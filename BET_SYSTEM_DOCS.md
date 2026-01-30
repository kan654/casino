# Globalny System Zarządzania Stawkami

## Przegląd

System globalnego zarządzania stawkami zapewnia jednolite, dynamiczne limity stawek dla wszystkich gier na platformie. System automatycznie dostosowuje limity na podstawie aktualnego balansu gracza.

## Główne Założenia

### 1. Dynamiczne Limity
- **Minimalna stawka**: 2% aktualnego balansu (minimum 1 coin)
- **Maksymalna stawka**: 100% aktualnego balansu (all-in dozwolony)
- **Brak sztywnych limitów**: Nie ma górnego limitu typu "max 100"

### 2. Przykłady Limitów

| Balans Gracza | Min. Stawka | Max. Stawka |
|---------------|-------------|-------------|
| 50            | 1           | 50          |
| 500           | 10          | 500         |
| 5,000         | 100         | 5,000       |
| 25,000        | 500         | 25,000      |
| 100,000       | 2,000       | 100,000     |

### 3. Centralizacja
Wszystkie gry używają tego samego modułu (`betManager.ts`):
- Dice
- Slots
- Coinflip
- Mines
- Trading
- Crash

## Implementacja

### Moduł: `src/utils/betManager.ts`

#### Funkcje Publiczne:

**`calculateBetLimits(balance: number): BetLimits`**
```typescript
// Oblicza dynamiczne limity na podstawie balansu
const limits = calculateBetLimits(5000);
// { min: 100, max: 5000 }
```

**`validateBet(betAmount: number, balance: number): ValidationResult`**
```typescript
// Waliduje czy stawka jest dozwolona
const validation = validateBet(150, 5000);
// { isValid: true }

const validation = validateBet(50, 5000);
// { isValid: false, message: "Minimalna stawka: 100 coins" }
```

**`formatLimitsMessage(balance: number): string`**
```typescript
// Formatuje komunikat o limitach dla użytkownika
const message = formatLimitsMessage(5000);
// "Min: 100 | Max: 5000 (All-in)"
```

**`getSuggestedBets(balance: number): number[]`**
```typescript
// Zwraca sugerowane szybkie stawki (5%, 10%, 25%, 50% balansu)
const suggestions = getSuggestedBets(5000);
// [250, 500, 1250, 2500]
```

**`clampBet(betAmount: number, balance: number): number`**
```typescript
// Dostosowuje stawkę do dopuszczalnych limitów
const adjusted = clampBet(50, 5000); // 100 (min)
const adjusted = clampBet(10000, 5000); // 5000 (max)
```

## Użycie w Grach

### Przykład Implementacji

```typescript
import { 
  calculateBetLimits, 
  validateBet, 
  formatLimitsMessage, 
  getSuggestedBets, 
  clampBet 
} from '../utils/betManager';

// Walidacja przed grą
const handlePlay = async () => {
  if (!user) return;
  
  const validation = validateBet(betAmount, user.balance);
  if (!validation.isValid) {
    toast.error(validation.message);
    return;
  }
  
  // Kontynuuj grę...
};

// UI - Input ze stawką
<input
  type="number"
  value={betAmount}
  onChange={(e) => {
    const value = Number(e.target.value);
    if (user) {
      setBetAmount(clampBet(value, user.balance));
    }
  }}
/>

// UI - Komunikat o limitach
{user && (
  <p className="text-xs text-dark-400">
    {formatLimitsMessage(user.balance)}
  </p>
)}

// UI - Szybkie przyciski
<div className="flex space-x-2">
  {user && getSuggestedBets(user.balance).map((amount) => (
    <button
      key={amount}
      onClick={() => setBetAmount(amount)}
      className="btn btn-secondary"
    >
      {amount}
    </button>
  ))}
</div>
```

## UX Features

### 1. Automatyczne Dostosowanie
Gdy użytkownik wpisuje stawkę poza limitami, system automatycznie dostosowuje ją do najbliższej dopuszczalnej wartości.

### 2. Przyciski +5% / -5%
Zamiast sztywnych przycisków +5 / -5, system używa przycisków zwiększających/zmniejszających stawkę o 5% maksymalnej stawki.

### 3. Inteligentne Sugestie
Przyciski szybkiego wyboru pokazują procentowe wartości balansu:
- 5% balansu
- 10% balansu
- 25% balansu
- 50% balansu

Dla małych balansów (<100) system pokazuje bezwzględne wartości.

### 4. Przejrzyste Komunikaty
```
Min: 100 | Max: 5000 (All-in)
```

## Synchronizacja z Backendem

System frontendowy waliduje stawki po stronie klienta dla lepszego UX. Backend powinien również walidować stawki, ale może używać własnej logiki (np. sprawdzanie czy gracz ma wystarczający balans w momencie gry).

**Uwaga**: Config z backendu (`minBet`, `maxBet`) jest **ignorowany** w nowym systemie. Frontend używa wyłącznie dynamicznych limitów opartych na balansie gracza.

## Zalety Systemu

1. **Jednolitość**: Wszystkie gry działają identycznie
2. **Skalowalność**: Dostosowuje się do każdego balansu
3. **Elastyczność**: Gracz może postawić all-in w każdej grze
4. **Prostota**: Jeden moduł do utrzymania
5. **UX**: Limity zawsze są sensowne względem balansu gracza

## Migracja z Poprzedniego Systemu

### Zmiany:
- ✅ Usunięto zależność od `config.minBet` i `config.maxBet`
- ✅ Dodano dynamiczne obliczanie limitów
- ✅ Zaktualizowano wszystkie przyciski szybkiego wyboru
- ✅ Ujednolicono komunikaty o błędach
- ✅ Dodano automatyczne dostosowanie wartości

### Zachowana Kompatybilność:
- Backend nadal może zwracać `minBet`/`maxBet` w config (są ignorowane)
- Logika gier pozostaje niezmieniona
- API calls pozostają identyczne

## Troubleshooting

### Problem: "Minimalna stawka zbyt wysoka"
**Rozwiązanie**: System wymaga minimum 2% balansu. Jeśli balans gracza jest bardzo niski (np. 10 coins), minimalna stawka to 1 coin.

### Problem: "Nie mogę postawić dużej stawki"
**Rozwiązanie**: Maksymalna stawka to 100% balansu. Sprawdź czy gracz ma wystarczający balans.

### Problem: "Przyciski szybkiego wyboru nie pokazują się"
**Rozwiązanie**: Sprawdź czy `user` jest zdefiniowany. Przyciski pokazują się tylko dla zalogowanych użytkowników.

## Przyszłe Rozszerzenia

Możliwe rozszerzenia systemu:
- Różne profile ryzyka (konserwatywny: min 5%, agresywny: min 1%)
- Historia preferowanych stawek gracza
- Automatyczne zapisywanie ostatniej stawki
- Limity dzienne/tygodniowe dla odpowiedzialnej gry
