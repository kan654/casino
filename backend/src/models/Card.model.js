const mongoose = require('mongoose');

/**
 * Card Schema
 * Represents collectible cards with different rarities
 */
const cardSchema = new mongoose.Schema({
  cardId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  rarity: {
    type: String,
    required: true,
    enum: ['common', 'uncommon', 'rare', 'very_rare', 'legendary'],
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'general'
  },
  // Drop rate percentage
  dropRate: {
    type: Number,
    required: true
  },
  // Value in coins
  value: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

/**
 * User Card Collection Schema
 * Tracks which cards user owns
 */
const userCollectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  cards: [{
    cardId: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    firstObtained: {
      type: Date,
      default: Date.now
    },
    lastObtained: {
      type: Date,
      default: Date.now
    }
  }],
  // Statistics
  totalCardsOpened: {
    type: Number,
    default: 0
  },
  totalPacksOpened: {
    type: Number,
    default: 0
  },
  coinsSpent: {
    type: Number,
    default: 0
  },
  rarityStats: {
    common: { type: Number, default: 0 },
    uncommon: { type: Number, default: 0 },
    rare: { type: Number, default: 0 },
    very_rare: { type: Number, default: 0 },
    legendary: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Ensure one collection per user
userCollectionSchema.index({ user: 1 }, { unique: true });

/**
 * Add card to collection
 */
userCollectionSchema.methods.addCard = function(cardId, rarity) {
  const existingCard = this.cards.find(c => c.cardId === cardId);
  
  if (existingCard) {
    existingCard.quantity += 1;
    existingCard.lastObtained = new Date();
  } else {
    this.cards.push({
      cardId,
      quantity: 1,
      firstObtained: new Date(),
      lastObtained: new Date()
    });
  }
  
  // Update stats
  this.totalCardsOpened += 1;
  this.rarityStats[rarity] = (this.rarityStats[rarity] || 0) + 1;
  
  return existingCard ? 'duplicate' : 'new';
};

/**
 * Get collection statistics
 */
userCollectionSchema.methods.getStats = function(totalAvailableCards) {
  const uniqueCards = this.cards.length;
  const totalCards = this.cards.reduce((sum, card) => sum + card.quantity, 0);
  const completionRate = ((uniqueCards / totalAvailableCards) * 100).toFixed(1);
  
  return {
    uniqueCards,
    totalCards,
    totalAvailableCards,
    completionRate: parseFloat(completionRate),
    totalPacksOpened: this.totalPacksOpened,
    coinsSpent: this.coinsSpent,
    rarityStats: this.rarityStats
  };
};

const Card = mongoose.model('Card', cardSchema);
const UserCollection = mongoose.model('UserCollection', userCollectionSchema);

module.exports = { Card, UserCollection };
