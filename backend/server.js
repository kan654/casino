const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const gameRoutes = require('./src/routes/game.routes');
const userRoutes = require('./src/routes/user.routes');
const adRoutes = require('./src/routes/ad.routes');
const cardRoutes = require('./src/routes/card.routes');

// Import socket handlers
const crashSocketHandler = require('./src/socket/crash.socket');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: true, // Allow all origins in development
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Casino API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/cards', cardRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Handle crash game socket events
  crashSocketHandler(io, socket);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces
server.listen(PORT, HOST, async () => {
  console.log(`🎰 Casino server running on port ${PORT}`);
  console.log(`📡 Host: ${HOST}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize cards in database
  const CardService = require('./src/services/card.service');
  try {
    await CardService.initializeCards();
  } catch (error) {
    console.error('Failed to initialize cards:', error);
  }
});

module.exports = { app, io };
