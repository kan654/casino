import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { gameAPI } from '../services/api';
import { DailyRewardConfig, DailyRewardStatus, DailyReward } from '../types';
import toast from 'react-hot-toast';
import { FaGift } from 'react-icons/fa';

const DailyRewards: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [config, setConfig] = useState<DailyRewardConfig | null>(null);
  const [status, setStatus] = useState<DailyRewardStatus | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [reel, setReel] = useState<DailyReward[]>([]);
  const [wonReward, setWonReward] = useState<DailyReward | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    loadConfig();
    loadStatus();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await gameAPI.getDailyRewardConfig();
      if (response.success) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Failed to load daily reward config:', error);
    }
  };

  const loadStatus = async () => {
    try {
      const response = await gameAPI.getDailyRewardStatus();
      if (response.success) {
        setStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to load daily reward status:', error);
    }
  };

  const claimReward = async () => {
    if (!user || !status?.canClaim) return;

    setIsOpening(true);
    setWonReward(null);
    setScrollPosition(0);

    try {
      const response = await gameAPI.claimDailyReward();

      if (response.success) {
        const { reward, reel: rewardReel, winningPosition } = response.data;

        // Set reel
        setReel(rewardReel);

        // Calculate scroll distance
        // Each item is 120px wide + 16px gap = 136px
        // We want to scroll so the winning item (at winningPosition) lands at center
        // Center of viewport is roughly at 50% of reel container width
        const itemWidth = 136;
        const finalScrollPosition = (winningPosition * itemWidth) - (window.innerWidth / 2) + (itemWidth / 2);

        // Animate scroll
        setTimeout(() => {
          setScrollPosition(finalScrollPosition);
        }, 100);

        // Show result after animation
        setTimeout(() => {
          setWonReward(reward);
          refreshUser();
          toast.success(`You won ${reward.amount} coins!`, { duration: 4000 });
          loadStatus();
        }, 4000);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to claim reward';
      toast.error(message);
      setIsOpening(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-600 to-gray-700';
      case 'uncommon': return 'from-green-600 to-green-700';
      case 'rare': return 'from-blue-600 to-blue-700';
      case 'epic': return 'from-purple-600 to-purple-700';
      case 'legendary': return 'from-yellow-600 to-orange-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-500/50';
      case 'uncommon': return 'shadow-green-500/50';
      case 'rare': return 'shadow-blue-500/50';
      case 'epic': return 'shadow-purple-500/50';
      case 'legendary': return 'shadow-yellow-500/50';
      default: return '';
    }
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-8 text-center">
        <FaGift className="text-6xl text-primary-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-2">Daily Rewards</h1>
        <p className="text-dark-300">
          Claim your free daily reward! Comes back every 24 hours.
        </p>
      </div>

      {/* Main Container */}
      <div className="game-container mb-8">
        {!isOpening ? (
          // Closed state - show claim button or cooldown
          <div className="text-center py-12">
            {status?.canClaim ? (
              <div>
                <button
                  onClick={claimReward}
                  disabled={!user}
                  className="btn btn-primary py-6 px-12 text-2xl font-bold"
                >
                  <FaGift className="inline mr-3" />
                  Open Daily Reward
                </button>
                <p className="text-dark-400 text-sm mt-4">
                  Click to open your daily reward!
                </p>
              </div>
            ) : (
              <div>
                <div className="text-6xl mb-4">⏰</div>
                <h3 className="text-2xl font-bold text-white mb-2">Come back later!</h3>
                <p className="text-dark-300 text-lg">
                  Next reward in: <span className="text-primary-400 font-bold">
                    {formatTime(status?.timeUntilNext || 0)}
                  </span>
                </p>
              </div>
            )}
          </div>
        ) : (
          // Opening animation - CSGO style horizontal reel
          <div className="relative">
            {/* Reel Container */}
            <div className="overflow-hidden relative h-48 bg-dark-800 rounded-lg">
              {/* Center marker - thin vertical line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary-500 z-20 transform -translate-x-1/2"></div>
              <div className="absolute left-1/2 top-0 w-12 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent z-20 transform -translate-x-1/2"></div>
              <div className="absolute left-1/2 bottom-0 w-12 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent z-20 transform -translate-x-1/2"></div>

              {/* Scrolling reel */}
              <div
                className="flex items-center h-full gap-4 px-4 transition-transform duration-[3500ms] ease-out"
                style={{
                  transform: `translateX(-${scrollPosition}px)`,
                  willChange: 'transform'
                }}
              >
                {reel.map((reward, index) => (
                  <div
                    key={index}
                    className={`
                      flex-shrink-0 w-28 h-36 rounded-lg bg-gradient-to-br ${getRarityColor(reward.rarity)}
                      border-2 border-${reward.rarity === 'common' ? 'gray' : reward.rarity === 'uncommon' ? 'green' : reward.rarity === 'rare' ? 'blue' : reward.rarity === 'epic' ? 'purple' : 'yellow'}-500
                      flex flex-col items-center justify-center p-2
                      ${getRarityGlow(reward.rarity)} shadow-lg
                    `}
                  >
                    <div className="text-4xl mb-2">🪙</div>
                    <div className="text-white font-bold text-lg">{reward.amount}</div>
                    <div className="text-white/80 text-xs uppercase">{reward.rarity}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Result display */}
            {wonReward && (
              <div className="mt-6 animate-slideUp">
                <div className={`
                  card bg-gradient-to-br ${getRarityColor(wonReward.rarity)}
                  border-2 border-${wonReward.rarity === 'common' ? 'gray' : wonReward.rarity === 'uncommon' ? 'green' : wonReward.rarity === 'rare' ? 'blue' : wonReward.rarity === 'epic' ? 'purple' : 'yellow'}-500
                  text-center py-8
                `}>
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-white mb-2">You Won!</h2>
                  <p className="text-2xl text-white mb-2">
                    <span className="font-bold">{wonReward.amount} Coins</span>
                  </p>
                  <p className="text-lg text-white/80 uppercase">{wonReward.rarity} Reward</p>
                  <button
                    onClick={() => {
                      setIsOpening(false);
                      setWonReward(null);
                      setReel([]);
                      setScrollPosition(0);
                    }}
                    className="btn btn-secondary mt-6"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Possible Rewards */}
      {config && !isOpening && (
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-4">Possible Rewards</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {config.rewards.map((reward) => (
              <div
                key={reward.id}
                className={`
                  rounded-lg bg-gradient-to-br ${getRarityColor(reward.rarity)}
                  border border-${reward.rarity === 'common' ? 'gray' : reward.rarity === 'uncommon' ? 'green' : reward.rarity === 'rare' ? 'blue' : reward.rarity === 'epic' ? 'purple' : 'yellow'}-500/50
                  p-3 text-center
                `}
              >
                <div className="text-3xl mb-2">🪙</div>
                <div className="text-white font-semibold">{reward.amount}</div>
                <div className="text-xs text-white/70 uppercase mt-1">{reward.rarity}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-dark-400 mt-4 text-center">
            Higher rarity rewards are less common but give more coins!
          </p>
        </div>
      )}

      {/* Info */}
      <div className="card mt-6">
        <h3 className="text-xl font-bold text-white mb-4">How it Works</h3>
        <div className="space-y-2 text-dark-300">
          <p>• Free daily reward system - no betting required!</p>
          <p>• Can be claimed once every 24 hours</p>
          <p>• Rewards are randomly selected with weighted probabilities</p>
          <p>• Rarer rewards give more coins but are harder to get</p>
          <p>• 100% provably fair using your client seed</p>
        </div>
      </div>
    </div>
  );
};

export default DailyRewards;
