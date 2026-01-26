# 📊 Advanced Trading System - Documentation

## Overview

Advanced Paper Trading system with **real-time PnL**, **leverage**, **dynamic timeframes**, and **liquidation mechanism**. This is a demo casino game with virtual currency only.

---

## 🎯 Features

### 1. **Leverage Trading**
- **Options:** 1x, 2x, 5x, 10x
- **Risk/Reward:** Higher leverage = higher profits AND losses
- **Liquidation:** Position auto-closes at 80% loss

### 2. **Dynamic Timeframes**
- **1 Minute** - Fast scalping (60 candles @ 1s)
- **5 Minutes** - Short-term (60 candles @ 5s)
- **15 Minutes** - Medium-term (60 candles @ 15s)
- **30 Minutes** - Swing trading (60 candles @ 30s)
- **1 Hour** - Long-term (60 candles @ 1m)

### 3. **Position Types**
- **LONG** - Profit when price goes UP
- **SHORT** - Profit when price goes DOWN

### 4. **Liquidation System**
- Auto-closes positions at 80% loss
- Formula: `liquidationPrice = entryPrice × (1 ± 0.8 / leverage)`
- Protects from losing more than stake

---

## 💡 How It Works

### Opening a Position

1. **Select Asset** (BTC, ETH, BNB, SOL, ADA)
2. **Choose Direction** (LONG or SHORT)
3. **Set Leverage** (1x - 10x)
4. **Enter Stake** (amount to risk)
5. **Open Position**

**Example:**
```
Asset: BTC @ $45,000
Direction: LONG
Leverage: 5x
Stake: 100 coins
Liquidation: $44,200 (1.8% drop)

If BTC rises to $45,900 (+2%):
PnL = 100 × 5 × 0.02 = +10 coins

If BTC drops to $44,200 (-1.8%):
Position LIQUIDATED! Loss = -80 coins
```

### Real-Time PnL Calculation

**LONG Position:**
```javascript
priceChange = currentPrice - entryPrice
percentChange = priceChange / entryPrice
PnL = stake × leverage × percentChange
```

**SHORT Position:**
```javascript
priceChange = entryPrice - currentPrice
percentChange = priceChange / entryPrice
PnL = stake × leverage × percentChange
```

### Liquidation Price

**LONG:**
```javascript
liquidationPrice = entryPrice × (1 - 0.8 / leverage)
```

**SHORT:**
```javascript
liquidationPrice = entryPrice × (1 + 0.8 / leverage)
```

---

## 🔧 Technical Architecture

### Backend

**Price Simulation:**
- Base candles: 1 second intervals
- Stores 1 hour of history (3600 candles)
- Aggregates into timeframes on-demand

**Liquidation Checker:**
- Runs every 2 seconds
- Checks all open positions
- Auto-closes if loss >= 80%

**Data Flow:**
```
Price Update (1s) → Base Candles → Aggregation → Client
                ↓
         Liquidation Check (2s)
```

### Frontend

**Chart Rendering:**
- HTML5 Canvas for performance
- Real-time updates every 1 second
- Dynamic scaling based on timeframe

**State Management:**
- Market data refreshes every 1s
- Open positions update every 1s
- Live PnL calculation client-side

---

## 📊 Timeframe Aggregation

**Example:** 5-minute timeframe

```javascript
Base: [1s candles] → Group by 5min → Aggregate OHLC
      
Aggregation:
- open = first candle's open
- high = max of all highs
- low = min of all lows
- close = last candle's close
- volume = sum of all volumes
```

---

## 🎮 UI Components

### Overview Page
- **Asset Cards:** Shows current price, open positions, PnL
- **Summary:** Total staked, total PnL across all assets

### Individual Asset Page
- **Timeframe Selector:** Switch between 1m, 5m, 15m, 30m, 1h
- **Live Chart:** Candlestick chart with current price line
- **Trading Panel:**
  - Direction (LONG/SHORT)
  - Leverage (1x-10x)
  - Stake input
  - Risk info (liquidation price, max profit)
- **Open Positions:** Real-time PnL, close button
- **History:** Closed positions with results

---

## ⚠️ Risk Management

### Leverage Examples

| Leverage | Price Change | PnL | Liquidation Threshold |
|----------|--------------|-----|----------------------|
| 1x | ±10% | ±10 | 80% loss |
| 2x | ±10% | ±20 | 40% drop |
| 5x | ±10% | ±50 | 16% drop |
| 10x | ±10% | ±100 | 8% drop |

**Key Points:**
- Higher leverage = faster liquidation
- 10x leverage liquidates at ~8% price move
- Always monitor liquidation price

---

## 🚀 Usage Examples

### Conservative Strategy (1x leverage)
```
Stake: 100 coins
Leverage: 1x
Risk: 80 coins max loss
Reward: Unlimited (minus house edge)
```

### Aggressive Strategy (10x leverage)
```
Stake: 10 coins
Leverage: 10x
Risk: 8 coins max loss (liquidation @ 8% move)
Reward: 80 coins on 8% favorable move
```

### Multiple Positions
```
BTC: LONG 2x @ $45,000
ETH: SHORT 5x @ $2,500
SOL: LONG 1x @ $100

Total exposure: Diversified across assets
```

---

## 🔐 Provably Fair

Each position includes:
- Client seed
- Server seed (hashed)
- Nonce

Can verify randomness of price movements (though this is demo with simulated prices).

---

## 📱 Mobile Friendly

- Responsive design
- Touch-friendly buttons
- Optimized chart rendering
- Swipe gestures supported

---

## ⚡ Performance

**Optimizations:**
- Canvas rendering (60 FPS)
- Efficient candle aggregation
- Lazy loading of history
- WebSocket for real-time data (optional)

**Scalability:**
- Supports unlimited assets
- Handles 1000s of positions
- Auto-cleanup of old history

---

## 🎯 Future Enhancements

Possible additions:
- ✅ Stop-loss / Take-profit orders
- ✅ Trailing stop
- ✅ Multiple timeframe analysis
- ✅ Technical indicators (RSI, MACD, MA)
- ✅ Order book visualization
- ✅ WebSocket price streaming
- ✅ Mobile app (React Native)

---

## 🛡️ Safety

**This is DEMO ONLY:**
- Virtual currency only
- No real money
- Educational purposes
- Simulated market data

**Not Financial Advice:**
- Trading involves risk
- Past performance ≠ future results
- Always do your own research

---

## 📞 Support

For questions or issues:
1. Check browser console for errors
2. Verify backend is running (`http://localhost:5000`)
3. Check network tab for API responses
4. Review server logs

---

## 📝 License

Virtual casino game for entertainment only. All virtual currency.

**Made with ❤️ using React, TypeScript, Node.js, and MongoDB**
