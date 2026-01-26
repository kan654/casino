import axios from 'axios';
import type { LoginCredentials, RegisterCredentials, AuthResponse, ApiResponse, User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateSeeds: async (clientSeed?: string, rotateServerSeed?: boolean): Promise<ApiResponse> => {
    const response = await api.post('/auth/update-seeds', {
      clientSeed,
      rotateServerSeed,
    });
    return response.data;
  },
};

// User API
export const userAPI = {
  getBalance: async (): Promise<ApiResponse> => {
    const response = await api.get('/user/balance');
    return response.data;
  },

  getHistory: async (limit = 20, page = 1, gameType?: string): Promise<ApiResponse> => {
    const params = new URLSearchParams({ limit: limit.toString(), page: page.toString() });
    if (gameType) params.append('gameType', gameType);
    const response = await api.get(`/user/history?${params}`);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse> => {
    const response = await api.get('/user/stats');
    return response.data;
  },

  getGameDetails: async (gameId: string): Promise<ApiResponse> => {
    const response = await api.get(`/user/game/${gameId}`);
    return response.data;
  },
};

// Game API
export const gameAPI = {
  // Slots
  spinSlots: async (betAmount: number, clientSeed?: string): Promise<ApiResponse> => {
    const response = await api.post('/games/slots/spin', { betAmount, clientSeed });
    return response.data;
  },

  getSlotsConfig: async (): Promise<ApiResponse> => {
    const response = await api.get('/games/slots/config');
    return response.data;
  },

  // Dice
  rollDice: async (
    betAmount: number,
    target: number,
    isOver: boolean,
    clientSeed?: string
  ): Promise<ApiResponse> => {
    const response = await api.post('/games/dice/roll', {
      betAmount,
      target,
      isOver,
      clientSeed,
    });
    return response.data;
  },

  getDiceConfig: async (): Promise<ApiResponse> => {
    const response = await api.get('/games/dice/config');
    return response.data;
  },

  // Coinflip
  flipCoin: async (
    betAmount: number,
    choice: 'heads' | 'tails',
    clientSeed?: string
  ): Promise<ApiResponse> => {
    const response = await api.post('/games/coinflip/flip', {
      betAmount,
      choice,
      clientSeed,
    });
    return response.data;
  },

  getCoinflipConfig: async (): Promise<ApiResponse> => {
    const response = await api.get('/games/coinflip/config');
    return response.data;
  },

  // Mines
  startMinesGame: async (
    betAmount: number,
    mineCount: number,
    clientSeed?: string
  ): Promise<ApiResponse> => {
    const response = await api.post('/games/mines/start', {
      betAmount,
      mineCount,
      clientSeed,
    });
    return response.data;
  },

  revealMinesTile: async (position: number): Promise<ApiResponse> => {
    const response = await api.post('/games/mines/reveal', { position });
    return response.data;
  },

  cashOutMines: async (): Promise<ApiResponse> => {
    const response = await api.post('/games/mines/cashout');
    return response.data;
  },

  getCurrentMinesGame: async (): Promise<ApiResponse> => {
    const response = await api.get('/games/mines/current');
    return response.data;
  },

  getMinesConfig: async (): Promise<ApiResponse> => {
    const response = await api.get('/games/mines/config');
    return response.data;
  },

  // Daily Rewards
  claimDailyReward: async (clientSeed?: string): Promise<ApiResponse> => {
    const response = await api.post('/games/daily-reward/claim', { clientSeed });
    return response.data;
  },

  getDailyRewardStatus: async (): Promise<ApiResponse> => {
    const response = await api.get('/games/daily-reward/status');
    return response.data;
  },

  getDailyRewardConfig: async (): Promise<ApiResponse> => {
    const response = await api.get('/games/daily-reward/config');
    return response.data;
  },

  // Trading (Real Paper Trading)
  openPosition: async (
    assetId: string,
    direction: 'long' | 'short',
    stake: number,
    leverage = 1,
    clientSeed?: string
  ): Promise<ApiResponse> => {
    const response = await api.post('/games/trading/open', {
      assetId,
      direction,
      stake,
      leverage,
      clientSeed,
    });
    return response.data;
  },

  closePosition: async (positionId: string): Promise<ApiResponse> => {
    const response = await api.post(`/games/trading/close/${positionId}`);
    return response.data;
  },

  getOpenPositions: async (): Promise<ApiResponse> => {
    const response = await api.get('/games/trading/positions');
    return response.data;
  },

  getClosedPositions: async (limit = 20): Promise<ApiResponse> => {
    const response = await api.get(`/games/trading/history?limit=${limit}`);
    return response.data;
  },

  getMarketData: async (timeframe = '1m'): Promise<ApiResponse> => {
    const response = await api.get(`/games/trading/market?timeframe=${timeframe}`);
    return response.data;
  },

  getTradingConfig: async (): Promise<ApiResponse> => {
    const response = await api.get('/games/trading/config');
    return response.data;
  },

  // Crash
  placeCrashBet: async (betAmount: number): Promise<ApiResponse> => {
    const response = await api.post('/games/crash/bet', { betAmount });
    return response.data;
  },

  crashCashOut: async (): Promise<ApiResponse> => {
    const response = await api.post('/games/crash/cashout');
    return response.data;
  },

  getCurrentCrashGame: async (): Promise<ApiResponse> => {
    const response = await api.get('/games/crash/current');
    return response.data;
  },

  getCrashConfig: async (): Promise<ApiResponse> => {
    const response = await api.get('/games/crash/config');
    return response.data;
  },

  // Global history
  getGlobalHistory: async (limit = 50, gameType?: string): Promise<ApiResponse> => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (gameType) params.append('gameType', gameType);
    const response = await api.get(`/games/history?${params}`);
    return response.data;
  },
};

// Ad API
export const adAPI = {
  watchRewardedAd: async (): Promise<ApiResponse> => {
    const response = await api.post('/ads/watch');
    return response.data;
  },
  
  getAdStatus: async (): Promise<ApiResponse> => {
    const response = await api.get('/ads/status');
    return response.data;
  },
  
  getAdConfig: async (): Promise<ApiResponse> => {
    const response = await api.get('/ads/config');
    return response.data;
  },
};

// Card API
export const cardAPI = {
  openPack: async (packSize: number): Promise<ApiResponse> => {
    const response = await api.post('/cards/open', { packSize });
    return response.data;
  },
  
  sellCard: async (cardId: string): Promise<ApiResponse> => {
    const response = await api.post('/cards/sell', { cardId });
    return response.data;
  },
  
  getCollection: async (): Promise<ApiResponse> => {
    const response = await api.get('/cards/collection');
    return response.data;
  },
  
  getStats: async (): Promise<ApiResponse> => {
    const response = await api.get('/cards/stats');
    return response.data;
  },
  
  getAllCards: async (): Promise<ApiResponse> => {
    const response = await api.get('/cards/all');
    return response.data;
  },
  
  getConfig: async (): Promise<ApiResponse> => {
    const response = await api.get('/cards/config');
    return response.data;
  },
};

export default api;
