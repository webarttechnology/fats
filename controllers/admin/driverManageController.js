const User = require('../../models/User');

exports.driverLists = async (req, res) => {
    const user = await User.find().lean();
    // const user = await User.find({ role: 'driver' }).lean();

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