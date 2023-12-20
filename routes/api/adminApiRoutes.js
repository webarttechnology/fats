// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/api/adminController');

// User registration route
router.get('/add', adminController.addAdmin);

module.exports = router;