const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_CONFIG } = require('../config/game.config');

/**
 * User Schema
 * Stores user authentication and balance information
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username must be less than 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  balance: {
    type: Number,
    default: USER_CONFIG.INITIAL_BALANCE,
    min: [0, 'Balance cannot be negative']
  },
  // Provably fair seeds
  clientSeed: {
    type: String,
    default: () => require('crypto').randomBytes(16).toString('hex')
  },
  serverSeed: {
    type: String,
    default: () => require('crypto').randomBytes(32).toString('hex')
  },
  serverSeedHash: {
    type: String
  },
  nonce: {
    type: Number,
    default: 0
  },
  totalWagered: {
    type: Number,
    default: 0
  },
  totalWon: {
    type: Number,
    default: 0
  },
  gamesPlayed: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  lastDailyReward: {
    type: Date,
    default: null
  },
  // Ad tracking
  adsWatched: {
    type: Number,
    default: 0
  },
  coinsEarnedFromAds: {
    type: Number,
    default: 0
  },
  lastAdWatched: {
    type: Date,
    default: null
  },
  canWatchAd: {
    type: Boolean,
    default: false // True only when balance = 0
  }
}, {
  timestamps: true
});

/**
 * Hash password before saving
 */
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Generate server seed hash
 */
userSchema.pre('save', function(next) {
  if (this.isModified('serverSeed')) {
    const crypto = require('crypto');
    this.serverSeedHash = crypto
      .createHash('sha256')
      .update(this.serverSeed)
      .digest('hex');
  }
  next();
});

/**
 * Compare password method
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Rotate server seed (for provably fair)
 */
userSchema.methods.rotateServerSeed = function() {
  const crypto = require('crypto');
  this.serverSeed = crypto.randomBytes(32).toString('hex');
  this.serverSeedHash = crypto
    .createHash('sha256')
    .update(this.serverSeed)
    .digest('hex');
  this.nonce = 0;
  return this.serverSeedHash;
};

/**
 * Increment nonce
 */
userSchema.methods.incrementNonce = function() {
  this.nonce += 1;
  return this.nonce;
};

/**
 * Update balance
 */
userSchema.methods.updateBalance = function(amount) {
  this.balance += amount;
  if (amount < 0) {
    this.totalWagered += Math.abs(amount);
  } else {
    this.totalWon += amount;
  }
  this.gamesPlayed += 1;
  
  // Update canWatchAd flag based on balance
  this.canWatchAd = this.balance === 0;
  
  return this.balance;
};

/**
 * Watch rewarded ad and get coins
 */
userSchema.methods.watchRewardedAd = function(rewardAmount = 1000) {
  if (this.balance !== 0) {
    throw new Error('Can only watch ad when balance is 0');
  }
  
  this.balance += rewardAmount;
  this.adsWatched += 1;
  this.coinsEarnedFromAds += rewardAmount;
  this.lastAdWatched = new Date();
  this.canWatchAd = false; // Block until next reset
  
  return {
    newBalance: this.balance,
    reward: rewardAmount,
    totalAdsWatched: this.adsWatched
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
