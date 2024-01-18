const express = require('express');
const router = express.Router();
const app = express();
const adminFrontendController = require('../../controllers/adminFrontendController');
const driverManageController = require('../../controllers/admin/driverManageController');


// Route to render the login page
router.get('/login', adminFrontendController.renderLoginPage);
router.get('/dashboard', adminFrontendController.adminDashboard);
router.get('/user/profile', adminFrontendController.userProfile);
router.get('/logout', adminFrontendController.adminLogout);
router.post('/login/action', adminFrontendController.adminLoginAction);

router.get('/driver/lists', driverManageController.driverLists);
router.get('/driver/delete/:userId', driverManageController.deleteDriver);
router.get('/driver/add/page', driverManageController.addPage);
router.post('/driver/save', driverManageController.saveDriver);

// Redirect root to the login
router.get('/', (req, res) => {
    res.redirect('./login');
});

// Redirect root to the dashboard
router.get('/home', (req, res) => {
    res.redirect('./dashboard');
});

module.exports = router;