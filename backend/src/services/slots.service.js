const { SLOTS_CONFIG } = require('../config/game.config');
const { generateSlotResult } = require('../utils/provablyFair');
const { calculateSlotPayout, formatCoins, calculateProfit } = require('../utils/gameCalculations');
const GameHistory = require('../models/GameHistory.model');

/**
 * Slots Game Service
 * Handles slot machine game logic
 */
class SlotsService {
  /**
   * Validate bet amount
   */
  static validateBet(betAmount, userBalance) {
    if (betAmount < SLOTS_CONFIG.MIN_BET) {
      throw new Error(`Minimum bet is ${SLOTS_CONFIG.MIN_BET} coins`);
    }
    
    if (betAmount > SLOTS_CONFIG.MAX_BET) {
      throw new Error(`Maximum bet is ${SLOTS_CONFIG.MAX_BET} coins`);
    }
    
    if (betAmount > userBalance) {
      throw new Error('Insufficient balance');
    }
    
    return true;
  }

  /**
   * Play slots game
   */
  static async spin(user, betAmount, clientSeed = null) {
    try {
      // Validate bet
      this.validateBet(betAmount, user.balance);
      
      // Use user's client seed or provided one
      const seedToUse = clientSeed || user.clientSeed;
      
      // Increment nonce for provably fair
      const currentNonce = user.nonce;
      user.incrementNonce();
      
      // Generate slot result
      const reels = generateSlotResult(
        seedToUse,
        user.serverSeed,
        currentNonce,
        SLOTS_CONFIG
      );
      
      // Calculate payout
      const payoutInfo = calculateSlotPayout(reels, betAmount);
      const payout = payoutInfo.totalWin;
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
        gameType: 'slots',
        betAmount: formatCoins(betAmount),
        payout: formatCoins(payout),
        profit: formatCoins(profit),
        multiplier: parseFloat(payoutInfo.multiplier),
        gameData: {
          reels,
          winningLines: payoutInfo.winningLines
        },
        provablyFair: {
          clientSeed: seedToUse,
          serverSeed: user.serverSeed,
          serverSeedHash: user.serverSeedHash,
          nonce: currentNonce,
          result: JSON.stringify(reels)
        },
        balanceBefore: formatCoins(balanceBefore),
        balanceAfter: formatCoins(user.balance),
        isWin: payout > 0 // Win if any payout received
      });
      
      return {
        success: true,
        result: {
          reels,
          winningLines: payoutInfo.winningLines,
          payout: formatCoins(payout),
          profit: formatCoins(profit),
          multiplier: parseFloat(payoutInfo.multiplier),
          balance: formatCoins(user.balance),
          isWin: payout > 0 // Win if any payout received
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
   * Get slot configuration (for client)
   */
  static getConfig() {
    return {
      reels: SLOTS_CONFIG.REELS,
      rows: SLOTS_CONFIG.ROWS,
      symbols: SLOTS_CONFIG.SYMBOLS.map(s => ({
        id: s.id,
        value: s.value
      })),
      paylines: SLOTS_CONFIG.PAYLINES,
      minBet: SLOTS_CONFIG.MIN_BET,
      maxBet: SLOTS_CONFIG.MAX_BET
    };
  }
}

module.exports = SlotsService;
