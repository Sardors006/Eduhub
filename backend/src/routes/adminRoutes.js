const express = require('express');
const { getDashboardAnalytics } = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/dashboard', authMiddleware, roleMiddleware('admin'), getDashboardAnalytics);

module.exports = router;

