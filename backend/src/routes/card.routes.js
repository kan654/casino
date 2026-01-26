const express = require('express');
const router = express.Router();
const {
  openCardPack,
  getCollection,
  getStats,
  getAllCards,
  getConfig,
  sellCard
} = require('../controllers/card.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * Card Routes
 */

// @route   POST /api/cards/open
// @desc    Open card pack
// @access  Private
router.post('/open', protect, openCardPack);

// @route   POST /api/cards/sell
// @desc    Sell a card
// @access  Private
router.post('/sell', protect, sellCard);

// @route   GET /api/cards/collection
// @desc    Get user collection
// @access  Private
router.get('/collection', protect, getCollection);

// @route   GET /api/cards/stats
// @desc    Get collection stats
// @access  Private
router.get('/stats', protect, getStats);

// @route   GET /api/cards/all
// @desc    Get all available cards
// @access  Public
router.get('/all', getAllCards);

// @route   GET /api/cards/config
// @desc    Get card configuration
// @access  Public
router.get('/config', getConfig);

module.exports = router;
