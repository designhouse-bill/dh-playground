/**
 * Numeric formatters — single source of truth for all Distribution pages.
 * When the Angular build replaces this prototype, these become utility pipes.
 *
 * Mirrors fmtCurrency / fmtNumber / fmtPct / fmtPp / fmtDateRange in
 * distribution.js. Future callers should use these instead of local copies.
 */

const Fmt = Object.freeze({
  /** '$1,234.56' */
  currency(val) {
    return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  /** '1,234' */
  number(val) {
    return val.toLocaleString('en-US');
  },

  /** '12.34%' */
  percent(val, decimals = 2) {
    return val.toFixed(decimals) + '%';
  },

  /** '+1.2 pp' / '-0.8 pp' */
  pp(val, decimals = 1) {
    const sign = val >= 0 ? '+' : '';
    return sign + val.toFixed(decimals) + ' pp';
  },

  /** '1k' / '1.2M' — compact for axis labels */
  compact(val) {
    if (Math.abs(val) >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
    if (Math.abs(val) >= 1_000)     return (val / 1_000).toFixed(1) + 'k';
    return String(val);
  },

  /** '2025-12-10' → 'Dec 10, 2025' */
  dateShort(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
});
