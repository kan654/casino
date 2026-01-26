const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { betLimiter } = require('../middleware/rateLimiter.middleware');
const {
  validateBet,
  validateDice,
  validateCoinflip,
  validateMines,
  validateMinesReveal,
  validateOpenPosition
} = require('../middleware/validation.middleware');
const {
  playSlots,
  getSlotsConfig,
  playDice,
  getDiceConfig,
  playCoinflip,
  getCoinflipConfig,
  startMinesGame,
  revealMinesTile,
  cashOutMines,
  getCurrentMinesGame,
  getMinesConfig,
  claimDailyReward,
  getDailyRewardStatus,
  getDailyRewardConfig,
  openPosition,
  closePosition,
  getOpenPositions,
  getClosedPositions,
  getMarketData,
  getTradingConfig,
  placeCrashBet,
  crashCashOut,
  getCurrentCrashGame,
  getCrashConfig
} = require('../controllers/game.controller');
const { getGlobalHistory } = require('../controllers/user.controller');

/**
 * Game Routes
 */

// Slots routes
router.post('/slots/spin', protect, betLimiter, validateBet, playSlots);
router.get('/slots/config', getSlotsConfig);

// Dice routes
router.post('/dice/roll', protect, betLimiter, validateDice, playDice);
router.get('/dice/config', getDiceConfig);

// Coinflip routes
router.post('/coinflip/flip', protect, betLimiter, validateCoinflip, playCoinflip);
router.get('/coinflip/config', getCoinflipConfig);

// Mines routes
router.post('/mines/start', protect, betLimiter, validateMines, startMinesGame);
router.post('/mines/reveal', protect, validateMinesReveal, revealMinesTile);
router.post('/mines/cashout', protect, cashOutMines);
router.get('/mines/current', protect, getCurrentMinesGame);
router.get('/mines/config', getMinesConfig);

// Daily Reward routes
router.post('/daily-reward/claim', protect, claimDailyReward);
router.get('/daily-reward/status', protect, getDailyRewardStatus);
router.get('/daily-reward/config', getDailyRewardConfig);

// Trading routes
router.post('/trading/open', protect, betLimiter, validateOpenPosition, openPosition);
router.post('/trading/close/:positionId', protect, closePosition);
router.get('/trading/positions', protect, getOpenPositions);
router.get('/trading/history', protect, getClosedPositions);
router.get('/trading/market', getMarketData);
router.get('/trading/config', getTradingConfig);

// Crash routes
router.post('/crash/bet', protect, betLimiter, validateBet, placeCrashBet);
router.post('/crash/cashout', protect, crashCashOut);
router.get('/crash/current', getCurrentCrashGame);
router.get('/crash/config', getCrashConfig);

// Global history
router.get('/history', getGlobalHistory);

module.exports = router;
