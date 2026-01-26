import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaDice, FaCoins, FaChartLine, FaGamepad, FaTh, FaGift, FaChartArea, FaBook } from 'react-icons/fa';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-dark-900 border-b border-dark-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FaDice className="text-primary-500 text-3xl" />
            <span className="text-2xl font-bold text-white">Casino</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/slots"
              className="flex items-center space-x-2 text-dark-300 hover:text-primary-400 transition-colors"
            >
              <FaGamepad className="text-xl" />
              <span>Slots</span>
            </Link>
            <Link
              to="/dice"
              className="flex items-center space-x-2 text-dark-300 hover:text-primary-400 transition-colors"
            >
              <FaDice className="text-xl" />
              <span>Dice</span>
            </Link>
            <Link
              to="/coinflip"
              className="flex items-center space-x-2 text-dark-300 hover:text-primary-400 transition-colors"
            >
              <FaCoins className="text-xl" />
              <span>Coinflip</span>
            </Link>
            <Link
              to="/mines"
              className="flex items-center space-x-2 text-dark-300 hover:text-primary-400 transition-colors"
            >
              <FaTh className="text-xl" />
              <span>Mines</span>
            </Link>
            <Link
              to="/trading"
              className="flex items-center space-x-2 text-dark-300 hover:text-primary-400 transition-colors"
            >
              <FaChartArea className="text-xl" />
              <span>Trading</span>
            </Link>
            <Link
              to="/crash"
              className="flex items-center space-x-2 text-dark-300 hover:text-primary-400 transition-colors"
            >
              <FaChartLine className="text-xl" />
              <span>Crash</span>
            </Link>
            <Link
              to="/cards"
              className="flex items-center space-x-2 text-dark-300 hover:text-primary-400 transition-colors"
            >
              <FaBook className="text-xl" />
              <span>Cards</span>
            </Link>
          </nav>

          {/* User section */}
          <div className="flex items-center space-x-4">
            {user && (
              <Link
                to="/daily-rewards"
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors"
              >
                <FaGift className="text-xl" />
                <span className="hidden lg:inline font-semibold">Daily Reward</span>
              </Link>
            )}
            
            {user ? (
              <>
                {/* Balance */}
                <div className="flex items-center space-x-2 bg-dark-800 px-4 py-2 rounded-lg">
                  <FaCoins className="text-yellow-500" />
                  <span className="font-semibold text-white">
                    {user.balance.toFixed(2)}
                  </span>
                </div>

                {/* Username */}
                <Link
                  to="/profile"
                  className="text-dark-300 hover:text-white transition-colors"
                >
                  {user.username}
                </Link>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="btn btn-secondary text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        <nav className="md:hidden flex items-center justify-around py-3 border-t border-dark-700">
          <Link
            to="/slots"
            className="flex flex-col items-center space-y-1 text-dark-300 hover:text-primary-400 transition-colors"
          >
            <FaGamepad className="text-2xl" />
            <span className="text-xs">Slots</span>
          </Link>
          <Link
            to="/dice"
            className="flex flex-col items-center space-y-1 text-dark-300 hover:text-primary-400 transition-colors"
          >
            <FaDice className="text-2xl" />
            <span className="text-xs">Dice</span>
          </Link>
          <Link
            to="/coinflip"
            className="flex flex-col items-center space-y-1 text-dark-300 hover:text-primary-400 transition-colors"
          >
            <FaCoins className="text-2xl" />
            <span className="text-xs">Coinflip</span>
          </Link>
          <Link
            to="/mines"
            className="flex flex-col items-center space-y-1 text-dark-300 hover:text-primary-400 transition-colors"
          >
            <FaTh className="text-2xl" />
            <span className="text-xs">Mines</span>
          </Link>
          <Link
            to="/trading"
            className="flex flex-col items-center space-y-1 text-dark-300 hover:text-primary-400 transition-colors"
          >
            <FaChartArea className="text-2xl" />
            <span className="text-xs">Trading</span>
          </Link>
          <Link
            to="/crash"
            className="flex flex-col items-center space-y-1 text-dark-300 hover:text-primary-400 transition-colors"
          >
            <FaChartLine className="text-2xl" />
            <span className="text-xs">Crash</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
