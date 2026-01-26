const { TRADING_CONFIG } = require('../config/game.config');
const { formatCoins } = require('../utils/gameCalculations');
const Position = require('../models/Position.model');
const GameHistory = require('../models/GameHistory.model');

/**
 * Real Paper Trading Service
 * Open/Close positions with live PnL calculation, leverage, and dynamic timeframes
 */
class TradingService {
  // Store live market data for all assets (1s base candles)
  static marketData = {};
  static priceUpdateInterval = null;
  static liquidationCheckInterval = null;

  /**
   * Initialize market with historical data and start live price updates
   */
  static initializeMarket() {
    TRADING_CONFIG.ASSETS.forEach(asset => {
      if (!this.marketData[asset.id]) {
        this.marketData[asset.id] = {
          currentPrice: asset.initialPrice,
          priceHistory: [], // Store base 1s candles
          lastUpdate: Date.now()
        };

        let price = asset.initialPrice;
        
        // Generate initial history (1 hour of 1s candles)
        for (let i = 0; i < TRADING_CONFIG.MAX_HISTORY_LENGTH; i++) {
          const change = (Math.random() - 0.5) * 2 * asset.volatility;
          const open = price;
          const close = price * (1 + change);
          const high = Math.max(open, close) * (1 + Math.random() * 0.01);
          const low = Math.min(open, close) * (1 - Math.random() * 0.01);
          const volume = Math.random() * 100; // Random volume
          
          this.marketData[asset.id].priceHistory.push({
            time: Date.now() - (TRADING_CONFIG.MAX_HISTORY_LENGTH - i) * 1000,
            open,
            high,
            low,
            close,
            volume
          });
          
          price = close;
        }
        
        this.marketData[asset.id].currentPrice = price;
      }
    });

    // Start live price updates (every 1 second)
    if (!this.priceUpdateInterval) {
      this.startLivePriceUpdates();
    }
    
    // Start liquidation checker
    if (!this.liquidationCheckInterval) {
      this.startLiquidationChecker();
    }
  }

  /**
   * Start live price updates (every 1 second)
   */
  static startLivePriceUpdates() {
    this.priceUpdateInterval = setInterval(() => {
      try {
        TRADING_CONFIG.ASSETS.forEach(asset => {
          if (!this.marketData[asset.id]) return;
          
          const data = this.marketData[asset.id];
          const change = (Math.random() - 0.5) * 2 * asset.volatility;
          const newPrice = data.currentPrice * (1 + change);
          
          // Update current price
          data.currentPrice = newPrice;
          data.lastUpdate = Date.now();
          
          // Add to history (keep last MAX_HISTORY_LENGTH candles)
          const lastCandle = data.priceHistory[data.priceHistory.length - 1];
          if (lastCandle) {
            data.priceHistory.push({
              time: Date.now(),
              open: lastCandle.close,
              high: Math.max(lastCandle.close, newPrice) * (1 + Math.random() * 0.005),
              low: Math.min(lastCandle.close, newPrice) * (1 - Math.random() * 0.005),
              close: newPrice,
              volume: Math.random() * 100
            });
            
            if (data.priceHistory.length > TRADING_CONFIG.MAX_HISTORY_LENGTH) {
              data.priceHistory.shift();
            }
          }
        });
      } catch (error) {
        console.error('Price update error:', error);
      }
    }, TRADING_CONFIG.BASE_CANDLE_INTERVAL);
  }

  /**
   * Start liquidation checker (every 2 seconds)
   */
  static startLiquidationChecker() {
    this.liquidationCheckInterval = setInterval(async () => {
      try {
        const openPositions = await Position.find({ status: 'open' });
        
        for (const position of openPositions) {
          const currentPrice = this.marketData[position.assetId]?.currentPrice;
          if (!currentPrice) continue;
          
          if (position.shouldLiquidate(currentPrice)) {
            await this.liquidatePosition(position, currentPrice);
          }
        }
      } catch (error) {
        console.error('Liquidation check error:', error);
      }
    }, 2000); // Check every 2 seconds
  }

