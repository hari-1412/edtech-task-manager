const express = require('express');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const authenticate = require('../middleware/auth');
const { validateTask, validateTaskUpdate } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /tasks - Get all tasks based on role
router.get('/', getTasks);

// POST /tasks - Create new task
router.post('/', validateTask, createTask);

// PUT /tasks/:id - Update task
router.put('/:id', validateTaskUpdate, updateTask);

// DELETE /tasks/:id - Delete task
router.delete('/:id', deleteTask);

module.exports = router;