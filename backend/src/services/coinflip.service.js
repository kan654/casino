const { COINFLIP_CONFIG } = require('../config/game.config');
const { generateProvablyFairNumber } = require('../utils/provablyFair');
const { formatCoins, calculateProfit } = require('../utils/gameCalculations');
const GameHistory = require('../models/GameHistory.model');
const { validateBet: validateBetAmount } = require('../utils/betManager');

/**
 * Coinflip Game Service
 * Simple heads/tails game with 50/50 odds and 1.98x payout
 */
class CoinflipService {
  /**
   * Validate bet amount
   */
  static validateBet(betAmount, userBalance) {
    // Use global bet manager for dynamic limits
    return validateBetAmount(betAmount, userBalance);
  }

  /**
   * Validate player choice
   */
  static validateChoice(choice) {
    if (!COINFLIP_CONFIG.SIDES.includes(choice)) {
      throw new Error('Invalid choice. Must be "heads" or "tails"');
    }
    return true;
  }

  /**
   * Play coinflip game
   */
  static async flip(user, betAmount, choice, clientSeed = null) {
    try {
      // Validate bet and choice
      this.validateBet(betAmount, user.balance);
      this.validateChoice(choice);
      
      // Use user's client seed or provided one
      const seedToUse = clientSeed || user.clientSeed;
      
      // Increment nonce for provably fair
      const currentNonce = user.nonce;
      user.incrementNonce();
      
      // Generate random number (0-100)
      const randomNumber = generateProvablyFairNumber(
        seedToUse,
        user.serverSeed,
        currentNonce,
        100
      );
      
      // Determine result: 0-49 = heads, 50-99 = tails
      const result = randomNumber < 50 ? 'heads' : 'tails';
      const isWin = result === choice;
      
      // Calculate payout
      const payout = isWin ? betAmount * COINFLIP_CONFIG.PAYOUT_MULTIPLIER : 0;
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
        gameType: 'coinflip',
        betAmount: formatCoins(betAmount),
        payout: formatCoins(payout),
        profit: formatCoins(profit),
        multiplier: isWin ? COINFLIP_CONFIG.PAYOUT_MULTIPLIER : 0,
        gameData: {
          choice,
          result,
          randomNumber: parseFloat(randomNumber.toFixed(2))
        },
        provablyFair: {
          clientSeed: seedToUse,
          serverSeed: user.serverSeed,
          serverSeedHash: user.serverSeedHash,
          nonce: currentNonce,
          result: JSON.stringify({ result, randomNumber })
        },
        balanceBefore: formatCoins(balanceBefore),
        balanceAfter: formatCoins(user.balance),
        isWin
      });
      
      return {
        success: true,
        result: {
          choice,
          result,
          isWin,
          randomNumber: parseFloat(randomNumber.toFixed(2)),
          payout: formatCoins(payout),
          profit: formatCoins(profit),
          multiplier: isWin ? COINFLIP_CONFIG.PAYOUT_MULTIPLIER : 0,
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
   * Get coinflip configuration (for client)
   */
  static getConfig() {
    return {
      minBet: COINFLIP_CONFIG.MIN_BET,
      maxBet: COINFLIP_CONFIG.MAX_BET,
      payoutMultiplier: COINFLIP_CONFIG.PAYOUT_MULTIPLIER,
      sides: COINFLIP_CONFIG.SIDES
    };
  }
}

module.exports = CoinflipService;
