# API Documentation

Complete API reference for the Casino backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Auth Required:** No

**Request Body:**
```json
{
  "username": "player123",
  "email": "player@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "player123",
      "email": "player@example.com",
      "balance": 1000
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login User

Authenticate and receive a JWT token.

**Endpoint:** `POST /auth/login`

**Auth Required:** No

**Request Body:**
```json
{
  "email": "player@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "player123",
      "email": "player@example.com",
      "balance": 1000,
      "gamesPlayed": 0,
      "totalWagered": 0,
      "totalWon": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Get Current User

Get authenticated user's information.

**Endpoint:** `GET /auth/me`

**Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "player123",
      "email": "player@example.com",
      "balance": 950.50,
      "gamesPlayed": 15,
      "totalWagered": 500,
      "totalWon": 450.50,
      "serverSeedHash": "abc123...",
      "clientSeed": "def456...",
      "nonce": 15
    }
  }
}
```

---

### Update Seeds

Update client seed or rotate server seed for provably fair gaming.

**Endpoint:** `POST /auth/update-seeds`

**Auth Required:** Yes

**Request Body:**
```json
{
  "clientSeed": "my_new_client_seed",
  "rotateServerSeed": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Seeds updated successfully",
  "data": {
    "clientSeed": "my_new_client_seed",
    "serverSeedHash": "new_hash...",
    "nonce": 0
  }
}
```

---

## Slots Game Endpoints

### Play Slots

Spin the slot machine.

**Endpoint:** `POST /games/slots/spin`

**Auth Required:** Yes

**Rate Limit:** 3 requests per second

**Request Body:**
```json
{
  "betAmount": 10,
  "clientSeed": "optional_custom_seed"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "result": {
    "reels": [
      ["cherry", "lemon", "orange"],
      ["cherry", "cherry", "lemon"],
      ["cherry", "plum", "bell"],
      ["lemon", "orange", "cherry"],
      ["cherry", "cherry", "seven"]
    ],
    "winningLines": [
      {
        "line": 0,
        "symbol": "cherry",
        "count": 3,
        "payout": 30
      }
    ],
    "payout": 30,
    "profit": 20,
    "multiplier": "3.00",
    "balance": 1020,
    "isWin": true
  },
  "provablyFair": {
    "clientSeed": "abc123",
    "serverSeedHash": "hash...",
    "nonce": 5
  },
  "gameId": "507f1f77bcf86cd799439011"
}
```

---

### Get Slots Configuration

Get game configuration and rules.

**Endpoint:** `GET /games/slots/config`

**Auth Required:** No

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "reels": 5,
    "rows": 3,
    "symbols": [
      { "id": "cherry", "value": 1 },
      { "id": "lemon", "value": 2 },
      { "id": "seven", "value": 20 }
    ],
    "paylines": [[1,1,1,1,1], [0,0,0,0,0]],
    "minBet": 1,
    "maxBet": 100
  }
}
```

---

## Dice Game Endpoints

### Play Dice

Roll the dice.

**Endpoint:** `POST /games/dice/roll`

**Auth Required:** Yes

**Rate Limit:** 3 requests per second

**Request Body:**
```json
{
  "betAmount": 10,
  "target": 50,
  "isOver": true,
  "clientSeed": "optional_custom_seed"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "result": {
    "rollResult": 75.23,
    "target": 50,
    "isOver": true,
    "isWin": true,
    "payout": 19.60,
    "profit": 9.60,
    "multiplier": 1.96,
    "winChance": "50.00",
    "balance": 1009.60
  },
  "provablyFair": {
    "clientSeed": "abc123",
    "serverSeedHash": "hash...",
    "nonce": 6
  },
  "gameId": "507f1f77bcf86cd799439012"
}
```

---

### Get Dice Configuration

Get game configuration.

**Endpoint:** `GET /games/dice/config`

**Auth Required:** No

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "minNumber": 0,
    "maxNumber": 100,
    "minBet": 1,
    "maxBet": 100,
    "minChance": 1,
    "maxChance": 95,
    "houseEdge": 0.01
  }
}
```

---

## Crash Game Endpoints

### Place Crash Bet

Place a bet in the current crash game.

**Endpoint:** `POST /games/crash/bet`

**Auth Required:** Yes

**Rate Limit:** 3 requests per second

**Request Body:**
```json
{
  "betAmount": 10
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bet placed successfully",
  "gameId": "abc123",
  "betAmount": 10,
  "balance": 990
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot place bet at this time"
}
```

---

### Cash Out from Crash

Cash out from the current crash game.

**Endpoint:** `POST /games/crash/cashout`

**Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cashed out successfully",
  "multiplier": 2.45,
  "payout": 24.50,
  "profit": 14.50,
  "balance": 1014.50
}
```

---

### Get Current Crash Game

Get the current crash game state.

**Endpoint:** `GET /games/crash/current`

