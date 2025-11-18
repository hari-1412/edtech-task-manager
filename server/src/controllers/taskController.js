const Task = require('../models/Task');
const User = require('../models/User');

/**
 * Get all tasks based on the authenticated user's role.
 *
 * Authorization rules (business logic):
 * - Students: should only see tasks that belong to themselves.
 * - Teachers: should see tasks they created AND tasks belonging to
 *   students assigned to that teacher.
 *
 * Implementation notes and rationale:
 * - We read `req.user` (set by the authentication middleware) to determine
 *   the caller's `_id` and `role`.
 * - For students we perform a simple query by `userId` so they cannot
 *   access other students' data even if they try to tamper with client-side
 *   filtering.
 * - For teachers we first find all student accounts that reference this
 *   teacher (via `teacherId` on the User model). That gives us authorized
 *   student ids to include in the result.
 * - We use a single DB query with `$or` to fetch tasks created by the
 *   teacher OR created by their assigned students. This keeps the result
 *   consistent, paginatable, and simple to cache later if required.
 * - We populate the `userId` field with `email` and `role` so the client
 *   can show who owns each task without making extra requests.
 */
const getTasks = async (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;
    let tasks;

    if (role === 'student') {
      // Students see only tasks where their user id is stored on the task.
      // This prevents any student from seeing other students' work.
      tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    } else if (role === 'teacher') {
      // Teachers must be able to monitor students assigned to them.
      // Step 1: find students who were assigned to this teacher (User.teacherId)
      const assignedStudents = await User.find({
        role: 'student',
        teacherId: userId
      }).select('_id');

      const studentIds = assignedStudents.map(student => student._id);

      // Step 2: return tasks that were either created by the teacher OR by
      // any of their assigned students. We populate the `userId` reference so
      // the client receives owner metadata (email, role) with each task.
      tasks = await Task.find({
        $or: [
          { userId }, // Tasks created by teacher
          { userId: { $in: studentIds } } // Tasks of assigned students
        ]
      })
      .populate('userId', 'email role')
      .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new task
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, progress } = req.body;
    const userId = req.user._id;

    // Create task with logged-in user's ID
    const task = await Task.create({
      userId,
      title,
      description,
      dueDate,
      progress: progress || 'not-started'
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update task
 * Only the task owner can update
 */
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    // Find task
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    /**
     * Ownership check (authorization):
     * - Only the task owner may update the task.
     * - This protects against horizontal privilege escalation where a user
     *   could try to edit another user's task by guessing an id.
     * - The server enforces this check even if the client hides edit UI
     *   for non-owners—never trust client-side restrictions.
     */
    if (task.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own tasks'
      });
    }

    // Update task
    Object.assign(task, updates);
    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete task
 * Only the task owner can delete
 */
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find task
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    /**
     * Ownership check (authorization) for delete:
     * - Only the owner of a task may delete it. This mirrors the update
     *   authorization and prevents users from deleting other people's tasks.
     * - We check ownership server-side and return HTTP 403 for forbidden
     *   attempts. Clients should also not display delete controls for
     *   non-owners, but that is only UX-level protection.
     */
    if (task.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own tasks'
      });
    }

    // Delete task
    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};