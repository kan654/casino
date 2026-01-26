import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { gameAPI } from '../services/api';
import { CoinflipConfig, CoinflipResult } from '../types';
import toast from 'react-hot-toast';

const Coinflip: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [betAmount, setBetAmount] = useState(10);
  const [choice, setChoice] = useState<'heads' | 'tails'>('heads');
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<CoinflipResult | null>(null);
  const [config, setConfig] = useState<CoinflipConfig | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await gameAPI.getCoinflipConfig();
      if (response.success) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Failed to load coinflip config:', error);
    }
  };

  const handleFlip = async () => {
    if (!user) {
      toast.error('Please login to play');
      return;
    }

    if (betAmount > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setFlipping(true);
    setResult(null);
    setShowResult(false);

    try {
      // Play game
      const response = await gameAPI.flipCoin(betAmount, choice);

      // Show result after brief animation
      setTimeout(() => {
        if (response.success && response.data) {
          setResult(response.data);
          setShowResult(true);
          refreshUser();

          if (response.data.isWin) {
            toast.success(
              `You won ${response.data.payout} coins! (${response.data.multiplier}x)`,
              { duration: 4000 }
            );
          } else {
            toast.error('Better luck next time!');
          }
        }

        setFlipping(false);
      }, 1000);
    } catch (error: any) {
      setFlipping(false);
      const message = error.response?.data?.message || 'Failed to flip coin';
      toast.error(message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Coinflip</h1>
        <p className="text-dark-300">
          Choose heads or tails. 50/50 chance. {config?.payoutMultiplier}x payout.
        </p>
      </div>

      <div className="game-container space-y-6">
        {/* Coin Selection */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-3">
            Choose Side
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setChoice('heads')}
              disabled={flipping}
              className={`
                p-8 rounded-lg border-2 transition-all
                ${choice === 'heads'
                  ? 'bg-primary-600 border-primary-500 text-white'
                  : 'bg-dark-700 border-dark-600 text-dark-300 hover:border-dark-500'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="text-6xl mb-2">👑</div>
              <div className="text-xl font-bold">HEADS</div>
            </button>

            <button
              onClick={() => setChoice('tails')}
              disabled={flipping}
              className={`
                p-8 rounded-lg border-2 transition-all
                ${choice === 'tails'
                  ? 'bg-primary-600 border-primary-500 text-white'
                  : 'bg-dark-700 border-dark-600 text-dark-300 hover:border-dark-500'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="text-6xl mb-2">🪙</div>
              <div className="text-xl font-bold">TAILS</div>
            </button>
          </div>
        </div>

        {/* Result Display */}
        {showResult && result && (
          <div
            className={`
              p-6 rounded-lg border-2 animate-slideUp
              ${result.isWin
                ? 'bg-green-900/30 border-green-500'
                : 'bg-red-900/30 border-red-500'
              }
            `}
          >
            <div className="text-center">
              <div className="text-7xl mb-4">
                {result.result === 'heads' ? '👑' : '🪙'}
              </div>
              <p className="text-2xl font-bold text-white mb-2 uppercase">
                {result.result}
              </p>
              {result.isWin ? (
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-green-400">
                    +{result.payout} coins
                  </p>
                  <p className="text-lg text-dark-300">
                    {result.multiplier}x multiplier
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-red-400">
                  -{betAmount} coins
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bet Amount */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Bet Amount
          </label>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setBetAmount(Math.max((config?.minBet || 1), betAmount / 2))}
              disabled={flipping}
              className="btn btn-secondary px-6"
            >
              1/2
            </button>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={flipping}
              className="input text-center flex-1 text-lg"
              min={config?.minBet || 1}
              max={config?.maxBet || 100}
            />
            <button
              onClick={() => setBetAmount(Math.min((config?.maxBet || 100), betAmount * 2))}
              disabled={flipping}
              className="btn btn-secondary px-6"
            >
              2x
            </button>
          </div>
          <p className="text-xs text-dark-400 mt-2">
            Min: {config?.minBet} | Max: {config?.maxBet}
          </p>
        </div>

        {/* Quick Bet Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[10, 25, 50, 100].map((amount) => (
            <button
              key={amount}
              onClick={() => setBetAmount(amount)}
              disabled={flipping}
              className="btn btn-secondary"
            >
              {amount}
            </button>
          ))}
        </div>

        {/* Flip Button */}
        <button
          onClick={handleFlip}
          disabled={flipping || !user}
          className={`
            w-full py-6 text-2xl font-bold rounded-lg transition-all
            ${flipping
              ? 'bg-dark-600 text-dark-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {flipping ? 'Flipping...' : `Flip (${betAmount} coins)`}
        </button>

        {/* Balance & Info */}
        {user && (
          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="text-dark-400">Balance:</span>
              <span className="text-white font-semibold ml-2">
                {user.balance.toFixed(2)} coins
              </span>
            </div>
            <div>
              <span className="text-dark-400">Payout:</span>
              <span className="text-primary-400 font-semibold ml-2">
                {config?.payoutMultiplier}x
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Game Info */}
      <div className="card mt-8">
        <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
        <div className="space-y-2 text-dark-300">
          <p>• Choose Heads or Tails</p>
          <p>• Select your bet amount</p>
          <p>• Click Flip to play</p>
          <p>• Win {config?.payoutMultiplier}x your bet if you guess correctly</p>
          <p>• 50% win chance with {((1 - (config?.payoutMultiplier || 1.98) / 2) * 100).toFixed(1)}% house edge</p>
        </div>
      </div>
    </div>
  );
};

export default Coinflip;
