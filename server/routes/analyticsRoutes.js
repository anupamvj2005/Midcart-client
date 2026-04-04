const express = require('express');
const router = express.Router();
const { getDashboardSummary, getRevenueChart, getTopProducts, getCategoryStats } = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);
router.get('/summary', getDashboardSummary);
router.get('/revenue', getRevenueChart);
router.get('/top-products', getTopProducts);
router.get('/categories', getCategoryStats);

module.exports = router;
