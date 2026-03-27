/**
 * Safe number formatting for currency strings in React Native.
 * Avoids toLocaleString which can crash on certain environments (Hermes without Intl).
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === undefined || amount === null) return '0';
  
  // Basic space-based grouping: 1 000 000
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
