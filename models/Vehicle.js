const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    // name: {
    //     type: String,
    //     required: true,
    //   },
      image: {
        type: String,
        required: true,
      },
      modelNo: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
  });
  
const Vehicle = mongoose.model('vehicles', vehicleSchema);
module.exports = Vehicle;