const express = require('express');
const router = express.Router();
const app = express();
const frontendController = require('../../controllers/frontend/frontendController');

router.get('/', frontendController.homePage);

// Redirect root to the dashboard
router.get('/home', (req, res) => {
    res.redirect('/');
});

module.exports = router;