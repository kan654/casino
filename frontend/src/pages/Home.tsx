import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaDice, FaArrowRight, FaChartLine, FaGamepad, FaCoins, FaTh, FaChartArea, FaBook } from 'react-icons/fa';

const Home: React.FC = () => {
  const { user } = useAuth();

  const games = [
    {
      id: 'slots',
      name: 'Slots',
      icon: FaGamepad,
      description: '5-reel slot machine with multiple paylines and big wins',
      color: 'from-purple-600 to-pink-600',
      link: '/slots',
    },
    {
      id: 'dice',
      name: 'Dice',
      icon: FaDice,
      description: 'Roll over or under with adjustable multipliers',
      color: 'from-blue-600 to-cyan-600',
      link: '/dice',
    },
    {
      id: 'coinflip',
      name: 'Coinflip',
      icon: FaCoins,
      description: 'Simple heads or tails game with 50/50 odds and 1.98x payout',
      color: 'from-yellow-600 to-amber-600',
      link: '/coinflip',
    },
    {
      id: 'mines',
      name: 'Mines',
      icon: FaTh,
      description: 'Reveal safe tiles and cash out before hitting a mine',
      color: 'from-green-600 to-emerald-600',
      link: '/mines',
    },
    {
      id: 'trading',
      name: 'Trading',
      icon: FaChartArea,
      description: 'Predict price movement and win up to 3x your bet',
      color: 'from-indigo-600 to-purple-600',
      link: '/trading',
    },
    {
      id: 'crash',
      name: 'Crash',
      icon: FaChartLine,
      description: 'Real-time multiplayer game - cash out before the crash!',
      color: 'from-red-600 to-orange-600',
      link: '/crash',
    },
    {
      id: 'cards',
      name: 'Card Collection',
      icon: FaBook,
      description: 'Collect 68 unique cards with different rarities!',
      color: 'from-pink-600 to-rose-600',
      link: '/cards',
    },
  ];

  return (
    <div className="relative -mx-4 -my-8 min-h-screen">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none"
        style={{ backgroundImage: "url('/images/casino-bg.png')" }}
      />
      
      {/* Content Overlay */}
      <div className="relative z-10 px-4 py-8 animate-fadeIn">
        {/* Hero Section */}
        <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Welcome to <span className="text-primary-500">Casino</span>
        </h1>
        <p className="text-xl text-dark-300 mb-8">
          Play provably fair casino games with virtual currency
        </p>
        {!user && (
          <div className="flex items-center justify-center space-x-4">
            <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary text-lg px-8 py-3">
              Login
            </Link>
          </div>
        )}
      </div>

      {/* User Stats */}
      {user && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="card text-center backdrop-blur-sm bg-dark-800/95">
            <h3 className="text-dark-400 text-sm mb-2">Balance</h3>
            <p className="text-3xl font-bold text-primary-500">
              {user.balance.toFixed(2)}
            </p>
          </div>
          <div className="card text-center backdrop-blur-sm bg-dark-800/95">
            <h3 className="text-dark-400 text-sm mb-2">Games Played</h3>
            <p className="text-3xl font-bold text-white">{user.gamesPlayed}</p>
          </div>
          <div className="card text-center backdrop-blur-sm bg-dark-800/95">
            <h3 className="text-dark-400 text-sm mb-2">Total Wagered</h3>
            <p className="text-3xl font-bold text-white">
              {user.totalWagered.toFixed(2)}
            </p>
          </div>
          <div className="card text-center backdrop-blur-sm bg-dark-800/95">
            <h3 className="text-dark-400 text-sm mb-2">Total Won</h3>
            <p className="text-3xl font-bold text-green-500">
              {user.totalWon.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Games Section */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Choose Your Game
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
            <Link
              key={game.id}
              to={game.link}
              className="card hover:scale-105 transition-transform duration-300 group backdrop-blur-sm bg-dark-800/95 shadow-xl"
            >
              <div
                className={`bg-gradient-to-br ${game.color} rounded-lg p-8 mb-4 flex items-center justify-center`}
              >
                <game.icon className="text-white text-6xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                {game.name}
              </h3>
              <p className="text-dark-300 mb-4">{game.description}</p>
              <div className="flex items-center text-primary-500 group-hover:text-primary-400 transition-colors">
                <span className="font-semibold">Play Now</span>
                <FaArrowRight className="ml-2" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card text-center backdrop-blur-sm bg-dark-800/95 shadow-xl">
          <div className="text-4xl mb-4">🎲</div>
          <h3 className="text-xl font-bold text-white mb-2">Provably Fair</h3>
          <p className="text-dark-300">
            All games use cryptographic algorithms to ensure fairness
          </p>
        </div>
        <div className="card text-center backdrop-blur-sm bg-dark-800/95 shadow-xl">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-bold text-white mb-2">Instant Play</h3>
          <p className="text-dark-300">
            No downloads required - play directly in your browser
          </p>
        </div>
        <div className="card text-center backdrop-blur-sm bg-dark-800/95 shadow-xl">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-white mb-2">Safe & Secure</h3>
          <p className="text-dark-300">
            Virtual currency only - no real money gambling
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Home;
