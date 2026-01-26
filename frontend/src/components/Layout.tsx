import React, { useState, useEffect } from 'react';
import Header from './Header';
import BannerAd from './BannerAd';
import RewardedAdModal from './RewardedAdModal';
import { useAuth } from '../context/AuthContext';
import { adAPI } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const [showAdModal, setShowAdModal] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(1000);

  // Check if user should see ad modal (balance = 0)
  useEffect(() => {
    const checkAdEligibility = async () => {
      if (!user) return;
      
      // Show modal if balance is 0
      if (user.balance === 0) {
        try {
          const response = await adAPI.getAdStatus();
          if (response.success && response.data.canWatchAd) {
            setRewardAmount(response.data.rewardAmount);
            setShowAdModal(true);
          }
        } catch (error) {
          console.error('Ad status check failed:', error);
        }
      } else {
        setShowAdModal(false);
      }
    };

    checkAdEligibility();
  }, [user?.balance, user]);

  const handleAdRewardClaimed = async () => {
    await refreshUser();
    setShowAdModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Top Banner Ad */}
      <div className="container mx-auto px-4 pt-4">
        <BannerAd position="top" height="90px" />
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      
      {/* Bottom Banner Ad */}
      <div className="container mx-auto px-4 pb-4">
        <BannerAd position="bottom" height="90px" />
      </div>
      
      <footer className="bg-dark-900 border-t border-dark-700 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-dark-400">
          <p className="mb-2">
            <span className="text-primary-500 font-semibold">Casino</span> - Virtual Currency Only
          </p>
          <p className="text-sm">
            This is a demo application for entertainment purposes only. No real money gambling.
          </p>
          <p className="text-xs mt-2 text-dark-500">
            💰 Watch ads to get free virtual coins when balance reaches 0!
          </p>
        </div>
      </footer>

      {/* Rewarded Ad Modal (shows when balance = 0) */}
      {user && (
        <RewardedAdModal
          isOpen={showAdModal}
          onClose={() => setShowAdModal(false)}
          onRewardClaimed={handleAdRewardClaimed}
          rewardAmount={rewardAmount}
        />
      )}
    </div>
  );
};

export default Layout;
