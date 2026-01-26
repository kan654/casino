const mongoose = require('mongoose');

/**
 * Trading Position Schema
 * Real-time trading positions with live PnL calculation
 */
const positionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    username: {
      type: String,
      required: true
    },
    assetId: {
      type: String,
      required: true,
      enum: ['BTC', 'ETH', 'BNB', 'SOL', 'ADA']
    },
    direction: {
      type: String,
      required: true,
      enum: ['long', 'short']
    },
    stake: {
      type: Number,
      required: true,
      min: 0
    },
    leverage: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 10
    },
    entryPrice: {
      type: Number,
      required: true
    },
    exitPrice: {
      type: Number,
      default: null
    },
    pnl: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'liquidated'],
      default: 'open',
      index: true
    },
    liquidationPrice: {
      type: Number,
      default: null
    },
    openedAt: {
      type: Date,
      default: Date.now
    },
    closedAt: {
      type: Date,
      default: null
    },
    provablyFair: {
      clientSeed: String,
      serverSeed: String,
      serverSeedHash: String,
      nonce: Number
    }
  },
  {
    timestamps: true
  }
);

// Index for finding open positions
positionSchema.index({ user: 1, status: 1 });

// Virtual for position duration
positionSchema.virtual('duration').get(function() {
  const end = this.closedAt || new Date();
  return Math.floor((end - this.openedAt) / 1000); // seconds
});

// Calculate PnL based on current price
positionSchema.methods.calculatePnL = function(currentPrice) {
  const priceChange = currentPrice - this.entryPrice;
  const percentChange = priceChange / this.entryPrice;
  
  if (this.direction === 'long') {
    // LONG: profit when price goes up
    return percentChange * this.stake * this.leverage;
  } else {
    // SHORT: profit when price goes down
    return -percentChange * this.stake * this.leverage;
  }
};

// Calculate liquidation price
positionSchema.methods.calculateLiquidationPrice = function() {
  const LIQUIDATION_THRESHOLD = 0.8; // 80% loss triggers liquidation
  const lossPercent = LIQUIDATION_THRESHOLD / this.leverage;
  
  if (this.direction === 'long') {
    // LONG liquidation: when price drops by lossPercent
    return this.entryPrice * (1 - lossPercent);
  } else {
    // SHORT liquidation: when price rises by lossPercent
    return this.entryPrice * (1 + lossPercent);
  }
};

// Check if position should be liquidated
positionSchema.methods.shouldLiquidate = function(currentPrice) {
  if (this.status !== 'open') return false;
  
  const pnl = this.calculatePnL(currentPrice);
  const lossPercent = Math.abs(pnl / this.stake);
  
  return lossPercent >= 0.8; // Liquidate at 80% loss
};

module.exports = mongoose.model('Position', positionSchema);
