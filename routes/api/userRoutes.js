// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/api/userController');

// User registration route
router.post('/register', userController.registerUser);
router.get('/users', userController.existingUser);
router.get('/drivers', userController.existingDrivers);

module.exports = router;