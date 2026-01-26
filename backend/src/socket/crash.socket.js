const CrashService = require('../services/crash.service');
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

/**
 * Crash Game Socket Handler
 * Handles WebSocket events for the crash game
 */

const crashSocketHandler = (io, socket) => {
  console.log('Crash socket handler initialized for:', socket.id);

  /**
   * Join crash game room
   */
  socket.on('crash:join', async (data) => {
    try {
      socket.join('crash');
      
      // Send current game state
      const currentGame = await CrashService.getCurrentGame();
      
      if (currentGame) {
        socket.emit('crash:game_state', {
          gameId: currentGame.gameId,
          status: currentGame.status,
          currentMultiplier: currentGame.currentMultiplier,
          serverSeedHash: currentGame.serverSeedHash,
          bets: currentGame.bets.map(bet => ({
            username: bet.username,
            betAmount: bet.betAmount,
            cashedOut: bet.cashedOut,
            cashoutMultiplier: bet.cashoutMultiplier
          }))
        });
      }
    } catch (error) {
      console.error('Error joining crash game:', error);
      socket.emit('crash:error', { message: 'Failed to join game' });
    }
  });

  /**
   * Place bet via socket (alternative to HTTP)
   */
  socket.on('crash:place_bet', async (data) => {
    try {
      const { token, betAmount } = data;
      
      if (!token) {
        return socket.emit('crash:error', { message: 'Authentication required' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return socket.emit('crash:error', { message: 'User not found' });
      }

      // Place bet
      const result = await CrashService.placeBet(user, betAmount, io);
      
      socket.emit('crash:bet_success', result);
    } catch (error) {
      console.error('Error placing crash bet:', error);
      socket.emit('crash:error', { message: error.message });
    }
  });

  /**
   * Cash out via socket (alternative to HTTP)
   */
  socket.on('crash:cashout', async (data) => {
    try {
      const { token } = data;
      
      if (!token) {
        return socket.emit('crash:error', { message: 'Authentication required' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return socket.emit('crash:error', { message: 'User not found' });
      }

      // Cash out
      const result = await CrashService.cashOut(user, io);
      
      socket.emit('crash:cashout_success', result);
    } catch (error) {
      console.error('Error cashing out:', error);
      socket.emit('crash:error', { message: error.message });
    }
  });

  /**
   * Leave crash game room
   */
  socket.on('crash:leave', () => {
    socket.leave('crash');
  });

  /**
   * Handle disconnect
   */
  socket.on('disconnect', () => {
    console.log('Crash client disconnected:', socket.id);
  });
};

module.exports = crashSocketHandler;
