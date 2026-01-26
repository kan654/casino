const crypto = require('crypto');

/**
 * Provably Fair System
 * Generates verifiable random numbers using client seed + server seed + nonce
 */

/**
 * Generate random number between 0 and max (exclusive)
 * Uses HMAC-SHA256 for provably fair random generation
 */
const generateProvablyFairNumber = (clientSeed, serverSeed, nonce, max = 100) => {
  // Combine seeds and nonce
  const message = `${clientSeed}:${nonce}`;
  
  // Generate HMAC
  const hmac = crypto.createHmac('sha256', serverSeed);
  hmac.update(message);
  const hash = hmac.digest('hex');
  
  // Convert first 8 characters of hash to number
  const subHash = hash.substring(0, 8);
  const number = parseInt(subHash, 16);
  
  // Convert to percentage (0-100) or custom max
  const result = (number / 0xFFFFFFFF) * max;
  
  return parseFloat(result.toFixed(2));
};

/**
 * Generate random integer between min and max (inclusive)
 */
const generateProvablyFairInteger = (clientSeed, serverSeed, nonce, min, max) => {
  const number = generateProvablyFairNumber(clientSeed, serverSeed, nonce, max - min + 1);
  return Math.floor(number) + min;
};

/**
 * Generate crash point (exponential distribution)
 * Lower crash points are more common than higher ones
 */
const generateCrashPoint = (serverSeed, gameSalt = '') => {
  // Use server seed + game salt for uniqueness
  const hash = crypto
    .createHash('sha256')
    .update(`${serverSeed}:${gameSalt}`)
    .digest('hex');
  
  // Convert first 13 hex chars to number
  const h = parseInt(hash.substring(0, 13), 16);
  const e = Math.pow(2, 52);
  
  // Apply house edge (1%)
  const houseEdge = 0.01;
  
  if (h % 33 === 0) {
    // 1 in 33 chance of instant crash at 1.00x
    return 1.00;
  }
  
  // Calculate crash point with exponential distribution
  const crashPoint = Math.floor((100 / (1 - houseEdge)) / (h / e)) / 100;
  
  // Clamp between 1.00 and 10000.00
  return Math.max(1.00, Math.min(10000.00, parseFloat(crashPoint.toFixed(2))));
};

/**
 * Generate slot reel result
 * Returns array of symbol IDs for one reel
 */
const generateSlotReel = (clientSeed, serverSeed, nonce, reelIndex, symbols, rows = 3) => {
  const reel = [];
  
  // Calculate total weight
  const totalWeight = symbols.reduce((sum, symbol) => sum + symbol.weight, 0);
  
  for (let row = 0; row < rows; row++) {
    // Generate random number for this position (0 to totalWeight)
    const randomValue = generateProvablyFairNumber(
      clientSeed,
      serverSeed,
      nonce + (reelIndex * 100) + row,
      totalWeight
    );
    
    // Select symbol based on weighted random
    let currentWeight = 0;
    let selectedSymbol = symbols[0]; // Fallback
    
    for (const symbol of symbols) {
      currentWeight += symbol.weight;
      if (randomValue <= currentWeight) {  // Changed < to <=
        selectedSymbol = symbol;
        break;
      }
    }
    
    reel.push(selectedSymbol.id);
  }
  
  return reel;
};

/**
 * Generate complete slot result (all reels)
 */
const generateSlotResult = (clientSeed, serverSeed, nonce, config) => {
  const reels = [];
  
  for (let i = 0; i < config.REELS; i++) {
    const reel = generateSlotReel(
      clientSeed,
      serverSeed,
      nonce,
      i,
      config.SYMBOLS,
      config.ROWS
    );
    reels.push(reel);
  }
  
  return reels;
};

/**
 * Hash server seed for verification
 */
const hashServerSeed = (serverSeed) => {
  return crypto
    .createHash('sha256')
    .update(serverSeed)
    .digest('hex');
};

/**
 * Verify game result
 * Allows users to verify the fairness of a game result
 */
const verifyResult = (clientSeed, serverSeed, nonce, expectedResult, gameType) => {
  try {
    let actualResult;
    
    switch (gameType) {
      case 'dice':
        actualResult = generateProvablyFairNumber(clientSeed, serverSeed, nonce, 100);
        break;
      case 'crash':
        actualResult = generateCrashPoint(serverSeed, clientSeed);
        break;
      default:
        return false;
    }
    
    return Math.abs(actualResult - expectedResult) < 0.01; // Allow small floating point differences
  } catch (error) {
    return false;
  }
};

module.exports = {
  generateProvablyFairNumber,
  generateProvablyFairInteger,
  generateCrashPoint,
  generateSlotReel,
  generateSlotResult,
  hashServerSeed,
  verifyResult
};
