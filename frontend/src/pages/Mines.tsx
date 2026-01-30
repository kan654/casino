import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { gameAPI } from '../services/api';
import { MinesConfig, MinesGameState } from '../types';
import toast from 'react-hot-toast';
import { calculateBetLimits, validateBet, formatLimitsMessage, getSuggestedBets, clampBet } from '../utils/betManager';

const Mines: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [betAmount, setBetAmount] = useState(10);
  const [mineCount, setMineCount] = useState(3);
  const [config, setConfig] = useState<MinesConfig | null>(null);
  const [gameState, setGameState] = useState<MinesGameState | null>(null);
  const [revealedTiles, setRevealedTiles] = useState<Set<number>>(new Set());
  const [mineTiles, setMineTiles] = useState<Set<number>>(new Set());
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    loadConfig();
    checkActiveGame();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await gameAPI.getMinesConfig();
      if (response.success) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Failed to load mines config:', error);
    }
  };

  const checkActiveGame = async () => {
    try {
      const response = await gameAPI.getCurrentMinesGame();
      if (response.success && response.data) {
        setGameState(response.data);
        setRevealedTiles(new Set(response.data.revealedTiles));
      }
    } catch (error: any) {
      // No active game - this is normal, don't log error
      if (error.response?.status !== 404) {
        console.error('Failed to check active game:', error);
      }
    }
  };

  const startGame = async () => {
    if (!user) {
      toast.error('Please login to play');
      return;
    }

    const validation = validateBet(betAmount, user.balance);
    if (!validation.isValid) {
      toast.error(validation.message || 'Invalid bet amount');
      return;
    }

    try {
      const response = await gameAPI.startMinesGame(betAmount, mineCount);
      
      if (response.success) {
        setGameState(response.data);
        setRevealedTiles(new Set());
        setMineTiles(new Set());
        refreshUser();
        toast.success('Game started! Click tiles to reveal.');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to start game';
      toast.error(message);
    }
  };

  const revealTile = async (position: number) => {
    if (!gameState || gameState.status !== 'active' || isRevealing) return;
    if (revealedTiles.has(position)) return;

    setIsRevealing(true);

    try {
      const response = await gameAPI.revealMinesTile(position);
      
      if (response.success) {
        const data = response.data;
        
        if (data.isMine) {
          // Hit a mine - game over
          setRevealedTiles(new Set(data.revealedTiles));
          setMineTiles(new Set(data.minePositions));
          setGameState(null);
          refreshUser();
          toast.error(`💣 Mine! You lost ${betAmount} coins.`, { duration: 4000 });
        } else if (data.gameOver) {
          // Won by revealing all safe tiles
          setRevealedTiles(new Set(data.revealedTiles));
          setMineTiles(new Set(data.minePositions));
          setGameState(null);
          refreshUser();
          toast.success(
            `🎉 All safe tiles revealed! You won ${data.payout} coins! (${data.multiplier}x)`,
            { duration: 5000 }
          );
        } else {
          // Safe tile
          setRevealedTiles(new Set(data.revealedTiles));
          setGameState({
            ...gameState,
            revealedTiles: data.revealedTiles,
            currentMultiplier: data.currentMultiplier,
            possiblePayout: data.possiblePayout
          });
          toast.success(`💎 Safe! ${data.currentMultiplier.toFixed(2)}x`, { duration: 1500 });
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reveal tile';
      toast.error(message);
    } finally {
      setIsRevealing(false);
    }
  };

  const cashOut = async () => {
    if (!gameState || gameState.status !== 'active') return;

    try {
      const response = await gameAPI.cashOutMines();
      
      if (response.success) {
        const data = response.data;
        setMineTiles(new Set(data.minePositions));
        setGameState(null);
        refreshUser();
        toast.success(
          `💰 Cashed out! You won ${data.payout} coins! (${data.multiplier}x)`,
          { duration: 4000 }
        );
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to cash out';
      toast.error(message);
    }
  };

  const resetGame = () => {
    setGameState(null);
    setRevealedTiles(new Set());
    setMineTiles(new Set());
  };

  const getTileContent = (position: number) => {
    if (mineTiles.has(position)) {
      return '💣';
    }
    if (revealedTiles.has(position)) {
      return '💎';
    }
    return null;
  };

  const getTileClass = (position: number) => {
    const isRevealed = revealedTiles.has(position);
    const isMine = mineTiles.has(position);
    
    let baseClass = 'aspect-square rounded-lg transition-all cursor-pointer flex items-center justify-center text-4xl select-none';
    
    if (isMine) {
      return `${baseClass} bg-red-900/50 border-2 border-red-500`;
    }
    
    if (isRevealed) {
      return `${baseClass} bg-green-900/50 border-2 border-green-500 scale-95`;
    }
    
    if (gameState && gameState.status === 'active') {
      return `${baseClass} bg-dark-700 border-2 border-dark-600 hover:border-primary-500 hover:scale-105`;
    }
    
    return `${baseClass} bg-dark-700 border-2 border-dark-600`;
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Mines</h1>
        <p className="text-dark-300">
          Reveal safe tiles to increase your multiplier. Cash out before hitting a mine!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Grid */}
        <div className="lg:col-span-2">
          <div className="game-container">
            <div className="grid grid-cols-5 gap-2 mb-4">
              {Array.from({ length: 25 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => revealTile(i)}
                  disabled={!gameState || gameState.status !== 'active' || isRevealing}
                  className={getTileClass(i)}
                >
                  {getTileContent(i)}
                </button>
              ))}
            </div>

            {/* Game Status */}
            {gameState && (
              <div className="bg-dark-700 rounded-lg p-4 border border-dark-600">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-dark-300">Current Multiplier:</span>
                  <span className="text-2xl font-bold text-primary-400">
                    {gameState.currentMultiplier.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-dark-300">Possible Payout:</span>
                  <span className="text-xl font-bold text-green-400">
                    {gameState.possiblePayout} coins
                  </span>
                </div>
                <button
                  onClick={cashOut}
                  disabled={revealedTiles.size === 0}
                  className="w-full btn btn-primary py-3 text-lg font-bold"
                >
                  Cash Out ({gameState.possiblePayout} coins)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Bet Amount */}
          {!gameState && (
            <>
              <div className="card">
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Bet Amount
                </label>
                <div className="flex items-center space-x-2 mb-3">
                  <button
                    onClick={() => {
                      const limits = calculateBetLimits(user?.balance || 0);
                      setBetAmount(Math.max(limits.min, Math.floor(betAmount / 2)));
                    }}
                    className="btn btn-secondary px-4"
                  >
                    1/2
                  </button>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (user) {
                        setBetAmount(clampBet(value, user.balance));
                      }
                    }}
                    className="input text-center flex-1"
                    min={1}
                  />
                  <button
                    onClick={() => {
                      const limits = calculateBetLimits(user?.balance || 0);
                      setBetAmount(Math.min(limits.max, Math.floor(betAmount * 2)));
                    }}
                    className="btn btn-secondary px-4"
                  >
                    2x
                  </button>
                </div>
                {user && (
                  <p className="text-xs text-dark-400 mb-3">
                    {formatLimitsMessage(user.balance)}
                  </p>
                )}
                <div className="grid grid-cols-4 gap-2">
                  {user && getSuggestedBets(user.balance).map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className="btn btn-secondary text-sm"
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mine Count */}
              <div className="card">
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Number of Mines
                </label>
                <input
                  type="range"
                  value={mineCount}
                  onChange={(e) => setMineCount(Number(e.target.value))}
                  min={config?.minMines || 1}
                  max={config?.maxMines || 24}
                  className="w-full mb-2"
                />
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-white">{mineCount}</span>
                  <span className="text-sm text-dark-400">
                    {config?.minMines} - {config?.maxMines} mines
                  </span>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={startGame}
                disabled={!user}
                className="w-full btn btn-primary py-4 text-xl font-bold"
              >
                Start Game ({betAmount} coins)
              </button>
            </>
          )}

          {/* Game Info */}
          {gameState && (
            <div className="card">
              <h3 className="text-lg font-bold text-white mb-3">Game Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-400">Bet:</span>
                  <span className="text-white font-semibold">{gameState.betAmount} coins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Mines:</span>
                  <span className="text-white font-semibold">{gameState.mineCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Revealed:</span>
                  <span className="text-white font-semibold">
                    {revealedTiles.size} / {25 - gameState.mineCount}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Balance */}
          {user && (
            <div className="card">
              <div className="text-center">
                <span className="text-dark-400 text-sm">Balance</span>
                <div className="text-2xl font-bold text-white">
                  {user.balance.toFixed(2)} coins
                </div>
              </div>
            </div>
          )}

          {/* Reset after game over */}
          {!gameState && mineTiles.size > 0 && (
            <button
              onClick={resetGame}
              className="w-full btn btn-secondary py-3"
            >
              New Game
            </button>
          )}
        </div>
      </div>

      {/* How to Play */}
      <div className="card mt-8">
        <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
        <div className="space-y-2 text-dark-300">
          <p>• Choose your bet amount and number of mines (more mines = higher multipliers)</p>
          <p>• Click "Start Game" to begin</p>
          <p>• Click tiles to reveal them - avoid the mines!</p>
          <p>• Each safe tile increases your multiplier</p>
          <p>• Cash out anytime to collect your winnings</p>
          <p>• Hitting a mine ends the game and you lose your bet</p>
        </div>
      </div>
    </div>
  );
};

export default Mines;
