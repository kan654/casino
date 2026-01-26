const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const {
  validateRegistration,
  validateLogin,
  validateClientSeed
} = require('../middleware/validation.middleware');
const {
  register,
  login,
  getMe,
  updateSeeds
} = require('../controllers/auth.controller');

/**
 * Authentication Routes
 */

// Public routes
router.post('/register', authLimiter, validateRegistration, register);
router.post('/login', authLimiter, validateLogin, login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/update-seeds', protect, validateClientSeed, updateSeeds);

module.exports = router;
