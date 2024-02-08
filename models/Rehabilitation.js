const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
      userId: {
        type: String,
        required: false,
      },
      incidentId: {
        type: String,
        required: false,
      },
  });
  
const task = mongoose.model('rehabilitation', taskSchema);
module.exports = task;