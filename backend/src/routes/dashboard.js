const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard');
const authenticateToken = require('../middlewares/authenticate');

router.get('/', authenticateToken, dashboardController.getDashboardStats);

module.exports = router;
