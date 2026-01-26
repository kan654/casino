import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cardAPI } from '../services/api';
import { Card as CardType } from '../types';
import CardReveal from '../components/CardReveal';
import toast from 'react-hot-toast';
import { FaBox, FaCoins, FaArrowLeft, FaBook } from 'react-icons/fa';

const CardPacks: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [opening, setOpening] = useState(false);
  const [revealedCards, setRevealedCards] = useState<CardType[]>([]);
  const [packConfig, setPackConfig] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await cardAPI.getConfig();
      if (response.success) {
        setPackConfig(response.data);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const openPack = async (packSize: number) => {
    if (!user) return;

    const prices = packConfig?.prices || { single: 100, triple: 250, mega: 400 };
    const packPrice = packSize === 1 ? prices.single : packSize === 3 ? prices.triple : prices.mega;

    if (user.balance < packPrice) {
      toast.error(`Insufficient balance! Need ${packPrice} coins.`);
      return;
    }

    setOpening(true);
    setShowResults(false);
    setRevealedCards([]);

    try {
      const response = await cardAPI.openPack(packSize);
      
      if (response.success) {
        setRevealedCards(response.data.cards);
        await refreshUser();
        
        // Show results after all cards are revealed
        setTimeout(() => {
          setShowResults(true);
          setOpening(false);
        }, 1000 + (packSize * 800));

        // Count new cards
        const newCards = response.data.cards.filter((c: CardType) => c.isNew).length;
        if (newCards > 0) {
          toast.success(`${newCards} new card${newCards > 1 ? 's' : ''} added to collection!`);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to open pack');
      setOpening(false);
    }
  };

  const handleRevealComplete = () => {
    // Optional: Add sound effects or additional animations
  };

  const prices = packConfig?.prices || { single: 100, triple: 250, mega: 400 };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>

          <button
            onClick={() => navigate('/cards/collection')}
            className="btn btn-primary flex items-center space-x-2"
          >
            <FaBook />
            <span>My Collection</span>
          </button>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2">🃏 Card Packs</h1>
        <p className="text-dark-400">Open packs to collect cards! 68 cards to discover.</p>
      </div>

      {/* Balance */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-dark-400 text-sm mb-1">Your Balance</p>
            <p className="text-3xl font-bold text-yellow-500 flex items-center">
              <FaCoins className="mr-2" />
              {user?.balance.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {!opening && revealedCards.length === 0 && (
        <>
          {/* Pack options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Single Pack */}
            <div className="card hover:border-primary-500 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="mb-4 group-hover:scale-110 transition-transform flex justify-center">
                  <img 
                    src="/impages/okladka/K01.png" 
                    alt="Card Pack" 
                    className="w-32 h-32 object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Single Pack</h3>
                <p className="text-dark-400 text-sm mb-4">1 Random Card</p>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-yellow-500">{prices.single}</span>
                  <span className="text-dark-400 ml-2">coins</span>
                </div>

                <button
                  onClick={() => openPack(1)}
                  disabled={!user || user.balance < prices.single}
                  className="btn btn-primary w-full"
                >
                  <FaBox className="mr-2" />
                  Open Pack
                </button>
              </div>
            </div>

            {/* Triple Pack */}
            <div className="card hover:border-purple-500 transition-all cursor-pointer group border-purple-600">
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                SAVE 50
              </div>
              
              <div className="text-center">
                <div className="mb-4 group-hover:scale-110 transition-transform flex justify-center gap-2">
                  <img src="/impages/okladka/K01.png" alt="Card Pack" className="w-24 h-24 object-contain" />
                  <img src="/impages/okladka/K01.png" alt="Card Pack" className="w-24 h-24 object-contain" />
                  <img src="/impages/okladka/K01.png" alt="Card Pack" className="w-24 h-24 object-contain" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Triple Pack</h3>
                <p className="text-dark-400 text-sm mb-4">3 Random Cards</p>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-purple-500">{prices.triple}</span>
                  <span className="text-dark-400 ml-2">coins</span>
                </div>

                <button
                  onClick={() => openPack(3)}
                  disabled={!user || user.balance < prices.triple}
                  className="btn btn-primary w-full bg-purple-600 hover:bg-purple-700"
                >
                  <FaBox className="mr-2" />
                  Open Pack
                </button>
              </div>
            </div>

            {/* Mega Pack */}
            <div className="card hover:border-yellow-500 transition-all cursor-pointer group border-yellow-600">
              <div className="absolute top-2 right-2 bg-yellow-500 text-dark-900 px-2 py-1 rounded-full text-xs font-bold">
                BEST VALUE
              </div>
              
              <div className="text-center">
                <div className="mb-4 group-hover:scale-110 transition-transform flex justify-center gap-1">
                  <img src="/impages/okladka/K01.png" alt="Card Pack" className="w-20 h-20 object-contain" />
                  <img src="/impages/okladka/K01.png" alt="Card Pack" className="w-20 h-20 object-contain" />
                  <img src="/impages/okladka/K01.png" alt="Card Pack" className="w-20 h-20 object-contain" />
                  <img src="/impages/okladka/K01.png" alt="Card Pack" className="w-20 h-20 object-contain" />
                  <img src="/impages/okladka/K01.png" alt="Card Pack" className="w-20 h-20 object-contain" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Mega Pack</h3>
                <p className="text-dark-400 text-sm mb-4">5 Random Cards</p>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-yellow-500">{prices.mega}</span>
                  <span className="text-dark-400 ml-2">coins</span>
                  <div className="text-green-400 text-xs mt-1">Save 100 coins!</div>
                </div>

                <button
                  onClick={() => openPack(5)}
                  disabled={!user || user.balance < prices.mega}
                  className="btn btn-primary w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  <FaBox className="mr-2" />
                  Open Pack
                </button>
              </div>
            </div>
          </div>

          {/* Rarity info */}
          <div className="card">
            <h3 className="text-xl font-bold text-white mb-4">📊 Drop Rates</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Common</span>
                <span className="font-semibold" style={{ color: '#9CA3AF' }}>58.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-400">Uncommon</span>
                <span className="font-semibold text-green-400">19.1%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-400">Rare</span>
                <span className="font-semibold text-blue-400">8.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-400">Very Rare</span>
                <span className="font-semibold text-purple-400">8.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-500">Legendary</span>
                <span className="font-semibold text-yellow-500">4.4%</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Card reveals */}
      {opening && revealedCards.length > 0 && (
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-white mb-8">🎉 Opening Pack...</h2>
          
          <div className="flex flex-wrap justify-center gap-6">
            {revealedCards.map((card, index) => (
              <CardReveal
                key={`${card.cardId}-${index}`}
                card={card}
                delay={index * 800}
                onRevealComplete={handleRevealComplete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && revealedCards.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-dark-800 border border-primary-600 rounded-xl p-8 max-w-2xl w-full mx-4">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              🎉 Pack Opened!
            </h2>

            <div className="mb-6">
              <p className="text-dark-300 text-center mb-4">
                You got {revealedCards.length} card{revealedCards.length > 1 ? 's' : ''}:
              </p>

              <div className="space-y-2">
                {revealedCards.map((card, index) => (
                  <div
                    key={index}
                    className="bg-dark-900 border border-dark-700 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {card.rarity === 'legendary' ? '👑' :
                         card.rarity === 'very_rare' ? '💎' :
                         card.rarity === 'rare' ? '⭐' :
                         card.rarity === 'uncommon' ? '🎯' : '🎴'}
                      </span>
                      <div>
                        <p className="text-white font-semibold">{card.name}</p>
                        <p className="text-sm capitalize" style={{ color: card.rarity === 'common' ? '#9CA3AF' : card.rarity === 'uncommon' ? '#10B981' : card.rarity === 'rare' ? '#3B82F6' : card.rarity === 'very_rare' ? '#A855F7' : '#F59E0B' }}>
                          {card.rarity.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {card.isNew && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                          NEW!
                        </span>
                      )}
                      {card.isDuplicate && (
                        <span className="bg-yellow-500 text-dark-900 px-2 py-1 rounded text-xs font-bold">
                          DUPLICATE
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowResults(false);
                  setRevealedCards([]);
                }}
                className="btn btn-primary flex-1"
              >
                Open Another Pack
              </button>
              <button
                onClick={() => navigate('/cards/collection')}
                className="btn btn-secondary flex-1"
              >
                <FaBook className="mr-2" />
                View Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardPacks;
