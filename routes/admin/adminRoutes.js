const express = require('express');
const router = express.Router();
const app = express();
const adminFrontendController = require('../../controllers/adminFrontendController');

// Route to render the login page
router.get('/login', adminFrontendController.renderLoginPage);
router.get('/dashboard', adminFrontendController.adminDashboard);

module.exports = router;