import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gameAPI } from '../services/api';
import { TradingConfig, AssetMarketData, Position } from '../types';
import toast from 'react-hot-toast';
import { FaChartLine, FaArrowUp, FaArrowDown, FaClock, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';

const Trading: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const [config, setConfig] = useState<TradingConfig | null>(null);
  const [marketData, setMarketData] = useState<{ [key: string]: AssetMarketData }>({});
  const [openPositions, setOpenPositions] = useState<Position[]>([]);
  const [closedPositions, setClosedPositions] = useState<Position[]>([]);
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [stake, setStake] = useState(10);
  const [leverage, setLeverage] = useState(1);
  const [timeframe, setTimeframe] = useState('1m');
  const [opening, setOpening] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    loadConfig();
    loadMarketData();
    loadPositions();
    
    // Auto-refresh market data every 1 second for live prices
    const marketInterval = setInterval(() => {
      loadMarketData();
    }, 1000);
    
    // Auto-refresh open positions every 1 second for live PnL
    const positionsInterval = setInterval(() => {
      loadPositions();
    }, 1000);
    
    return () => {
      clearInterval(marketInterval);
      clearInterval(positionsInterval);
    };
  }, [timeframe]);

  useEffect(() => {
    if (assetId && marketData[assetId]) {
      drawChart();
    }
  }, [marketData, assetId]);

  const loadConfig = async () => {
    try {
      const response = await gameAPI.getTradingConfig();
      if (response.success && response.data) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const loadMarketData = async () => {
    try {
      const response = await gameAPI.getMarketData(timeframe);
      if (response.success && response.data) {
        setMarketData(response.data);
      }
    } catch (error) {
      console.error('Failed to load market data:', error);
    }
  };

  const loadPositions = async () => {
    try {
      const [openRes, closedRes] = await Promise.all([
        gameAPI.getOpenPositions(),
        gameAPI.getClosedPositions(10)
      ]);
      
      if (openRes.success && openRes.data) {
        setOpenPositions(openRes.data);
      }
      
      if (closedRes.success && closedRes.data) {
        setClosedPositions(closedRes.data);
      }
    } catch (error) {
      console.error('Failed to load positions:', error);
    }
  };

  const drawChart = () => {
    if (!assetId || !canvasRef.current || !marketData[assetId]) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 50;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const history = marketData[assetId].priceHistory;
    if (history.length === 0) return;

    // Calculate price range
    const prices = history.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Draw grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      const y = padding + (height - 2 * padding) * (i / 6);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Price labels
      const price = maxPrice - (priceRange * (i / 6));
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`$${price.toFixed(2)}`, padding - 10, y + 5);
    }

    // Draw candlesticks
    const candleWidth = (width - 2 * padding) / history.length;
    const candleBodyWidth = Math.max(2, candleWidth * 0.75);

    history.forEach((candle, i) => {
      const x = padding + i * candleWidth + candleWidth / 2;
      
      const openY = padding + (height - 2 * padding) * (1 - (candle.open - minPrice) / priceRange);
      const closeY = padding + (height - 2 * padding) * (1 - (candle.close - minPrice) / priceRange);
      const highY = padding + (height - 2 * padding) * (1 - (candle.high - minPrice) / priceRange);
      const lowY = padding + (height - 2 * padding) * (1 - (candle.low - minPrice) / priceRange);

      const isGreen = candle.close >= candle.open;
      const color = isGreen ? '#10b981' : '#ef4444';

      // Draw wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body
      ctx.fillStyle = color;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(2, Math.abs(closeY - openY));
      ctx.fillRect(x - candleBodyWidth / 2, bodyTop, candleBodyWidth, bodyHeight);
    });

    // Current price line
    const currentPriceY = padding + (height - 2 * padding) * (1 - (marketData[assetId].currentPrice - minPrice) / priceRange);
    ctx.strokeStyle = marketData[assetId].color;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, currentPriceY);
    ctx.lineTo(width - padding, currentPriceY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current price label (right side with background)
    const priceText = `$${marketData[assetId].currentPrice.toFixed(2)}`;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    const textWidth = ctx.measureText(priceText).width;
    
    ctx.fillStyle = marketData[assetId].color;
    ctx.fillRect(width - padding + 10, currentPriceY - 12, textWidth + 10, 24);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(priceText, width - padding + 15, currentPriceY + 5);
  };

  const handleOpenPosition = async () => {
    if (!user) {
      toast.error('Please login to trade');
      return;
    }

    if (!assetId) {
      toast.error('Please select an asset');
      return;
    }

    if (stake > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (stake < (config?.minBet || 1)) {
      toast.error(`Minimum stake is ${config?.minBet || 1} coins`);
      return;
    }

    try {
      setOpening(true);
      const response = await gameAPI.openPosition(assetId, direction, stake, leverage);
      
      if (response.success) {
        toast.success(`Position opened! ${direction.toUpperCase()} ${leverage}x`);
        await loadPositions();
        await refreshUser();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to open position');
    } finally {
      setOpening(false);
    }
  };

  const handleClosePosition = async (positionId: string) => {
    try {
      const response = await gameAPI.closePosition(positionId);
      
      if (response.success) {
        const pnl = response.data.pnl;
        if (pnl >= 0) {
          toast.success(`Position closed! Profit: +${pnl}`);
        } else {
          toast.error(`Position closed! Loss: ${pnl}`);
        }
        await loadPositions();
        await refreshUser();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to close position');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const calculateLiquidationPrice = (entryPrice: number, direction: 'long' | 'short', lev: number) => {
    const threshold = 0.8;
    const lossPercent = threshold / lev;
    
    if (direction === 'long') {
      return entryPrice * (1 - lossPercent);
    } else {
      return entryPrice * (1 + lossPercent);
    }
  };

  const totalPnL = openPositions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalStake = openPositions.reduce((sum, pos) => sum + pos.stake, 0);

  // Asset overview - when no specific asset selected
  if (!assetId) {
    return (
      <div className="max-w-7xl mx-auto animate-fadeIn">
        <div className="mb-6">
          <div className="flex items-center">
            <FaChartLine className="text-5xl text-primary-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-white">Paper Trading</h1>
              <p className="text-dark-300">Select an asset to start trading with leverage</p>
            </div>
          </div>
        </div>

        {/* Asset Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config?.assets.map(asset => {
            const assetData = marketData[asset.id];
            if (!assetData) return null;

            const assetPositions = openPositions.filter(p => p.assetId === asset.id);
            const assetPnL = assetPositions.reduce((sum, p) => sum + p.pnl, 0);

            return (
              <Link 
                to={`/trading/${asset.id}`} 
                key={asset.id}
                className="card hover:border-primary-500 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{asset.name}</h3>
                    <p className="text-dark-400 text-sm">{asset.symbol}</p>
                  </div>
                  <div style={{ color: asset.color }} className="text-3xl font-bold">
                    ${assetData.currentPrice.toFixed(2)}
                  </div>
                </div>

                {assetPositions.length > 0 && (
                  <div className="bg-dark-900 rounded-lg p-3 mb-3">
                    <p className="text-dark-400 text-sm mb-1">
                      {assetPositions.length} open position{assetPositions.length > 1 ? 's' : ''}
                    </p>
                    <p className={`text-lg font-bold ${assetPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {assetPnL >= 0 ? '+' : ''}{assetPnL.toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="text-primary-500 text-center py-2 font-semibold">
                  Click to Trade →
                </div>
              </Link>
            );
          })}
        </div>

        {/* Open Positions Summary */}
        {openPositions.length > 0 && (
          <div className="card mt-8">
            <h3 className="text-xl font-bold text-white mb-4">All Open Positions ({openPositions.length})</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-dark-900 rounded-lg p-4">
                <p className="text-dark-400 text-sm">Total Staked</p>
                <p className="text-2xl font-bold text-white">{totalStake.toFixed(2)}</p>
              </div>
              <div className="bg-dark-900 rounded-lg p-4">
                <p className="text-dark-400 text-sm">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Individual asset trading page
  const currentAssetData = marketData[assetId];
  const currentAsset = config?.assets.find(a => a.id === assetId);
  
  if (!currentAssetData || !currentAsset) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-400">Loading asset data...</p>
      </div>
    );
  }

  const liquidationPrice = calculateLiquidationPrice(currentAssetData.currentPrice, direction, leverage);
  const assetOpenPositions = openPositions.filter(p => p.assetId === assetId);
  const assetClosedPositions = closedPositions.filter(p => p.assetId === assetId);

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/trading')} 
            className="btn btn-secondary mr-4 flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">{currentAsset.name}</h1>
            <p className="text-dark-300">Paper Trading • {currentAssetData.timeframeLabel}</p>
          </div>
        </div>
        <div style={{ color: currentAsset.color }} className="text-4xl font-bold">
          ${currentAssetData.currentPrice.toFixed(2)}
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="card mb-6">
        <h3 className="text-white font-semibold mb-3">Timeframe</h3>
        <div className="flex flex-wrap gap-2">
          {config?.timeframes.map(tf => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`btn ${timeframe === tf.id ? 'btn-primary' : 'btn-secondary'}`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-white font-semibold mb-4">Price Chart</h3>
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ width: '100%', height: '500px' }}
            />
          </div>

          {/* Open Positions for this asset */}
          {assetOpenPositions.length > 0 && (
            <div className="card mt-6">
              <h3 className="text-white font-semibold mb-4">
                Open Positions ({assetOpenPositions.length})
              </h3>
              <div className="space-y-3">
                {assetOpenPositions.map(position => (
                  <div 
                    key={position.positionId} 
                    className={`bg-dark-900 rounded-lg p-4 border-l-4 ${
                      position.pnl >= 0 ? 'border-green-500' : 'border-red-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded text-sm font-bold ${
                          position.direction === 'long' 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {position.direction.toUpperCase()}
                        </div>
                        <span className="text-primary-400 font-bold">{position.leverage}x</span>
                        <span className="text-dark-400 text-sm">
                          <FaClock className="inline mr-1" />
                          {formatDuration(position.duration || 0)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleClosePosition(position.positionId)}
                        className="btn btn-secondary btn-sm"
                      >
                        Close
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-dark-400">Entry</p>
                        <p className="text-white font-semibold">${position.entryPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-dark-400">Current</p>
                        <p className="text-white font-semibold">${position.currentPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-dark-400">Stake</p>
                        <p className="text-white font-semibold">{position.stake.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-dark-400">P&L</p>
                        <p className={`font-bold ${
                          position.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(2)} ({position.pnlPercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>

                    {position.liquidationPrice && (
                      <div className="mt-3 flex items-center text-xs text-yellow-500">
                        <FaExclamationTriangle className="mr-2" />
                        Liquidation: ${position.liquidationPrice.toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Position History */}
          {assetClosedPositions.length > 0 && (
            <div className="card mt-6">
              <h3 className="text-white font-semibold mb-4">Position History</h3>
              <div className="space-y-2">
                {assetClosedPositions.map(position => (
                  <div 
                    key={position.positionId}
                    className="bg-dark-900 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`px-2 py-1 rounded text-xs font-bold ${
                        position.direction === 'long' 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {position.direction.toUpperCase()} {position.leverage}x
                      </div>
                      <div className="text-sm">
                        <p className="text-dark-400">
                          ${position.entryPrice?.toFixed(2)} → ${position.exitPrice?.toFixed(2)}
                        </p>
                        <p className="text-dark-500 text-xs">{formatDuration(position.duration || 0)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        position.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {position.pnl >= 0 ? '+' : ''}{position.pnl.toFixed(2)}
                      </p>
                      <p className="text-dark-400 text-xs">{position.pnlPercent?.toFixed(2)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trading Panel */}
        <div>
          <div className="card sticky top-6">
            <h3 className="text-white font-semibold mb-4">Open Position</h3>

            {/* Direction Selector */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setDirection('long')}
                className={`py-3 rounded-lg font-bold transition-all ${
                  direction === 'long'
                    ? 'bg-green-600 text-white'
                    : 'bg-dark-900 text-dark-400 hover:bg-dark-700'
                }`}
              >
                <FaArrowUp className="inline mr-2" />
                LONG
              </button>
              <button
                onClick={() => setDirection('short')}
                className={`py-3 rounded-lg font-bold transition-all ${
                  direction === 'short'
                    ? 'bg-red-600 text-white'
                    : 'bg-dark-900 text-dark-400 hover:bg-dark-700'
                }`}
              >
                <FaArrowDown className="inline mr-2" />
                SHORT
              </button>
            </div>

            {/* Leverage Selector */}
            <div className="mb-4">
              <label className="text-sm text-dark-400 mb-2 block">Leverage</label>
              <div className="grid grid-cols-4 gap-2">
                {config?.leverageOptions.map(lev => (
                  <button
                    key={lev}
                    onClick={() => setLeverage(lev)}
                    className={`py-2 rounded font-bold ${
                      leverage === lev
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-900 text-dark-400 hover:bg-dark-700'
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>

            {/* Stake Input */}
            <div className="mb-4">
              <label className="text-sm text-dark-400 mb-2 block">
                Stake Amount (Balance: {user?.balance.toFixed(2) || 0})
              </label>
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(Number(e.target.value))}
                disabled={opening}
                className="input w-full text-lg"
                min={config?.minBet || 1}
                max={config?.maxBet || 100}
              />
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[10, 25, 50, 100].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setStake(amount)}
                    disabled={opening}
                    className="btn btn-secondary text-sm py-2"
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Open Button */}
            <button
              onClick={handleOpenPosition}
              disabled={opening || !user || stake === 0}
              className={`
                w-full py-5 text-xl font-bold rounded-lg transition-all
                ${direction === 'long'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
                }
                text-white disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {opening ? 'Opening...' : `Open ${direction.toUpperCase()} ${leverage}x`}
            </button>

            {/* Info */}
            <div className="mt-4 p-3 bg-dark-900 rounded-lg text-xs text-dark-400 space-y-1">
              <div className="flex justify-between">
                <span>Entry:</span>
                <span className="text-white">${currentAssetData.currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Risk:</span>
                <span className="text-white">{stake.toFixed(2)} coins</span>
              </div>
              <div className="flex justify-between">
                <span>Max Profit ({leverage}x):</span>
                <span className="text-green-400">+{(stake * leverage * 0.8).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Liquidation:</span>
                <span className="text-yellow-500">${liquidationPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trading;
