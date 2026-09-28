/**
 * Currency formatting utilities for TeenSpend
 * Defaults to Indian Rupee (₹) as specified in prompt, but flexible.
 */

export function formatCurrency(amount, showDecimals = false) {
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0
  }).format(numeric);
}

export function formatCompactCurrency(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
  return `₹${num}`;
}
