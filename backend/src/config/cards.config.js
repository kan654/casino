/**
 * Card Collection Data
 * 68 collectible cards with different rarities
 * 
 * Rarity Distribution:
 * - Common: 40 cards (58.8%)
 * - Uncommon: 13 cards (19.1%)
 * - Rare: 6 cards (8.8%)
 * - Very Rare: 6 cards (8.8%)
 * - Legendary: 3 cards (4.4%)
 */

const RARITY_CONFIG = {
  common: {
    name: 'Common',
    dropRate: 58.8,
    color: '#9CA3AF',
    value: 50
  },
  uncommon: {
    name: 'Uncommon',
    dropRate: 19.1,
    color: '#10B981',
    value: 150
  },
  rare: {
    name: 'Rare',
    dropRate: 8.8,
    color: '#3B82F6',
    value: 350
  },
  very_rare: {
    name: 'Very Rare',
    dropRate: 8.8,
    color: '#A855F7',
    value: 700
  },
  legendary: {
    name: 'Legendary',
    dropRate: 4.4,
    color: '#F59E0B',
    value: 2000
  }
};

const CARD_DATA = [
  // COMMON CARDS (40 cards - 58.8%)
  { cardId: 'C001', name: 'Ace of Coins', rarity: 'common', category: 'coins', description: 'A single golden coin shining brightly' },
  { cardId: 'C002', name: 'Double Dice', rarity: 'common', category: 'dice', description: 'Two lucky dice showing sixes' },
  { cardId: 'C003', name: 'Cherry Symbols', rarity: 'common', category: 'slots', description: 'Three red cherries in a row' },
  { cardId: 'C004', name: 'Lucky Seven', rarity: 'common', category: 'slots', description: 'The classic lucky seven symbol' },
  { cardId: 'C005', name: 'Poker Chip', rarity: 'common', category: 'poker', description: 'A red casino chip' },
  { cardId: 'C006', name: 'Playing Card', rarity: 'common', category: 'cards', description: 'Standard playing card back' },
  { cardId: 'C007', name: 'Coin Stack', rarity: 'common', category: 'coins', description: 'Small stack of gold coins' },
  { cardId: 'C008', name: 'Dice Roll', rarity: 'common', category: 'dice', description: 'A single die mid-roll' },
  { cardId: 'C009', name: 'Bell Symbol', rarity: 'common', category: 'slots', description: 'Golden bell slot symbol' },
  { cardId: 'C010', name: 'Bar Symbol', rarity: 'common', category: 'slots', description: 'Classic BAR slot symbol' },
  
  { cardId: 'C011', name: 'Lemon Fruit', rarity: 'common', category: 'slots', description: 'Bright yellow lemon' },
  { cardId: 'C012', name: 'Orange Fruit', rarity: 'common', category: 'slots', description: 'Juicy orange slice' },
  { cardId: 'C013', name: 'Grape Bunch', rarity: 'common', category: 'slots', description: 'Purple grape cluster' },
  { cardId: 'C014', name: 'Watermelon', rarity: 'common', category: 'slots', description: 'Red watermelon slice' },
  { cardId: 'C015', name: 'Plum Symbol', rarity: 'common', category: 'slots', description: 'Sweet purple plum' },
  { cardId: 'C016', name: 'White Chip', rarity: 'common', category: 'poker', description: 'Low value white chip' },
  { cardId: 'C017', name: 'Red Chip', rarity: 'common', category: 'poker', description: 'Standard red chip' },
  { cardId: 'C018', name: 'Blue Chip', rarity: 'common', category: 'poker', description: 'Medium blue chip' },
  { cardId: 'C019', name: 'Green Chip', rarity: 'common', category: 'poker', description: 'Standard green chip' },
  { cardId: 'C020', name: 'Black Chip', rarity: 'common', category: 'poker', description: 'High value black chip' },
  
  { cardId: 'C021', name: 'Spades Ace', rarity: 'common', category: 'cards', description: 'Ace of Spades' },
  { cardId: 'C022', name: 'Hearts King', rarity: 'common', category: 'cards', description: 'King of Hearts' },
  { cardId: 'C023', name: 'Clubs Queen', rarity: 'common', category: 'cards', description: 'Queen of Clubs' },
  { cardId: 'C024', name: 'Diamonds Jack', rarity: 'common', category: 'cards', description: 'Jack of Diamonds' },
  { cardId: 'C025', name: 'Joker Card', rarity: 'common', category: 'cards', description: 'Wild joker card' },
  { cardId: 'C026', name: 'Small Coin', rarity: 'common', category: 'coins', description: 'Bronze coin' },
  { cardId: 'C027', name: 'Silver Coin', rarity: 'common', category: 'coins', description: 'Shiny silver coin' },
  { cardId: 'C028', name: 'Copper Coin', rarity: 'common', category: 'coins', description: 'Old copper coin' },
  { cardId: 'C029', name: 'Token Coin', rarity: 'common', category: 'coins', description: 'Casino token' },
  { cardId: 'C030', name: 'Lucky Coin', rarity: 'common', category: 'coins', description: 'Golden lucky coin' },
  
  { cardId: 'C031', name: 'D6 Die', rarity: 'common', category: 'dice', description: 'Standard six-sided die' },
  { cardId: 'C032', name: 'Red Die', rarity: 'common', category: 'dice', description: 'Red gaming die' },
  { cardId: 'C033', name: 'Blue Die', rarity: 'common', category: 'dice', description: 'Blue gaming die' },
  { cardId: 'C034', name: 'Green Die', rarity: 'common', category: 'dice', description: 'Green gaming die' },
  { cardId: 'C035', name: 'Black Die', rarity: 'common', category: 'dice', description: 'Black gaming die' },
  { cardId: 'C036', name: 'Gold Star', rarity: 'common', category: 'slots', description: 'Golden star symbol' },
  { cardId: 'C037', name: 'Diamond Gem', rarity: 'common', category: 'slots', description: 'Sparkling diamond' },
  { cardId: 'C038', name: 'Ruby Gem', rarity: 'common', category: 'slots', description: 'Red ruby gem' },
  { cardId: 'C039', name: 'Emerald Gem', rarity: 'common', category: 'slots', description: 'Green emerald gem' },
  { cardId: 'C040', name: 'Sapphire Gem', rarity: 'common', category: 'slots', description: 'Blue sapphire gem' },

  // UNCOMMON CARDS (13 cards - 19.1%)
  { cardId: 'U001', name: 'Golden Horseshoe', rarity: 'uncommon', category: 'luck', description: 'Lucky golden horseshoe' },
  { cardId: 'U002', name: 'Four-Leaf Clover', rarity: 'uncommon', category: 'luck', description: 'Rare four-leaf clover' },
  { cardId: 'U003', name: 'Lucky 777', rarity: 'uncommon', category: 'slots', description: 'Triple seven jackpot' },
  { cardId: 'U004', name: 'Roulette Wheel', rarity: 'uncommon', category: 'roulette', description: 'Spinning roulette wheel' },
  { cardId: 'U005', name: 'Royal Flush', rarity: 'uncommon', category: 'poker', description: 'Best poker hand' },
  { cardId: 'U006', name: 'Dice Pair Sixes', rarity: 'uncommon', category: 'dice', description: 'Double sixes roll' },
  { cardId: 'U007', name: 'Treasure Chest', rarity: 'uncommon', category: 'treasure', description: 'Wooden treasure chest' },
  { cardId: 'U008', name: 'Gold Bar', rarity: 'uncommon', category: 'coins', description: 'Solid gold bar' },
  { cardId: 'U009', name: 'Slot Machine', rarity: 'uncommon', category: 'slots', description: 'Classic slot machine' },
  { cardId: 'U010', name: 'Dealer Chip', rarity: 'uncommon', category: 'poker', description: 'Special dealer button' },
  { cardId: 'U011', name: 'Wild Card', rarity: 'uncommon', category: 'cards', description: 'Mystical wild card' },
  { cardId: 'U012', name: 'Lucky Cat', rarity: 'uncommon', category: 'luck', description: 'Maneki-neko fortune cat' },
  { cardId: 'U013', name: 'Magic Dice', rarity: 'uncommon', category: 'dice', description: 'Glowing magic dice' },

  // RARE CARDS (6 cards - 8.8%)
  { cardId: 'R001', name: 'Diamond Ring', rarity: 'rare', category: 'treasure', description: 'Brilliant diamond ring' },
  { cardId: 'R002', name: 'Golden Crown', rarity: 'rare', category: 'royalty', description: 'Majestic golden crown' },
  { cardId: 'R003', name: 'Mega Jackpot', rarity: 'rare', category: 'slots', description: 'Massive jackpot win' },
  { cardId: 'R004', name: 'Crystal Ball', rarity: 'rare', category: 'magic', description: 'Fortune telling orb' },
  { cardId: 'R005', name: 'Phoenix Coin', rarity: 'rare', category: 'coins', description: 'Mythical phoenix coin' },
  { cardId: 'R006', name: 'Dragon Dice', rarity: 'rare', category: 'dice', description: 'Ancient dragon dice' },

  // VERY RARE CARDS (6 cards - 8.8%)
  { cardId: 'VR001', name: 'Royal Scepter', rarity: 'very_rare', category: 'royalty', description: 'King\'s golden scepter' },
  { cardId: 'VR002', name: 'Platinum Chip', rarity: 'very_rare', category: 'poker', description: 'Ultra rare platinum chip' },
  { cardId: 'VR003', name: 'Infinity Dice', rarity: 'very_rare', category: 'dice', description: 'Cosmic infinity dice' },
  { cardId: 'VR004', name: 'Rainbow Gem', rarity: 'very_rare', category: 'treasure', description: 'Legendary rainbow gem' },
  { cardId: 'VR005', name: 'Golden Dragon', rarity: 'very_rare', category: 'dragon', description: 'Majestic golden dragon' },
  { cardId: 'VR006', name: 'Lucky Talisman', rarity: 'very_rare', category: 'magic', description: 'Ancient lucky talisman' },

  // LEGENDARY CARDS (3 cards - 4.4%)
  { cardId: 'L001', name: 'Cosmic Jackpot', rarity: 'legendary', category: 'ultimate', description: 'The ultimate cosmic jackpot' },
  { cardId: 'L002', name: 'Emperor\'s Fortune', rarity: 'legendary', category: 'ultimate', description: 'Legendary emperor\'s treasure' },
  { cardId: 'L003', name: 'Infinity Crown', rarity: 'legendary', category: 'ultimate', description: 'Crown of infinite luck' }
];

// Generate image URLs (actual images in /impages/karty/)
const enrichedCardData = CARD_DATA.map(card => ({
  ...card,
  imageUrl: `/impages/karty/${card.rarity}/${card.cardId}.png`,
  dropRate: RARITY_CONFIG[card.rarity].dropRate / (CARD_DATA.filter(c => c.rarity === card.rarity).length),
  value: RARITY_CONFIG[card.rarity].value
}));

module.exports = {
  CARD_DATA: enrichedCardData,
  RARITY_CONFIG,
  PACK_PRICES: {
    single: 100,    // 1 card = 100 coins
    triple: 250,    // 3 cards = 250 coins (save 50)
    mega: 400       // 5 cards = 400 coins (save 100)
  }
};
