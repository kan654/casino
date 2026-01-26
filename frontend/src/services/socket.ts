import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  // Crash game events
  joinCrash() {
    this.socket?.emit('crash:join');
  }

  leaveCrash() {
    this.socket?.emit('crash:leave');
  }

  onCrashGameState(callback: (data: any) => void) {
    this.socket?.on('crash:game_state', callback);
  }

  onCrashNewGame(callback: (data: any) => void) {
    this.socket?.on('crash:new_game', callback);
  }

  onCrashGameStarted(callback: (data: any) => void) {
    this.socket?.on('crash:game_started', callback);
  }

  onCrashMultiplierUpdate(callback: (data: any) => void) {
    this.socket?.on('crash:multiplier_update', callback);
  }

  onCrashGameCrashed(callback: (data: any) => void) {
    this.socket?.on('crash:game_crashed', callback);
  }

  onCrashBetPlaced(callback: (data: any) => void) {
    this.socket?.on('crash:bet_placed', callback);
  }

  onCrashPlayerCashedOut(callback: (data: any) => void) {
    this.socket?.on('crash:player_cashed_out', callback);
  }

  onCrashError(callback: (data: any) => void) {
    this.socket?.on('crash:error', callback);
  }

  offCrashGameState() {
    this.socket?.off('crash:game_state');
  }

  offCrashNewGame() {
    this.socket?.off('crash:new_game');
  }

  offCrashGameStarted() {
    this.socket?.off('crash:game_started');
  }

  offCrashMultiplierUpdate() {
    this.socket?.off('crash:multiplier_update');
  }

  offCrashGameCrashed() {
    this.socket?.off('crash:game_crashed');
  }

  offCrashBetPlaced() {
    this.socket?.off('crash:bet_placed');
  }

  offCrashPlayerCashedOut() {
    this.socket?.off('crash:player_cashed_out');
  }

  offCrashError() {
    this.socket?.off('crash:error');
  }
}

const socketService = new SocketService();
export default socketService;
