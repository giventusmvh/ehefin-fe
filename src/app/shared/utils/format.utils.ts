/**
 * Format a number as Indonesian Rupiah currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "Rp 1.000.000")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string
 * @param date - ISO date string
 * @param locale - Locale for formatting (default: 'id-ID')
 * @returns Formatted date string
 */
export function formatDate(date: string, locale = 'id-ID'): string {
  return new Date(date).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date with time
 * @param date - ISO date string
 * @param locale - Locale for formatting (default: 'id-ID')
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string, locale = 'id-ID'): string {
  return new Date(date).toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
