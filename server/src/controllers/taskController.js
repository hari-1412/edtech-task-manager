const Task = require('../models/Task');
const User = require('../models/User');

/**
 * Get all tasks based on user role
 * Students: Only their own tasks
 * Teachers: Tasks created by them + tasks of their assigned students
 */
const getTasks = async (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;
    let tasks;

    if (role === 'student') {
      // Students see only their own tasks
      tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    } else if (role === 'teacher') {
      // Teachers see:
      // 1. Tasks they created
      // 2. Tasks created by their assigned students
      
      // Find all students assigned to this teacher
      const assignedStudents = await User.find({ 
        role: 'student', 
        teacherId: userId 
      }).select('_id');
      
      const studentIds = assignedStudents.map(student => student._id);
      
      // Get tasks created by teacher OR by assigned students
      tasks = await Task.find({
        $or: [
          { userId }, // Tasks created by teacher
          { userId: { $in: studentIds } } // Tasks of assigned students
        ]
      })
      .populate('userId', 'email role') // Include user info
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

    // Check if user is the task owner
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

    // Check if user is the task owner
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