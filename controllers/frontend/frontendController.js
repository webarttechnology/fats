const User = require('../../models/User');
const Vehicle = require('../../models/Vehicle');
const Task = require('../../models/Task');
const session = require('express-session');
const crypto = require('crypto');

exports.homePage = async (req, res) => {
    const users = await User.find().lean();
    const vehicles = await Vehicle.find().lean();
    const tasks = await Task.find().lean();

    const vehiclesWithUsers = [];

        for (const vehicle of vehicles) {
            const assignedUsers = await Task.find({ vehicleId: vehicle._id }).populate('userId').lean();

            // Extracting user information from the populated field
            const new_users = assignedUsers.map(task => task.userId);

            // Add the data to the array
            vehiclesWithUsers.push({
                vehicle,
                new_users,
            });
        }

        for (const vehicleWithUsers of vehiclesWithUsers) {
            const newUsers = vehicleWithUsers.new_users;
        
            console.log('New Users:', newUsers);
        }

    res.render('frontend/home', { users, vehicles, tasks, vehiclesWithUsers });
};

exports.assignTask = async (req, res) => {
    const { draggedDivId, containerDivId } = req.body;
    // const randomString = crypto.randomBytes(8).toString('hex');

    const newTask = new Task({ vehicleId:containerDivId, userId:draggedDivId  });
    await newTask.save();

    res.json({ success: true });
};