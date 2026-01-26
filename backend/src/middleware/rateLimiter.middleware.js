const rateLimit = require('express-rate-limit');
const { RATE_LIMIT_CONFIG } = require('../config/game.config');

/**
 * General API rate limiter
 * Limits requests to prevent abuse
 */
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Betting rate limiter
 * Stricter limits for bet endpoints
 */
const betLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.BET_WINDOW_MS,
  max: RATE_LIMIT_CONFIG.MAX_BETS_PER_SECOND,
  message: {
    success: false,
    message: 'Too many bets placed, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

/**
 * Auth rate limiter
 * Limits login/registration attempts
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  betLimiter,
  authLimiter
};
