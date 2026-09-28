const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All analytics routes require authentication
router.use(authenticateToken);

router.get('/summary', AnalyticsController.getSummary);
router.get('/category', AnalyticsController.getCategoryAnalytics);
router.get('/monthly', AnalyticsController.getTimelineAnalytics);
router.get('/comparison', AnalyticsController.getComparison);
router.get('/suggestions', AnalyticsController.getSuggestions);

module.exports = router;
