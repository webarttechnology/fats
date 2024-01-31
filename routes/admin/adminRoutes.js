const express = require('express');
const router = express.Router();
const app = express();
const adminFrontendController = require('../../controllers/adminFrontendController');
const driverManageController = require('../../controllers/admin/driverManageController');
const fireFighterManageController = require('../../controllers/admin/fireFighterManageController');
const vehicleManageController = require('../../controllers/vehicle/vehicleManageController');
const incidentManageController = require('../../controllers/incident/incidentManageController');
const frontendController = require('../../controllers/frontend/frontendController');
const authMiddleware = require('../../middleware/checkAuthMiddleware');


// Route to render the login page
router.get('/login', adminFrontendController.renderLoginPage);
router.get('/dashboard', authMiddleware, adminFrontendController.adminDashboard);
router.get('/user/profile', authMiddleware, adminFrontendController.userProfile);
router.get('/logout', adminFrontendController.adminLogout);
router.post('/login/action', adminFrontendController.adminLoginAction);

/**
 * Admin Profile 
*/

router.post('/edit/profile', authMiddleware, adminFrontendController.adminEditProfileAction);
// router.post('/change/password', adminFrontendController.adminChangePasswordAction);

/**
 * Driver Listing & CRUD Routes
*/

router.get('/driver/lists', authMiddleware, driverManageController.driverLists);
router.get('/driver/delete/:userId', authMiddleware, driverManageController.deleteDriver);
router.get('/driver/add/page', authMiddleware, driverManageController.addPage);
router.post('/driver/save', authMiddleware, driverManageController.saveDriver);
router.get('/driver/update/page/:userId', authMiddleware, driverManageController.updatePage);
router.post('/driver/update/action/:userId', authMiddleware, driverManageController.updateAction);
router.get('/driver/change/password/page/:userId', authMiddleware, driverManageController.changePassword);
router.post('/driver/change/password/action/:userId', authMiddleware, driverManageController.updatePasswordAction);


/**
 * Fire Fighter's Routes
*/

router.get('/fire-fighter/lists', authMiddleware, fireFighterManageController.fireFighterLists);
router.get('/fire-fighter/add/page', authMiddleware, fireFighterManageController.fireFighterAddPage);
router.post('/fire-fighter/add/action', authMiddleware, fireFighterManageController.fireFighterAddAction);
router.get('/fire-fighter/update/page/:userId', authMiddleware, fireFighterManageController.fireFighterUpdatePage);
router.post('/fire-fighter/update/action/:userId', authMiddleware, fireFighterManageController.fireFighterUpdateAction);
router.get('/fire-fighter/delete/:userId', authMiddleware, fireFighterManageController.deleteFireFighter);

/**
 * Vehicle Routes
*/

router.get('/vehicle/lists', authMiddleware, vehicleManageController.vehicleLists);
router.get('/vehicle/add/page', authMiddleware, vehicleManageController.vehicleAddPage);
router.post('/vehicle/add/action', authMiddleware, vehicleManageController.vehicleAddAction);
router.get('/vehicle/update/page/:vehicleId', authMiddleware, vehicleManageController.vehicleUpdatePage);
router.post('/vehicle/update/action/:vehicleId', authMiddleware, vehicleManageController.vehicleUpdateAction);
router.get('/vehicle/delete/:vehicleId', authMiddleware, vehicleManageController.deleteVehicle);

/**
 * Incidents
*/

router.get('/incident/lists', authMiddleware, incidentManageController.incidentLists);
router.get('/incident/add/page', authMiddleware, incidentManageController.incidentAddPage);
router.post('/incident/save', authMiddleware, incidentManageController.saveIncident);
router.get('/incident/tasks', authMiddleware, frontendController.homePage);
router.get('/incident/update/page/:incidentId', authMiddleware, incidentManageController.updatePage);
router.post('/incident/update/action/:incidentId', authMiddleware, incidentManageController.incidentUpdateAction);

// Redirect root to the login
router.get('/', (req, res) => {
    res.redirect('./login');
});

// Redirect root to the dashboard
router.get('/home', (req, res) => {
    res.redirect('./dashboard');
});

module.exports = router;