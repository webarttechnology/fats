const User = require('../../models/User');
const bcrypt = require('bcrypt');

exports.driverLists = async (req, res) => {
    const user = await User.find({ role: 'driver' }).lean();

    // Reverse the order of the users
    const users = user.reverse();
    res.render('admin/driver/list', { users });
};

exports.deleteDriver = async (req, res) => {
    const userId = req.params.userId;

    // Check if the user exists
    const user = await User.findById(userId);
    console.log(user);
    if (!user) {
    return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user
    await user.deleteOne();
    // res.send(req.flash('message'));
    res.redirect('../../driver/lists');
}

exports.addPage = async (req, res) => {
    res.render('admin/driver/add');
};

exports.saveDriver = async (req, res) => {
    try {
        const { name, username, email, phone, password, role } = req.body;
    
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          const errorMessage = 'User already exists';
          return res.status(400).render('admin/driver/add', { errorMessage });
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = "driver";
    
        // Create a new user
        const newUser = new User({ name, username, email, phone, password: hashedPassword, role: userRole });
        await newUser.save();
    
        const successMessage = 'User registered successfully';
        return res.status(201).render('admin/driver/add', { successMessage });
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
}