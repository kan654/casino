# 📋 Common Commands Reference

Quick reference for all common commands you'll need.

## Backend Commands

### Installation & Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit environment variables (use your editor)
notepad .env   # Windows
nano .env      # Mac/Linux
```

### Running the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### MongoDB Commands

#### Windows
```bash
# Start MongoDB
net start MongoDB

# Stop MongoDB
net stop MongoDB

# Check if MongoDB is running
sc query MongoDB
```

#### Mac/Linux
```bash
# Start MongoDB
sudo systemctl start mongod

# Stop MongoDB
sudo systemctl stop mongod

# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

#### MongoDB Shell
```bash
# Connect to MongoDB
mongosh

# Show databases
show dbs

# Use casino database
use casino

# Show collections
show collections

# View users
db.users.find()

# View game history
db.gamehistories.find()

# Clear game history
db.gamehistories.deleteMany({})

# Drop entire database (careful!)
db.dropDatabase()
```

### Debugging
```bash
# View logs (if using PM2)
pm2 logs casino-backend

# Check if port 5000 is in use (Windows)
netstat -ano | findstr :5000

# Check if port 5000 is in use (Mac/Linux)
lsof -i :5000

# Kill process on port 5000 (Windows)
taskkill /PID <PID> /F

# Kill process on port 5000 (Mac/Linux)
kill -9 <PID>
```

---

## Frontend Commands

### Installation & Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Running the App
```bash
# Development mode (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Tools
```bash
# Type checking (TypeScript)
npx tsc --noEmit

# Format code (if Prettier is installed)
npx prettier --write "src/**/*.{ts,tsx}"

# Lint code (if ESLint is installed)
npx eslint "src/**/*.{ts,tsx}"
```

### Build & Deployment
```bash
# Create production build
npm run build

# The build output will be in: dist/

# Test production build locally
npm run preview

# Deploy to Netlify
netlify deploy --prod --dir=dist

# Deploy to Vercel
vercel --prod
```

---

## Full Stack Commands

### First Time Setup
```bash
# From project root

# Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
cd ..

# Setup frontend
cd frontend
npm install
cp .env.example .env
# Edit .env if needed
cd ..
```

### Running Both Servers

#### Option 1: Two Terminals
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### Option 2: Using PM2 (Recommended for development)
```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name casino-backend

# Start frontend (requires PM2 serve)
cd frontend
npm run build
pm2 serve dist 3000 --name casino-frontend --spa

# View all processes
pm2 list

# View logs
pm2 logs

# Stop all
pm2 stop all

# Delete all
pm2 delete all
```

#### Option 3: Using Concurrently (from package.json)
```bash
# Add to root package.json:
{
  "scripts": {
    "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm run dev\""
  }
}

# Install concurrently
npm install -D concurrently

# Run both
npm run dev
```

---

## Database Management

### Backup Database
```bash
# Export entire database
mongodump --db casino --out ./backup

# Export specific collection
mongoexport --db casino --collection users --out users.json
```

### Restore Database
```bash
# Restore entire database
mongorestore --db casino ./backup/casino

# Import collection
mongoimport --db casino --collection users --file users.json
```

### Reset Database
```bash
# Connect to MongoDB shell
mongosh

# Use casino database
use casino

# Drop all collections
db.users.drop()
db.gamehistories.drop()
db.crashgames.drop()
```

---

## Git Commands

### Initial Setup
```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: Complete casino application"

# Add remote
git remote add origin https://github.com/yourusername/casino-app.git

# Push to GitHub
git push -u origin main
```

### Regular Updates
```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to remote
git push
```

---

## Docker Commands (Optional)

### Build & Run with Docker

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

#### Build and Run
```bash
# Build backend image
cd backend
docker build -t casino-backend .

# Run backend container
docker run -d -p 5000:5000 --name casino-backend \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/casino \
  -e JWT_SECRET=your_secret \
  casino-backend

# View logs
docker logs casino-backend

# Stop container
docker stop casino-backend

# Remove container
docker rm casino-backend
```

---

## Testing Commands

### Test API Endpoints with curl

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Get User Info (with token)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Play Slots
```bash
curl -X POST http://localhost:5000/api/games/slots/spin \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"betAmount":10}'
```

---

## Production Deployment Commands

### Backend (PM2)
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name casino-backend

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Monitor
pm2 monit

# View logs
pm2 logs casino-backend

# Restart
pm2 restart casino-backend

# Stop
pm2 stop casino-backend

# Delete
pm2 delete casino-backend
```

### Frontend (Static Hosting)
```bash
# Build
npm run build

# Deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# Deploy to Vercel
npm install -g vercel
vercel --prod

# Deploy to AWS S3
aws s3 sync dist/ s3://your-bucket-name --delete
```

---

## Troubleshooting Commands

### Clear Node Modules
```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json  # Mac/Linux
rmdir /s node_modules && del package-lock.json  # Windows

# Reinstall
npm install
```

### Clear Cache
```bash
# Clear npm cache
npm cache clean --force

# Clear Vite cache (frontend)
rm -rf node_modules/.vite  # Mac/Linux
rmdir /s node_modules\.vite  # Windows
```

### View Environment Variables
```bash
# Backend
cat backend/.env  # Mac/Linux
type backend\.env  # Windows

# Frontend
cat frontend/.env  # Mac/Linux
type frontend\.env  # Windows
```

### Check Port Usage
```bash
# Check what's using port 5000 (Windows)
netstat -ano | findstr :5000

# Check what's using port 5000 (Mac/Linux)
lsof -i :5000

# Check what's using port 3000 (Windows)
netstat -ano | findstr :3000

# Check what's using port 3000 (Mac/Linux)
lsof -i :3000
```

---

## Useful NPM Commands

```bash
# Check outdated packages
npm outdated

# Update packages
npm update

# Install specific version
npm install package@version

# Uninstall package
npm uninstall package

# List installed packages
npm list --depth=0

# Check npm version
npm --version

# Check Node version
node --version
```

---

## Development Tips

### Watch Mode
```bash
# Backend automatically restarts with nodemon
npm run dev

# Frontend automatically rebuilds with Vite HMR
npm run dev
```

### Environment-Specific Commands
```bash
# Set NODE_ENV temporarily (Mac/Linux)
NODE_ENV=production npm start

# Set NODE_ENV temporarily (Windows)
set NODE_ENV=production && npm start
```

### Quick Server Restart
```bash
# Kill and restart (Mac/Linux)
pkill -f "node server.js" && npm run dev

# Kill and restart (Windows)
taskkill /f /im node.exe && npm run dev
```

---

## Quick Reference Card

| Action | Backend | Frontend |
|--------|---------|----------|
| Install | `npm install` | `npm install` |
| Dev | `npm run dev` | `npm run dev` |
| Start | `npm start` | `npm run dev` |
| Build | N/A | `npm run build` |
| Test | N/A | `npm run preview` |
| Port | 5000 | 3000 |

---

**💡 Tip:** Bookmark this file for quick access to commands!
