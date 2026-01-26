import React from 'react';
import { FaBullhorn } from 'react-icons/fa';

/**
 * Banner Ad Component
 * Displays persistent ad banner (Google AdSense placeholder)
 * 
 * PRODUCTION SETUP:
 * 1. Sign up for Google AdSense: https://www.google.com/adsense/
 * 2. Get your ad code
 * 3. Replace this placeholder with actual AdSense code
 * 
 * Example AdSense integration:
 * <ins className="adsbygoogle"
 *      style={{display:'block'}}
 *      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
 *      data-ad-slot="1234567890"
 *      data-ad-format="auto"
 *      data-full-width-responsive="true"></ins>
 * 
 * Alternative networks:
 * - PropellerAds: https://propellerads.com
 * - Media.net: https://www.media.net
 * - Ezoic: https://www.ezoic.com
 */

interface BannerAdProps {
  position?: 'top' | 'bottom' | 'sidebar';
  height?: string;
}

const BannerAd: React.FC<BannerAdProps> = ({ 
  position = 'bottom',
  height = '90px' 
}) => {
  // In production, load AdSense script
  // useEffect(() => {
  //   try {
  //     (window.adsbygoogle = window.adsbygoogle || []).push({});
  //   } catch (e) {
  //     console.error('AdSense error:', e);
  //   }
  // }, []);

  // Demo placeholder (replace with actual ad code)
  return (
    <div 
      className="bg-gradient-to-r from-primary-900 to-purple-900 border border-primary-600 rounded-lg overflow-hidden"
      style={{ height, minHeight: height }}
    >
      <div className="h-full flex items-center justify-center px-4">
        <div className="text-center">
          <FaBullhorn className="text-3xl text-primary-400 mx-auto mb-2" />
          <p className="text-sm text-dark-300 mb-1">
            📺 Advertisement Space
          </p>
          <p className="text-xs text-dark-500">
            Google AdSense / PropellerAds banner here
          </p>
          <p className="text-xs text-dark-600 mt-2">
            Supports FREE virtual casino 💰
          </p>
        </div>
      </div>
      
      {/* 
        PRODUCTION: Replace above with:
        
        <ins className="adsbygoogle"
             style={{display:'block', height: '100%'}}
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
             data-ad-slot="1234567890"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
      */}
    </div>
  );
};

export default BannerAd;
