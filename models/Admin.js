const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      profileImage: {
        type: String, // Assuming you store the file path or URL of the profile image
        default: null, // Default value is set to null as it's nullable
      },
      status: {
        type: String,
        required: true,
      },
  });
  
  const Admin = mongoose.model('admins', adminSchema);
  module.exports = Admin;