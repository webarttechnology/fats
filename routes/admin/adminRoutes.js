const express = require('express');
const router = express.Router();
const app = express();
const adminFrontendController = require('../../controllers/adminFrontendController');
const driverManageController = require('../../controllers/admin/driverManageController');
const fireFighterManageController = require('../../controllers/admin/fireFighterManageController');
const vehicleManageController = require('../../controllers/vehicle/vehicleManageController');


// Route to render the login page
router.get('/login', adminFrontendController.renderLoginPage);
router.get('/dashboard', adminFrontendController.adminDashboard);
router.get('/user/profile', adminFrontendController.userProfile);
router.get('/logout', adminFrontendController.adminLogout);
router.post('/login/action', adminFrontendController.adminLoginAction);

/**
 * Admin Profile 
*/

router.post('/edit/profile', adminFrontendController.adminEditProfileAction);

/**
 * Driver Listing & CRUD Routes
*/

router.get('/driver/lists', driverManageController.driverLists);
router.get('/driver/delete/:userId', driverManageController.deleteDriver);
router.get('/driver/add/page', driverManageController.addPage);
router.post('/driver/save', driverManageController.saveDriver);
router.get('/driver/update/page/:userId', driverManageController.updatePage);
router.post('/driver/update/action/:userId', driverManageController.updateAction);
router.get('/driver/change/password/page/:userId', driverManageController.changePassword);
router.post('/driver/change/password/action/:userId', driverManageController.updatePasswordAction);


/**
 * Fire Fighter's Routes
*/

router.get('/fire-fighter/lists', fireFighterManageController.fireFighterLists);
router.get('/fire-fighter/add/page', fireFighterManageController.fireFighterAddPage);
router.post('/fire-fighter/add/action', fireFighterManageController.fireFighterAddAction);
router.get('/fire-fighter/update/page/:userId', fireFighterManageController.fireFighterUpdatePage);
router.post('/fire-fighter/update/action/:userId', fireFighterManageController.fireFighterUpdateAction);
router.get('/fire-fighter/delete/:userId', fireFighterManageController.deleteFireFighter);

/**
 * Vehicle Routes
*/

router.get('/vehicle/lists', vehicleManageController.vehicleLists);

// Redirect root to the login
router.get('/', (req, res) => {
    res.redirect('./login');
});

// Redirect root to the dashboard
router.get('/home', (req, res) => {
    res.redirect('./dashboard');
});

module.exports = router;