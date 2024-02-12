const User = require('../../models/User');
const Vehicle = require('../../models/Vehicle');
const Task = require('../../models/Task');
const AssignHome = require('../../models/AssignToHome');
const Incident = require('../../models/Incident');
const Rehabilitate = require('../../models/Rehabilitation');
const session = require('express-session');
const crypto = require('crypto');

exports.homePage = async (req, res) => {
    if (!req.query.incidentDetail) {
        return res.redirect('/admin/');
    }

    const incidentId = req.query.incidentDetail.replace(/^"(.*)"$/, '$1');

     const users = await User.find({ battery: { $gt: 0 } }).lean();

    // const reserveUsers = await User.find({ battery: { $gt: 3 } }).lean();
    // const rehabilitatedAllUsers = await User.find({
    //     battery: {
    //         $ne: '10',
    //         $lte: '3',
    //     }
    // }).lean();

    /**
     * Get Rehabilitate user Lists 
    */
    const rehabilitatedUsers = await Rehabilitate.find({ incidentId }).populate('userId').lean();
    
    // Extract user IDs from rehabilitatedUsers
    const userIds = rehabilitatedUsers.map(user => user.userId);
    const rehabilitatedAllUsers = await User.find({ _id: { $in: userIds } }).lean();
    
    // const vehicles = await Vehicle.find().lean();
    const assignedVehicles = await AssignHome.find({ incidentId: incidentId }).distinct('vehicleId');
    const tasks = await Task.find({ incidentId:incidentId }).lean();
    const vehicles = await Vehicle.find({ _id: { $nin: assignedVehicles } }).lean();
    

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

    // const userIdsInTasks = tasks.map(task => task.userId);
    // // Fetch users excluding those whose IDs are in the tasks
    // console.log(userIdsInTasks);
    // const users = await User.find({ _id: { $nin: userIdsInTasks }, battery: { $gt: 2 } }).lean();

    /**
     * Reserve User's Lists
    */

    const reserveUserIds = tasks.map(user => user.userId);

    // Combine both arrays of user IDs
    const combinedUserIds = [...userIds, ...reserveUserIds];
    const reserveUsers = await User.find({ _id: { $nin: combinedUserIds } }).lean();

    /**
     * Home Assign
    */
    const leftTaskUsers = await getAssignedUsersForSide('left', incidentId);
    const rightTaskUsers = await getAssignedUsersForSide('right', incidentId);

    const assignedTaskUsers = await Task.find({ incidentId: incidentId }).lean();
    res.render('frontend/home', { users, assignedTaskUsers, rightTaskUsers, vehicles, tasks, leftTaskUsers, vehiclesWithUsers, reserveUsers, incidentId, rehabilitatedAllUsers });
};

/**
 * Task Assignment to home top, left, right, bottom
 * 
 * @param {*} side 
 * @param {*} incidentId 
 * @returns 
 */

async function getAssignedUsersForSide(side, incidentId) {
    const taskAssignments = await AssignHome.find({ incidentId, side }).lean();
    const taskUsers = [];

    for (const assignment of taskAssignments) {
        const assignedUsers = await Task.find({ vehicleId: assignment.vehicleId, incidentId }).populate('userId').lean();
        const vehicle3 = await Vehicle.findOne({ _id: assignment.vehicleId }).lean();

        const new_users2 = assignedUsers.map(task => User.findById(task.userId).lean());

        taskUsers.push({
            vehicle3,
            new_users2: await Promise.all(new_users2),
        });
    }

    return taskUsers;
}

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

exports.assignVehicle = async (req, res) => {
    const { vehicleId, side, incidentId } = req.body;

       const checkHomeAssign = await AssignHome.findOne({incidentId, side});

       if(checkHomeAssign == null){
           const existingTask = await Task.find({ vehicleId, incidentId:incidentId });
           
           if (existingTask.length !== 0){
                const newTask = new AssignHome({ vehicleId:vehicleId, side:side, incidentId:incidentId  });
                await newTask.save();
           }
       }

       res.json({ success: true });
};



