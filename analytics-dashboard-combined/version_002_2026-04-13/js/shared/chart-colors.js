/**
 * Chart Color Palette — JS mirror of design-tokens.css chart variables.
 * Used by eCharts (which requires JS hex values, not CSS vars).
 *
 * Single source of truth for chart colors across Engagement & Distribution.
 * When the Angular build replaces this prototype, these become design-system tokens.
 */

const ChartColors = Object.freeze({
  // Core palette
  blue:        '#4272D8',
  green:       '#10B981',
  amber:       '#F59E0B',
  red:         '#EF4444',
  indigo:      '#6366F1',
  purple:      '#937DF8',
  teal:        '#06989D',
  gray:        '#9CA3AF',
  grayLight:   '#E5E7EB',
  indigoDark:  '#4F46E5',
  blueLight:   '#93C5FD',

  // Status (map markers, leaderboard badges)
  strong:      '#10B981',
  watch:       '#F59E0B',
  critical:    '#EF4444',

  // Metric series (engagement line charts)
  views:       '#4272D8',
  clicks:      '#B8D64D',
  adds:        '#937DF8',
  total:       '#06989D',

  // Ordered palette for multi-series charts
  series: ['#EF4444', '#6366F1', '#F59E0B', '#9CA3AF', '#10B981']
});
