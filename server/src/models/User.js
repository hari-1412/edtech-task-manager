const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    required: [true, 'Role is required']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Required only for students
    required: function() {
      return this.role === 'student';
    },
    // Validate that teacherId references a teacher
    validate: {
      validator: async function(value) {
        if (this.role !== 'student') return true;
        const teacher = await mongoose.model('User').findById(value);
        return teacher && teacher.role === 'teacher';
      },
      message: 'Teacher ID must reference a valid teacher'
    }
  }
}, {
  timestamps: true
});

// Remove password from JSON responses
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

module.exports = mongoose.model('User', userSchema);