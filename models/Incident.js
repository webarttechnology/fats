const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
      title: {
        type: String,
        required: false,
      },
      description: {
        type: String,
        required: false,
      },
      street_address: {
        type: String,
        required: false,
      },
      building: {
        type: String,
        required: false,
      },
      landmark: {
        type: String,
        required: false,
      },
      zip: {
        type: String,
        required: false,
      },
  });
  
const incident = mongoose.model('incidents', incidentSchema);
module.exports = incident;