  /**
   * Aggregate base candles into larger timeframes
   */
  static aggregateCandles(baseCandles, timeframeSeconds) {
    if (!baseCandles || baseCandles.length === 0) return [];
    
    const aggregated = [];
    let currentCandle = null;
    
    baseCandles.forEach(candle => {
      const candleTime = Math.floor(candle.time / (timeframeSeconds * 1000)) * timeframeSeconds * 1000;
      
      if (!currentCandle || currentCandle.time !== candleTime) {
        if (currentCandle) aggregated.push(currentCandle);
        
        currentCandle = {
          time: candleTime,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume || 0
        };
      } else {
        currentCandle.high = Math.max(currentCandle.high, candle.high);
        currentCandle.low = Math.min(currentCandle.low, candle.low);
        currentCandle.close = candle.close;
        currentCandle.volume += candle.volume || 0;
      }
    });
    
    if (currentCandle) aggregated.push(currentCandle);
    
    return aggregated;
  }

  /**
   * Open a new position (LONG or SHORT) with optional leverage
   */
  static async openPosition(user, assetId, direction, stake, leverage = 1, clientSeed = null) {
    try {
      this.initializeMarket();
      
      // Validate inputs
      if (stake < TRADING_CONFIG.MIN_BET) {
        throw new Error(`Minimum stake is ${TRADING_CONFIG.MIN_BET} coins`);
      }
      
      if (stake > TRADING_CONFIG.MAX_BET) {
        throw new Error(`Maximum stake is ${TRADING_CONFIG.MAX_BET} coins`);
      }
      
      if (stake > user.balance) {
        throw new Error('Insufficient balance');
      }
      
      if (!TRADING_CONFIG.LEVERAGE_OPTIONS.includes(leverage)) {
        throw new Error(`Invalid leverage. Choose from: ${TRADING_CONFIG.LEVERAGE_OPTIONS.join(', ')}`);
      }
      
      const asset = TRADING_CONFIG.ASSETS.find(a => a.id === assetId);
      if (!asset) {
        throw new Error(`Invalid asset: ${assetId}`);
      }
      
      if (!['long', 'short'].includes(direction)) {
        throw new Error('Direction must be "long" or "short"');
      }
      
      // Get current price
      const entryPrice = this.marketData[assetId].currentPrice;
      
      // Deduct stake from balance (locked in position)
      user.balance -= stake;
      await user.save();
      
      // Create position
      const position = await Position.create({
        user: user._id,
        username: user.username,
        assetId,
        direction,
        stake,
        leverage,
        entryPrice,
        status: 'open',
        provablyFair: {
          clientSeed: clientSeed || user.clientSeed,
          serverSeed: user.serverSeed,
          serverSeedHash: user.serverSeedHash,
          nonce: user.nonce
        }
      });
      
      // Calculate and store liquidation price
      position.liquidationPrice = position.calculateLiquidationPrice();
      await position.save();
      
      user.incrementNonce();
      await user.save();
      
      return {
        success: true,
        data: {
          positionId: position._id,
          assetId,
          assetName: asset.name,
          direction,
          stake: formatCoins(stake),
          leverage,
          entryPrice: parseFloat(entryPrice.toFixed(2)),
          liquidationPrice: parseFloat(position.liquidationPrice.toFixed(2)),
          currentPrice: parseFloat(entryPrice.toFixed(2)),
          pnl: 0,
          pnlPercent: 0,
          status: 'open',
          openedAt: position.openedAt,
          balance: formatCoins(user.balance)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Close an open position
   */
  static async closePosition(user, positionId) {
    try {
      this.initializeMarket();
      
      // Find position
      const position = await Position.findOne({
        _id: positionId,
        user: user._id,
        status: 'open'
      });
      
      if (!position) {
        throw new Error('Position not found or already closed');
      }
      
      // Get current price
      const currentPrice = this.marketData[position.assetId].currentPrice;
      
      // Calculate final PnL
      const pnl = position.calculatePnL(currentPrice);
      const finalBalance = position.stake + pnl;
      
      // Update position
      position.exitPrice = currentPrice;
      position.pnl = pnl;
      position.status = 'closed';
      position.closedAt = new Date();
      await position.save();
      
      // Update user balance
      const balanceBefore = user.balance;
      user.balance += finalBalance; // Return stake + profit/loss
      user.totalWagered += position.stake;
      if (pnl > 0) {
        user.totalWon += finalBalance;
      }
      user.gamesPlayed += 1;
      await user.save();
      
      // Create game history
      await GameHistory.create({
        user: user._id,
        username: user.username,
        gameType: 'trading',
        betAmount: formatCoins(position.stake),
        payout: formatCoins(finalBalance),
        profit: formatCoins(pnl),
        multiplier: pnl > 0 ? finalBalance / position.stake : 0,
        gameData: {
          assetId: position.assetId,
          direction: position.direction,
          leverage: position.leverage,
          entryPrice: position.entryPrice,
          exitPrice: currentPrice,
          duration: Math.floor((position.closedAt - position.openedAt) / 1000)
        },
        provablyFair: position.provablyFair,
        balanceBefore: formatCoins(balanceBefore),
        balanceAfter: formatCoins(user.balance),
        isWin: pnl > 0
      });
      
      const asset = TRADING_CONFIG.ASSETS.find(a => a.id === position.assetId);
      
      return {
        success: true,
        data: {
          positionId: position._id,
          assetId: position.assetId,
          assetName: asset.name,
          direction: position.direction,
          leverage: position.leverage,
          stake: formatCoins(position.stake),
          entryPrice: parseFloat(position.entryPrice.toFixed(2)),
          exitPrice: parseFloat(currentPrice.toFixed(2)),
          pnl: formatCoins(pnl),
          pnlPercent: parseFloat(((pnl / position.stake) * 100).toFixed(2)),
          duration: Math.floor((position.closedAt - position.openedAt) / 1000),
          balance: formatCoins(user.balance),
          status: 'closed'
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Liquidate a position
   */
  static async liquidatePosition(position, currentPrice) {
    try {
      const User = require('../models/User.model');
      const user = await User.findById(position.user);
      if (!user) return;
      
      // Calculate final PnL (should be -80% of stake)
      const pnl = position.calculatePnL(currentPrice);
      const finalBalance = position.stake + pnl;
      
      // Update position
      position.exitPrice = currentPrice;
      position.pnl = pnl;
      position.status = 'liquidated';
      position.closedAt = new Date();
      await position.save();
      
      // Update user balance
      user.balance += Math.max(0, finalBalance); // Return remaining balance (if any)
      user.totalWagered += position.stake;
      user.gamesPlayed += 1;
      await user.save();
      
      // Create game history
      await GameHistory.create({
        user: user._id,
        username: user.username,
        gameType: 'trading',
        betAmount: formatCoins(position.stake),
        payout: formatCoins(Math.max(0, finalBalance)),
        profit: formatCoins(pnl),
        multiplier: 0,
        gameData: {
          assetId: position.assetId,
          direction: position.direction,
          leverage: position.leverage,
          entryPrice: position.entryPrice,
          exitPrice: currentPrice,
          liquidated: true,
          duration: Math.floor((position.closedAt - position.openedAt) / 1000)
        },
        provablyFair: position.provablyFair,
        balanceBefore: formatCoins(user.balance - Math.max(0, finalBalance)),
        balanceAfter: formatCoins(user.balance),
        isWin: false
      });
      
      console.log(`Position ${position._id} liquidated for user ${user.username}`);
    } catch (error) {
      console.error('Liquidation error:', error);
    }
  }

  /**
   * Get all open positions for a user
   */
  static async getOpenPositions(userId) {
    try {
      this.initializeMarket();
      
      const positions = await Position.find({
        user: userId,
        status: 'open'
      }).sort({ openedAt: -1 });
      
      // Calculate live PnL for each position
      const positionsWithPnL = positions.map(position => {
        const currentPrice = this.marketData[position.assetId].currentPrice;
        const pnl = position.calculatePnL(currentPrice);
        const asset = TRADING_CONFIG.ASSETS.find(a => a.id === position.assetId);
        
        return {
          positionId: position._id,
          assetId: position.assetId,
          assetName: asset.name,
          assetSymbol: asset.symbol,
          assetColor: asset.color,
          direction: position.direction,
          leverage: position.leverage,
          stake: formatCoins(position.stake),
          entryPrice: parseFloat(position.entryPrice.toFixed(2)),
          currentPrice: parseFloat(currentPrice.toFixed(2)),
          liquidationPrice: position.liquidationPrice ? parseFloat(position.liquidationPrice.toFixed(2)) : null,
          pnl: formatCoins(pnl),
          pnlPercent: parseFloat(((pnl / position.stake) * 100).toFixed(2)),
          openedAt: position.openedAt,
          duration: Math.floor((Date.now() - position.openedAt) / 1000)
        };
      });
      
      return {
        success: true,
        data: positionsWithPnL
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get closed positions history
   */
  static async getClosedPositions(userId, limit = 20) {
    try {
      const positions = await Position.find({
        user: userId,
        status: 'closed'
      })
        .sort({ closedAt: -1 })
        .limit(limit);
      
      const positionsData = positions.map(position => {
        const asset = TRADING_CONFIG.ASSETS.find(a => a.id === position.assetId);
        
        return {
          positionId: position._id,
          assetId: position.assetId,
          assetName: asset.name,
          direction: position.direction,
          stake: formatCoins(position.stake),
          entryPrice: parseFloat(position.entryPrice.toFixed(2)),
          exitPrice: parseFloat(position.exitPrice.toFixed(2)),
          pnl: formatCoins(position.pnl),
          pnlPercent: parseFloat(((position.pnl / position.stake) * 100).toFixed(2)),
          duration: Math.floor((position.closedAt - position.openedAt) / 1000),
          openedAt: position.openedAt,
          closedAt: position.closedAt
        };
      });
      
      return {
        success: true,
        data: positionsData
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current market data for all assets with specific timeframe
   */
  static getAllMarketData(timeframe = '1m') {
    this.initializeMarket();
    
    const timeframeConfig = TRADING_CONFIG.TIMEFRAMES.find(tf => tf.id === timeframe) || 
                           TRADING_CONFIG.TIMEFRAMES.find(tf => tf.id === TRADING_CONFIG.DEFAULT_TIMEFRAME);
    
    const allData = {};
    
    TRADING_CONFIG.ASSETS.forEach(asset => {
      const baseCandles = this.marketData[asset.id].priceHistory;
      
      // Aggregate candles based on timeframe
      let processedCandles;
      if (timeframe === '1m' || !timeframe) {
        // For 1m, aggregate 60 x 1s candles into 1m candles
        processedCandles = this.aggregateCandles(baseCandles, 60);
      } else {
        processedCandles = this.aggregateCandles(baseCandles, timeframeConfig.seconds);
      }
      
      // Take last N candles based on config
      const lastCandles = processedCandles.slice(-timeframeConfig.candleCount);
      
      allData[asset.id] = {
        assetId: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        color: asset.color,
        currentPrice: parseFloat(this.marketData[asset.id].currentPrice.toFixed(2)),
        priceHistory: lastCandles.map(candle => ({
          time: candle.time,
          open: parseFloat(candle.open.toFixed(2)),
          high: parseFloat(candle.high.toFixed(2)),
          low: parseFloat(candle.low.toFixed(2)),
          close: parseFloat(candle.close.toFixed(2)),
          volume: parseFloat((candle.volume || 0).toFixed(2))
        })),
        lastUpdate: this.marketData[asset.id].lastUpdate,
        timeframe: timeframeConfig.id,
        timeframeLabel: timeframeConfig.label
      };
    });
    
    return allData;
  }

  /**
   * Get config (for client)
   */
  static getConfig() {
    return {
      minBet: TRADING_CONFIG.MIN_BET,
      maxBet: TRADING_CONFIG.MAX_BET,
      leverageOptions: TRADING_CONFIG.LEVERAGE_OPTIONS,
      timeframes: TRADING_CONFIG.TIMEFRAMES.map(tf => ({
        id: tf.id,
        label: tf.label,
        seconds: tf.seconds
      })),
      defaultTimeframe: TRADING_CONFIG.DEFAULT_TIMEFRAME,
      assets: TRADING_CONFIG.ASSETS.map(a => ({
        id: a.id,
        name: a.name,
        symbol: a.symbol,
        color: a.color
      }))
    };
  }
}

module.exports = TradingService;
