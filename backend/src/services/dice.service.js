const { DICE_CONFIG } = require('../config/game.config');
const { generateProvablyFairNumber } = require('../utils/provablyFair');
const { calculateDicePayout, isDiceWin, formatCoins, calculateProfit } = require('../utils/gameCalculations');
const GameHistory = require('../models/GameHistory.model');
const { validateBet: validateBetAmount } = require('../utils/betManager');

/**
 * Dice Game Service
 * Handles dice game logic (roll over/under)
 */
class DiceService {
  /**
   * Validate bet parameters
   */
  static validateBet(betAmount, target, userBalance) {
    // Use global bet manager for dynamic limits
    validateBetAmount(betAmount, userBalance);
    
    if (target < DICE_CONFIG.MIN_CHANCE || target > DICE_CONFIG.MAX_CHANCE) {
      throw new Error(`Target must be between ${DICE_CONFIG.MIN_CHANCE} and ${DICE_CONFIG.MAX_CHANCE}`);
    }
    
    return true;
  }

  /**
   * Play dice game
   */
  static async roll(user, betAmount, target, isOver, clientSeed = null) {
    try {
      // Validate bet
      this.validateBet(betAmount, target, user.balance);
      
      // Use user's client seed or provided one
      const seedToUse = clientSeed || user.clientSeed;
      
      // Increment nonce for provably fair
      const currentNonce = user.nonce;
      user.incrementNonce();
      
      // Generate dice roll (0-100)
      const rollResult = generateProvablyFairNumber(
        seedToUse,
        user.serverSeed,
        currentNonce,
        DICE_CONFIG.MAX_NUMBER
      );
      
      // Calculate payout info
      const payoutInfo = calculateDicePayout(target, isOver, betAmount);
      
      // Check if win
      const isWin = isDiceWin(rollResult, target, isOver);
      
      // Calculate actual payout
      const payout = isWin ? parseFloat(payoutInfo.potentialPayout) : 0;
      const profit = calculateProfit(payout, betAmount);
      
      // Store balance before
      const balanceBefore = user.balance;
      
      // Update user balance
      user.balance -= betAmount;
      user.balance += payout;
      user.totalWagered += betAmount;
      if (payout > 0) {
        user.totalWon += payout;
      }
      user.gamesPlayed += 1;
      
      await user.save();
      
      // Create game history record
      const gameHistory = await GameHistory.create({
        user: user._id,
        username: user.username,
        gameType: 'dice',
        betAmount: formatCoins(betAmount),
        payout: formatCoins(payout),
        profit: formatCoins(profit),
        multiplier: parseFloat(payoutInfo.multiplier),
        gameData: {
          rollResult: rollResult,
          target: target,
          isOver: isOver,
          winChance: payoutInfo.winChance
        },
        provablyFair: {
          clientSeed: seedToUse,
          serverSeed: user.serverSeed,
          serverSeedHash: user.serverSeedHash,
          nonce: currentNonce,
          result: rollResult.toString()
        },
        balanceBefore: formatCoins(balanceBefore),
        balanceAfter: formatCoins(user.balance),
        isWin: isWin
      });
      
      return {
        success: true,
        result: {
          rollResult: rollResult,
          target: target,
          isOver: isOver,
          isWin: isWin,
          payout: formatCoins(payout),
          profit: formatCoins(profit),
          multiplier: parseFloat(payoutInfo.multiplier),
          winChance: payoutInfo.winChance,
          balance: formatCoins(user.balance)
        },
        provablyFair: {
          clientSeed: seedToUse,
          serverSeedHash: user.serverSeedHash,
          nonce: currentNonce
        },
        gameId: gameHistory._id
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get dice configuration (for client)
   */
  static getConfig() {
    return {
      minNumber: DICE_CONFIG.MIN_NUMBER,
      maxNumber: DICE_CONFIG.MAX_NUMBER,
      minBet: DICE_CONFIG.MIN_BET,
      maxBet: DICE_CONFIG.MAX_BET,
      minChance: DICE_CONFIG.MIN_CHANCE,
      maxChance: DICE_CONFIG.MAX_CHANCE,
      houseEdge: DICE_CONFIG.HOUSE_EDGE
    };
  }
}

module.exports = DiceService;
