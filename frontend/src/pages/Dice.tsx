import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { gameAPI } from '../services/api';
import { DiceConfig, DiceResult } from '../types';
import toast from 'react-hot-toast';
import { FaDice, FaCoins } from 'react-icons/fa';

const Dice: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [betAmount, setBetAmount] = useState(10);
  const [target, setTarget] = useState(50);
  const [isOver, setIsOver] = useState(true);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<DiceResult | null>(null);
  const [config, setConfig] = useState<DiceConfig | null>(null);
  const [multiplier, setMultiplier] = useState(1.98);
  const [winChance, setWinChance] = useState(50);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    calculateMultiplier();
  }, [target, isOver]);

  const loadConfig = async () => {
    try {
      const response = await gameAPI.getDiceConfig();
      if (response.success) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Failed to load dice config:', error);
    }
  };

  const calculateMultiplier = () => {
    if (!config) return;

    const chance = isOver
      ? config.maxNumber - target
      : target;

    const mult = ((config.maxNumber / chance) * (1 - config.houseEdge)).toFixed(4);
    const chancePercent = (chance / config.maxNumber) * 100;

    setMultiplier(parseFloat(mult));
    setWinChance(parseFloat(chancePercent.toFixed(2)));
  };

  const handleRoll = async () => {
    if (!user) {
      toast.error('Please login to play');
      return;
    }

    if (betAmount > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setRolling(true);
    setResult(null);

    try {
      const response = await gameAPI.rollDice(betAmount, target, isOver);

      // Simulate rolling animation
      setTimeout(() => {
        if (response.success && response.result) {
          setResult(response.result);
          refreshUser();

          if (response.result.isWin) {
            toast.success(
              `You won ${response.result.payout} coins! (${response.result.multiplier}x)`,
              { duration: 4000 }
            );
          } else {
            toast.error('Better luck next time!');
          }
        }

        setRolling(false);
      }, 1000);
    } catch (error: any) {
      setRolling(false);
      const message = error.response?.data?.message || 'Failed to roll dice';
      toast.error(message);
    }
  };

  const potentialPayout = (betAmount * multiplier).toFixed(2);

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <FaDice className="text-6xl text-primary-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-2">Dice Game</h1>
        <p className="text-dark-300">
          Roll over or under your target number to win
        </p>
      </div>

      <div className="game-container">
        {/* Result Display */}
        <div className="bg-gradient-to-b from-dark-900 to-dark-800 rounded-xl p-8 mb-6 text-center">
          {rolling ? (
            <div className="py-12">
              <FaDice className="text-8xl text-primary-500 mx-auto animate-spin" />
              <p className="text-2xl text-white mt-4">Rolling...</p>
            </div>
          ) : result ? (
            <div className="py-8 animate-slideUp">
              <div
                className={`text-8xl font-bold mb-4 ${
                  result.isWin ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {result.rollResult.toFixed(2)}
              </div>
              <p className="text-xl text-white mb-2">
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
                </div>
              )}
            </div>
          ) : (
            <div className="py-12">
              <FaDice className="text-8xl text-dark-600 mx-auto" />
              <p className="text-xl text-dark-400 mt-4">Place your bet and roll!</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Roll Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Roll Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsOver(true)}
                disabled={rolling}
                className={`btn py-3 ${
                  isOver ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                Roll Over
              </button>
              <button
                onClick={() => setIsOver(false)}
                disabled={rolling}
                className={`btn py-3 ${
                  !isOver ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                Roll Under
              </button>
            </div>
          </div>

          {/* Target Number */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Target Number: {target}
            </label>
            <input
              type="range"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              disabled={rolling}
              min={config?.minChance || 1}
              max={config?.maxChance || 95}
              className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-xs text-dark-400 mt-1">
              <span>{config?.minChance}</span>
              <span>{config?.maxChance}</span>
            </div>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-900 rounded-lg p-4">
              <p className="text-sm text-dark-400 mb-1">Win Chance</p>
              <p className="text-2xl font-bold text-primary-400">{winChance}%</p>
            </div>
            <div className="bg-dark-900 rounded-lg p-4">
              <p className="text-sm text-dark-400 mb-1">Multiplier</p>
              <p className="text-2xl font-bold text-primary-400">{multiplier}x</p>
            </div>
          </div>

          {/* Bet Amount */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Bet Amount
            </label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setBetAmount(Math.max((config?.minBet || 1), betAmount - 5))}
                disabled={rolling}
                className="btn btn-secondary"
              >
                -5
              </button>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={rolling}
                className="input text-center"
                min={config?.minBet || 1}
                max={config?.maxBet || 100}
              />
              <button
                onClick={() => setBetAmount(Math.min((config?.maxBet || 100), betAmount + 5))}
                disabled={rolling}
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
                disabled={rolling}
                className="btn btn-secondary flex-1"
              >
                {amount}
              </button>
            ))}
          </div>

          {/* Potential Payout */}
          <div className="bg-dark-900 rounded-lg p-4 text-center">
            <p className="text-sm text-dark-400 mb-1">Potential Payout</p>
            <p className="text-3xl font-bold text-green-400">{potentialPayout} coins</p>
          </div>

          {/* Roll Button */}
          <button
            onClick={handleRoll}
            disabled={rolling || !user}
            className="w-full btn btn-primary py-4 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {rolling ? (
              <>
                <FaDice className="inline mr-2 animate-spin" />
                Rolling...
              </>
            ) : (
              <>
                <FaCoins className="inline mr-2" />
                Roll Dice ({betAmount} coins)
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

      {/* How to Play */}
      <div className="card mt-8">
        <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
        <ul className="space-y-2 text-dark-300">
          <li>• Choose "Roll Over" or "Roll Under"</li>
          <li>• Set your target number using the slider</li>
          <li>• Higher win chance = lower multiplier</li>
          <li>• Lower win chance = higher multiplier</li>
          <li>• Roll the dice and win if the result matches your prediction!</li>
        </ul>
      </div>
    </div>
  );
};

export default Dice;
