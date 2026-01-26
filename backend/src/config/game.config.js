/**
 * Game configuration constants
 */

// Slots configuration
const SLOTS_CONFIG = {
  REELS: 5,
  ROWS: 3,
  SYMBOLS: [
    { id: 'cherry', value: 1, weight: 35 },    // Increased from 30
    { id: 'lemon', value: 2, weight: 30 },     // Increased from 25
    { id: 'orange', value: 3, weight: 25 },    // Increased from 20
    { id: 'plum', value: 4, weight: 20 },      // Increased from 15
    { id: 'bell', value: 5, weight: 15 },      // Increased from 10
    { id: 'bar', value: 10, weight: 12 },      // Increased from 8
    { id: 'seven', value: 20, weight: 8 },     // Increased from 5
    { id: 'diamond', value: 50, weight: 5 }    // Increased from 2
  ],
  PAYLINES: [
    [1, 1, 1, 1, 1], // Middle row
    [0, 0, 0, 0, 0], // Top row
    [2, 2, 2, 2, 2], // Bottom row
    [0, 1, 2, 1, 0], // V shape
    [2, 1, 0, 1, 2], // ^ shape
  ],
  MIN_BET: 1,
  MAX_BET: 100,
  MIN_MATCHING: 3 // Minimum symbols in a row to win
};

// Dice configuration
const DICE_CONFIG = {
  MIN_NUMBER: 0,
  MAX_NUMBER: 100,
  MIN_BET: 1,
  MAX_BET: 100,
  MIN_CHANCE: 1,
  MAX_CHANCE: 95,
  HOUSE_EDGE: 0.01 // 1% house edge
};

// Coinflip configuration
const COINFLIP_CONFIG = {
  MIN_BET: 1,
  MAX_BET: 100,
  PAYOUT_MULTIPLIER: 1.98, // 1% house edge (50% win chance * 1.98 = 99% RTP)
  SIDES: ['heads', 'tails']
};

// Mines configuration
const MINES_CONFIG = {
  MIN_BET: 1,
  MAX_BET: 100,
  GRID_SIZE: 25, // 5x5 grid
  MIN_MINES: 1,
  MAX_MINES: 24,
  HOUSE_EDGE: 0.01, // 1% house edge
  // Multiplier increases based on number of revealed tiles and mines
  // Formula: (totalTiles - mines) / (totalTiles - mines - revealed) * (1 - houseEdge)
};

// Daily Rewards configuration
const DAILY_REWARDS_CONFIG = {
  COOLDOWN_HOURS: 24,
  REWARDS: [
    { id: 'common1', name: '10 Coins', amount: 10, weight: 40, rarity: 'common' },
    { id: 'common2', name: '25 Coins', amount: 25, weight: 30, rarity: 'common' },
    { id: 'uncommon1', name: '50 Coins', amount: 50, weight: 15, rarity: 'uncommon' },
    { id: 'uncommon2', name: '75 Coins', amount: 75, weight: 8, rarity: 'uncommon' },
    { id: 'rare', name: '100 Coins', amount: 100, weight: 5, rarity: 'rare' },
    { id: 'epic', name: '250 Coins', amount: 250, weight: 1.5, rarity: 'epic' },
    { id: 'legendary', name: '500 Coins', amount: 500, weight: 0.5, rarity: 'legendary' }
  ]
};

// Trading configuration
const TRADING_CONFIG = {
  MIN_BET: 1,
  MAX_BET: 100,
  
  // Timeframes (in seconds)
  TIMEFRAMES: [
    { id: '1m', label: '1 Minute', seconds: 60, candleCount: 60 },
    { id: '5m', label: '5 Minutes', seconds: 300, candleCount: 60 },
    { id: '15m', label: '15 Minutes', seconds: 900, candleCount: 60 },
    { id: '30m', label: '30 Minutes', seconds: 1800, candleCount: 60 },
    { id: '1h', label: '1 Hour', seconds: 3600, candleCount: 60 }
  ],
  DEFAULT_TIMEFRAME: '1m',
  
  // Leverage options
  LEVERAGE_OPTIONS: [1, 2, 5, 10],
  MAX_LEVERAGE: 10,
  LIQUIDATION_THRESHOLD: 0.8, // Liquidate at 80% loss
  
  // Price simulation
  BASE_CANDLE_INTERVAL: 1000, // 1 second base candles
  MAX_HISTORY_LENGTH: 3600, // Keep 1 hour of 1s candles
  PRICE_VOLATILITY: 0.03,
  
  ASSETS: [
    { id: 'BTC', name: 'Bitcoin', symbol: '₿', initialPrice: 45000, volatility: 0.03, color: '#f7931a' },
    { id: 'ETH', name: 'Ethereum', symbol: 'Ξ', initialPrice: 2500, volatility: 0.035, color: '#627eea' },
    { id: 'BNB', name: 'Binance Coin', symbol: 'BNB', initialPrice: 350, volatility: 0.04, color: '#f3ba2f' },
    { id: 'SOL', name: 'Solana', symbol: 'SOL', initialPrice: 100, volatility: 0.05, color: '#14f195' },
    { id: 'ADA', name: 'Cardano', symbol: 'ADA', initialPrice: 0.5, volatility: 0.045, color: '#0033ad' }
  ]
};

// Crash configuration
const CRASH_CONFIG = {
  MIN_BET: 1,
  MAX_BET: 100,
  MIN_MULTIPLIER: 1.0,
  MAX_MULTIPLIER: 10000.0,
  CRASH_POINT_HOUSE_EDGE: 0.01, // 1% house edge
  GAME_DURATION: 10000, // Maximum game duration in ms
  MULTIPLIER_TICK_RATE: 100, // Update multiplier every 100ms
  MULTIPLIER_GROWTH_RATE: 0.01 // Growth per tick
};

// User configuration
const USER_CONFIG = {
  INITIAL_BALANCE: 1000, // Starting virtual coins
  MIN_BALANCE: 0
};

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // Max requests per window
  BET_WINDOW_MS: 1000, // 1 second
  MAX_BETS_PER_SECOND: 3
};

module.exports = {
  SLOTS_CONFIG,
  DICE_CONFIG,
  COINFLIP_CONFIG,
  MINES_CONFIG,
  DAILY_REWARDS_CONFIG,
  TRADING_CONFIG,
  CRASH_CONFIG,
  USER_CONFIG,
  RATE_LIMIT_CONFIG
};
