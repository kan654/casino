import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, adAPI } from '../services/api';
import { GameHistory } from '../types';
import { FaUser, FaCoins, FaGamepad, FaTrophy, FaBullhorn } from 'react-icons/fa';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [adStats, setAdStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyResponse, statsResponse, adStatsResponse] = await Promise.all([
        userAPI.getHistory(20, 1, filter === 'all' ? undefined : filter),
        userAPI.getStats(),
        adAPI.getAdStatus(),
      ]);

      if (historyResponse.success && historyResponse.data) {
        setHistory(historyResponse.data.history);
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
      
      if (adStatsResponse.success && adStatsResponse.data) {
        setAdStats(adStatsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case 'slots':
        return '🎰';
      case 'dice':
        return '🎲';
      case 'crash':
        return '💥';
      default:
        return '🎮';
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-400">Please login to view your profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <h1 className="text-4xl font-bold text-white mb-8">Profile</h1>

      {/* User Info Card */}
      <div className="card mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-primary-600 rounded-full p-4">
            <FaUser className="text-4xl text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user.username}</h2>
            <p className="text-dark-400">{user.email}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-900 rounded-lg p-4 text-center">
            <FaCoins className="text-3xl text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-dark-400 mb-1">Balance</p>
            <p className="text-2xl font-bold text-white">{user.balance.toFixed(2)}</p>
          </div>
          <div className="bg-dark-900 rounded-lg p-4 text-center">
            <FaGamepad className="text-3xl text-primary-500 mx-auto mb-2" />
            <p className="text-sm text-dark-400 mb-1">Games Played</p>
            <p className="text-2xl font-bold text-white">{user.gamesPlayed}</p>
          </div>
          <div className="bg-dark-900 rounded-lg p-4 text-center">
            <FaGamepad className="text-3xl text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-dark-400 mb-1">Total Wagered</p>
            <p className="text-2xl font-bold text-white">{user.totalWagered.toFixed(2)}</p>
          </div>
          <div className="bg-dark-900 rounded-lg p-4 text-center">
            <FaTrophy className="text-3xl text-green-500 mx-auto mb-2" />
            <p className="text-sm text-dark-400 mb-1">Total Won</p>
            <p className="text-2xl font-bold text-white">{user.totalWon.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Ad Statistics */}
      {adStats && (adStats.adsWatched > 0 || adStats.canWatchAd) && (
        <div className="card mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaBullhorn className="mr-2 text-purple-500" />
            Ad Rewards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-purple-900/50 to-primary-900/50 rounded-lg p-4 border border-purple-600">
              <p className="text-purple-300 mb-2 text-sm">📺 Ads Watched</p>
              <p className="text-3xl font-bold text-white">{adStats.adsWatched}</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-lg p-4 border border-yellow-600">
              <p className="text-yellow-300 mb-2 text-sm">💰 Coins Earned</p>
              <p className="text-3xl font-bold text-white">{adStats.coinsEarnedFromAds.toFixed(0)}</p>
            </div>
            <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-lg p-4 border border-green-600">
              <p className="text-green-300 mb-2 text-sm">🎁 Next Reward</p>
              <p className="text-3xl font-bold text-white">
                {adStats.canWatchAd ? 'Available!' : `${adStats.rewardAmount}`}
              </p>
            </div>
          </div>
          
          {adStats.canWatchAd && (
            <div className="mt-4 bg-gradient-to-r from-primary-900 to-purple-900 border border-primary-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold mb-1">🎉 Watch an ad and get coins!</p>
                  <p className="text-dark-300 text-sm">Your balance is 0 - claim {adStats.rewardAmount} free coins now!</p>
                </div>
                <div className="text-right">
                  <p className="text-primary-300 text-sm">Closes balance = 0 modal</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-dark-900 rounded-lg">
            <p className="text-xs text-dark-500 text-center">
              💡 Ads support this FREE virtual casino. Watch ads to get coins when your balance reaches 0!
            </p>
          </div>
        </div>
      )}

      {/* Game Statistics */}
      {stats && (
        <div className="card mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Game Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dark-900 rounded-lg p-4">
              <p className="text-dark-400 mb-2">🎰 Slots Games</p>
              <p className="text-2xl font-bold text-white">{stats.gamesByType.slots}</p>
            </div>
            <div className="bg-dark-900 rounded-lg p-4">
              <p className="text-dark-400 mb-2">🎲 Dice Games</p>
              <p className="text-2xl font-bold text-white">{stats.gamesByType.dice}</p>
            </div>
            <div className="bg-dark-900 rounded-lg p-4">
              <p className="text-dark-400 mb-2">💥 Crash Games</p>
              <p className="text-2xl font-bold text-white">{stats.gamesByType.crash}</p>
            </div>
          </div>

          {stats.biggestWin && (
            <div className="mt-4 bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-500 rounded-lg p-4">
              <p className="text-green-400 font-semibold mb-2">🏆 Biggest Win</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-dark-400">Game</p>
                  <p className="text-white font-semibold">{stats.biggestWin.gameType}</p>
                </div>
                <div>
                  <p className="text-sm text-dark-400">Profit</p>
                  <p className="text-green-400 font-semibold">
                    {stats.biggestWin.profit.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-dark-400">Multiplier</p>
                  <p className="text-primary-400 font-semibold">
                    {stats.biggestWin.multiplier.toFixed(2)}x
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Game History */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Game History</h3>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-dark-900 border border-dark-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="all">All Games</option>
            <option value="slots">Slots</option>
            <option value="dice">Dice</option>
            <option value="crash">Crash</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-2">
            {history.map((game) => (
              <div
                key={game._id}
                className={`bg-dark-900 rounded-lg p-4 ${
                  game.isWin ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">{getGameIcon(game.gameType)}</span>
                    <div>
                      <p className="text-white font-semibold capitalize">{game.gameType}</p>
                      <p className="text-sm text-dark-400">
                        {new Date(game.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-dark-400 text-sm">Bet: {game.betAmount}</p>
                    <p
                      className={`text-lg font-semibold ${
                        game.profit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {game.profit >= 0 ? '+' : ''}
                      {game.profit.toFixed(2)}
                    </p>
                    {game.multiplier > 0 && (
                      <p className="text-primary-400 text-sm">{game.multiplier.toFixed(2)}x</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-dark-400 text-center py-8">No games played yet</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
