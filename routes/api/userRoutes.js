// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');

// User registration route
router.post('/register', userController.registerUser);
router.get('/users', userController.existingUser);

module.exports = router;