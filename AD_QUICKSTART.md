# 📺 Ad System - Quick Start Guide

## ✅ System Is Live!

Your virtual casino now has a complete ad monetization system:

---

## 🎯 Features

### 1. **Banner Ads** (Always Visible)
- **Top of page**: High visibility
- **Bottom of page**: Non-intrusive
- **Placeholder**: Ready for Google AdSense

### 2. **Rewarded Ads** (Balance = 0)
- **Auto-trigger**: Modal appears when balance hits 0
- **Reward**: 1000 coins per ad
- **User-friendly**: Clear "Watch ad to continue" flow

### 3. **Statistics Tracking**
- **Profile page**: Shows ads watched, coins earned
- **Backend**: Tracks all ad interactions
- **Analytics-ready**: Easy to integrate with Google Analytics

---

## 🚀 How It Works

### User Flow:

```
1. User plays games (Slots, Dice, Crash, Trading, etc.)
   ↓
2. Balance gradually decreases
   ↓
3. Balance reaches 0
   ↓
4. 🎬 MODAL APPEARS:
   "Out of Coins? Watch a 15s ad to get 1000 coins!"
   ↓
5. User clicks "Watch Ad"
   ↓
6. Ad plays (15 seconds, simulated in demo)
   ↓
7. User clicks "Claim Reward"
   ↓
8. ✅ 1000 coins added to balance!
   ↓
9. Continue playing! 🎰
```

---

## 🧪 Testing

### Test Scenario 1: Reach Balance 0
```bash
1. Login to your account
2. Play games until balance = 0
3. Modal should appear automatically
4. Click "Watch Ad & Get 1000 Coins"
5. Wait 15 seconds (progress bar)
6. Click "Claim 1000 Coins"
7. Check balance: Should be 1000!
```

### Test Scenario 2: Banner Ads
```bash
1. Navigate to any page
2. See banner at top (purple gradient)
3. See banner at bottom (purple gradient)
4. These are placeholders - replace with real ads
```

### Test Scenario 3: Profile Stats
```bash
1. Watch at least 1 ad
2. Go to /profile
3. See "Ad Rewards" section:
   - Ads Watched: 1
   - Coins Earned: 1000
   - Next Reward: Available (if balance = 0)
```

---

## 💻 Current Implementation (Demo Mode)

### Backend Endpoints:
```
POST /api/ads/watch     → Watch ad & get 1000 coins
GET  /api/ads/status    → Check if user can watch ad
GET  /api/ads/config    → Get reward configuration
```

### Frontend Components:
```
BannerAd.tsx         → Placeholder banner (top/bottom)
RewardedAdModal.tsx  → Full ad watching flow
Layout.tsx           → Auto-show modal when balance = 0
Profile.tsx          → Ad statistics display
```

### Database Fields (User model):
```javascript
{
  adsWatched: 0,           // Increment on each ad
  coinsEarnedFromAds: 0,   // Total coins from ads
  lastAdWatched: null,     // Timestamp
  canWatchAd: false        // Auto-set when balance = 0
}
```

---

## 🎨 UI Screenshots (What You'll See)

### 1. Banner Ads
```
┌─────────────────────────────────────────┐
│  📺 Advertisement Space                 │
│  Google AdSense / PropellerAds banner   │
│  Supports FREE virtual casino 💰        │
└─────────────────────────────────────────┘
```

### 2. Rewarded Ad Modal (Balance = 0)
```
┌─────────────────────────────────────────┐
│  💰 Out of Coins?                       │
│  Watch an ad to continue playing!       │
├─────────────────────────────────────────┤
│  Your Balance: 0 coins                  │
│  You'll Get: +1000 coins                │
├─────────────────────────────────────────┤
│  📺 Watch a 15-second ad                │
│  [Watch Ad & Get 1000 Coins]            │
└─────────────────────────────────────────┘
```

### 3. Profile - Ad Stats
```
┌─────────────────────────────────────────┐
│  📺 Ad Rewards                          │
├─────────────────────────────────────────┤
│  Ads Watched: 5                         │
│  Coins Earned: 5000                     │
│  Next Reward: 1000                      │
└─────────────────────────────────────────┘
```

---

## 🔄 Production Setup (Replace Demo Ads)

### Step 1: Sign Up for Ad Network

**Recommended: Google AdSense**
1. Go to: https://www.google.com/adsense/
2. Create account
3. Add your website
4. Get approved (usually 24-48 hours)
5. Get your Publisher ID: `ca-pub-XXXXXXXXXXXXXXXX`

### Step 2: Replace Banner Ad Code

In `frontend/src/components/BannerAd.tsx`:

```typescript
// REMOVE the demo placeholder
// REPLACE with:

<ins className="adsbygoogle"
     style={{display:'block', height: '90px'}}
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="1234567890"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>

<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

### Step 3: Replace Rewarded Ad

In `frontend/src/components/RewardedAdModal.tsx`:

```typescript
// REMOVE simulateAdWatching()
// REPLACE with real ad network SDK

