const { SLOTS_CONFIG } = require('../config/game.config');

/**
 * Calculate slot game payout
 * Checks paylines for winning combinations
 */
const calculateSlotPayout = (reels, betAmount) => {
  let totalWin = 0;
  const winningLines = [];
  
  // Check each payline
  SLOTS_CONFIG.PAYLINES.forEach((payline, lineIndex) => {
    const symbolsOnLine = payline.map((row, reelIndex) => reels[reelIndex][row]);
    
    // Check for matching symbols
    const firstSymbol = symbolsOnLine[0];
    let matchCount = 1;
    
    for (let i = 1; i < symbolsOnLine.length; i++) {
      if (symbolsOnLine[i] === firstSymbol) {
        matchCount++;
      } else {
        break;
      }
    }
    
    // Calculate win if enough matching symbols
    if (matchCount >= SLOTS_CONFIG.MIN_MATCHING) {
      const symbol = SLOTS_CONFIG.SYMBOLS.find(s => s.id === firstSymbol);
      if (symbol) {
        // Fixed formula: betAmount * symbol.value (removed * matchCount multiplication)
        const lineWin = betAmount * symbol.value;
        totalWin += lineWin;
        
        winningLines.push({
          line: lineIndex,
          symbol: firstSymbol,
          count: matchCount,
          payout: lineWin
        });
      }
    }
  });
  
  return {
    totalWin,
    winningLines,
    multiplier: totalWin > 0 ? (totalWin / betAmount).toFixed(2) : 0
  };
};

/**
 * Calculate dice game payout
 */
const calculateDicePayout = (target, isOver, betAmount) => {
  const { HOUSE_EDGE, MAX_NUMBER } = require('../config/game.config').DICE_CONFIG;
  
  // Calculate win chance
  const winChance = isOver ? (MAX_NUMBER - target) : target;
  
  // Ensure valid win chance
  if (winChance <= 0 || winChance >= MAX_NUMBER) {
    throw new Error('Invalid win chance');
  }
  
  // Calculate multiplier with house edge
  const multiplier = ((MAX_NUMBER / winChance) * (1 - HOUSE_EDGE)).toFixed(4);
  
  return {
    multiplier: parseFloat(multiplier),
    winChance: (winChance / MAX_NUMBER * 100).toFixed(2),
    potentialPayout: (betAmount * multiplier).toFixed(2)
  };
};

/**
 * Check if dice roll is a win
 */
const isDiceWin = (rollResult, target, isOver) => {
  return isOver ? rollResult > target : rollResult < target;
};

/**
 * Calculate crash game multiplier at given time
 */
const calculateCrashMultiplier = (elapsedTime) => {
  // Exponential growth formula
  // Multiplier = e^(0.00006 * t) where t is time in milliseconds
  const growthRate = 0.00006;
  const multiplier = Math.pow(Math.E, growthRate * elapsedTime);
  
  return Math.max(1.00, parseFloat(multiplier.toFixed(2)));
};

/**
 * Calculate crash payout
 */
const calculateCrashPayout = (betAmount, cashoutMultiplier) => {
  return parseFloat((betAmount * cashoutMultiplier).toFixed(2));
};

/**
 * Format currency (virtual coins)
 */
const formatCoins = (amount) => {
  return parseFloat(amount.toFixed(2));
};

/**
 * Calculate profit
 */
const calculateProfit = (payout, betAmount) => {
  return formatCoins(payout - betAmount);
};

module.exports = {
  calculateSlotPayout,
  calculateDicePayout,
  isDiceWin,
  calculateCrashMultiplier,
  calculateCrashPayout,
  formatCoins,
  calculateProfit
};
