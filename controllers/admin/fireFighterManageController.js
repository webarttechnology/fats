const User = require('../../models/User');
const bcrypt = require('bcrypt');

exports.fireFighterLists = async (req, res) => {
    const user = await User.find({ role: 'fire_fighter' }).lean();

    // Reverse the order of the users
    const users = user.reverse();
    res.render('admin/fire_fighter/list', { users });
};

exports.fireFighterAddPage = async (req, res) => {
    res.render('admin/fire_fighter/add');
};

exports.fireFighterAddAction = async (req, res) => {
    try {
        const { name, username, email, phone, password, role } = req.body;
    
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          const errorMessage = 'Fire Fighter already exists';
          return res.status(400).render('admin/fire_fighter/add', { errorMessage });
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = "fire_fighter";
    
        // Create a new user
        const newUser = new User({ name, username, email, phone, password: hashedPassword, role: userRole });
        await newUser.save();
    
        const successMessage = 'Fire Fighter registered successfully';
        return res.status(200).render('admin/fire_fighter/add', { successMessage });
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

exports.fireFighterUpdatePage = async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findOne({ _id: userId }).lean();
 
    if (!user) {
     return res.status(404).render('error', { message: 'Fire Fighter not found' });
    }
 
    res.render('admin/fire_fighter/update', { user });
};

exports.fireFighterUpdateAction = async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.find({ role: 'fire_fighter' }).lean();
      const users = user.reverse();

      await User.findByIdAndUpdate(userId, req.body);
      const successMessage = 'Fire Fighter updated successfully';
      res.render('admin/fire_fighter/list', { successMessage, users });
    } catch (error) {
      console.error(error);
      res.status(500).render('error', { message: 'Internal server error' });
    }
}

exports.deleteFireFighter = async (req, res) => {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    
    const allUser = await User.find({ role: 'fire_fighter' }).lean();
    const users = allUser.reverse();

    if (!user) {
        return res.status(404).json({ message: 'Fire Fighter not found' });
    }

    await user.deleteOne();
    const successMessage = 'Fire Fighter Deleted successfully';
    res.render('admin/fire_fighter/list', { successMessage, users });
}