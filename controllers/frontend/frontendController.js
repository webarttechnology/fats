const User = require('../../models/User');
const Vehicle = require('../../models/Vehicle');
const Task = require('../../models/Task');
const Incident = require('../../models/Incident');
const session = require('express-session');
const crypto = require('crypto');

exports.homePage = async (req, res) => {
    if (!req.query.incidentDetail) {
        return res.redirect('/admin/');
    }

    const incidentId = req.query.incidentDetail.replace(/^"(.*)"$/, '$1');

    // const users = await User.find({ battery: { $gt: 0 } }).lean();
    const reserveUsers = await User.find({ battery: { $gt: 3 } }).lean();
    const rehabilitatedUsers = await User.find({
        battery: {
            $ne: '10',
            $lte: '3',
        }
    }).lean();

    const vehicles = await Vehicle.find().lean();
    const tasks = await Task.find({ incidentId:incidentId }).lean();

    const vehiclesWithUsers = [];

        for (const vehicle of vehicles) {
            const assignedUsers = await Task.find({ vehicleId: vehicle._id, incidentId: incidentId }).populate('userId').lean();
            
            // Extracting user information from the populated field
            const new_users = [];

            for (const task of assignedUsers) {
                const user = await User.findById(task.userId).lean();
                new_users.push(user);
            }

            // Add the data to the array
            vehiclesWithUsers.push({
                vehicle,
                new_users,
            });
        }

    const userIdsInTasks = tasks.map(task => task.userId);
    // Fetch users excluding those whose IDs are in the tasks
    const users = await User.find({ _id: { $nin: userIdsInTasks }, battery: { $gt: 0 } }).lean();

    const assignedTaskUsers = await Task.find({ incidentId: incidentId }).lean();
    res.render('frontend/home', { users, assignedTaskUsers, vehicles, tasks, vehiclesWithUsers, reserveUsers, incidentId, rehabilitatedUsers });
};


exports.assignTask = async (req, res) => {
    const { draggedDivId, containerDivId, incidentId } = req.body;

    // Check if the user is already assigned to any vehicle for the given incident
    const existingTask = await Task.findOne({
        userId: draggedDivId,
        incidentId: incidentId
    });

    if (existingTask) {
        if (existingTask.vehicleId !== containerDivId) {
            await Task.findOneAndUpdate(
                { userId: draggedDivId, incidentId: incidentId },
                { $set: { vehicleId: containerDivId } }
            );
        }
    }
    else{
        const newTask = new Task({ vehicleId:containerDivId, userId:draggedDivId, incidentId:incidentId  });
        await newTask.save();
    }

    res.json({ success: true });
};