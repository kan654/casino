const mongoose = require('mongoose');

/**
 * Game History Schema
 * Stores all game results for transparency and history
 */
const gameHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  gameType: {
    type: String,
    required: true,
    enum: ['slots', 'dice', 'coinflip', 'mines', 'trading', 'crash']
  },
  betAmount: {
    type: Number,
    required: true,
    min: 0
  },
  payout: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  profit: {
    type: Number,
    required: true
  },
  multiplier: {
    type: Number,
    default: 0
  },
  // Game-specific data
  gameData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  // Provably fair verification data
  provablyFair: {
    clientSeed: String,
    serverSeed: String,
    serverSeedHash: String,
    nonce: Number,
    result: String
  },
  // Balance before and after
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  isWin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
gameHistorySchema.index({ user: 1, createdAt: -1 });
gameHistorySchema.index({ gameType: 1, createdAt: -1 });
gameHistorySchema.index({ createdAt: -1 });

const GameHistory = mongoose.model('GameHistory', gameHistorySchema);

module.exports = GameHistory;