// Option A: Google Ad Manager
const loadRewardedAd = () => {
  googletag.cmd.push(() => {
    const slot = googletag.defineOutOfPageSlot(
      '/YOUR-NETWORK-CODE/rewarded',
      googletag.enums.OutOfPageFormat.REWARDED
    );
    
    slot.addService(googletag.pubads());
    googletag.enableServices();
    googletag.display(slot);
  });
};

// Option B: PropellerAds
window.propellerads.push({
  zone_id: YOUR_ZONE_ID,
  onReward: () => {
    claimReward(); // Give 1000 coins
  }
});
```

### Step 4: Add Ad Scripts to index.html

```html
<!-- Google AdSense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>

<!-- OR PropellerAds -->
<script>
  (function(d,z,s){
    s.src='https://'+d+'/400/'+z;
    try{(document.body||document.documentElement).appendChild(s)}
    catch(e){}
  })('yourzone.com',1234567,document.createElement('script'))
</script>
```

---

## 💰 Revenue Estimates

### With 1,000 Daily Users:
```
Banner Ads (CPM ~$2):
1,000 users × 10 pages = 10,000 impressions
Revenue: (10,000/1000) × $2 = $20/day = $600/month

Rewarded Ads (eCPM ~$10):
500 users watch ad
Revenue: (500/1000) × $10 = $5/day = $150/month

Total: ~$750/month
```

### With 10,000 Daily Users:
```
Banner: $200/day = $6,000/month
Rewarded: $50/day = $1,500/month
Total: ~$7,500/month
```

### With 100,000 Daily Users:
```
Banner: $2,000/day = $60,000/month
Rewarded: $500/day = $15,000/month
Total: ~$75,000/month 🚀
```

---

## 🎯 Best Practices

### 1. **Don't Spam Users**
✅ Only show rewarded ad when balance = 0
✅ Clear messaging: "Watch to continue"
✅ Make it feel helpful, not forced

❌ Don't show ads mid-game
❌ Don't force ads every 5 minutes
❌ Don't show ads without context

### 2. **Optimize Reward Amount**
```
Too Low (100 coins):
- Users frustrated
- Not worth watching ad

Sweet Spot (1000 coins):
- 10-20 games worth
- Feels valuable
- High watch rate

Too High (10,000 coins):
- Users abuse system
- No gameplay challenge
```

### 3. **Track Everything**
```javascript
// Analytics to monitor:
- Ad watch rate (% of users)
- Average ads per user
- Coins distributed
- User retention after ad
- Revenue per user (ARPU)
```

---

## 🐛 Troubleshooting

### Modal doesn't appear when balance = 0
```bash
# Check:
1. User is logged in
2. Backend /api/ads/status returns canWatchAd: true
3. Check browser console for errors
4. Refresh page (F5)
```

### "Can only watch ad when balance is 0" error
```bash
# User tried to watch ad with balance > 0
# This is correct behavior!
# Modal should only show at balance = 0
```

### Banner ads not showing
```bash
# In demo mode:
- Shows placeholder purple gradient
- This is expected!

# In production:
1. Check AdSense approval status
2. Verify ad code is correct
3. Check for ad blockers
4. Wait 24 hours after setup
```

---

## 📊 Analytics Setup

### Google Analytics Integration
```javascript
// Track ad watches
gtag('event', 'ad_watched', {
  event_category: 'monetization',
  event_label: 'rewarded_ad',
  value: 1000 // coins given
});

// Track ad impressions
gtag('event', 'ad_impression', {
  event_category: 'monetization',
  event_label: 'banner_ad',
  ad_position: 'top'
});
```

---

## 🚀 Next Steps

1. ✅ **Test Demo** (Current)
   - Play games until balance = 0
   - Watch simulated ad
   - Verify 1000 coins received

2. ✅ **Sign Up for Ads** (Production)
   - Google AdSense for banners
   - Google Ad Manager for rewarded
   - Get approved (~48 hours)

3. ✅ **Replace Demo Code**
   - Swap placeholder with real ads
   - Test with ad network test mode
   - Deploy to production

4. ✅ **Monitor & Optimize**
   - Track metrics
   - Adjust reward amounts
   - A/B test ad placements
   - Maximize revenue!

---

## 📞 Support

**Documentation:**
- Full docs: `AD_SYSTEM_DOCS.md`
- Google AdSense: https://support.google.com/adsense
- PropellerAds: https://docs.propellerads.com

**Common Issues:**
- Modal not showing → Check browser console
- Ad not playing → Replace with real ad network
- Revenue low → Increase traffic, optimize placements

---

## ✅ You're Ready!

**Current Status:**
- ✅ Backend ad system: Complete
- ✅ Frontend UI: Complete
- ✅ Auto-detection: Working
- ✅ Statistics tracking: Working
- ✅ Demo mode: Functional

**To Go Live:**
1. Sign up for ad network
2. Replace demo code with real ads
3. Deploy & start earning! 💰

**Revenue Potential:** Scale with your user base! 🚀

---

**Happy Monetizing! 🎰💸**
