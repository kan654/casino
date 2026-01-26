const mongoose = require('mongoose');

/**
 * Crash Game Schema
 * Stores active and completed crash games
 */
const crashGameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['waiting', 'running', 'crashed', 'cancelled'],
    default: 'waiting'
  },
  crashPoint: {
    type: Number,
    required: true,
    min: 1.0
  },
  // Server seed for this specific game
  serverSeed: {
    type: String,
    required: true
  },
  serverSeedHash: {
    type: String,
    required: true
  },
  // Bets placed in this game
  bets: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    betAmount: {
      type: Number,
      required: true,
      min: 0
    },
    cashoutMultiplier: {
      type: Number,
      default: null
    },
    payout: {
      type: Number,
      default: 0
    },
    profit: {
      type: Number,
      default: 0
    },
    cashedOut: {
      type: Boolean,
      default: false
    },
    placedAt: {
      type: Date,
      default: Date.now
    },
    cashedOutAt: {
      type: Date,
      default: null
    }
  }],
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  currentMultiplier: {
    type: Number,
    default: 1.0
  }
}, {
  timestamps: true
});

// Index for efficient queries
crashGameSchema.index({ gameId: 1 });
crashGameSchema.index({ status: 1 });
crashGameSchema.index({ createdAt: -1 });

const CrashGame = mongoose.model('CrashGame', crashGameSchema);

module.exports = CrashGame;
