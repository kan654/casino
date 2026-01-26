import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cardAPI } from '../services/api';
import { Card as CardType, CardsByRarity, CollectionStats } from '../types';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaBox, FaTrophy, FaGem, FaLock, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'very_rare', 'legendary'];

const RARITY_CONFIG = {
  common: { name: 'Common', color: '#9CA3AF', icon: '🎴', dropRate: 58.8 },
  uncommon: { name: 'Uncommon', color: '#10B981', icon: '🎯', dropRate: 19.1 },
  rare: { name: 'Rare', color: '#3B82F6', icon: '⭐', dropRate: 8.8 },
  very_rare: { name: 'Very Rare', color: '#A855F7', icon: '💎', dropRate: 8.8 },
  legendary: { name: 'Legendary', color: '#F59E0B', icon: '👑', dropRate: 4.4 }
};

const CardCollection: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  const [collection, setCollection] = useState<CardsByRarity | null>(null);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [, setRarestCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [filterRarity, setFilterRarity] = useState<string>('all');

  useEffect(() => {
    loadCollection();
  }, []);

  const loadCollection = async () => {
    setLoading(true);
    try {
      const [collectionRes, statsRes] = await Promise.all([
        cardAPI.getCollection(),
        cardAPI.getStats()
      ]);

      if (collectionRes.success) {
        setCollection(collectionRes.data.collection);
      }

      if (statsRes.success) {
        setStats(statsRes.data.stats);
        setRarestCards(statsRes.data.rarestCards || []);
      }
    } catch (error) {
      console.error('Failed to load collection:', error);
      toast.error('Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  const openCardDetail = (card: CardType) => {
    if (card.owned) {
      setSelectedCard(card);
    }
  };

  const closeCardDetail = () => {
    setSelectedCard(null);
  };

  const sellCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to sell this card?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await cardAPI.sellCard(cardId);
      
      if (response.success) {
        toast.success(response.message || 'Card sold successfully!');
        closeCardDetail();
        
        // Refresh user balance
        await refreshUser();
        
        // Reload collection
        loadCollection();
      }
    } catch (error: any) {
      console.error('Failed to sell card:', error);
      toast.error(error.response?.data?.message || 'Failed to sell card');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const filteredCollection = collection && filterRarity !== 'all'
    ? { [filterRarity]: collection[filterRarity as keyof CardsByRarity] }
    : collection;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/cards')}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <FaArrowLeft />
            <span>Back to Packs</span>
          </button>

          <button
            onClick={() => navigate('/cards')}
            className="btn btn-primary flex items-center space-x-2"
          >
            <FaBox />
            <span>Open Packs</span>
          </button>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2">📚 My Collection</h1>
        <p className="text-dark-400">Collect all 68 cards!</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <FaTrophy className="text-4xl text-yellow-500 mx-auto mb-2" />
            <p className="text-dark-400 text-sm mb-1">Completion</p>
            <p className="text-2xl font-bold text-white">{stats.completionRate}%</p>
          </div>

          <div className="card text-center">
            <FaGem className="text-4xl text-primary-500 mx-auto mb-2" />
            <p className="text-dark-400 text-sm mb-1">Unique Cards</p>
            <p className="text-2xl font-bold text-white">
              {stats.uniqueCards}/{stats.totalAvailableCards}
            </p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-2">🎴</div>
            <p className="text-dark-400 text-sm mb-1">Total Cards</p>
            <p className="text-2xl font-bold text-white">{stats.totalCards}</p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-2">📦</div>
            <p className="text-dark-400 text-sm mb-1">Packs Opened</p>
            <p className="text-2xl font-bold text-white">{stats.totalPacksOpened}</p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {stats && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold">Collection Progress</span>
            <span className="text-primary-400 font-bold">{stats.completionRate}%</span>
          </div>
          <div className="bg-dark-900 rounded-full h-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-600 to-purple-600 h-full transition-all duration-500 flex items-center justify-center"
              style={{ width: `${stats.completionRate}%` }}
            >
              {stats.completionRate > 10 && (
                <span className="text-white text-xs font-bold">
                  {stats.uniqueCards}/{stats.totalAvailableCards}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rarity filter */}
      <div className="card mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterRarity('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterRarity === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-dark-900 text-dark-400 hover:bg-dark-800'
            }`}
          >
            All Cards
          </button>
          {RARITY_ORDER.map((rarity) => {
            const config = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG];
            const count = stats?.rarityStats[rarity as keyof typeof stats.rarityStats] || 0;
            
            return (
              <button
                key={rarity}
                onClick={() => setFilterRarity(rarity)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filterRarity === rarity
                    ? 'text-white'
                    : 'bg-dark-900 text-dark-400 hover:bg-dark-800'
                }`}
                style={{
                  backgroundColor: filterRarity === rarity ? config.color : undefined,
                  borderWidth: '2px',
                  borderColor: config.color
                }}
              >
                {config.icon} {config.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Card grid by rarity */}
      {filteredCollection && Object.entries(filteredCollection)
        .sort(([a], [b]) => RARITY_ORDER.indexOf(a) - RARITY_ORDER.indexOf(b))
        .map(([rarity, cards]) => {
          const config = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG];
          const ownedCount = (cards as CardType[]).filter(c => c.owned).length;
          const totalCount = (cards as CardType[]).length;

          return (
            <div key={rarity} className="mb-8">
              <div
                className="flex items-center justify-between mb-4 pb-2 border-b-2"
                style={{ borderColor: config.color }}
              >
                <h2 className="text-2xl font-bold flex items-center" style={{ color: config.color }}>
                  {config.icon} {config.name}
                </h2>
                <span className="text-dark-400 font-semibold">
                  {ownedCount}/{totalCount}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {(cards as CardType[]).map((card) => (
                  <div
                    key={card.cardId}
                    onClick={() => openCardDetail(card)}
                    className={`relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer transition-all ${
                      card.owned
                        ? 'hover:scale-105 hover:shadow-lg'
                        : 'opacity-40 filter grayscale'
                    }`}
                    style={{
                      borderWidth: '3px',
                      borderStyle: 'solid',
                      borderColor: card.owned ? config.color : '#374151'
                    }}
                  >
                    {/* Card image */}
                    {card.owned ? (
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback to emoji if image not found
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        className="h-full flex items-center justify-center text-6xl"
                        style={{ background: '#1F2937' }}
                      >
                        <FaLock className="text-dark-600 text-3xl" />
                      </div>
                    )}

                    {/* Card info */}
                    {card.owned && (
                      <div className="absolute bottom-0 left-0 right-0 bg-dark-900 bg-opacity-95 p-2">
                        <p className="text-white text-xs font-semibold truncate">
                          {card.name}
                        </p>
                        {card.quantity && card.quantity > 1 && (
                          <span className="absolute top-2 right-2 bg-yellow-500 text-dark-900 px-2 py-1 rounded-full text-xs font-bold">
                            x{card.quantity}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      {/* Card detail modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 animate-fadeIn p-4"
          onClick={closeCardDetail}
        >
          <div
            className="bg-dark-800 rounded-xl max-w-md w-full overflow-hidden"
            style={{
              borderWidth: '4px',
              borderStyle: 'solid',
              borderColor: RARITY_CONFIG[selectedCard.rarity].color
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeCardDetail}
              className="absolute top-4 right-4 text-white bg-dark-900 rounded-full p-2 hover:bg-dark-700 transition-colors"
            >
              <FaTimes />
            </button>

            {/* Card image */}
            <div
              className="h-96 flex items-center justify-center p-6"
              style={{
                background: `linear-gradient(135deg, ${RARITY_CONFIG[selectedCard.rarity].color}40, ${RARITY_CONFIG[selectedCard.rarity].color}80)`
              }}
            >
              <img
                src={selectedCard.imageUrl}
                alt={selectedCard.name}
                className="max-h-full max-w-full object-contain rounded-lg"
                style={{ 
                  boxShadow: `0 0 30px ${RARITY_CONFIG[selectedCard.rarity].color}60`,
                  border: `3px solid ${RARITY_CONFIG[selectedCard.rarity].color}`
                }}
                onError={(e) => {
                  // Fallback to emoji if image fails
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="text-8xl">${RARITY_CONFIG[selectedCard.rarity].icon}</div>`;
                  }
                }}
              />
            </div>

            {/* Card info */}
            <div className="p-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                {selectedCard.name}
              </h2>

              <div className="flex items-center mb-4">
                <FaGem className="mr-2" style={{ color: RARITY_CONFIG[selectedCard.rarity].color }} />
                <span
                  className="font-semibold text-lg"
                  style={{ color: RARITY_CONFIG[selectedCard.rarity].color }}
                >
                  {RARITY_CONFIG[selectedCard.rarity].name}
                </span>
              </div>

              <p className="text-dark-400 mb-4">{selectedCard.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-dark-900 rounded-lg p-3">
                  <p className="text-dark-500 text-xs mb-1">Rarity</p>
                  <p className="font-bold capitalize" style={{ color: RARITY_CONFIG[selectedCard.rarity].color }}>
                    {RARITY_CONFIG[selectedCard.rarity].name}
                  </p>
                </div>

                <div className="bg-dark-900 rounded-lg p-3">
                  <p className="text-dark-500 text-xs mb-1">Drop Rate</p>
                  <p className="text-white font-bold">{RARITY_CONFIG[selectedCard.rarity].dropRate}%</p>
                </div>

                <div className="bg-dark-900 rounded-lg p-3">
                  <p className="text-dark-500 text-xs mb-1">Value</p>
                  <p className="text-yellow-500 font-bold">{selectedCard.value} coins</p>
                </div>

                <div className="bg-dark-900 rounded-lg p-3">
                  <p className="text-dark-500 text-xs mb-1">Owned</p>
                  <p className="text-white font-bold">x{selectedCard.quantity || 0}</p>
                </div>
              </div>

              {selectedCard.firstObtained && (
                <p className="text-dark-500 text-xs text-center mb-4">
                  First obtained: {new Date(selectedCard.firstObtained).toLocaleDateString()}
                </p>
              )}

              {/* Sell button */}
              <button
                onClick={() => sellCard(selectedCard.cardId)}
                className="w-full btn btn-primary flex items-center justify-center space-x-2"
                disabled={loading}
              >
                <span>💰</span>
                <span>Sell for {selectedCard.value} coins</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardCollection;
