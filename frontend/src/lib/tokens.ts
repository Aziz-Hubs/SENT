/**
 * Design Tokens - Centralized design system values
 * Use these tokens throughout the application for consistency
 */

export const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
} as const;

export const typography = {
  h1: 'text-3xl font-black tracking-tight',
  h2: 'text-2xl font-bold tracking-tight',
  h3: 'text-xl font-semibold tracking-tight',
  h4: 'text-lg font-semibold',
  body: 'text-base font-medium',
  bodySmall: 'text-sm font-medium',
  caption: 'text-xs font-normal',
  label: 'text-xs font-bold uppercase tracking-wider',
} as const;

export const buttonSizes = {
  sm: 'h-8 px-3 text-sm',
  default: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-lg',
  icon: 'h-10 w-10',
} as const;

export const inputSizes = {
  default: 'h-10 px-3 text-base',
  sm: 'h-8 px-2 text-sm',
  lg: 'h-12 px-4 text-lg',
} as const;

export const tableSizes = {
  dense: 'h-8',    // For data-heavy tables
  default: 'h-10', // Standard tables
  comfortable: 'h-12', // Spacious tables
} as const;

export const semanticColors = {
  success: {
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    border: 'border-emerald-500/20 dark:border-emerald-500/30',
    hover: 'hover:bg-emerald-500 hover:text-white',
  },
  warning: {
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    border: 'border-amber-500/20 dark:border-amber-500/30',
    hover: 'hover:bg-amber-500 hover:text-white',
  },
  error: {
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    border: 'border-red-500/20 dark:border-red-500/30',
    hover: 'hover:bg-red-500 hover:text-white',
  },
  info: {
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    border: 'border-blue-500/20 dark:border-blue-500/30',
    hover: 'hover:bg-blue-500 hover:text-white',
  },
} as const;

/**
 * Utility function for formatting currency
 * Ensures consistent number formatting across the application
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Utility function for formatting numbers
 */
export function formatNumber(
  value: number,
  decimals: number = 2,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Utility function for formatting dates
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'long' | 'time' = 'short',
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return dateObj.toLocaleString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'short':
    default:
      return dateObj.toLocaleDateString(locale);
  }
}