**Auth Required:** No

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "gameId": "abc123",
    "status": "running",
    "currentMultiplier": 1.85,
    "serverSeedHash": "hash...",
    "bets": [
      {
        "username": "player1",
        "betAmount": 10,
        "cashedOut": false,
        "cashoutMultiplier": null
      },
      {
        "username": "player2",
        "betAmount": 25,
        "cashedOut": true,
        "cashoutMultiplier": 1.50
      }
    ]
  }
}
```

---

### Get Crash Configuration

Get game configuration.

**Endpoint:** `GET /games/crash/config`

**Auth Required:** No

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "minBet": 1,
    "maxBet": 100,
    "minMultiplier": 1.0,
    "maxMultiplier": 10000.0
  }
}
```

---

## User Endpoints

### Get Balance

Get user's current balance and stats.

**Endpoint:** `GET /user/balance`

**Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "balance": 1234.56,
    "totalWagered": 5000,
    "totalWon": 4734.56,
    "gamesPlayed": 150
  }
}
```

---

### Get Game History

Get user's game history with pagination.

**Endpoint:** `GET /user/history?limit=20&page=1&gameType=slots`

**Auth Required:** Yes

**Query Parameters:**
- `limit` (optional): Number of results per page (default: 20)
- `page` (optional): Page number (default: 1)
- `gameType` (optional): Filter by game type (slots, dice, crash)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "user": "507f191e810c19729de860ea",
        "username": "player123",
        "gameType": "slots",
        "betAmount": 10,
        "payout": 30,
        "profit": 20,
        "multiplier": 3,
        "isWin": true,
        "createdAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

---

### Get User Statistics

Get detailed user statistics.

**Endpoint:** `GET /user/stats`

**Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "balance": 1234.56,
    "totalWagered": 5000,
    "totalWon": 4734.56,
    "gamesPlayed": 150,
    "gamesByType": {
      "slots": 75,
      "dice": 50,
      "crash": 25
    },
    "biggestWin": {
      "gameType": "crash",
      "profit": 250,
      "multiplier": 5.5,
      "date": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

---

### Get Game Details

Get details of a specific game.

**Endpoint:** `GET /user/game/:id`

**Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "gameType": "slots",
    "betAmount": 10,
    "payout": 30,
    "profit": 20,
    "multiplier": 3,
    "gameData": {
      "reels": [["cherry", "cherry", "cherry"]],
      "winningLines": []
    },
    "provablyFair": {
      "clientSeed": "abc123",
      "serverSeedHash": "hash...",
      "nonce": 5
    },
    "isWin": true,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### Get Global Game History

Get recent games from all users (public).

**Endpoint:** `GET /games/history?limit=50&gameType=slots`

**Auth Required:** No

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)
- `gameType` (optional): Filter by game type

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "username": "player123",
      "gameType": "slots",
      "betAmount": 10,
      "payout": 30,
      "profit": 20,
      "multiplier": 3,
      "isWin": true,
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "betAmount",
      "message": "Bet amount must be greater than 0"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Route not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many bets placed, please slow down."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## WebSocket Events

Connect to: `http://localhost:5000`

### Client Events

**crash:join** - Join crash game room
```javascript
socket.emit('crash:join');
```

**crash:leave** - Leave crash game room
```javascript
socket.emit('crash:leave');
```

### Server Events

**crash:game_state** - Current game state
```javascript
socket.on('crash:game_state', (data) => {
  console.log(data.gameId, data.status, data.currentMultiplier);
});
```

**crash:new_game** - New game created
```javascript
socket.on('crash:new_game', (data) => {
  console.log('New game:', data.gameId);
});
```

**crash:game_started** - Game started
```javascript
socket.on('crash:game_started', (data) => {
  console.log('Game started!');
});
```

**crash:multiplier_update** - Multiplier update (every 100ms)
```javascript
socket.on('crash:multiplier_update', (data) => {
  console.log('Multiplier:', data.multiplier);
});
```

**crash:game_crashed** - Game crashed
```javascript
socket.on('crash:game_crashed', (data) => {
  console.log('Crashed at:', data.crashPoint);
});
```

**crash:bet_placed** - Player placed bet
```javascript
socket.on('crash:bet_placed', (data) => {
  console.log(data.bet.username, 'placed', data.bet.betAmount);
});
```

**crash:player_cashed_out** - Player cashed out
```javascript
socket.on('crash:player_cashed_out', (data) => {
  console.log(data.username, 'cashed out at', data.multiplier);
});
```

---

## Rate Limiting

- **General API:** 100 requests per 15 minutes
- **Auth endpoints:** 10 requests per 15 minutes
- **Bet endpoints:** 3 requests per second

---

## Notes

- All monetary values are in virtual coins (no real money)
- Timestamps are in ISO 8601 format (UTC)
- All game results are provably fair and verifiable
- WebSocket connection required for real-time crash game updates
