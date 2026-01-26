# 📺 Ad System Documentation - Virtual Casino

## Overview

Complete ad monetization system with **banner ads** and **rewarded video ads** for virtual casino game. Users get free coins by watching ads when balance reaches 0.

---

## 🎯 System Components

### 1. **Banner Ads** (Passive Income)
- Display: Top & bottom of every page
- Always visible during gameplay
- **Production**: Google AdSense, PropellerAds, Media.net

### 2. **Rewarded Ads** (Active Engagement)
- Trigger: User balance = 0
- Reward: 1000 coins per ad
- Limit: 1 ad per balance reset
- **Production**: Google AdMob, Unity Ads, IronSource

---

## 💰 Monetization Flow

```
User plays games → Balance decreases → Balance = 0
                                            ↓
                            Modal appears: "Watch ad for coins?"
                                            ↓
                            User clicks "Watch Ad"
                                            ↓
                            Ad plays (15-30 seconds)
                                            ↓
                        User receives 1000 coins
                                            ↓
                        Continues playing!
```

---

## 🔧 Technical Implementation

### Backend

**User Model Fields:**
```javascript
{
  adsWatched: Number,        // Total ads watched
  coinsEarnedFromAds: Number, // Total coins from ads
  lastAdWatched: Date,       // Timestamp of last ad
  canWatchAd: Boolean        // True when balance = 0
}
```

**API Endpoints:**
```
POST /api/ads/watch    - Watch ad & claim reward
GET  /api/ads/status   - Check eligibility
GET  /api/ads/config   - Get reward config
```

### Frontend

**Components:**
1. `BannerAd.tsx` - Passive banner display
2. `RewardedAdModal.tsx` - Rewarded ad flow
3. `Layout.tsx` - Auto-detect balance = 0

**Flow:**
```javascript
useEffect(() => {
  if (user.balance === 0) {
    // Show rewarded ad modal
    setShowAdModal(true);
  }
}, [user.balance]);
```

---

## 🎮 User Experience

### Scenario 1: Playing Games
```
1. User starts with 1000 coins
2. Plays slots, dice, crash, trading
3. Balance gradually decreases
4. When balance hits 0:
   → Modal appears automatically
   → "Watch 15s ad = Get 1000 coins"
5. User clicks "Watch Ad"
6. Ad plays (simulated in demo)
7. After completion:
   → 1000 coins added to balance
   → Modal closes
   → Can continue playing!
```

### Scenario 2: Profile Page
```
1. User visits /profile
2. Sees "Ad Rewards" section:
   - Total ads watched
   - Total coins earned from ads
   - Next reward amount
3. Encourages watching ads when needed
```

---

## 📊 Revenue Model

### Banner Ads (CPM)
```
CPM = Cost Per 1000 Impressions
Example: $2 CPM
10,000 daily users × 10 pages/user = 100,000 impressions
Revenue = (100,000 / 1000) × $2 = $200/day
```

### Rewarded Ads (Higher CPM)
```
Rewarded CPM typically 5-10x higher than banner
Example: $10 CPM (or $0.50 per completion)
1,000 daily users watch ad = $500/day
```

### Combined Estimate
```
Banner Ads:    $200/day
Rewarded Ads:  $500/day
Total:         $700/day = $21,000/month
(For 10,000 daily active users)
```

---

## 🚀 Production Setup

### Option 1: Google AdSense (Banner) + AdMob (Rewarded)

#### Google AdSense Setup
```html
<!-- In BannerAd.tsx, replace placeholder with: -->

<!-- 1. Sign up: https://www.google.com/adsense/ -->
<!-- 2. Get your publisher ID (ca-pub-XXXXXXXXXXXXXXXX) -->
<!-- 3. Add script to index.html: -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>

<!-- 4. In BannerAd.tsx: -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="1234567890"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>

<!-- 5. Initialize: -->
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

#### Google AdMob (Rewarded Video)
```javascript
// For web, use Google Ad Manager
// https://admanager.google.com/

