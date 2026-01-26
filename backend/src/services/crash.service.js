const { CRASH_CONFIG } = require('../config/game.config');
const { generateCrashPoint, hashServerSeed } = require('../utils/provablyFair');
const { calculateCrashMultiplier, calculateCrashPayout, formatCoins, calculateProfit } = require('../utils/gameCalculations');
const CrashGame = require('../models/CrashGame.model');
const GameHistory = require('../models/GameHistory.model');
const User = require('../models/User.model');
const crypto = require('crypto');

/**
 * Crash Game Service
 * Handles real-time crash game logic
 */
class CrashService {
  static currentGame = null;
  static gameInterval = null;

  /**
   * Initialize a new crash game
   */
  static async createNewGame() {
    try {
      // Generate unique game ID
      const gameId = crypto.randomBytes(8).toString('hex');
      
      // Generate server seed for this game
      const serverSeed = crypto.randomBytes(32).toString('hex');
      const serverSeedHash = hashServerSeed(serverSeed);
      
      // Generate crash point
      const crashPoint = generateCrashPoint(serverSeed, gameId);
      
      // Create game in database
      const game = await CrashGame.create({
        gameId,
        status: 'waiting',
        crashPoint,
        serverSeed,
        serverSeedHash,
        bets: [],
        currentMultiplier: 1.0
      });
      
      this.currentGame = game;
      
      console.log(`New crash game created: ${gameId}, crash point: ${crashPoint}x`);
      
      return game;
    } catch (error) {
      console.error('Error creating crash game:', error);
      throw error;
    }
  }

