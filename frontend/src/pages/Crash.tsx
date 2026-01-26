import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { gameAPI } from '../services/api';
import socketService from '../services/socket';
import { CrashGame, CrashConfig } from '../types';
import toast from 'react-hot-toast';
import { FaChartLine, FaCoins, FaUsers } from 'react-icons/fa';

const Crash: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [betAmount, setBetAmount] = useState(10);
  const [game, setGame] = useState<CrashGame | null>(null);
  const [config, setConfig] = useState<CrashConfig | null>(null);
  const [hasBet, setHasBet] = useState(false);
  const [canCashout, setCanCashout] = useState(false);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    loadConfig();
    connectSocket();

    return () => {
      if (socketRef.current) {
        socketService.leaveCrash();
        socketService.offCrashGameState();
        socketService.offCrashNewGame();
        socketService.offCrashGameStarted();
        socketService.offCrashMultiplierUpdate();
        socketService.offCrashGameCrashed();
        socketService.offCrashBetPlaced();
        socketService.offCrashPlayerCashedOut();
        socketService.offCrashError();
      }
    };
  }, []);

  const loadConfig = async () => {
    try {
      const response = await gameAPI.getCrashConfig();
      if (response.success) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Failed to load crash config:', error);
    }
  };

  const connectSocket = () => {
    socketRef.current = socketService.connect();

    // Join crash game room
    socketService.joinCrash();

    // Listen for game state
    socketService.onCrashGameState((data) => {
      setGame(data);
      checkUserBet(data);
    });

    // Listen for new game
    socketService.onCrashNewGame((data) => {
      setGame({
        gameId: data.gameId,
        status: 'waiting',
        currentMultiplier: 1.0,
        serverSeedHash: data.serverSeedHash,
        bets: [],
      });
      setHasBet(false);
      setCanCashout(false);
    });

    // Listen for game started
    socketService.onCrashGameStarted(() => {
      setGame((prev) =>
        prev
          ? {
              ...prev,
              status: 'running',
              currentMultiplier: 1.0,
            }
          : null
      );
      if (hasBet) {
        setCanCashout(true);
      }
    });

    // Listen for multiplier updates
    socketService.onCrashMultiplierUpdate((data) => {
      setGame((prev) =>
        prev
          ? {
              ...prev,
              currentMultiplier: data.multiplier,
            }
          : null
      );
    });

    // Listen for game crashed
    socketService.onCrashGameCrashed((data) => {
      setGame((prev) =>
        prev
          ? {
              ...prev,
              status: 'crashed',
              currentMultiplier: data.crashPoint,
            }
          : null
      );
      setCanCashout(false);

      // Check if user had a bet
      if (hasBet) {
        // User lost if they didn't cash out
        refreshUser();
      }
    });

    // Listen for bet placed
    socketService.onCrashBetPlaced((data) => {
      setGame((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          bets: [
            ...prev.bets,
            {
              username: data.bet.username,
              betAmount: data.bet.betAmount,
              cashedOut: false,
              cashoutMultiplier: null,
            },
          ],
        };
      });
    });

    // Listen for player cashed out
    socketService.onCrashPlayerCashedOut((data) => {
      toast.success(`${data.username} cashed out at ${data.multiplier}x!`);

      setGame((prev) => {
        if (!prev) return null;
        const updatedBets = prev.bets.map((bet) =>
          bet.username === data.username
            ? { ...bet, cashedOut: true, cashoutMultiplier: data.multiplier }
            : bet
        );
        return { ...prev, bets: updatedBets };
      });

      // If it was the current user, update state
      if (user && data.username === user.username) {
        setCanCashout(false);
        refreshUser();
      }
    });

    // Listen for errors
    socketService.onCrashError((data) => {
      toast.error(data.message);
    });
  };

  const checkUserBet = (gameData: CrashGame) => {
    if (!user) return;

    const userBet = gameData.bets.find((bet) => bet.username === user.username);
    if (userBet) {
      setHasBet(true);
      setCanCashout(gameData.status === 'running' && !userBet.cashedOut);
    }
  };

  const handlePlaceBet = async () => {
    if (!user) {
      toast.error('Please login to play');
      return;
    }

    if (betAmount > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!game || game.status !== 'waiting') {
      toast.error('Cannot place bet at this time');
      return;
    }

    setLoading(true);
    try {
      const response = await gameAPI.placeCrashBet(betAmount);
      if (response.success) {
        setHasBet(true);
        refreshUser();
        toast.success('Bet placed successfully!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to place bet';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCashout = async () => {
    if (!canCashout) return;

    setLoading(true);
    try {
      const response = await gameAPI.crashCashOut();
      if (response.success && response.data) {
        setCanCashout(false);
        setHasBet(false);
        refreshUser();
        toast.success(
          `Cashed out at ${response.data.multiplier}x! Won ${response.data.payout} coins!`,
          { duration: 4000 }
        );
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to cash out';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!game) return 'text-dark-400';
    switch (game.status) {
      case 'waiting':
        return 'text-yellow-400';
      case 'running':
        return 'text-green-400';
      case 'crashed':
        return 'text-red-400';
      default:
        return 'text-dark-400';
    }
  };

  const getStatusText = () => {
    if (!game) return 'Connecting...';
    switch (game.status) {
      case 'waiting':
        return 'Waiting for players...';
      case 'running':
        return 'Game in progress!';
      case 'crashed':
        return `Crashed at ${game.currentMultiplier.toFixed(2)}x`;
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <FaChartLine className="text-6xl text-primary-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-2">Crash Game</h1>
        <p className="text-dark-300">
          Cash out before the crash to win big!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-2">
          <div className="game-container">
            {/* Multiplier Display */}
            <div className="bg-gradient-to-b from-dark-900 to-dark-800 rounded-xl p-8 mb-6 text-center relative overflow-hidden">
              {/* Background animation */}
              {game?.status === 'running' && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-green-500/10 animate-pulse"></div>
              )}

              <div className="relative z-10">
                <p className={`text-xl mb-4 ${getStatusColor()} font-semibold`}>
                  {getStatusText()}
                </p>

                <div
                  className={`text-8xl font-bold mb-4 transition-all duration-300 ${
                    game?.status === 'running'
                      ? 'text-green-400 scale-110'
                      : game?.status === 'crashed'
                      ? 'text-red-400'
                      : 'text-dark-600'
                  }`}
                >
                  {game?.currentMultiplier.toFixed(2)}x
                </div>

                {game?.status === 'crashed' && (
                  <p className="text-2xl text-red-400 animate-pulse">💥 CRASHED!</p>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Bet Amount */}
              {!hasBet && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Bet Amount
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setBetAmount(Math.max((config?.minBet || 1), betAmount - 5))}
                        disabled={loading || game?.status !== 'waiting'}
                        className="btn btn-secondary"
                      >
                        -5
                      </button>
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        disabled={loading || game?.status !== 'waiting'}
                        className="input text-center"
                        min={config?.minBet || 1}
                        max={config?.maxBet || 100}
                      />
                      <button
                        onClick={() => setBetAmount(Math.min((config?.maxBet || 100), betAmount + 5))}
                        disabled={loading || game?.status !== 'waiting'}
                        className="btn btn-secondary"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  {/* Quick Bet Buttons */}
                  <div className="flex space-x-2">
                    {[10, 25, 50, 100].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setBetAmount(amount)}
                        disabled={loading || game?.status !== 'waiting'}
                        className="btn btn-secondary flex-1"
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Action Button */}
              {!hasBet ? (
                <button
                  onClick={handlePlaceBet}
                  disabled={loading || !user || game?.status !== 'waiting'}
                  className="w-full btn btn-primary py-4 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    'Placing Bet...'
                  ) : game?.status !== 'waiting' ? (
                    'Wait for next round'
                  ) : (
                    <>
                      <FaCoins className="inline mr-2" />
                      Place Bet ({betAmount} coins)
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleCashout}
                  disabled={!canCashout || loading}
                  className="w-full btn btn-success py-4 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? 'Cashing Out...'
                    : canCashout
                    ? `Cash Out (${(betAmount * (game?.currentMultiplier || 1)).toFixed(2)} coins)`
                    : hasBet && game?.status === 'waiting'
                    ? 'Waiting for game to start...'
                    : 'Cash out not available'}
                </button>
              )}

              {/* Balance */}
              {user && (
                <div className="text-center text-dark-300">
                  Balance:{' '}
                  <span className="text-white font-semibold">{user.balance.toFixed(2)}</span> coins
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Players List */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <FaUsers className="mr-2" />
              Players
            </h3>
            <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {game?.bets.length || 0}
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {game?.bets && game.bets.length > 0 ? (
              game.bets.map((bet, index) => (
                <div
                  key={index}
                  className={`bg-dark-900 rounded-lg p-3 ${
                    bet.cashedOut ? 'border-l-4 border-green-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">{bet.username}</span>
                    <span className="text-primary-400">{bet.betAmount} coins</span>
                  </div>
                  {bet.cashedOut && bet.cashoutMultiplier && (
                    <div className="text-sm text-green-400 mt-1">
                      Cashed out at {bet.cashoutMultiplier.toFixed(2)}x
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-dark-400 text-center py-8">No players yet</p>
            )}
          </div>
        </div>
      </div>

      {/* How to Play */}
      <div className="card mt-8">
        <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
        <ul className="space-y-2 text-dark-300">
          <li>• Place your bet before the game starts</li>
          <li>• Watch the multiplier increase in real-time</li>
          <li>• Cash out before the crash to secure your winnings</li>
          <li>• The longer you wait, the higher the multiplier - but risk the crash!</li>
          <li>• If you don't cash out before the crash, you lose your bet</li>
        </ul>
      </div>
    </div>
  );
};

export default Crash;
