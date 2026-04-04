const express = require('express');
const router = express.Router();
const { getDemandForecast, getRecommendations, getExpiryRisk, getInventorySuggestions } = require('../controllers/mlController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/recommendations/:productId', getRecommendations);
router.get('/forecast/:productId', protect, admin, getDemandForecast);
router.get('/expiry-risk', protect, admin, getExpiryRisk);
router.get('/inventory-suggestions', protect, admin, getInventorySuggestions);

module.exports = router;
