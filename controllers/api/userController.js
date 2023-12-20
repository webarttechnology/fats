// controllers/userController.js
const User = require('../../models/User');

/**
 * User Registration
*/

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
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