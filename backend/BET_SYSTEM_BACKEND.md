# Backend - Globalny System Zarządzania Stawkami

## Zaktualizowane Pliki

### Nowy Moduł
**`src/utils/betManager.js`**
- Centralna logika walidacji stawek
- Dynamiczne obliczanie limitów na podstawie balansu
- Funkcje: `calculateBetLimits()`, `validateBet()`, `clampBet()`

### Zaktualizowane Serwisy

1. **`src/services/dice.service.js`**
   - Import `validateBet` z betManager
   - Usunięto sprawdzanie MIN_BET/MAX_BET
   - Używa dynamicznej walidacji

2. **`src/services/slots.service.js`**
   - Import `validateBet` z betManager
   - Usunięto sprawdzanie MIN_BET/MAX_BET
   - Używa dynamicznej walidacji

3. **`src/services/coinflip.service.js`**
   - Import `validateBet` z betManager
   - Usunięto sprawdzanie MIN_BET/MAX_BET
   - Używa dynamicznej walidacji

4. **`src/services/mines.service.js`**
   - Import `validateBet` z betManager
   - Usunięto sprawdzanie MIN_BET/MAX_BET
   - Używa dynamicznej walidacji

5. **`src/services/trading.service.js`**
   - Import `validateBet` z betManager
   - Usunięto sprawdzanie MIN_BET/MAX_BET dla stake
   - Używa dynamicznej walidacji

6. **`src/services/crash.service.js`**
   - Import `validateBet` z betManager
   - Usunięto sprawdzanie MIN_BET/MAX_BET
   - Używa dynamicznej walidacji

## Logika Walidacji

### Przed
```javascript
if (betAmount < GAME_CONFIG.MIN_BET) {
  throw new Error(`Minimum bet is ${GAME_CONFIG.MIN_BET} coins`);
}

if (betAmount > GAME_CONFIG.MAX_BET) {
  throw new Error(`Maximum bet is ${GAME_CONFIG.MAX_BET} coins`);
}

if (betAmount > userBalance) {
  throw new Error('Insufficient balance');
}
```

### Po
```javascript
const { validateBet } = require('../utils/betManager');

// Automatyczna walidacja z dynamicznymi limitami
validateBet(betAmount, userBalance);
// Rzuca błąd jeśli stawka jest nieprawidłowa
```

## Dynamiczne Limity

### Obliczanie
```javascript
function calculateBetLimits(balance) {
  const min = Math.max(1, Math.floor(balance * 0.02)); // 2% balansu
  const max = Math.floor(balance); // 100% balansu
  
  return { min, max };
}
```

### Przykłady

| Balans | Min (2%) | Max (100%) |
|--------|----------|------------|
| 50     | 1        | 50         |
| 1,000  | 20       | 1,000      |
| 5,000  | 100      | 5,000      |
| 25,000 | 500      | 25,000     |
| 100,000| 2,000    | 100,000    |

## Config Pliki

### Uwaga
Wartości `MIN_BET` i `MAX_BET` w `game.config.js` są **ignorowane** przez nowy system.
Config nadal może je zawierać dla kompatybilności wstecznej, ale nie są używane w walidacji.

## Komunikaty Błędów

### Nowe Komunikaty
```javascript
// Stawka za niska
"Minimum bet is 100 coins (2% of your balance)"

// Stawka za wysoka
"Maximum bet is 5000 coins (your current balance)"

// Niewystarczający balans
"Insufficient balance"
```

## Testowanie

### Test Manualny
1. Ustaw balans gracza na 5,000 coins
2. Spróbuj postawić 50 coins - **Powinien zwrócić błąd**: min = 100
3. Spróbuj postawić 100 coins - **Powinno działać**
4. Spróbuj postawić 5,000 coins - **Powinno działać** (all-in)
5. Spróbuj postawić 5,001 coins - **Powinien zwrócić błąd**: max = 5,000

### Test z Dużym Balansem
1. Ustaw balans gracza na 100,000 coins
2. Spróbuj postawić 10,000 coins - **Powinno działać**
3. Spróbuj postawić 50,000 coins - **Powinno działać**
4. Spróbuj postawić 100,000 coins - **Powinno działać** (all-in)

## Migracja

### Brak Breaking Changes
- API pozostaje niezmienione
- Endpointy pozostają takie same
- Format requestów i responsów bez zmian
- Tylko logika walidacji została zaktualizowana

### Kompatybilność
- Stary frontend będzie nadal działał (choć może otrzymywać inne błędy)
- Nowy frontend korzysta z pełnej dynamicznej walidacji
- Config wartości min/max są ignorowane ale nie muszą być usuwane

## Deployment

### Restart Wymagany
Po wdrożeniu zmian, restart serwera Node.js jest **wymagany**, aby załadować nowy moduł betManager.

### Bazy Danych
**NIE** wymagane żadne zmiany w bazie danych.

## Troubleshooting

### Problem: "Maximum bet is 100 coins"
**Przyczyna**: Stary kod nadal używa config limitów
**Rozwiązanie**: Upewnij się że wszystkie serwisy importują i używają `validateBet` z betManager

### Problem: Frontend pokazuje inne limity niż backend
**Przyczyna**: Frontend i backend używają różnych obliczeń
**Rozwiązanie**: Oba powinny używać tej samej logiki (2% min, 100% max)

### Problem: Błąd "validateBet is not a function"
**Przyczyna**: Moduł betManager nie został załadowany
**Rozwiązanie**: Restart serwera Node.js

## Przyszłe Rozszerzenia

Możliwe rozszerzenia:
- Różne profile limitów (VIP użytkownicy, nowi gracze)
- Rate limiting (max stawka na dzień/tydzień)
- Anti-cheat (detekcja nietypowych wzorców)
- Personalizowane limity per użytkownik
