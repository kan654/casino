const express = require('express');
const router = express.Router();
const { watchRewardedAd, getAdStatus, getAdConfig } = require('../controllers/ad.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * Ad Routes
 */

// @route   POST /api/ads/watch
// @desc    Watch rewarded ad
// @access  Private
router.post('/watch', protect, watchRewardedAd);

// @route   GET /api/ads/status
// @desc    Get ad eligibility status
// @access  Private
router.get('/status', protect, getAdStatus);

// @route   GET /api/ads/config
// @desc    Get ad configuration
// @access  Public
router.get('/config', getAdConfig);

module.exports = router;
