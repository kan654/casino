// User types
export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  gamesPlayed: number;
  totalWagered: number;
  totalWon: number;
  serverSeedHash?: string;
  clientSeed?: string;
  nonce?: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Game types
export interface GameHistory {
  _id: string;
  user: string;
  username: string;
  gameType: 'slots' | 'dice' | 'coinflip' | 'mines' | 'crash';
  betAmount: number;
  payout: number;
  profit: number;
  multiplier: number;
  gameData: any;
  isWin: boolean;
  createdAt: string;
}

// Slots types
export interface SlotsResult {
  reels: string[][];
  winningLines: WinningLine[];
  payout: number;
  profit: number;
  multiplier: number;
  balance: number;
  isWin: boolean;
}

export interface WinningLine {
  line: number;
  symbol: string;
  count: number;
  payout: number;
}

export interface SlotsConfig {
  reels: number;
  rows: number;
  symbols: Symbol[];
  paylines: number[][];
  minBet: number;
  maxBet: number;
}

export interface Symbol {
  id: string;
  value: number;
}

// Dice types
export interface DiceResult {
  rollResult: number;
  target: number;
  isOver: boolean;
  isWin: boolean;
  payout: number;
  profit: number;
  multiplier: number;
  winChance: string;
  balance: number;
}

export interface DiceConfig {
  minNumber: number;
  maxNumber: number;
  minBet: number;
  maxBet: number;
  minChance: number;
  maxChance: number;
  houseEdge: number;
}

// Crash types
export interface CrashGame {
  gameId: string;
  status: 'waiting' | 'running' | 'crashed';
  currentMultiplier: number;
  serverSeedHash: string;
  bets: CrashBet[];
}

export interface CrashBet {
  username: string;
  betAmount: number;
  cashedOut: boolean;
  cashoutMultiplier: number | null;
  payout?: number;
}

export interface CrashConfig {
  minBet: number;
  maxBet: number;
  minMultiplier: number;
  maxMultiplier: number;
}

// Coinflip types
export interface CoinflipResult {
  choice: 'heads' | 'tails';
  result: 'heads' | 'tails';
  isWin: boolean;
  randomNumber: number;
  payout: number;
  profit: number;
  multiplier: number;
  balance: number;
}

export interface CoinflipConfig {
  minBet: number;
  maxBet: number;
  payoutMultiplier: number;
  sides: string[];
}

// Mines types
export interface MinesGameState {
  gameId: string;
  gridSize: number;
  mineCount: number;
  revealedTiles: number[];
  currentMultiplier: number;
  possiblePayout: number;
  betAmount: number;
  status: 'active' | 'won' | 'lost';
}

export interface MinesRevealResult {
  revealed: number;
  isMine: boolean;
  gameOver: boolean;
  payout?: number;
  profit?: number;
  multiplier?: number;
  balance?: number;
  minePositions?: number[];
  revealedTiles: number[];
  currentMultiplier: number;
  possiblePayout?: number;
}

export interface MinesConfig {
  minBet: number;
  maxBet: number;
  gridSize: number;
  minMines: number;
  maxMines: number;
}

// Daily Rewards types
export interface DailyReward {
  id: string;
  name: string;
  amount: number;
  weight: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface DailyRewardClaimResult {
  reward: DailyReward;
  reel: DailyReward[];
  winningPosition: number;
  balance: number;
  nextClaimTime: string;
}

export interface DailyRewardStatus {
  canClaim: boolean;
  timeUntilNext: number;
  lastClaim?: string;
}

export interface DailyRewardConfig {
  cooldownHours: number;
  rewards: DailyReward[];
}

// Trading types (Real Paper Trading)
export interface Asset {
  id: string;
  name: string;
  symbol: string;
  color: string;
}

export interface Timeframe {
  id: string;
  label: string;
  seconds: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Position {
  positionId: string;
  assetId: string;
  assetName: string;
  assetSymbol?: string;
  assetColor?: string;
  direction: 'long' | 'short';
  leverage: number;
  stake: number;
  entryPrice: number;
  currentPrice: number;
  liquidationPrice?: number;
  exitPrice?: number;
  pnl: number;
  pnlPercent: number;
  status?: 'open' | 'closed' | 'liquidated';
  openedAt: string;
  closedAt?: string;
  duration?: number;
}

export interface AssetMarketData {
  assetId: string;
  name: string;
  symbol: string;
  color: string;
  currentPrice: number;
  priceHistory: Candle[];
  lastUpdate: number;
  timeframe?: string;
  timeframeLabel?: string;
}

export interface TradingConfig {
  minBet: number;
  maxBet: number;
  leverageOptions: number[];
  timeframes: Timeframe[];
  defaultTimeframe: string;
  assets: Asset[];
}

// Ad System types
export interface AdConfig {
  REWARD_AMOUNT: number;
  MIN_BALANCE_REQUIRED: number;
}

export interface AdStatus {
  canWatchAd: boolean;
  currentBalance: number;
  rewardAmount: number;
  adsWatched: number;
  coinsEarnedFromAds: number;
  lastAdWatched: string | null;
}

// Card Collection types
export interface Card {
  cardId: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary';
  imageUrl: string;
  description: string;
  category: string;
  dropRate: number;
  value: number;
  owned?: boolean;
  quantity?: number;
  firstObtained?: string | null;
  isNew?: boolean;
  isDuplicate?: boolean;
}

export interface RarityConfig {
  name: string;
  dropRate: number;
  color: string;
  value: number;
}

export interface CollectionStats {
  uniqueCards: number;
  totalCards: number;
  totalAvailableCards: number;
  completionRate: number;
  totalPacksOpened: number;
  coinsSpent: number;
  rarityStats: {
    common: number;
    uncommon: number;
    rare: number;
    very_rare: number;
    legendary: number;
  };
}

export interface CardsByRarity {
  common: Card[];
  uncommon: Card[];
  rare: Card[];
  very_rare: Card[];
  legendary: Card[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
