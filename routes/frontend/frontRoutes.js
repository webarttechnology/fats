const express = require('express');
const router = express.Router();
const app = express();
const frontendController = require('../../controllers/frontend/frontendController');

router.get('/home', frontendController.homePage);
router.post('/assign-task', frontendController.assignTask);

// Redirect root to the dashboard
router.get('/', (req, res) => {
    res.redirect('/home');
});

module.exports = router;