import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlay, FaCoins, FaCheckCircle } from 'react-icons/fa';
import { adAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Rewarded Ad Modal Component
 * Shows when balance = 0, allows user to watch ad for coins
 * 
 * PRODUCTION SETUP:
 * 1. Sign up for ad network (Google AdMob, Unity Ads, PropellerAds)
 * 2. Get rewarded ad unit ID
 * 3. Replace simulateAdWatching() with actual ad SDK call
 * 
 * Example with PropellerAds:
 * https://docs.propellerads.com/docs/rewarded-video
 * 
 * Example with Google AdMob:
 * https://developers.google.com/admob/unity/rewarded
 */

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: () => void;
  rewardAmount: number;
}

const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
  rewardAmount
}) => {
  const [isWatching, setIsWatching] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [adCompleted, setAdCompleted] = useState(false);

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setIsWatching(false);
      setWatchProgress(0);
      setAdCompleted(false);
    }
  }, [isOpen]);

  /**
   * Simulate ad watching (REPLACE WITH REAL AD SDK)
   * 
   * PRODUCTION: Replace this function with:
   * - PropellerAds SDK call
   * - Google AdMob rewarded ad
   * - Unity Ads rewarded video
   * - IronSource rewarded ad
   */
  const simulateAdWatching = () => {
    setIsWatching(true);
    setWatchProgress(0);

    // Simulate 15-second ad
    const duration = 15000; // 15 seconds
    const intervalTime = 100; // Update every 100ms
    const increment = (intervalTime / duration) * 100;

    const interval = setInterval(() => {
      setWatchProgress(prev => {
        const newProgress = prev + increment;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setAdCompleted(true);
          return 100;
        }
        
        return newProgress;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  };

  /**
   * Claim reward after watching ad
   */
  const claimReward = async () => {
    try {
      const response = await adAPI.watchRewardedAd();
      
      if (response.success) {
        toast.success(`${response.data.reward} coins added to your balance!`);
        onRewardClaimed();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to claim reward');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 animate-fadeIn">
      <div className="bg-dark-800 border border-primary-600 rounded-xl p-8 max-w-md w-full mx-4 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FaCoins className="text-4xl text-yellow-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Out of Coins?</h2>
              <p className="text-dark-400 text-sm">Watch an ad to continue playing!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
            disabled={isWatching}
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-dark-900 border border-dark-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Your Balance</p>
              <p className="text-2xl font-bold text-red-400">0 coins</p>
            </div>
            <div className="text-right">
              <p className="text-dark-400 text-sm">You'll Get</p>
              <p className="text-2xl font-bold text-green-400">+{rewardAmount}</p>
            </div>
          </div>
        </div>

        {/* Ad Watching State */}
        {!isWatching && !adCompleted && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-900 to-primary-900 border border-purple-600 rounded-lg p-4">
              <p className="text-white text-center font-semibold mb-2">
                📺 Watch a 15-second ad
              </p>
              <p className="text-dark-300 text-sm text-center">
                Supports our FREE virtual casino and gives you coins to keep playing!
              </p>
            </div>

            <button
              onClick={simulateAdWatching}
              className="btn btn-primary w-full py-4 text-lg font-bold flex items-center justify-center space-x-2"
            >
              <FaPlay />
              <span>Watch Ad & Get {rewardAmount} Coins</span>
            </button>

            <p className="text-xs text-dark-500 text-center">
              💡 This is a demo. In production, real ads from Google AdSense or PropellerAds would play here.
            </p>
          </div>
        )}

        {/* Watching Progress */}
        {isWatching && !adCompleted && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-white font-semibold mb-2">📺 Ad Playing...</p>
              <p className="text-dark-400 text-sm">Please wait {Math.ceil((100 - watchProgress) * 0.15)} seconds</p>
            </div>

            <div className="bg-dark-900 rounded-full h-6 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary-600 to-purple-600 h-full transition-all duration-200 flex items-center justify-center"
                style={{ width: `${watchProgress}%` }}
              >
                {watchProgress > 10 && (
                  <span className="text-white text-xs font-bold">
                    {Math.round(watchProgress)}%
                  </span>
                )}
              </div>
            </div>

            <div className="bg-dark-900 border border-dark-700 rounded-lg p-6">
              <div className="text-center space-y-2">
                <div className="animate-pulse">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-dark-400">Advertisement content</p>
                  <p className="text-xs text-dark-500 mt-2">
                    (In production: Real ad from ad network)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ad Completed */}
        {adCompleted && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
              <p className="text-white font-bold text-xl mb-2">Ad Complete!</p>
              <p className="text-dark-400">Click below to claim your reward</p>
            </div>

            <button
              onClick={claimReward}
              className="btn btn-primary w-full py-4 text-lg font-bold flex items-center justify-center space-x-2"
            >
              <FaCoins />
              <span>Claim {rewardAmount} Coins!</span>
            </button>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-6 pt-4 border-t border-dark-700">
          <p className="text-xs text-dark-500 text-center">
            ⚠️ All currency is <strong>virtual</strong>. No real money involved.
            <br />
            Ads help keep this casino free to play! 🎰
          </p>
        </div>
      </div>
    </div>
  );
};

export default RewardedAdModal;
