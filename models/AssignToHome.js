const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
      vehicleId: {
        type: String,
        required: false,
      },
      side: {
        type: String,
        required: false,
      },
      incidentId: {
        type: String,
        required: false,
      },
  });
  
const task = mongoose.model('assign_to_home', taskSchema);
module.exports = task;