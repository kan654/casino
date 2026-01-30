/**
 * Global Bet Manager (Backend)
 * Centralized bet limit management for all games
 * 
 * Logic:
 * - Minimum bet = 2% of current balance (minimum 1)
 * - Maximum bet = 100% of current balance (all-in allowed)
 * - No hard limits
 * - Dynamic scaling based on player balance
 */

/**
 * Calculate dynamic bet limits based on user balance
 */
function calculateBetLimits(balance) {
  // Minimum: 2% of balance, but not less than 1
  const min = Math.max(1, Math.floor(balance * 0.02));
  
  // Maximum: 100% of balance (all-in)
  const max = Math.floor(balance);
  
  return {
    min: Math.max(1, min), // Always minimum 1
    max: Math.max(1, max)  // Always minimum 1
  };
}

/**
 * Validate if bet amount is within allowed limits
 */
function validateBet(betAmount, balance) {
  const limits = calculateBetLimits(balance);
  
  if (betAmount < limits.min) {
    throw new Error(`Minimum bet is ${limits.min} coins (2% of your balance)`);
  }
  
  if (betAmount > limits.max) {
    throw new Error(`Maximum bet is ${limits.max} coins (your current balance)`);
  }
  
  if (betAmount > balance) {
    throw new Error('Insufficient balance');
  }
  
  return true;
}

/**
 * Clamp bet to allowed limits
 */
function clampBet(betAmount, balance) {
  const limits = calculateBetLimits(balance);
  return Math.max(limits.min, Math.min(limits.max, betAmount));
}

module.exports = {
  calculateBetLimits,
  validateBet,
  clampBet
};
