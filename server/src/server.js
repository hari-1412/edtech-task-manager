require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EdTech Task Manager API is running!',
    endpoints: {
      auth: {
        signup: 'POST /auth/signup',
        login: 'POST /auth/login'
      },
      tasks: {
        getAll: 'GET /tasks',
        create: 'POST /tasks',
        update: 'PUT /tasks/:id',
        delete: 'DELETE /tasks/:id'
      }
    }
  });
});

// Feature/config endpoint - expose minimal runtime flags to clients
app.get('/config', (req, res) => {
  res.json({
    success: true,
    enableGpt5Mini: true,
    aiModel: process.env.DEFAULT_AI_MODEL || 'gpt-5-mini'
  });
});

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});