const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
      vehicleId: {
        type: String,
        required: false,
      },
      userId: {
        type: String,
        required: false,
      },
      incidentId: {
        type: String,
        required: false,
      },
  });
  
const task = mongoose.model('tasks', taskSchema);
module.exports = task;