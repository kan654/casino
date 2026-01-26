const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getBalance,
  getHistory,
  getStats,
  getGameDetails
} = require('../controllers/user.controller');

/**
 * User Routes
 */

// All routes are protected (require authentication)
router.get('/balance', protect, getBalance);
router.get('/history', protect, getHistory);
router.get('/stats', protect, getStats);
router.get('/game/:id', protect, getGameDetails);

module.exports = router;
