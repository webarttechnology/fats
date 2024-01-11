// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  username: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate: {
      validator: (value) => {
        // Use a regular expression or another method to validate email format
        // Example: Check if the value matches a basic email format
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: 'Invalid email format',
    },
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    validate: {
      validator: (value) => {
        // Use a regular expression or another method to validate phone format
        // Example: Check if the value matches a basic phone number format
        return /^\d{10}$/g.test(value);
      },
      message: 'Invalid phone format',
    },
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;