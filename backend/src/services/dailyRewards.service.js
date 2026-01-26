const { DAILY_REWARDS_CONFIG } = require('../config/game.config');
const { generateProvablyFairNumber } = require('../utils/provablyFair');

/**
 * Daily Rewards Service
 * CSGO-style daily reward opening with weighted probabilities
 */
class DailyRewardsService {
  /**
   * Check if user can claim daily reward
   */
  static canClaim(user) {
    if (!user.lastDailyReward) {
      return { canClaim: true, timeUntilNext: 0 };
    }

    const now = Date.now();
    const lastClaim = new Date(user.lastDailyReward).getTime();
    const cooldownMs = DAILY_REWARDS_CONFIG.COOLDOWN_HOURS * 60 * 60 * 1000;
    const timeUntilNext = Math.max(0, (lastClaim + cooldownMs) - now);

    return {
      canClaim: timeUntilNext === 0,
      timeUntilNext,
      lastClaim: user.lastDailyReward
    };
  }

  /**
   * Select reward using weighted random (provably fair)
   */
  static selectReward(clientSeed, serverSeed, nonce) {
    const rewards = DAILY_REWARDS_CONFIG.REWARDS;
    const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
    
    // Generate random value between 0 and totalWeight
    const randomValue = generateProvablyFairNumber(
      clientSeed,
      serverSeed,
      nonce,
      totalWeight * 100 // Multiply for precision
    ) / 100;
    
    // Select reward based on weight
    let currentWeight = 0;
    for (const reward of rewards) {
      currentWeight += reward.weight;
      if (randomValue < currentWeight) {
        return reward;
      }
    }
    
    // Fallback to first reward (shouldn't happen)
    return rewards[0];
  }

  /**
   * Generate reel items for animation (CSGO-style)
   * Creates a horizontal strip with the winning item positioned correctly
   */
  static generateReel(winningReward, clientSeed, serverSeed, nonce) {
    const rewards = DAILY_REWARDS_CONFIG.REWARDS;
    const reelLength = 50; // Total items in reel
    const winningPosition = 25; // Winning item will be at position 25 (center of 50)
    
    const reel = [];
    let currentNonce = nonce + 1; // Use different nonce for reel generation
    
    // Fill reel with random items
    for (let i = 0; i < reelLength; i++) {
      if (i === winningPosition) {
        // Place winning item at exact position
        reel.push(winningReward);
      } else {
        // Generate random item for this position
        const randomReward = this.selectReward(clientSeed, serverSeed, currentNonce);
        reel.push(randomReward);
        currentNonce++;
      }
    }
    
    return reel;
  }

  /**
   * Claim daily reward
   */
  static async claimReward(user, clientSeed = null) {
    try {
      // Check if can claim
      const { canClaim, timeUntilNext } = this.canClaim(user);
      
      if (!canClaim) {
        const hoursLeft = Math.floor(timeUntilNext / (60 * 60 * 1000));
        const minutesLeft = Math.floor((timeUntilNext % (60 * 60 * 1000)) / (60 * 1000));
        throw new Error(`You can claim your next reward in ${hoursLeft}h ${minutesLeft}m`);
      }
      
      // Use user's client seed or provided one
      const seedToUse = clientSeed || user.clientSeed;
      
      // Increment nonce for provably fair
      const currentNonce = user.nonce;
      user.incrementNonce();
      
      // Select winning reward
      const winningReward = this.selectReward(
        seedToUse,
        user.serverSeed,
        currentNonce
      );
      
      // Generate reel for animation
      const reel = this.generateReel(
        winningReward,
        seedToUse,
        user.serverSeed,
        currentNonce
      );
      
      // Update user balance
      user.balance += winningReward.amount;
      user.lastDailyReward = new Date();
      await user.save();
      
      return {
        success: true,
        data: {
          reward: winningReward,
          reel,
          winningPosition: 25,
          balance: user.balance,
          nextClaimTime: new Date(Date.now() + (DAILY_REWARDS_CONFIG.COOLDOWN_HOURS * 60 * 60 * 1000))
        },
        provablyFair: {
          clientSeed: seedToUse,
          serverSeedHash: user.serverSeedHash,
          nonce: currentNonce
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get available rewards (for display)
   */
  static getRewards() {
    return DAILY_REWARDS_CONFIG.REWARDS;
  }

  /**
   * Get config (for client)
   */
  static getConfig() {
    return {
      cooldownHours: DAILY_REWARDS_CONFIG.COOLDOWN_HOURS,
      rewards: DAILY_REWARDS_CONFIG.REWARDS
    };
  }
}

module.exports = DailyRewardsService;
