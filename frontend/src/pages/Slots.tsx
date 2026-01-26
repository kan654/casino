import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { gameAPI } from '../services/api';
import { SlotsConfig, SlotsResult } from '../types';
import toast from 'react-hot-toast';
import { FaCoins, FaGamepad } from 'react-icons/fa';

const Slots: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [betAmount, setBetAmount] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>([]);
  const [result, setResult] = useState<SlotsResult | null>(null);
  const [config, setConfig] = useState<SlotsConfig | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await gameAPI.getSlotsConfig();
      if (response.success) {
        setConfig(response.data);
        // Initialize empty reels
        const emptyReels = Array(response.data.reels)
          .fill(null)
          .map(() => Array(response.data.rows).fill('cherry'));
        setReels(emptyReels);
      }
    } catch (error) {
      console.error('Failed to load slots config:', error);
    }
  };

  const handleSpin = async () => {
    if (!user) {
      toast.error('Please login to play');
      return;
    }

    if (betAmount > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setSpinning(true);
    setResult(null);

    try {
      // Animate spinning
      const spinInterval = setInterval(() => {
        const randomReels = Array(config?.reels || 5)
          .fill(null)
          .map(() =>
            Array(config?.rows || 3)
              .fill(null)
              .map(() => {
                const symbols = config?.symbols || [];
                return symbols[Math.floor(Math.random() * symbols.length)]?.id || 'cherry';
              })
          );
        setReels(randomReels);
      }, 100);

      // Play game
      const response = await gameAPI.spinSlots(betAmount);

      // Stop spinning after 2 seconds
      setTimeout(() => {
        clearInterval(spinInterval);

        if (response.success) {
          setReels(response.result.reels);
          setResult(response.result);
          refreshUser();

          if (response.result.isWin) {
            toast.success(
              `You won ${response.result.payout} coins! (${response.result.multiplier}x)`,
              { duration: 4000 }
            );
          } else {
            toast.error('No win this time!');
          }
        }

        setSpinning(false);
      }, 2000);
    } catch (error: any) {
      setSpinning(false);
      const message = error.response?.data?.message || 'Failed to spin';
      toast.error(message);
    }
  };

  const getSymbolEmoji = (symbol: string) => {
    const emojiMap: Record<string, string> = {
      cherry: '🍒',
      lemon: '🍋',
      orange: '🍊',
      plum: '🍇',
      bell: '🔔',
      bar: '💎',
      seven: '7️⃣',
      diamond: '💠',
    };
    return emojiMap[symbol] || '❓';
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <FaGamepad className="text-6xl text-primary-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-2">Slot Machine</h1>
        <p className="text-dark-300">
          Match symbols across paylines to win big!
        </p>
      </div>

      {/* Slot Machine */}
      <div className="game-container">
        {/* Reels Display */}
        <div className="bg-gradient-to-b from-dark-900 to-dark-800 rounded-xl p-8 mb-6">
          <div className="grid grid-cols-5 gap-4">
            {reels.map((reel, reelIndex) => (
              <div key={reelIndex} className="space-y-2">
                {reel.map((symbol, symbolIndex) => (
                  <div
                    key={symbolIndex}
                    className={`bg-dark-700 rounded-lg p-4 text-center text-5xl transition-all ${
                      spinning ? 'animate-pulse' : ''
                    }`}
                  >
                    {getSymbolEmoji(symbol)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Result Display */}
        {result && !spinning && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              result.isWin
                ? 'bg-green-900/30 border border-green-500'
                : 'bg-red-900/30 border border-red-500'
            } animate-slideUp`}
          >
            <div className="text-center">
              <p className="text-xl font-bold text-white mb-2">
                {result.isWin ? '🎉 You Won!' : 'Better luck next time!'}
              </p>
              {result.isWin && (
                <div className="space-y-1">
                  <p className="text-lg text-white">
                    Payout: <span className="text-green-400">{result.payout} coins</span>
                  </p>
                  <p className="text-lg text-white">
                    Multiplier: <span className="text-primary-400">{result.multiplier}x</span>
                  </p>
                  {result.winningLines.length > 0 && (
                    <p className="text-sm text-dark-300">
                      {result.winningLines.length} winning line(s)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-4">
          {/* Bet Amount */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Bet Amount
            </label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setBetAmount(Math.max((config?.minBet || 1), betAmount - 5))}
                disabled={spinning}
                className="btn btn-secondary"
              >
                -5
              </button>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={spinning}
                className="input text-center"
                min={config?.minBet || 1}
                max={config?.maxBet || 100}
              />
              <button
                onClick={() => setBetAmount(Math.min((config?.maxBet || 100), betAmount + 5))}
                disabled={spinning}
                className="btn btn-secondary"
              >
                +5
              </button>
            </div>
            <p className="text-xs text-dark-400 mt-1">
              Min: {config?.minBet} | Max: {config?.maxBet}
            </p>
          </div>

          {/* Quick Bet Buttons */}
          <div className="flex space-x-2">
            {[10, 25, 50, 100].map((amount) => (
              <button
                key={amount}
                onClick={() => setBetAmount(amount)}
                disabled={spinning}
                className="btn btn-secondary flex-1"
              >
                {amount}
              </button>
            ))}
          </div>

          {/* Spin Button */}
          <button
            onClick={handleSpin}
            disabled={spinning || !user}
            className="w-full btn btn-primary py-4 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {spinning ? (
              <>
                <FaGamepad className="inline mr-2 animate-spin" />
                Spinning...
              </>
            ) : (
              <>
                <FaCoins className="inline mr-2" />
                Spin ({betAmount} coins)
              </>
            )}
          </button>

          {/* Balance */}
          {user && (
            <div className="text-center text-dark-300">
              Balance: <span className="text-white font-semibold">{user.balance.toFixed(2)}</span>{' '}
              coins
            </div>
          )}
        </div>
      </div>

      {/* Paytable */}
      {config && (
        <div className="card mt-8">
          <h3 className="text-xl font-bold text-white mb-4">Paytable</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {config.symbols.map((symbol) => (
              <div key={symbol.id} className="bg-dark-900 rounded-lg p-3 text-center">
                <div className="text-3xl mb-2">{getSymbolEmoji(symbol.id)}</div>
                <p className="text-sm text-dark-300">{symbol.id}</p>
                <p className="text-primary-400 font-semibold">{symbol.value}x</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-dark-400 mt-4 text-center">
            Match 3 or more symbols on a payline to win
          </p>
        </div>
      )}
    </div>
  );
};

export default Slots;
