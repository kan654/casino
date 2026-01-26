# 🎰 Casino Web Application

A modern, full-stack online casino application with provably fair games (Slots, Dice, Crash). Built with React, TypeScript, Node.js, Express, and MongoDB.

> **⚠️ IMPORTANT:** This application uses **virtual currency only**. No real money gambling. For educational and entertainment purposes only.

## ✨ Features

- **🎰 Slots** - 5-reel slot machine with multiple paylines
- **🎲 Dice** - Roll over/under with adjustable multipliers
- **💥 Crash** - Real-time multiplayer crash game with WebSocket
- **🔐 Authentication** - JWT-based secure authentication
- **📊 User Dashboard** - Balance, stats, and game history
- **🎯 Provably Fair** - Cryptographically verifiable game results
- **🎨 Modern UI** - Dark theme, responsive design, smooth animations
- **⚡ Real-time** - Live game updates via WebSocket

## 🚀 Quick Start

Get up and running in 5 minutes! See [QUICKSTART.md](QUICKSTART.md) for detailed instructions.

### Prerequisites

- Node.js v16+ 
- MongoDB (local or Atlas)

### Installation

1. **Clone and setup backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

2. **Clone and setup frontend (in new terminal):**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

3. **Open browser:**
```
http://localhost:3000
```

4. **Register and play!** You start with 1000 virtual coins.

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[API.md](API.md)** - Complete API documentation
- **[backend/SETUP.md](backend/SETUP.md)** - Detailed backend setup
- **[frontend/SETUP.md](frontend/SETUP.md)** - Detailed frontend setup
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.io (WebSocket)
- bcryptjs, express-rate-limit

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- React Router v6
- Axios + Socket.io-client
- Vite (build tool)

## 🎮 Games

### Slots
5-reel slot machine with 8 symbols and 5 paylines. Match 3+ symbols to win!

**Features:**
- Configurable bet amounts (1-100 coins)
- Multiple winning combinations
- Animated reel spinning
- Win celebration effects

### Dice
Roll a number from 0-100. Choose roll over or under your target.

**Features:**
- Adjustable target (1-95)
- Dynamic multiplier calculation
- Win chance display
- House edge: 1%

### Crash
Real-time multiplayer game. Cash out before the crash to win!

**Features:**
- Live multiplier growth
- Real-time player updates
- WebSocket communication
- Exponential multiplier curve
- Fair crash point generation

## 🔒 Security

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ Input validation
- ✅ CORS protection
- ✅ Environment variables
- ✅ Protected API routes

## 🎯 Provably Fair System

All games use a provably fair system with:
- **Client Seed** - Player-provided randomness
- **Server Seed** - Server-provided randomness (hashed)
- **Nonce** - Incremental counter
- **HMAC-SHA256** - Cryptographic hash function

Results can be independently verified using the seeds and nonce.

## 📁 Project Structure

```
casino-app/
├── backend/           # Express.js server
│   ├── src/
│   │   ├── config/    # Configuration
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/    # MongoDB schemas
│   │   ├── routes/    # API routes
│   │   ├── services/  # Game logic
│   │   ├── socket/    # WebSocket handlers
│   │   └── utils/     # Helpers
│   └── server.js
├── frontend/          # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/     # Game pages
│   │   ├── context/   # Auth context
│   │   ├── services/  # API & Socket
│   │   └── types/     # TypeScript types
│   └── vite.config.ts
└── README.md (this file)
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Games
- `POST /api/games/slots/spin` - Play slots
- `POST /api/games/dice/roll` - Play dice
- `POST /api/games/crash/bet` - Place crash bet
- `POST /api/games/crash/cashout` - Cash out

### User
- `GET /api/user/balance` - Get balance
- `GET /api/user/history` - Get game history
- `GET /api/user/stats` - Get statistics

See [API.md](API.md) for complete documentation.

## 🌐 WebSocket Events

Crash game uses WebSocket for real-time updates:

- `crash:join` - Join game room
- `crash:game_state` - Current game state
- `crash:multiplier_update` - Multiplier updates (100ms)
- `crash:game_crashed` - Game crashed
- `crash:player_cashed_out` - Player cashed out

## 🎨 UI/UX

- **Dark Theme** - Casino-style dark interface
- **Responsive** - Mobile, tablet, and desktop
- **Animations** - Smooth transitions and effects
- **Toast Notifications** - User feedback
- **Real-time Updates** - Live balance and game state

## 📊 Database Schema

### User
- Authentication (email, password hash)
- Balance and statistics
- Provably fair seeds
- Game history reference

### GameHistory
- Game type and results
- Bet and payout amounts
- Provably fair data
- Timestamps

### CrashGame
- Game state and status
- Player bets
- Crash point
- Real-time data

## 🧪 Testing

1. **Register Account:**
   - Username: test123
   - Email: test@example.com
   - Password: password123

2. **Test Each Game:**
   - Slots: Place bet and spin
   - Dice: Adjust target and roll
   - Crash: Join game, bet, and cashout

3. **Check Profile:**
   - View balance updates
   - Check game history
   - Verify statistics

## 🚀 Deployment

### Backend (Node.js)
- Use PM2 for process management
- MongoDB Atlas for cloud database
- Enable HTTPS/SSL
- Set environment variables
- Configure CORS for production URL

### Frontend (React)
- Build: `npm run build`
- Deploy to: Netlify, Vercel, AWS S3, etc.
- Update API URLs for production
- Configure SPA redirects

## 🔧 Configuration

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/casino
JWT_SECRET=your_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 📈 Performance

- **Fast Load Times** - Vite build optimization
- **Efficient WebSocket** - Socket.io compression
- **Database Indexing** - Optimized MongoDB queries
- **Rate Limiting** - Prevents abuse
- **Code Splitting** - React Router lazy loading

## ⚠️ Disclaimer

This application is for **educational and entertainment purposes only**. It uses **virtual currency** with no real monetary value. No real money gambling is involved.

## 📄 License

MIT License - Free to use for educational purposes.

## 🤝 Contributing

Feel free to fork, customize, and improve this project!

## 📞 Support

For issues:
1. Check documentation files
2. Review error logs in terminal
3. Verify MongoDB connection
4. Ensure environment variables are set
5. Check that all dependencies are installed

## 🎯 Features Checklist

- ✅ User registration and authentication
- ✅ JWT-based security
- ✅ Three casino games (Slots, Dice, Crash)
- ✅ Provably fair system
- ✅ Real-time multiplayer (Crash)
- ✅ WebSocket integration
- ✅ User dashboard and profile
- ✅ Game history tracking
- ✅ Balance management
- ✅ Rate limiting
- ✅ Input validation
- ✅ Responsive design
- ✅ Dark theme UI
- ✅ Smooth animations
- ✅ Complete documentation

## 🎉 Enjoy!

Register an account, claim your 1000 virtual coins, and start playing! Good luck! 🍀

---

**Built with ❤️ using modern web technologies**

**Version:** 1.0.0  
**Status:** Production Ready ✅
