const SlotsService = require('../services/slots.service');
const DiceService = require('../services/dice.service');
const CoinflipService = require('../services/coinflip.service');
const MinesService = require('../services/mines.service');
const DailyRewardsService = require('../services/dailyRewards.service');
const TradingService = require('../services/trading.service');
const CrashService = require('../services/crash.service');
const User = require('../models/User.model');

/**
 * Game Controller
 * Handles game-related requests
 */

/**
 * @route   POST /api/games/slots/spin
 * @desc    Play slots game
 * @access  Private
 */
const playSlots = async (req, res) => {
  try {
    const { betAmount, clientSeed } = req.body;
    const user = await User.findById(req.user.id);

    const result = await SlotsService.spin(user, betAmount, clientSeed);

    res.status(200).json(result);
  } catch (error) {
    console.error('Slots error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/games/slots/config
 * @desc    Get slots configuration
 * @access  Public
 */
const getSlotsConfig = (req, res) => {
  try {
    const config = SlotsService.getConfig();
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   POST /api/games/dice/roll
 * @desc    Play dice game
 * @access  Private
 */
const playDice = async (req, res) => {
  try {
    const { betAmount, target, isOver, clientSeed } = req.body;
    const user = await User.findById(req.user.id);

    const result = await DiceService.roll(user, betAmount, target, isOver, clientSeed);

    res.status(200).json(result);
  } catch (error) {
    console.error('Dice error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/games/dice/config
 * @desc    Get dice configuration
 * @access  Public
 */
const getDiceConfig = (req, res) => {
  try {
    const config = DiceService.getConfig();
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   POST /api/games/crash/bet
 * @desc    Place bet in crash game
 * @access  Private
 */
const placeCrashBet = async (req, res) => {
  try {
    const { betAmount } = req.body;
    const user = await User.findById(req.user.id);
    const io = req.app.get('io');

    const result = await CrashService.placeBet(user, betAmount, io);

    res.status(200).json(result);
  } catch (error) {
    console.error('Crash bet error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   POST /api/games/crash/cashout
 * @desc    Cash out from crash game
 * @access  Private
 */
const crashCashOut = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const io = req.app.get('io');

    const result = await CrashService.cashOut(user, io);

    res.status(200).json(result);
  } catch (error) {
    console.error('Crash cashout error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/games/crash/current
 * @desc    Get current crash game state
 * @access  Public
 */
const getCurrentCrashGame = async (req, res) => {
  try {
    const game = await CrashService.getCurrentGame();
    
    if (!game) {
      // Return success: true with null data (avoid 404 in console)
      return res.status(200).json({
        success: true,
        data: null
      });
    }

    res.status(200).json({
      success: true,
      data: {
        gameId: game.gameId,
        status: game.status,
        currentMultiplier: game.currentMultiplier,
        serverSeedHash: game.serverSeedHash,
        bets: game.bets.map(bet => ({
          username: bet.username,
          betAmount: bet.betAmount,
          cashedOut: bet.cashedOut,
          cashoutMultiplier: bet.cashoutMultiplier
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/games/crash/config
 * @desc    Get crash configuration
 * @access  Public
 */
const getCrashConfig = (req, res) => {
  try {
    const config = CrashService.getConfig();
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   POST /api/games/coinflip/flip
 * @desc    Play coinflip game
 * @access  Private
 */
const playCoinflip = async (req, res) => {
  try {
    const { betAmount, choice, clientSeed } = req.body;
    const user = await User.findById(req.user.id);

    const result = await CoinflipService.flip(user, betAmount, choice, clientSeed);

    res.status(200).json(result);
  } catch (error) {
    console.error('Coinflip error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/games/coinflip/config
 * @desc    Get coinflip configuration
 * @access  Public
 */
const getCoinflipConfig = (req, res) => {
  try {
    const config = CoinflipService.getConfig();
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   POST /api/games/mines/start
 * @desc    Start a new mines game
 * @access  Private
 */
const startMinesGame = async (req, res) => {
  try {
    const { betAmount, mineCount, clientSeed } = req.body;
    const user = await User.findById(req.user.id);

    const result = await MinesService.startGame(user, betAmount, mineCount, clientSeed);

    res.status(200).json(result);
  } catch (error) {
    console.error('Mines start error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   POST /api/games/mines/reveal
 * @desc    Reveal a tile in mines game
 * @access  Private
 */
const revealMinesTile = async (req, res) => {
  try {
    const { position } = req.body;
    const user = await User.findById(req.user.id);

    const result = await MinesService.revealTile(user, position);

    res.status(200).json(result);
  } catch (error) {
    console.error('Mines reveal error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   POST /api/games/mines/cashout
 * @desc    Cash out from mines game
 * @access  Private
 */
const cashOutMines = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const result = await MinesService.cashOut(user);

    res.status(200).json(result);
  } catch (error) {
    console.error('Mines cashout error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/games/mines/current
 * @desc    Get current mines game state
 * @access  Private
 */
const getCurrentMinesGame = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const game = MinesService.getCurrentGame(user);
    
    // Return success: true even if no game (avoid 404 error in console)
    res.status(200).json({
      success: true,
      data: game || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/games/mines/config
 * @desc    Get mines configuration
 * @access  Public
 */
const getMinesConfig = (req, res) => {
  try {
    const config = MinesService.getConfig();
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   POST /api/games/daily-reward/claim
 * @desc    Claim daily reward
 * @access  Private
 */
const claimDailyReward = async (req, res) => {
  try {
    const { clientSeed } = req.body;
    const user = await User.findById(req.user.id);

    const result = await DailyRewardsService.claimReward(user, clientSeed);

    res.status(200).json(result);
  } catch (error) {
    console.error('Daily reward claim error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/games/daily-reward/status
 * @desc    Check if user can claim daily reward
 * @access  Private
 */
const getDailyRewardStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const status = DailyRewardsService.canClaim(user);

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/games/daily-reward/config
 * @desc    Get daily reward configuration
 * @access  Public
 */
const getDailyRewardConfig = (req, res) => {
  try {
    const config = DailyRewardsService.getConfig();
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   POST /api/games/trading/trade
 * @desc    Place a trade
 * @access  Private
 */
/**
 * @route   POST /api/games/trading/open
 * @desc    Open a new trading position
 * @access  Private
 */
const openPosition = async (req, res) => {
  try {
    const { assetId, direction, stake, leverage, clientSeed } = req.body;
    const user = await User.findById(req.user.id);

    const result = await TradingService.openPosition(user, assetId, direction, stake, leverage || 1, clientSeed);

    res.status(200).json(result);
  } catch (error) {
    console.error('Open position error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   POST /api/games/trading/close/:positionId
 * @desc    Close an open trading position
 * @access  Private
 */
const closePosition = async (req, res) => {
  try {
    const { positionId } = req.params;
    const user = await User.findById(req.user.id);

    const result = await TradingService.closePosition(user, positionId);

    res.status(200).json(result);
  } catch (error) {
    console.error('Close position error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/games/trading/positions
 * @desc    Get all open positions for user
 * @access  Private
 */
const getOpenPositions = async (req, res) => {
  try {
    const result = await TradingService.getOpenPositions(req.user.id);

    res.status(200).json(result);
  } catch (error) {
    console.error('Get positions error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/games/trading/history
 * @desc    Get closed positions history
 * @access  Private
 */
const getClosedPositions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const result = await TradingService.getClosedPositions(req.user.id, limit);

    res.status(200).json(result);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/games/trading/market
 * @desc    Get current market data
 * @access  Public
 */
const getMarketData = (req, res) => {
  try {
    const { timeframe } = req.query;
    const data = TradingService.getAllMarketData(timeframe);
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/games/trading/config
 * @desc    Get trading configuration
 * @access  Public
 */
const getTradingConfig = (req, res) => {
  try {
    const config = TradingService.getConfig();
    
    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  playSlots,
  getSlotsConfig,
  playDice,
  getDiceConfig,
  playCoinflip,
  getCoinflipConfig,
  startMinesGame,
  revealMinesTile,
  cashOutMines,
  getCurrentMinesGame,
  getMinesConfig,
  claimDailyReward,
  getDailyRewardStatus,
  getDailyRewardConfig,
  openPosition,
  closePosition,
  getOpenPositions,
  getClosedPositions,
  getMarketData,
  getTradingConfig,
  placeCrashBet,
  crashCashOut,
  getCurrentCrashGame,
  getCrashConfig
};
