const { body, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Registration validation rules
 */
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  handleValidationErrors
];

/**
 * Login validation rules
 */
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Bet validation rules
 */
const validateBet = [
  body('betAmount')
    .isNumeric()
    .withMessage('Bet amount must be a number')
    .custom((value) => value > 0)
    .withMessage('Bet amount must be greater than 0'),
  
  handleValidationErrors
];

/**
 * Dice game validation rules
 */
const validateDice = [
  body('betAmount')
    .isNumeric()
    .withMessage('Bet amount must be a number')
    .custom((value) => value > 0)
    .withMessage('Bet amount must be greater than 0'),
  
  body('target')
    .isNumeric()
    .withMessage('Target must be a number')
    .custom((value) => value >= 1 && value <= 99)
    .withMessage('Target must be between 1 and 99'),
  
  body('isOver')
    .isBoolean()
    .withMessage('isOver must be a boolean'),
  
  handleValidationErrors
];

/**
 * Client seed validation
 */
const validateClientSeed = [
  body('clientSeed')
    .optional()
    .isString()
    .withMessage('Client seed must be a string')
    .isLength({ min: 8, max: 64 })
    .withMessage('Client seed must be between 8 and 64 characters'),
  
  handleValidationErrors
];

/**
 * Coinflip game validation rules
 */
const validateCoinflip = [
  body('betAmount')
    .isNumeric()
    .withMessage('Bet amount must be a number')
    .custom((value) => value > 0)
    .withMessage('Bet amount must be greater than 0'),
  
  body('choice')
    .isString()
    .withMessage('Choice must be a string')
    .isIn(['heads', 'tails'])
    .withMessage('Choice must be "heads" or "tails"'),
  
  handleValidationErrors
];

/**
 * Mines game start validation rules
 */
const validateMines = [
  body('betAmount')
    .isNumeric()
    .withMessage('Bet amount must be a number')
    .custom((value) => value > 0)
    .withMessage('Bet amount must be greater than 0'),
  
  body('mineCount')
    .isInt({ min: 1, max: 24 })
    .withMessage('Mine count must be between 1 and 24'),
  
  handleValidationErrors
];

/**
 * Mines reveal tile validation rules
 */
const validateMinesReveal = [
  body('position')
    .isInt({ min: 0, max: 24 })
    .withMessage('Position must be between 0 and 24'),
  
  handleValidationErrors
];

/**
 * Trading position validation rules
 */
const validateOpenPosition = [
  body('assetId')
    .isString()
    .withMessage('Asset ID must be a string')
    .isIn(['BTC', 'ETH', 'BNB', 'SOL', 'ADA'])
    .withMessage('Invalid asset ID'),
  
  body('direction')
    .isString()
    .withMessage('Direction must be a string')
    .isIn(['long', 'short'])
    .withMessage('Direction must be "long" or "short"'),
  
  body('stake')
    .isNumeric()
    .withMessage('Stake must be a number')
    .custom((value) => value > 0)
    .withMessage('Stake must be greater than 0'),
  
  body('leverage')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Leverage must be an integer between 1 and 10')
    .custom((value) => [1, 2, 5, 10].includes(value))
    .withMessage('Leverage must be one of: 1, 2, 5, 10'),
  
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateBet,
  validateDice,
  validateCoinflip,
  validateMines,
  validateMinesReveal,
  validateOpenPosition,
  validateClientSeed,
  handleValidationErrors
};
