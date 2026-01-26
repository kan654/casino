import React, { useState, useEffect } from 'react';
import { Card as CardType } from '../types';
import { FaStar, FaGem } from 'react-icons/fa';

interface CardRevealProps {
  card: CardType;
  delay?: number;
  onRevealComplete?: () => void;
}

const RARITY_COLORS = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  very_rare: '#A855F7',
  legendary: '#F59E0B'
};

const RARITY_NAMES = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  very_rare: 'Very Rare',
  legendary: 'Legendary'
};

const CardReveal: React.FC<CardRevealProps> = ({ card, delay = 0, onRevealComplete }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlipped(true);
      setShowParticles(true);
      
      if (onRevealComplete) {
        setTimeout(onRevealComplete, 800);
      }

      // Hide particles after animation
      setTimeout(() => setShowParticles(false), 2000);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, onRevealComplete]);

  const rarityColor = RARITY_COLORS[card.rarity];
  const rarityName = RARITY_NAMES[card.rarity];

  return (
    <div className="relative inline-block">
      {/* Particle effects */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: rarityColor,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      )}

      {/* Card container with 3D flip */}
      <div className="relative w-64 h-96 perspective">
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Back */}
          <div
            className="absolute inset-0 backface-hidden rounded-xl border-4 border-primary-600 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%)'
            }}
          >
            <div className="h-full flex flex-col items-center justify-center p-6">
              <div className="text-6xl mb-4 animate-pulse">🃏</div>
              <div className="text-white font-bold text-2xl mb-2">Mystery Card</div>
              <div className="text-primary-300 text-sm">Click to reveal...</div>
              
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-4 gap-4 p-4">
                  {[...Array(16)].map((_, i) => (
                    <FaStar key={i} className="text-white text-2xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card Front */}
          <div
            className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl overflow-hidden"
            style={{
              borderWidth: '4px',
              borderStyle: 'solid',
              borderColor: rarityColor,
              boxShadow: `0 0 20px ${rarityColor}80`
            }}
          >
            {/* Rarity gradient background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `linear-gradient(135deg, ${rarityColor}00 0%, ${rarityColor} 100%)`
              }}
            />

            {/* Card content */}
            <div className="relative h-full bg-dark-800 flex flex-col">
              {/* Card image */}
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Real card image */}
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-48 h-48 rounded-lg object-cover"
                    style={{ 
                      boxShadow: `0 0 20px ${rarityColor}40`,
                      border: `2px solid ${rarityColor}40`
                    }}
                    onLoad={() => console.log('✅ Image loaded:', card.imageUrl)}
                    onError={(e) => {
                      console.error('❌ Image failed to load:', card.imageUrl);
                      // Fallback to emoji if image not found
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  
                  {/* Fallback emoji (if image fails to load) */}
                  <div
                    className="w-48 h-48 rounded-lg flex items-center justify-center text-6xl"
                    style={{ 
                      background: `${rarityColor}20`,
                      display: 'none' // Hidden by default, shown if img fails
                    }}
                  >
                    {card.rarity === 'legendary' ? '👑' :
                     card.rarity === 'very_rare' ? '💎' :
                     card.rarity === 'rare' ? '⭐' :
                     card.rarity === 'uncommon' ? '🎯' : '🎴'}
                  </div>

                  {/* New card badge */}
                  {card.isNew && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-bounce">
                      NEW!
                    </div>
                  )}

                  {/* Duplicate badge */}
                  {card.isDuplicate && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-dark-900 px-3 py-1 rounded-full text-xs font-bold">
                      x{(card.quantity || 0) + 1}
                    </div>
                  )}
                </div>
              </div>

              {/* Card info */}
              <div className="p-4 bg-dark-900 border-t-4" style={{ borderColor: rarityColor }}>
                {/* Card name */}
                <h3 className="text-white font-bold text-lg mb-1 text-center">
                  {card.name}
                </h3>

                {/* Rarity */}
                <div className="flex items-center justify-center mb-2">
                  <FaGem className="mr-2" style={{ color: rarityColor }} />
                  <span className="font-semibold" style={{ color: rarityColor }}>
                    {rarityName}
                  </span>
                </div>

                {/* Description */}
                <p className="text-dark-400 text-xs text-center mb-2">
                  {card.description}
                </p>

                {/* Stats */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-dark-500">
                    Drop: {card.dropRate.toFixed(2)}%
                  </span>
                  <span className="text-yellow-500 font-bold">
                    {card.value} coins
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Glow effect */}
      {isFlipped && (
        <div
          className="absolute inset-0 rounded-xl animate-pulse pointer-events-none"
          style={{
            boxShadow: `0 0 40px ${rarityColor}60`,
            animation: 'pulse 2s infinite'
          }}
        />
      )}

      <style>{`
        .perspective {
          perspective: 1000px;
        }
        
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CardReveal;
