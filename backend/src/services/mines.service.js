const { MINES_CONFIG } = require('../config/game.config');
const { generateProvablyFairNumber } = require('../utils/provablyFair');
const { formatCoins, calculateProfit } = require('../utils/gameCalculations');
const GameHistory = require('../models/GameHistory.model');
const { validateBet: validateBetAmount } = require('../utils/betManager');

/**
 * Mines Game Service
 * Grid-based mine-sweeper style game with provably fair mine placement
 */
class MinesService {
  // Store active games in memory (in production, use Redis)
  static activeGames = new Map();

  /**
   * Calculate multiplier based on revealed tiles and mine count
   */
  static calculateMultiplier(revealed, mineCount) {
    const totalTiles = MINES_CONFIG.GRID_SIZE;
    const safeTiles = totalTiles - mineCount;
    
    if (revealed === 0) return 1.0;
    
    // Calculate probability-based multiplier
    let multiplier = 1.0;
    for (let i = 0; i < revealed; i++) {
      const tilesRemaining = totalTiles - i;
      const safeTilesRemaining = safeTiles - i;
      multiplier *= tilesRemaining / safeTilesRemaining;
    }
    
    // Apply house edge
    multiplier *= (1 - MINES_CONFIG.HOUSE_EDGE);
    
    return parseFloat(multiplier.toFixed(4));
  }

  /**
   * Generate mine positions using provably fair RNG
   */
  static generateMinePositions(clientSeed, serverSeed, nonce, mineCount) {
    const positions = new Set();
    let currentNonce = nonce;
    
    while (positions.size < mineCount) {
      const randomValue = generateProvablyFairNumber(
        clientSeed,
        serverSeed,
        currentNonce,
        MINES_CONFIG.GRID_SIZE
      );
      
      const position = Math.floor(randomValue);
      positions.add(position);
      currentNonce++;
    }
    
    return Array.from(positions);
  }

