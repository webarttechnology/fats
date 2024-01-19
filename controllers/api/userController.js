// controllers/userController.js
const User = require('../../models/User');
const bcrypt = require('bcrypt');

/**
 * User Registration
*/

exports.registerUser = async (req, res) => {
  try {
    const { name, username, email, phone, password, role } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ name, username, email, phone, password: hashedPassword, role });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      // Handle validation errors with a more structured response
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * All Users View 
*/

exports.existingUser = async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude password field from the response
        res.status(200).json(users);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
};

/**
 * All Drivers View 
*/

exports.existingDrivers = async (req, res) => {
  try {
      // Exclude password, __v0, role fields from the response
      const drivers = await User.find({ role: "driver" }).select('-password -__v -role'); 
      res.status(200).json(drivers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
};