// In RewardedAdModal.tsx, replace simulateAdWatching():
const loadRewardedAd = () => {
  googletag.cmd.push(() => {
    const slot = googletag.defineOutOfPageSlot(
      '/21775744923/rewarded',
      googletag.enums.OutOfPageFormat.REWARDED
    );
    
    slot.addService(googletag.pubads());
    
    // Listen for reward event
    googletag.pubads().addEventListener('rewardedSlotReady', (event) => {
      event.makeRewardedVisible();
    });
    
    googletag.pubads().addEventListener('rewardedSlotGranted', () => {
      // User earned reward!
      claimReward();
    });
    
    googletag.enableServices();
    googletag.display(slot);
  });
};
```

### Option 2: PropellerAds (All Ad Types)

#### PropellerAds Setup
```javascript
// 1. Sign up: https://propellerads.com
// 2. Create Zone ID for each ad placement
// 3. Add PropellerAds script:

<!-- In index.html: -->
<script>
  (function(d,z,s){
    s.src='https://'+d+'/400/'+z;
    try{(document.body||document.documentElement).appendChild(s)}
    catch(e){}
  })('yourzone.com',1234567,document.createElement('script'))
</script>

// For rewarded video in RewardedAdModal:
const loadPropellerAd = () => {
  window.propellerads = window.propellerads || [];
  propellerads.push({
    zone_id: YOUR_ZONE_ID,
    onReward: () => {
      // User completed ad
      claimReward();
    }
  });
};
```

### Option 3: Unity Ads (Gaming-Focused)

```javascript
// Best for game-like applications
// https://unity.com/products/unity-ads

// Initialize Unity Ads
UnityAds.initialize('YOUR_GAME_ID', testMode, () => {
  console.log('Unity Ads initialized');
});

// Load rewarded ad
UnityAds.load('Rewarded_Android', {
  onComplete: () => {
    // Ad loaded successfully
  }
});

// Show rewarded ad
UnityAds.show('Rewarded_Android', {
  onComplete: () => {
    // User completed ad - give reward
    claimReward();
  }
});
```

---

## 📱 Mobile App Integration

For React Native / Mobile version:

### Google AdMob (React Native)
```bash
npm install @react-native-google-mobile-ads/admob
```

```javascript
import MobileAds, { RewardedAd, RewardedAdEventType } from '@react-native-google-mobile-ads/admob';

// Initialize
MobileAds().initialize();

// Create rewarded ad
const rewarded = RewardedAd.createForAdRequest('ca-app-pub-XXXXX/XXXXX', {
  requestNonPersonalizedAdsOnly: false,
});

// Listen for events
rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
  rewarded.show();
});

rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
  console.log(`User earned ${reward.amount} ${reward.type}`);
  // Give 1000 coins
  claimReward();
});

// Load ad
rewarded.load();
```

---

## 🎯 Best Practices

### 1. **Balance User Experience**
- Don't show ads too frequently
- Only rewarded ad when balance = 0
- Make ads feel like a help, not spam

### 2. **Clear Communication**
```
✅ "Watch a 15s ad to get 1000 coins!"
✅ "Ads keep this casino FREE to play"
✅ "All currency is virtual"

❌ "You MUST watch this ad"
❌ "Forced ad in 3... 2... 1..."
```

### 3. **Track Metrics**
```javascript
// In backend analytics
- Total ads watched
- Average ads per user
- Coin distribution from ads
- Ad completion rate
- Revenue per user
```

### 4. **A/B Testing**
```
Test A: 1000 coins per ad
Test B: 500 coins per ad
Test C: 2000 coins per ad

Measure:
- User engagement
- Ad watch rate
- Session length
- Revenue per user
```

---

## 🔐 Security

### Prevent Ad Fraud
```javascript
// Backend validation
watchRewardedAd: async (req, res) => {
  // 1. Check if balance is actually 0
  if (user.balance !== 0) {
    return res.status(400).json({ 
      error: 'Can only watch ad when balance is 0' 
    });
  }
  
  // 2. Rate limiting (prevent spam)
  const timeSinceLastAd = Date.now() - user.lastAdWatched;
  if (timeSinceLastAd < 60000) { // 1 minute cooldown
    return res.status(429).json({ 
      error: 'Please wait before watching another ad' 
    });
  }
  
  // 3. Server-side verification (for real ad networks)
  // Verify ad completion with ad network API
  const verified = await verifyAdCompletion(req.body.adToken);
  if (!verified) {
    return res.status(400).json({ error: 'Ad verification failed' });
  }
  
  // Give reward
  user.watchRewardedAd(1000);
  await user.save();
}
```

---

## 📊 Analytics Dashboard

Track these metrics:

```
Daily Metrics:
- Total impressions (banner ads)
- Total ad watches (rewarded)
- Unique users who watched ads
- Average coins earned per user
- Revenue (from ad networks)