  /**
   * Start a new mines game
   */
  static async startGame(user, betAmount, mineCount, clientSeed = null) {
    try {
      // Validate bet amount using global bet manager
      validateBetAmount(betAmount, user.balance);
      
      if (mineCount < MINES_CONFIG.MIN_MINES || mineCount > MINES_CONFIG.MAX_MINES) {
        throw new Error(`Mine count must be between ${MINES_CONFIG.MIN_MINES} and ${MINES_CONFIG.MAX_MINES}`);
      }

      // Check if user already has an active game
      if (this.activeGames.has(user._id.toString())) {
        throw new Error('You already have an active game. Please cash out or finish it first.');
      }
      
      // Use user's client seed or provided one
      const seedToUse = clientSeed || user.clientSeed;
      
      // Increment nonce for provably fair
      const currentNonce = user.nonce;
      user.incrementNonce();
      
      // Generate mine positions
      const minePositions = this.generateMinePositions(
        seedToUse,
        user.serverSeed,
        currentNonce,
        mineCount
      );
      
      // Deduct bet from balance
      user.balance -= betAmount;
      await user.save();
      
      // Create active game
      const gameId = `${user._id}_${Date.now()}`;
      const game = {
        gameId,
        userId: user._id.toString(),
        username: user.username,
        betAmount,
        mineCount,
        minePositions,
        revealedTiles: [],
        currentMultiplier: 1.0,
        status: 'active',
        clientSeed: seedToUse,
        serverSeed: user.serverSeed,
        serverSeedHash: user.serverSeedHash,
        nonce: currentNonce,
        balanceBefore: user.balance + betAmount,
        startedAt: Date.now()
      };
      
      this.activeGames.set(user._id.toString(), game);
      
      return {
        success: true,
        data: {
          gameId,
          gridSize: MINES_CONFIG.GRID_SIZE,
          mineCount,
          currentMultiplier: 1.0,
          revealedTiles: [],
          status: 'active'
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reveal a tile
   */
  static async revealTile(user, position) {
    try {
      const game = this.activeGames.get(user._id.toString());
      
      if (!game) {
        throw new Error('No active game found');
      }
      
      if (game.status !== 'active') {
        throw new Error('Game is not active');
      }
      
      if (position < 0 || position >= MINES_CONFIG.GRID_SIZE) {
        throw new Error('Invalid tile position');
      }
      
      if (game.revealedTiles.includes(position)) {
        throw new Error('Tile already revealed');
      }
      
      // Check if tile is a mine
      const isMine = game.minePositions.includes(position);
      
      if (isMine) {
        // Player hit a mine - game over
        game.status = 'lost';
        game.revealedTiles.push(position);
        
        // Save game history
        await this.saveGameHistory(game, user, false);
        
        // Remove from active games
        this.activeGames.delete(user._id.toString());
        
        return {
          success: true,
          data: {
            revealed: position,
            isMine: true,
            gameOver: true,
            payout: 0,
            profit: -game.betAmount,
            minePositions: game.minePositions,
            revealedTiles: game.revealedTiles,
            currentMultiplier: 0
          }
        };
      } else {
        // Safe tile
        game.revealedTiles.push(position);
        game.currentMultiplier = this.calculateMultiplier(
          game.revealedTiles.length,
          game.mineCount
        );
        
        // Check if all safe tiles are revealed (max win)
        const maxSafeTiles = MINES_CONFIG.GRID_SIZE - game.mineCount;
        const gameComplete = game.revealedTiles.length === maxSafeTiles;
        
        if (gameComplete) {
          // Auto cash out - all safe tiles revealed
          return await this.cashOut(user);
        }
        
        return {
          success: true,
          data: {
            revealed: position,
            isMine: false,
            gameOver: false,
            currentMultiplier: game.currentMultiplier,
            revealedTiles: game.revealedTiles,
            possiblePayout: formatCoins(game.betAmount * game.currentMultiplier)
          }
        };
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cash out current game
   */
  static async cashOut(user) {
    try {
      const game = this.activeGames.get(user._id.toString());
      
      if (!game) {
        throw new Error('No active game found');
      }
      
      if (game.status !== 'active') {
        throw new Error('Game is not active');
      }
      
      if (game.revealedTiles.length === 0) {
        throw new Error('Cannot cash out without revealing any tiles');
      }
      
      // Calculate payout
      const payout = game.betAmount * game.currentMultiplier;
      
      // Update user balance
      user.balance += payout;
      await user.save();
      
      // Update game status
      game.status = 'won';
      
      // Save game history
      await this.saveGameHistory(game, user, true, payout);
      
      // Remove from active games
      this.activeGames.delete(user._id.toString());
      
      return {
        success: true,
        data: {
          gameOver: true,
          payout: formatCoins(payout),
          profit: formatCoins(payout - game.betAmount),
          multiplier: game.currentMultiplier,
          balance: formatCoins(user.balance),
          revealedTiles: game.revealedTiles,
          minePositions: game.minePositions
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current game state
   */
  static getCurrentGame(user) {
    const game = this.activeGames.get(user._id.toString());
    
    if (!game) {
      return null;
    }
    
    return {
      gameId: game.gameId,
      gridSize: MINES_CONFIG.GRID_SIZE,
      mineCount: game.mineCount,
      revealedTiles: game.revealedTiles,
      currentMultiplier: game.currentMultiplier,
      possiblePayout: formatCoins(game.betAmount * game.currentMultiplier),
      betAmount: formatCoins(game.betAmount),
      status: game.status
    };
  }

  /**
   * Save game to history
   */
  static async saveGameHistory(game, user, isWin, payout = 0) {
    const profit = payout - game.betAmount;
    
    await GameHistory.create({
      user: user._id,
      username: user.username,
      gameType: 'mines',
      betAmount: formatCoins(game.betAmount),
      payout: formatCoins(payout),
      profit: formatCoins(profit),
      multiplier: game.currentMultiplier,
      gameData: {
        mineCount: game.mineCount,
        revealedTiles: game.revealedTiles,
        minePositions: game.minePositions,
        gridSize: MINES_CONFIG.GRID_SIZE
      },
      provablyFair: {
        clientSeed: game.clientSeed,
        serverSeed: game.serverSeed,
        serverSeedHash: game.serverSeedHash,
        nonce: game.nonce,
        result: JSON.stringify({ minePositions: game.minePositions })
      },
      balanceBefore: formatCoins(game.balanceBefore),
      balanceAfter: formatCoins(user.balance),
      isWin
    });
  }

  /**
   * Get mines configuration (for client)
   */
  static getConfig() {
    return {
      minBet: MINES_CONFIG.MIN_BET,
      maxBet: MINES_CONFIG.MAX_BET,
      gridSize: MINES_CONFIG.GRID_SIZE,
      minMines: MINES_CONFIG.MIN_MINES,
      maxMines: MINES_CONFIG.MAX_MINES
    };
  }
}

module.exports = MinesService;
