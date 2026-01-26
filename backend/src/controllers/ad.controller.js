const User = require('../models/User.model');

/**
 * Ad Reward Config
 */
const AD_CONFIG = {
  REWARD_AMOUNT: 1000, // Coins given per ad
  MIN_BALANCE_REQUIRED: 0 // Can only watch when balance = 0
};

/**
 * @route   POST /api/ads/watch
 * @desc    Watch rewarded ad and get coins
 * @access  Private
 */
const watchRewardedAd = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user can watch ad
    if (user.balance !== AD_CONFIG.MIN_BALANCE_REQUIRED) {
      return res.status(400).json({
        success: false,
        message: `Can only watch ad when balance is ${AD_CONFIG.MIN_BALANCE_REQUIRED}`,
        currentBalance: user.balance
      });
    }
    
    // Give reward
    const result = user.watchRewardedAd(AD_CONFIG.REWARD_AMOUNT);
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Ad watched! You received ${AD_CONFIG.REWARD_AMOUNT} coins!`,
      data: {
        reward: AD_CONFIG.REWARD_AMOUNT,
        newBalance: user.balance,
        totalAdsWatched: user.adsWatched,
        totalEarned: user.coinsEarnedFromAds
      }
    });
  } catch (error) {
    console.error('Watch ad error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to watch ad'
    });
  }
};

/**
 * @route   GET /api/ads/status
 * @desc    Get ad eligibility status
 * @access  Private
 */
const getAdStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        canWatchAd: user.balance === 0,
        currentBalance: user.balance,
        rewardAmount: AD_CONFIG.REWARD_AMOUNT,
        adsWatched: user.adsWatched,
        coinsEarnedFromAds: user.coinsEarnedFromAds,
        lastAdWatched: user.lastAdWatched
      }
    });
  } catch (error) {
    console.error('Get ad status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @route   GET /api/ads/config
 * @desc    Get ad configuration (for client)
 * @access  Public
 */
const getAdConfig = (req, res) => {
  res.status(200).json({
    success: true,
    data: AD_CONFIG
  });
};

module.exports = {
  watchRewardedAd,
  getAdStatus,
  getAdConfig
};
