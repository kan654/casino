# Backend Setup Instructions

This document provides detailed instructions for setting up and running the casino backend server.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager

## Installation Steps

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- dotenv - Environment variables
- cors - Cross-origin resource sharing
- socket.io - WebSocket support
- express-rate-limit - Rate limiting
- express-validator - Input validation

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/casino
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Important:**
- Change `JWT_SECRET` to a strong, random string in production
- Update `MONGODB_URI` if using MongoDB Atlas or different connection
- Set `NODE_ENV=production` when deploying to production

### 4. Set Up MongoDB

#### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:

Windows:
```bash
net start MongoDB
```

macOS/Linux:
```bash
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/casino?retryWrites=true&w=majority
```

### 5. Start the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (or your specified PORT).

## Verifying Installation

### Check Server Health

Visit: `http://localhost:5000/health`

You should see:
```json
{
  "status": "ok",
  "message": "Casino API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Check MongoDB Connection

Look for this message in the console:
```
✅ MongoDB Connected: localhost
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/update-seeds` - Update provably fair seeds (requires auth)

### Games
- `POST /api/games/slots/spin` - Play slots (requires auth)
- `GET /api/games/slots/config` - Get slots configuration
- `POST /api/games/dice/roll` - Play dice (requires auth)
- `GET /api/games/dice/config` - Get dice configuration
- `POST /api/games/crash/bet` - Place crash bet (requires auth)
- `POST /api/games/crash/cashout` - Cash out from crash (requires auth)
- `GET /api/games/crash/current` - Get current crash game
- `GET /api/games/crash/config` - Get crash configuration
- `GET /api/games/history` - Get global game history

### User
- `GET /api/user/balance` - Get user balance (requires auth)
- `GET /api/user/history` - Get user game history (requires auth)
- `GET /api/user/stats` - Get user statistics (requires auth)
- `GET /api/user/game/:id` - Get specific game details (requires auth)

## WebSocket Events

The crash game uses WebSocket for real-time communication:

### Client Events
- `crash:join` - Join the crash game room
- `crash:leave` - Leave the crash game room
- `crash:place_bet` - Place a bet (alternative to HTTP)
- `crash:cashout` - Cash out (alternative to HTTP)

### Server Events
- `crash:game_state` - Initial game state when joining
- `crash:new_game` - New game created
- `crash:game_started` - Game started
- `crash:multiplier_update` - Multiplier update (every 100ms)
- `crash:game_crashed` - Game crashed
- `crash:bet_placed` - Player placed a bet
- `crash:player_cashed_out` - Player cashed out
- `crash:error` - Error occurred

## Troubleshooting

### MongoDB Connection Failed

**Error:** `MongoDB Connection Error`

**Solution:**
1. Ensure MongoDB is running
2. Check `MONGODB_URI` in `.env`
3. Verify network connectivity (for Atlas)
4. Check firewall settings

### Port Already in Use

**Error:** `EADDRINUSE`

**Solution:**
1. Change PORT in `.env`
2. Or stop the process using port 5000:

Windows:
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

macOS/Linux:
```bash
lsof -ti:5000 | xargs kill -9
```

### JWT Token Errors

**Error:** `Not authorized, token failed`

**Solution:**
1. Ensure `JWT_SECRET` is set in `.env`
2. Check token is being sent in Authorization header
3. Token format: `Bearer <token>`

### CORS Errors

**Solution:**
Update `CLIENT_URL` in `.env` to match your frontend URL.

## Production Deployment

### 1. Environment Setup

```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
MONGODB_URI=<production-mongodb-url>
CLIENT_URL=<production-frontend-url>
```

### 2. Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use HTTPS (SSL/TLS)
- [ ] Set up MongoDB authentication
- [ ] Configure firewall rules
- [ ] Enable rate limiting (already configured)
- [ ] Use environment variables for all secrets
- [ ] Set up proper CORS origins

### 3. Process Manager (PM2)

Install PM2:
```bash
npm install -g pm2
```

Start server with PM2:
```bash
pm2 start server.js --name casino-backend
pm2 save
pm2 startup
```

### 4. Monitoring

View logs:
```bash
pm2 logs casino-backend
```

Monitor performance:
```bash
pm2 monit
```

## Development Tips

### Hot Reload

The development server uses `nodemon` for automatic restarts when files change.

### Testing API Endpoints

Use tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

### Database Management

View/edit data using:
- MongoDB Compass (GUI)
- mongo shell
- MongoDB Atlas UI

## Support

For issues or questions:
1. Check error logs in console
2. Verify environment variables
3. Ensure all dependencies are installed
4. Check MongoDB connection

## License

MIT License - Free to use for educational purposes.
