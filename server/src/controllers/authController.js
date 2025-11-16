const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

/**
 * Signup - Create new user account
 */
const signup = async (req, res, next) => {
  try {
    const { email, password, role, teacherId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // If role is student, verify teacher exists
    if (role === 'student' && teacherId) {
      const teacher = await User.findById(teacherId);
      if (!teacher) {
        return res.status(400).json({
          success: false,
          message: 'Invalid teacher ID'
        });
      }
      if (teacher.role !== 'teacher') {
        return res.status(400).json({
          success: false,
          message: 'Specified user is not a teacher'
        });
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      role,
      teacherId: role === 'student' ? teacherId : undefined
    });

    // Generate token
    const token = generateToken(user._id);

    // Get teacher info if student
    let teacherInfo = null;
    if (role === 'student') {
      const teacher = await User.findById(teacherId);
      teacherInfo = {
        _id: teacher._id,
        email: teacher.email
      };
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          teacherId: user.teacherId,
          teacher: teacherInfo
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login - Authenticate user and return token
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Get teacher info if student
    let teacherInfo = null;
    if (user.role === 'student' && user.teacherId) {
      const teacher = await User.findById(user.teacherId);
      if (teacher) {
        teacherInfo = {
          _id: teacher._id,
          email: teacher.email
        };
      }
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          teacherId: user.teacherId,
          teacher: teacherInfo
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login
};