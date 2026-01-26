# Frontend Setup Instructions

This document provides detailed instructions for setting up and running the casino frontend application.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager

## Installation Steps

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- react - UI library
- react-dom - React DOM renderer
- react-router-dom - Client-side routing
- typescript - Type safety
- vite - Build tool and dev server
- tailwindcss - CSS framework
- axios - HTTP client
- socket.io-client - WebSocket client
- react-hot-toast - Toast notifications
- react-icons - Icon library

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit the `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

**For Production:**
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
```

### 4. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`

Open your browser and navigate to:
```
http://localhost:3000
```

## Build for Production

### 1. Create Production Build

```bash
npm run build
```

This creates an optimized build in the `dist` directory.

### 2. Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## Application Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/          # Page components
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Slots.tsx
│   │   ├── Dice.tsx
│   │   ├── Crash.tsx
│   │   └── Profile.tsx
│   ├── context/        # React context
│   │   └── AuthContext.tsx
│   ├── services/       # API and WebSocket services
│   │   ├── api.ts
│   │   └── socket.ts
│   ├── types/          # TypeScript types
│   │   └── index.ts
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Features Overview

### Authentication
- User registration with validation
- Secure login with JWT
- Protected routes
- Automatic token refresh

### Games

#### 1. Slots
- 5-reel slot machine
- Multiple paylines
- Symbol matching
- Win animations
- Configurable bet amounts

#### 2. Dice
- Roll over/under mechanics
- Adjustable target number
- Dynamic multiplier calculation
- Win chance display
- Instant results

#### 3. Crash
- Real-time multiplayer game
- Live multiplier updates via WebSocket
- Cash out before crash
- Player list
- Live game feed

### User Profile
- Balance display
- Game statistics
- Game history
- Win/loss tracking
- Biggest win showcase

## Styling

The application uses **Tailwind CSS** with a custom dark theme:

### Custom Classes

```css
.btn - Base button style
.btn-primary - Primary button (blue)
.btn-secondary - Secondary button (gray)
.btn-success - Success button (green)
.btn-danger - Danger button (red)
.card - Card container style
.input - Input field style
.game-container - Game container style
```

### Color Palette

- **Primary**: Blue shades (primary-500, primary-600, etc.)
- **Dark**: Dark theme colors (dark-700, dark-800, dark-900)
- **Success**: Green for wins
- **Danger**: Red for losses

### Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-friendly interface
- Optimized for all screen sizes

## Environment Configuration

### Development
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Production
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://api.yourdomain.com
```

## Troubleshooting

### API Connection Issues

**Error:** Network error or CORS issues

**Solution:**
1. Ensure backend is running on correct port
2. Check `VITE_API_URL` in `.env`
3. Verify CORS is enabled on backend
4. Check browser console for detailed errors

### WebSocket Connection Failed

**Error:** WebSocket connection failed

**Solution:**
1. Ensure backend WebSocket server is running
2. Check `VITE_SOCKET_URL` in `.env`
3. Verify firewall/proxy settings
4. Check browser console for errors

### Build Errors

**Error:** TypeScript or build errors

**Solution:**
1. Delete `node_modules` and reinstall: `npm install`
2. Clear cache: `npm run dev -- --force`
3. Check TypeScript errors: `npx tsc --noEmit`

### Styling Issues

**Error:** Tailwind styles not loading

**Solution:**
1. Ensure `tailwind.config.js` is configured
2. Check `index.css` imports Tailwind
3. Restart dev server
4. Clear browser cache

## Production Deployment

### Option 1: Static Hosting (Netlify, Vercel, etc.)

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder

3. Configure environment variables on hosting platform

4. Set up redirects for SPA routing:

**Netlify** (_redirects file):
```
/*    /index.html   200
```

**Vercel** (vercel.json):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Option 2: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t casino-frontend .
docker run -p 80:80 casino-frontend
```

### Option 3: AWS S3 + CloudFront

1. Build the project
2. Upload `dist` folder to S3 bucket
3. Enable static website hosting
4. Configure CloudFront distribution
5. Set up custom domain

## Performance Optimization

### Already Implemented
- Code splitting with React Router
- Lazy loading components
- Optimized images and assets
- Minified production build
- Tree shaking

### Additional Optimizations
- Enable gzip/brotli compression
- Use CDN for static assets
- Implement service worker (PWA)
- Add image optimization
- Enable HTTP/2

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

**Note:** Internet Explorer is not supported.

## Development Tips

### Hot Module Replacement (HMR)

Vite provides instant HMR - changes appear immediately without full page reload.

### TypeScript Type Checking

Run type checking without building:
```bash
npx tsc --noEmit
```

### Code Formatting

Use Prettier for consistent formatting:
```bash
npm install -D prettier
npx prettier --write "src/**/*.{ts,tsx}"
```

### Linting

Use ESLint for code quality:
```bash
npm install -D eslint
npx eslint src/**/*.{ts,tsx}
```

## Testing the Application

### 1. Register a New Account
- Navigate to `/register`
- Fill in username, email, password
- Starting balance: 1000 coins

### 2. Play Games
- **Slots**: Click "Slots" in navigation
- **Dice**: Click "Dice" in navigation  
- **Crash**: Click "Crash" in navigation

### 3. View Profile
- Click your username in header
- View statistics and game history

## Common Issues

### Port Already in Use

Change port in `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 3001, // Change to different port
  }
})
```

### Module Not Found

```bash
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading

- Restart dev server after changing `.env`
- Ensure variables start with `VITE_`
- Access with `import.meta.env.VITE_*`

## Support

For issues or questions:
1. Check browser console for errors
2. Verify backend is running
3. Check environment variables
4. Ensure all dependencies are installed

## License

MIT License - Free to use for educational purposes.
