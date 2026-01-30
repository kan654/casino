/**
 * Global Bet Manager
 * Centralny system zarządzania stawkami dla wszystkich gier
 * 
 * Logika:
 * - Minimalna stawka = 2% aktualnego balansu (minimum 1)
 * - Maksymalna stawka = 100% aktualnego balansu (all-in)
 * - Brak sztywnych limitów
 * - Dynamiczne skalowanie względem balansu gracza
 */

export interface BetLimits {
  min: number;
  max: number;
}

/**
 * Oblicza dynamiczne limity stawek na podstawie balansu gracza
 */
export function calculateBetLimits(balance: number): BetLimits {
  // Minimum: 2% balansu, ale nie mniej niż 1
  const min = Math.max(1, Math.floor(balance * 0.02));
  
  // Maximum: 100% balansu (all-in)
  const max = Math.floor(balance);
  
  return {
    min: Math.max(1, min), // Zawsze minimum 1
    max: Math.max(1, max)  // Zawsze minimum 1
  };
}

/**
 * Waliduje czy stawka mieści się w dozwolonych limitach
 */
export function validateBet(betAmount: number, balance: number): {
  isValid: boolean;
  message?: string;
} {
  const limits = calculateBetLimits(balance);
  
  if (betAmount < limits.min) {
    return {
      isValid: false,
      message: `Minimalna stawka: ${limits.min} coins`
    };
  }
  
  if (betAmount > limits.max) {
    return {
      isValid: false,
      message: `Maksymalna stawka: ${limits.max} coins (Twój balans)`
    };
  }
  
  if (betAmount > balance) {
    return {
      isValid: false,
      message: 'Niewystarczający balans'
    };
  }
  
  return { isValid: true };
}

/**
 * Formatuje komunikat o limitach dla użytkownika
 */
export function formatLimitsMessage(balance: number): string {
  const limits = calculateBetLimits(balance);
  return `Min: ${limits.min} | Max: ${limits.max} (All-in)`;
}

/**
 * Sugerowane szybkie stawki na podstawie balansu
 */
export function getSuggestedBets(balance: number): number[] {
  const limits = calculateBetLimits(balance);
  
  // Jeśli balans jest mały, zwróć proste wartości
  if (balance <= 100) {
    return [limits.min, 10, 25, 50].filter(v => v >= limits.min && v <= limits.max);
  }
  
  // Dla większych balansów: 5%, 10%, 25%, 50% balansu
  const suggestions = [
    Math.floor(balance * 0.05),
    Math.floor(balance * 0.10),
    Math.floor(balance * 0.25),
    Math.floor(balance * 0.50)
  ];
  
  // Filtruj i upewnij się że są unikalne
  return [...new Set(suggestions)]
    .filter(v => v >= limits.min && v <= limits.max)
    .sort((a, b) => a - b)
    .slice(0, 4); // Maksymalnie 4 sugestie
}

/**
 * Dostosowuje stawkę do dopuszczalnych limitów
 */
export function clampBet(betAmount: number, balance: number): number {
  const limits = calculateBetLimits(balance);
  return Math.max(limits.min, Math.min(limits.max, betAmount));
}
