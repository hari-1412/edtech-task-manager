const express = require('express');
const rateLimit = require('express-rate-limit');
const { signup, login } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middleware/validation');

const router = express.Router();

// Rate limiter for login endpoint (prevent brute force attacks)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /auth/signup - Register new user
router.post('/signup', validateSignup, signup);

// POST /auth/login - Login user
router.post('/login', loginLimiter, validateLogin, login);

module.exports = router;