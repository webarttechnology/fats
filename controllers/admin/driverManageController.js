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
        const newUser = new User({ name, username, email, phone, password: hashedPassword, role: userRole, battery:10 });
        await newUser.save();
    
        const successMessage = 'User registered successfully';
        return res.status(200).render('admin/driver/add', { successMessage });
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

exports.updatePage = async (req, res) => {
   const userId = req.params.userId;
   const user = await User.findOne({ _id: userId }).lean();

   // Check if the user is found
   if (!user) {
    // Handle the case where the user is not found
    return res.status(404).render('error', { message: 'User not found' });
   }

   res.render('admin/driver/update', { user });
};

exports.updateAction = async (req, res) => {
  try {
    const userId = req.params.userId;
    await User.findByIdAndUpdate(userId, req.body);
    res.redirect('../../lists');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Internal server error' });
  }
}

exports.changePassword = async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findOne({ _id: userId }).lean();

  if (!user) {
   return res.status(404).render('error', { message: 'User not found' });
  }

  res.render('admin/driver/change_password', { userId });
};

exports.updatePasswordAction = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { old_password, new_password, confirm_password } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    const driver = await User.find({ role: 'driver' }).lean();

    if (!user) {
      return res.status(404).render('error', { message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(old_password, user.password);
    if (!isPasswordValid) {
      const errorMessage = 'Old password is incorrect';
      return res.status(400).render('admin/driver/change_password', { errorMessage: errorMessage, userId: userId, });
    }

    if (new_password !== confirm_password) {
      const errorMessage = 'New password and confirm password do not match';
      return res.status(400).render('admin/driver/change_password', { errorMessage: errorMessage, userId: userId, });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    const successMessage = 'Password updated successfully';
    return res.status(200).render('admin/driver/list', { successMessage, user:driver });
    // return res.status(200).redirect('/admin/driver/list', { successMessage });
  } catch (error) {
    console.error(error);

    // Handle errors, e.g., render an error view
    res.status(500).render('error', { message: 'Internal server error' });
  }
};