  /**
   * Place a bet in the current game
   */
  static async placeBet(user, betAmount, io) {
    try {
      // Validate bet amount
      if (betAmount < CRASH_CONFIG.MIN_BET) {
        throw new Error(`Minimum bet is ${CRASH_CONFIG.MIN_BET} coins`);
      }
      
      if (betAmount > CRASH_CONFIG.MAX_BET) {
        throw new Error(`Maximum bet is ${CRASH_CONFIG.MAX_BET} coins`);
      }
      
      if (betAmount > user.balance) {
        throw new Error('Insufficient balance');
      }
      
      // Check if game exists and is in waiting state
      if (!this.currentGame || this.currentGame.status !== 'waiting') {
        throw new Error('Cannot place bet at this time');
      }
      
      // Check if user already has a bet in this game
      const existingBet = this.currentGame.bets.find(
        bet => bet.user.toString() === user._id.toString()
      );
      
      if (existingBet) {
        throw new Error('You already have a bet in this game');
      }
      
      // Deduct bet amount from user balance
      user.balance -= betAmount;
      user.totalWagered += betAmount;
      await user.save();
      
      // Add bet to game
      const bet = {
        user: user._id,
        username: user.username,
        betAmount: formatCoins(betAmount),
        cashedOut: false,
        cashoutMultiplier: null,
        payout: 0,
        profit: 0,
        placedAt: new Date()
      };
      
      this.currentGame.bets.push(bet);
      await this.currentGame.save();
      
      // Broadcast new bet to all clients
      io.emit('crash:bet_placed', {
        gameId: this.currentGame.gameId,
        bet: {
          username: user.username,
          betAmount: formatCoins(betAmount)
        }
      });
      
      return {
        success: true,
        message: 'Bet placed successfully',
        gameId: this.currentGame.gameId,
        betAmount: formatCoins(betAmount),
        balance: formatCoins(user.balance)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cash out from current game
   */
  static async cashOut(user, io) {
    try {
      // Check if game is running
      if (!this.currentGame || this.currentGame.status !== 'running') {
        throw new Error('Cannot cash out at this time');
      }
      
      // Find user's bet
      const betIndex = this.currentGame.bets.findIndex(
        bet => bet.user.toString() === user._id.toString() && !bet.cashedOut
      );
      
      if (betIndex === -1) {
        throw new Error('No active bet found');
      }
      
      const bet = this.currentGame.bets[betIndex];
      const currentMultiplier = this.currentGame.currentMultiplier;
      
      // Calculate payout
      const payout = calculateCrashPayout(bet.betAmount, currentMultiplier);
      const profit = calculateProfit(payout, bet.betAmount);
      
      // Update bet
      bet.cashedOut = true;
      bet.cashoutMultiplier = currentMultiplier;
      bet.payout = formatCoins(payout);
      bet.profit = formatCoins(profit);
      bet.cashedOutAt = new Date();
      
      // Update user balance
      user.balance += payout;
      user.totalWon += payout;
      await user.save();
      
      await this.currentGame.save();
      
      // Broadcast cashout to all clients
      io.emit('crash:player_cashed_out', {
        gameId: this.currentGame.gameId,
        username: user.username,
        multiplier: currentMultiplier,
        payout: formatCoins(payout)
      });
      
      return {
        success: true,
        message: 'Cashed out successfully',
        multiplier: currentMultiplier,
        payout: formatCoins(payout),
        profit: formatCoins(profit),
        balance: formatCoins(user.balance)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Start the crash game
   */
  static async startGame(io) {
    if (!this.currentGame || this.currentGame.status !== 'waiting') {
      return;
    }
    
    // Update game status
    this.currentGame.status = 'running';
    this.currentGame.startTime = new Date();
    await this.currentGame.save();
    
    // Broadcast game started
    io.emit('crash:game_started', {
      gameId: this.currentGame.gameId,
      serverSeedHash: this.currentGame.serverSeedHash
    });
    
    console.log(`Crash game started: ${this.currentGame.gameId}`);
    
    // Start multiplier updates
    const startTime = Date.now();
    
    this.gameInterval = setInterval(async () => {
      const elapsedTime = Date.now() - startTime;
      const currentMultiplier = calculateCrashMultiplier(elapsedTime);
      
      this.currentGame.currentMultiplier = currentMultiplier;
      
      // Broadcast multiplier update
      io.emit('crash:multiplier_update', {
        gameId: this.currentGame.gameId,
        multiplier: currentMultiplier
      });
      
      // Check if crash point reached
      if (currentMultiplier >= this.currentGame.crashPoint) {
        await this.crashGame(io);
      }
    }, CRASH_CONFIG.MULTIPLIER_TICK_RATE);
  }

  /**
   * End the crash game
   */
  static async crashGame(io) {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
    
    if (!this.currentGame) return;
    
    // Update game status
    this.currentGame.status = 'crashed';
    this.currentGame.endTime = new Date();
    this.currentGame.currentMultiplier = this.currentGame.crashPoint;
    
    // Process all bets and create history records
    for (const bet of this.currentGame.bets) {
      const user = await User.findById(bet.user);
      
      if (!user) continue;
      
      // If player didn't cash out, they lose
      if (!bet.cashedOut) {
        bet.payout = 0;
        bet.profit = -bet.betAmount;
      }
      
      // Create game history
      await GameHistory.create({
        user: user._id,
        username: user.username,
        gameType: 'crash',
        betAmount: bet.betAmount,
        payout: bet.payout,
        profit: bet.profit,
        multiplier: bet.cashoutMultiplier || 0,
        gameData: {
          crashPoint: this.currentGame.crashPoint,
          cashedOut: bet.cashedOut,
          cashoutMultiplier: bet.cashoutMultiplier
        },
        provablyFair: {
          serverSeed: this.currentGame.serverSeed,
          serverSeedHash: this.currentGame.serverSeedHash,
          result: this.currentGame.crashPoint.toString()
        },
        balanceBefore: user.balance - bet.payout,
        balanceAfter: user.balance,
        isWin: bet.cashedOut && bet.payout > bet.betAmount
      });
      
      user.gamesPlayed += 1;
      await user.save();
    }
    
    await this.currentGame.save();
    
    // Broadcast game crashed
    io.emit('crash:game_crashed', {
      gameId: this.currentGame.gameId,
      crashPoint: this.currentGame.crashPoint,
      serverSeed: this.currentGame.serverSeed
    });
    
    console.log(`Crash game ended: ${this.currentGame.gameId}, crashed at ${this.currentGame.crashPoint}x`);
    
    // Wait 5 seconds before starting new game
    setTimeout(() => {
      this.createNewGame().then(game => {
        io.emit('crash:new_game', {
          gameId: game.gameId,
          serverSeedHash: game.serverSeedHash
        });
        
        // Auto-start game after 10 seconds
        setTimeout(() => {
          this.startGame(io);
        }, 10000);
      });
    }, 5000);
  }

  /**
   * Get current game state
   */
  static async getCurrentGame() {
    return this.currentGame;
  }

  /**
   * Get crash configuration (for client)
   */
  static getConfig() {
    return {
      minBet: CRASH_CONFIG.MIN_BET,
      maxBet: CRASH_CONFIG.MAX_BET,
      minMultiplier: CRASH_CONFIG.MIN_MULTIPLIER,
      maxMultiplier: CRASH_CONFIG.MAX_MULTIPLIER
    };
  }
}

module.exports = CrashService;
