const Joi = require('joi');

// Signup validation schema
const signupSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('student', 'teacher').required().messages({
    'any.only': 'Role must be either student or teacher',
    'any.required': 'Role is required'
  }),
  teacherId: Joi.when('role', {
    is: 'student',
    then: Joi.string().required().messages({
      'any.required': 'Teacher ID is required for students'
    }),
    otherwise: Joi.forbidden()
  })
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Task validation schema
const taskSchema = Joi.object({
  title: Joi.string().max(200).required().messages({
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().max(1000).required().messages({
    'string.max': 'Description cannot exceed 1000 characters',
    'any.required': 'Description is required'
  }),
  dueDate: Joi.date().optional().allow(null),
  progress: Joi.string().valid('not-started', 'in-progress', 'completed').optional()
});

// Task update validation schema
const taskUpdateSchema = Joi.object({
  title: Joi.string().max(200).optional(),
  description: Joi.string().max(1000).optional(),
  dueDate: Joi.date().optional().allow(null),
  progress: Joi.string().valid('not-started', 'in-progress', 'completed').optional()
}).min(1); // At least one field must be present

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    next();
  };
};

module.exports = {
  validateSignup: validate(signupSchema),
  validateLogin: validate(loginSchema),
  validateTask: validate(taskSchema),
  validateTaskUpdate: validate(taskUpdateSchema)
};