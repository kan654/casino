const CardService = require('../services/card.service');
const User = require('../models/User.model');
const { PACK_PRICES } = require('../config/cards.config');

/**
 * @route   POST /api/cards/open
 * @desc    Open card pack (1, 3, or 5 cards)
 * @access  Private
 */
const openCardPack = async (req, res) => {
  try {
    const { packSize = 1 } = req.body;
    
    // Validate pack size
    if (![1, 3, 5].includes(packSize)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pack size. Choose 1, 3, or 5 cards.'
      });
    }

    // Get pack price
    const packPriceMap = {
      1: PACK_PRICES.single,
      3: PACK_PRICES.triple,
      5: PACK_PRICES.mega
    };
    const packPrice = packPriceMap[packSize];

    // Check user balance
    const user = await User.findById(req.user.id);
    if (user.balance < packPrice) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Need ${packPrice} coins.`,
        required: packPrice,
        current: user.balance
      });
    }

    // Deduct coins
    user.balance -= packPrice;
    await user.save();

    // Open pack
    const result = await CardService.openPack(req.user.id, packSize);

    res.status(200).json({
      success: true,
      message: `Opened ${packSize} card(s)!`,
      data: result,
      newBalance: user.balance
    });
  } catch (error) {
    console.error('Open pack error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to open pack'
    });
  }
};

/**
 * @route   GET /api/cards/collection
 * @desc    Get user's card collection
 * @access  Private
 */
const getCollection = async (req, res) => {
  try {
    const result = await CardService.getUserCollection(req.user.id);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/cards/stats
 * @desc    Get collection statistics
 * @access  Private
 */
const getStats = async (req, res) => {
  try {
    const stats = await CardService.getCollectionStats(req.user.id);
    const rarestCards = await CardService.getRarestCards(req.user.id, 5);
    
    res.status(200).json({
      success: true,
      data: {
        stats,
        rarestCards
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/cards/all
 * @desc    Get all available cards
 * @access  Public
 */
const getAllCards = async (req, res) => {
  try {
    const cards = await CardService.getAllCards();
    
    res.status(200).json({
      success: true,
      data: cards
    });
  } catch (error) {
    console.error('Get all cards error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/cards/config
 * @desc    Get card pack configuration
 * @access  Public
 */
const getConfig = async (req, res) => {
  try {
    const { RARITY_CONFIG, PACK_PRICES } = require('../config/cards.config');
    
    res.status(200).json({
      success: true,
      data: {
        rarities: RARITY_CONFIG,
        prices: PACK_PRICES
      }
    });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   POST /api/cards/sell
 * @desc    Sell a card from collection
 * @access  Private
 */
const sellCard = async (req, res) => {
  try {
    const { cardId } = req.body;

    if (!cardId) {
      return res.status(400).json({
        success: false,
        message: 'Card ID is required'
      });
    }

    // Sell the card
    const result = await CardService.sellCard(req.user.id, cardId);

    // Add coins to user balance and update stats
    const user = await User.findById(req.user.id);
    user.balance += result.coinsReceived;
    
    // Update game statistics
    user.totalWon += result.coinsReceived;
    user.gamesPlayed += 1;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: `Sold ${result.cardSold.name} for ${result.coinsReceived} coins!`,
      data: {
        ...result,
        newBalance: user.balance
      }
    });
  } catch (error) {
    console.error('Sell card error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to sell card'
    });
  }
};

module.exports = {
  openCardPack,
  getCollection,
  getStats,
  getAllCards,
  getConfig,
  sellCard
};