exports.batteryCheck = async (req, res) => {
    try {
        const incidentId = req.params.incidentId;
        const leftTaskUsers = await getTaskUsersForSide(incidentId, 'left');
        const rightTaskUsers = await getTaskUsersForSide(incidentId, 'right');
        const batteryLevel = await increaseBatteryLevel(incidentId);
        
        // Send data to the client
        res.status(200).json({ leftTaskUsers, rightTaskUsers, batteryLevel  });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * 
 * Increase battery level of user's who are present in rehabilitation zone 
 */

async function increaseBatteryLevel(incidentId) {
    const rehabilitateUser = await Rehabilitate.find({ incidentId }).lean(); 
    const userIds = rehabilitateUser.map(user => user.userId);

    // Iterate over each user ID in the array
    for (const userId of userIds) {
        // Find the user by ID
        const user = await User.findById(userId);
        
        if(user.battery < 10){
            const newBatteryLevel = parseInt(user.battery) + 1;
            await User.findByIdAndUpdate(userId, { battery: newBatteryLevel });
        }
    }

    return true;
}

// Helper function to get task users for a specific side
async function getTaskUsersForSide(incidentId, side) {
    const vehicles = await AssignHome.find({ incidentId, side }).lean();

    if (!Array.isArray(vehicles) || vehicles.length === 0) {
        // console.log(`No tasks found for incidentId: ${incidentId}`);
        return [];
    }

    const vehicleIds = vehicles.map(vehicle => vehicle.vehicleId);
    const tasks = await Task.find({ vehicleId: { $in: vehicleIds }, incidentId }).populate('userId').lean();

    const tasksByVehicleId = tasks.reduce((acc, task) => {
        acc[task.vehicleId] = acc[task.vehicleId] || [];
        acc[task.vehicleId].push(task);
        return acc;
    }, {});

    const usersByVehicleId = {};
        for (const [vehicleId, tasks] of Object.entries(tasksByVehicleId)) {
            const users = tasks.map(task => task.userId);
            usersByVehicleId[vehicleId] = users;

            // Fetch battery of each user and reduce if greater than 1
            for (const user of users) {
                // Assuming User model has a 'battery' field
                const userObj = await User.findById(user);

                if (userObj) {
                    if(userObj.battery > 2){
                        userObj.battery -= 1;
                        await userObj.save();
                    }else{
                        await userObj.save();
                    }
                }
            }
        }

        const updatedUsers = await Promise.all(Object.values(usersByVehicleId).flat().map(userId => User.findById(userId)));
        const taskUsers = Object.values(updatedUsers);

    // For each user, fetch additional data if needed and add it to the user object
    for (const user of taskUsers) {
        // Fetch additional data for user.new_users2
        // Here you should fetch the required data based on your application logic
        user.new_users2 = []; // Example: Initialize new_users2 array
    }

    return taskUsers;
    // return Object.values(updatedUsers);
}

/**
 * Rehabilitatete User
*/

exports.rehabiliateUser = async (req, res) => {
    const { userId, incidentId } = req.body;

    const userDetails = await User.findOne({ _id:userId }).lean();
    if(userDetails.battery <= 2){

         /**
          * send a driver to rehabilitation zone  
         */

          const rehabilitate = new Rehabilitate({ userId, incidentId });
          await rehabilitate.save();

         /**
          * delete the user from home assign zone 
         */

          const task = await Task.findOne({ userId, incidentId }).lean();
          if(task != null){
              await Task.findByIdAndDelete(task._id);
          }
    }
    
    res.status(200).json("Success");
}

exports.rehabilitationContent = async (req, res) => {
    try {
        const { incidentId } = req.body;
        const rehabilitatedUsers = await Rehabilitate.find({ incidentId }).lean();

        // Extract user IDs from rehabilitatedUsers
        const userIds = rehabilitatedUsers.map(user => user.userId);
        const rehabilitatedAllUsers = await User.find({ _id: { $in: userIds } }).lean();

        res.status(500).json({ users: rehabilitatedAllUsers });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.assignReserveUserToTask = async (req, res) => {
     try{
        const { userId,incidentId,side } = req.body;

        // fetch vehicleId from incidentId & side
        const vehicle = await AssignHome.findOne({incidentId, side}).lean();

        // add task for that vehicle
        const newTask = new Task({vehicleId:vehicle.vehicleId, userId, incidentId});
        await newTask.save();

        res.status(200).json({ msg: 'Success' });
     }catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}