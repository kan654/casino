const { Card, UserCollection } = require('../models/Card.model');
const { CARD_DATA, RARITY_CONFIG, PACK_PRICES } = require('../config/cards.config');

/**
 * Card Service
 * Handles card pack opening, collection management
 */
class CardService {
  /**
   * Initialize cards in database (run once)
   */
  static async initializeCards() {
    try {
      // Delete all existing cards and re-initialize with new paths
      await Card.deleteMany({});
      await Card.insertMany(CARD_DATA);
      console.log(`✅ Re-initialized ${CARD_DATA.length} cards with updated paths`);
      
      return { success: true, count: CARD_DATA.length };
    } catch (error) {
      console.error('Card initialization error:', error);
      throw error;
    }
  }

  /**
   * Get all available cards
   */
  static async getAllCards() {
    return await Card.find({}).sort({ rarity: 1, cardId: 1 });
  }

  /**
   * Get cards by rarity
   */
  static async getCardsByRarity(rarity) {
    return await Card.find({ rarity }).sort({ cardId: 1 });
  }

  /**
   * Open card pack (1, 3, or 5 cards)
   */
  static async openPack(userId, packSize = 1) {
    try {
      // Validate pack size
      if (![1, 3, 5].includes(packSize)) {
        throw new Error('Invalid pack size. Must be 1, 3, or 5');
      }

      // Get pack price
      const packPriceMap = {
        1: PACK_PRICES.single,
        3: PACK_PRICES.triple,
        5: PACK_PRICES.mega
      };
      const packPrice = packPriceMap[packSize];

      // Get or create user collection
      let userCollection = await UserCollection.findOne({ user: userId });
      if (!userCollection) {
        userCollection = new UserCollection({ user: userId });
      }

      // Open cards
      const openedCards = [];
      const allCards = await Card.find({});

      for (let i = 0; i < packSize; i++) {
        const drawnCard = this.drawRandomCard(allCards);
        const isNew = userCollection.addCard(drawnCard.cardId, drawnCard.rarity);
        
        openedCards.push({
          ...drawnCard.toObject(),
          isNew: isNew === 'new',
          isDuplicate: isNew === 'duplicate'
        });
      }

      // Update pack stats
      userCollection.totalPacksOpened += 1;
      userCollection.coinsSpent += packPrice;

      await userCollection.save();

      return {
        success: true,
        cards: openedCards,
        packSize,
        packPrice,
        stats: userCollection.getStats(allCards.length)
      };
    } catch (error) {
      console.error('Open pack error:', error);
      throw error;
    }
  }

  /**
   * Draw random card based on rarity drop rates
   */
  static drawRandomCard(allCards) {
    // Group cards by rarity
    const cardsByRarity = {
      common: allCards.filter(c => c.rarity === 'common'),
      uncommon: allCards.filter(c => c.rarity === 'uncommon'),
      rare: allCards.filter(c => c.rarity === 'rare'),
      very_rare: allCards.filter(c => c.rarity === 'very_rare'),
      legendary: allCards.filter(c => c.rarity === 'legendary')
    };

    // Roll for rarity
    const roll = Math.random() * 100;
    let cumulativeRate = 0;
    let selectedRarity = 'common';

    // Determine rarity based on drop rates
    for (const [rarity, config] of Object.entries(RARITY_CONFIG)) {
      cumulativeRate += config.dropRate;
      if (roll <= cumulativeRate) {
        selectedRarity = rarity;
        break;
      }
    }

    // Select random card from that rarity
    const rarityCards = cardsByRarity[selectedRarity];
    const randomIndex = Math.floor(Math.random() * rarityCards.length);
    
    return rarityCards[randomIndex];
  }

  /**
   * Get user's collection
   */
  static async getUserCollection(userId) {
    try {
      let userCollection = await UserCollection.findOne({ user: userId });
      
      if (!userCollection) {
        userCollection = new UserCollection({ user: userId });
        await userCollection.save();
      }

      const allCards = await Card.find({});
      const stats = userCollection.getStats(allCards.length);

      // Organize cards by rarity
      const cardsByRarity = {
        common: [],
        uncommon: [],
        rare: [],
        very_rare: [],
        legendary: []
      };

      allCards.forEach(card => {
        const userCard = userCollection.cards.find(c => c.cardId === card.cardId);
        
        cardsByRarity[card.rarity].push({
          ...card.toObject(),
          owned: !!userCard,
          quantity: userCard ? userCard.quantity : 0,
          firstObtained: userCard ? userCard.firstObtained : null
        });
      });

      return {
        success: true,
        collection: cardsByRarity,
        stats,
        rarityConfig: RARITY_CONFIG
      };
    } catch (error) {
      console.error('Get collection error:', error);
      throw error;
    }
  }

  /**
   * Get collection statistics
   */
  static async getCollectionStats(userId) {
    try {
      const userCollection = await UserCollection.findOne({ user: userId });
      
      if (!userCollection) {
        const totalCards = await Card.countDocuments();
        return {
          uniqueCards: 0,
          totalCards: 0,
          totalAvailableCards: totalCards,
          completionRate: 0,
          totalPacksOpened: 0,
          coinsSpent: 0,
          rarityStats: {
            common: 0,
            uncommon: 0,
            rare: 0,
            very_rare: 0,
            legendary: 0
          }
        };
      }

      const allCards = await Card.find({});
      return userCollection.getStats(allCards.length);
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  }

  /**
   * Get rarest cards in user's collection
   */
  static async getRarestCards(userId, limit = 5) {
    try {
      const userCollection = await UserCollection.findOne({ user: userId });
      
      if (!userCollection || userCollection.cards.length === 0) {
        return [];
      }

      const userCardIds = userCollection.cards.map(c => c.cardId);
      const allCards = await Card.find({ cardId: { $in: userCardIds } })
        .sort({ dropRate: 1 })
        .limit(limit);

      return allCards.map(card => {
        const userCard = userCollection.cards.find(c => c.cardId === card.cardId);
        return {
          ...card.toObject(),
          quantity: userCard.quantity,
          firstObtained: userCard.firstObtained
        };
      });
    } catch (error) {
      console.error('Get rarest cards error:', error);
      throw error;
    }
  }

  /**
   * Sell a card from user's collection
   */
  static async sellCard(userId, cardId) {
    try {
      const userCollection = await UserCollection.findOne({ user: userId });
      
      if (!userCollection) {
        throw new Error('Collection not found');
      }

      const userCard = userCollection.cards.find(c => c.cardId === cardId);
      
      if (!userCard || userCard.quantity === 0) {
        throw new Error('Card not found in collection');
      }

      // Get card details for value
      const card = await Card.findOne({ cardId });
      if (!card) {
        throw new Error('Card not found');
      }

      // Remove one card
      userCard.quantity -= 1;
      
      // If no more cards, remove from collection
      if (userCard.quantity === 0) {
        userCollection.cards = userCollection.cards.filter(c => c.cardId !== cardId);
      }

      await userCollection.save();

      return {
        success: true,
        cardSold: {
          cardId: card.cardId,
          name: card.name,
          value: card.value
        },
        coinsReceived: card.value
      };
    } catch (error) {
      console.error('Sell card error:', error);
      throw error;
    }
  }
}

module.exports = CardService;
