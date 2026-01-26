const User = require('../models/User.model');
const GameHistory = require('../models/GameHistory.model');

/**
 * User Controller
 * Handles user-related requests (balance, history, etc.)
 */

/**
 * @route   GET /api/user/balance
 * @desc    Get user balance
 * @access  Private
 */
const getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        balance: user.balance,
        totalWagered: user.totalWagered,
        totalWon: user.totalWon,
        gamesPlayed: user.gamesPlayed
      }
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching balance',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/user/history
 * @desc    Get user game history
 * @access  Private
 */
const getHistory = async (req, res) => {
  try {
    const { limit = 20, page = 1, gameType } = req.query;
    
    const query = { user: req.user.id };
    
    if (gameType) {
      query.gameType = gameType;
    }

    const history = await GameHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await GameHistory.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching history',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/user/stats
 * @desc    Get user statistics
 * @access  Private
 */
const getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Get game-specific stats
    const slotGames = await GameHistory.countDocuments({
      user: req.user.id,
      gameType: 'slots'
    });

    const diceGames = await GameHistory.countDocuments({
      user: req.user.id,
      gameType: 'dice'
    });

    const crashGames = await GameHistory.countDocuments({
      user: req.user.id,
      gameType: 'crash'
    });

    // Get biggest win
    const biggestWin = await GameHistory.findOne({
      user: req.user.id,
      isWin: true
    }).sort({ profit: -1 });

    res.status(200).json({
      success: true,
      data: {
        balance: user.balance,
        totalWagered: user.totalWagered,
        totalWon: user.totalWon,
        gamesPlayed: user.gamesPlayed,
        gamesByType: {
          slots: slotGames,
          dice: diceGames,
          crash: crashGames
        },
        biggestWin: biggestWin ? {
          gameType: biggestWin.gameType,
          profit: biggestWin.profit,
          multiplier: biggestWin.multiplier,
          date: biggestWin.createdAt
        } : null
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/user/game/:id
 * @desc    Get specific game details
 * @access  Private
 */
const getGameDetails = async (req, res) => {
  try {
    const game = await GameHistory.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('Get game details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching game details',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/games/history
 * @desc    Get global game history (all users, recent games)
 * @access  Public
 */
const getGlobalHistory = async (req, res) => {
  try {
    const { limit = 50, gameType } = req.query;
    
    const query = {};
    
    if (gameType) {
      query.gameType = gameType;
    }

    const history = await GameHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('username gameType betAmount payout profit multiplier isWin createdAt');

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get global history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching global history',
      error: error.message
    });
  }
};

module.exports = {
  getBalance,
  getHistory,
  getStats,
  getGameDetails,
  getGlobalHistory
};
