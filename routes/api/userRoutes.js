// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/api/userController');
const vehicleController = require('../../controllers/api/vehicleController');

// User registration route
router.post('/register', userController.registerUser);
router.get('/users', userController.existingUser);
router.get('/drivers', userController.existingDrivers);
router.get('/fire-fighters', userController.existingFirefighters);
router.get('/vehicles', vehicleController.existingVehicles);
router.get('/vehicles/:type', vehicleController.vehicleByType);

module.exports = router;