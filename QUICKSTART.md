# 🚀 Quick Start Guide

Get the casino app running in 5 minutes!

## Prerequisites

- Node.js v16+ installed
- MongoDB installed and running (or use MongoDB Atlas)

## Backend Setup (2 minutes)

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file** (use the default values or customize):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/casino
   JWT_SECRET=your_super_secret_jwt_key_change_this
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

5. **Start the backend:**
   ```bash
   npm run dev
   ```

   ✅ You should see:
   ```
   🎰 Casino server running on port 5000
   ✅ MongoDB Connected: localhost
   ```

## Frontend Setup (2 minutes)

1. **Open a new terminal** and navigate to frontend:
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **The default `.env` values should work:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

5. **Start the frontend:**
   ```bash
   npm run dev
   ```

   ✅ You should see:
   ```
   VITE v5.0.8  ready in XXX ms
   ➜  Local:   http://localhost:3000/
   ```

## Access the Application

1. **Open your browser** and go to:
   ```
   http://localhost:3000
   ```

2. **Register a new account:**
   - Click "Sign Up"
   - Enter username, email, and password
   - You'll start with 1000 virtual coins!

3. **Play games:**
   - Click on any game (Slots, Dice, or Crash)
   - Place bets and enjoy!

## Quick Test

### Test Slots
1. Navigate to Slots
2. Set bet amount (default 10)
3. Click "Spin"
4. Watch the reels spin and see if you win!

### Test Dice
1. Navigate to Dice
2. Choose "Roll Over" or "Roll Under"
3. Adjust target number
4. Click "Roll Dice"

### Test Crash
1. Navigate to Crash
2. Wait for "Waiting for players..." status
3. Place a bet
4. Watch multiplier increase
5. Click "Cash Out" before it crashes!

## Troubleshooting

### Backend won't start

**Check MongoDB:**
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

**Or use MongoDB Atlas** (free cloud database):
1. Sign up at mongodb.com/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env`

### Frontend can't connect to backend

1. Ensure backend is running on port 5000
2. Check `.env` files in both directories
3. Check browser console for errors

### Port already in use

**Change backend port:**
- Edit `backend/.env` and change `PORT=5000` to `PORT=5001`
- Update `frontend/.env` URLs to match

**Change frontend port:**
- Edit `frontend/vite.config.ts`:
  ```typescript
  server: {
    port: 3001, // Change from 3000
  }
  ```

## What's Next?

- ✅ View your profile and stats
- ✅ Check game history
- ✅ Try different bet amounts
- ✅ Learn about provably fair gaming
- ✅ Customize the application

## Detailed Setup

For more detailed instructions, see:
- **Backend:** `backend/SETUP.md`
- **Frontend:** `frontend/SETUP.md`
- **Main README:** `README.md`

## Need Help?

1. Check error messages in terminal
2. Review setup documentation
3. Verify MongoDB connection
4. Ensure all dependencies installed

---

**Enjoy playing! 🎰🎲💥**