User Metrics:
- % of users who watch ads
- Average ads per user
- Time between ads
- Retention after watching ad

Financial Metrics:
- CPM (banner)
- eCPM (rewarded)
- Revenue per user (ARPU)
- Total monthly revenue
```

---

## 🚦 Testing

### Development Testing
```javascript
// Current demo mode (simulated ads)
// No real ad networks required

// Test scenarios:
1. Reduce balance to 0 → Modal appears ✓
2. Click "Watch Ad" → 15s simulation ✓
3. Complete ad → 1000 coins added ✓
4. Profile shows ad stats ✓
5. Banner ads display ✓
```

### Production Testing
```javascript
// Use test mode for ad networks

// Google AdSense test mode:
data-adtest="on"

// AdMob test device:
MobileAds().setRequestConfiguration({
  testDeviceIdentifiers: ['DEVICE_ID'],
});

// PropellerAds test mode:
Set "Test Mode" in dashboard
```

---

## 💡 Monetization Tips

### 1. **Optimize Ad Placement**
- Top banner: High visibility
- Bottom banner: Less intrusive
- Don't place ads mid-game

### 2. **Increase Ad Watch Rate**
```
- Make reward valuable (1000 coins = 10-20 games)
- Show modal immediately when balance = 0
- Clear messaging: "15 seconds = Keep playing!"
```

### 3. **Diversify Ad Networks**
```
Primary: Google AdSense (high quality)
Secondary: PropellerAds (higher CPM)
Tertiary: Media.net (fill rate)
```

### 4. **Premium Option**
```
Consider adding:
- "Remove Ads" for $4.99
- "VIP Pass" with no ads + bonus coins
- Creates revenue from both ads AND purchases
```

---

## 📞 Support & Resources

### Ad Networks
- **Google AdSense**: https://www.google.com/adsense/
- **Google AdMob**: https://admob.google.com/
- **PropellerAds**: https://propellerads.com
- **Unity Ads**: https://unity.com/products/unity-ads
- **Media.net**: https://www.media.net

### Documentation
- AdSense Help: https://support.google.com/adsense
- AdMob Docs: https://developers.google.com/admob
- PropellerAds Docs: https://docs.propellerads.com

---

## ⚠️ Legal Requirements

### 1. **Privacy Policy**
Must disclose:
- Use of advertising networks
- Data collection by ad partners
- Cookie usage
- User tracking

### 2. **Terms of Service**
Include:
- Virtual currency has no real value
- Ads are optional but help keep service free
- Fair use policy

### 3. **GDPR Compliance** (if serving EU users)
- Cookie consent banner
- Data processing agreements with ad networks
- User right to opt-out

### 4. **COPPA Compliance** (if allowing users under 13)
- Parental consent
- Limit data collection
- Use child-safe ad networks

---

## 🎉 Summary

### What You Get:
✅ Banner ads (passive income)
✅ Rewarded video ads (high engagement)
✅ Auto-detection when balance = 0
✅ User-friendly modal UI
✅ Ad statistics tracking
✅ Profile page integration
✅ Security & fraud prevention
✅ Production-ready comments

### Revenue Potential:
- **10K users** = ~$700/day = $21K/month
- **100K users** = ~$7K/day = $210K/month
- Scales with user base!

### Next Steps:
1. ✅ Deploy backend + frontend
2. ✅ Sign up for ad network (AdSense recommended)
3. ✅ Replace placeholder code with real ads
4. ✅ Test in production
5. ✅ Monitor metrics
6. ✅ Optimize for revenue!

**You're ready to monetize! 🚀💰**
