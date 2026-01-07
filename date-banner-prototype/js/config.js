/**
 * Date Banner Configuration Module
 * Single source of truth for both admin and circular views
 */

const CONFIG_VERSION = 1;
const CONFIG_KEY = 'dateBannerConfig';

// =============================================================================
// Default Configuration
// =============================================================================
const DEFAULT_CONFIG = {
  version: CONFIG_VERSION,

  // Banner activation
  bannerEnabled: true,

  // Layout
  layout: 'centered', // 'centered' | 'spread' | 'stacked'
  padding: 'md', // 'sm' | 'md' | 'lg'

  // Display options
  showTitle: true,
  showDayNames: true,
  showYear: false,
  useFullDayNames: false,
  useFullMonthNames: false,

  // Colors
  backgroundColor: '#1a5f2a',
  textColor: '#ffffff',

  // Typography - Title
  titleFontFamily: 'opensans',
  titleFontSize: 'md',
  titleFontWeight: 'semibold',
  titleTransform: 'uppercase',

  // Typography - Dates
  dateFontFamily: 'opensans',
  dateFontSize: 'md',
  dateFontWeight: 'medium',
  dateTransform: 'capitalize',

  // Language/Locale
  locale: 'en',
  headerText: 'WEEKLY AD',
  headerTextSpanish: 'OFERTAS SEMANALES',

  // Validity Pill
  showValidityPill: true,
  validityText: 'Valid',
  validityTextSpanish: 'Válido',
  dayLeftText: 'Day Left',
  dayLeftTextSpanish: 'Día Restante',
  daysLeftText: 'Days Left',
  daysLeftTextSpanish: 'Días Restantes',

  // Typography - Pill
  pillFontFamily: 'opensans',
  pillFontSize: 'sm',
  pillFontWeight: 'medium',
  pillTransform: 'uppercase',

  // Sticky Scroll Behavior
  stickyEnabled: false,
  stickyHideOnScroll: false,
  stickyThreshold: 200,

  // Demo dates (for prototype)
  startDate: null, // Will be set dynamically
  endDate: null,   // Will be set dynamically

  // Preview/Sneak Peek Banner Settings
  previewHeaderText: 'SNEAK PEEK',
  previewHeaderTextSpanish: 'ADELANTO',

  // Preview Pill Text (for "Starts in X Days")
  previewPillText: 'Starts in',
  previewPillTextSpanish: 'Comienza en',
  previewDayText: 'Day',
  previewDayTextSpanish: 'Día',
  previewDaysText: 'Days',
  previewDaysTextSpanish: 'Días'
};

// =============================================================================
// Presets
// =============================================================================
const PRESETS = {
  standard: {
    bannerEnabled: true,
    layout: 'centered',
    showTitle: true,
    showDayNames: true,
    showYear: false,
    useFullDayNames: false,
    useFullMonthNames: false,
    backgroundColor: '#1a5f2a',
    textColor: '#ffffff',
    padding: 'md',
    titleFontFamily: 'opensans',
    titleFontSize: 'md',
    titleFontWeight: 'semibold',
    titleTransform: 'uppercase',
    dateFontFamily: 'opensans',
    dateFontSize: 'md',
    dateFontWeight: 'medium',
    dateTransform: 'capitalize',
    locale: 'en',
    headerText: 'WEEKLY AD',
    headerTextSpanish: 'OFERTAS SEMANALES',
    showValidityPill: true,
    validityText: 'Valid',
    validityTextSpanish: 'Válido',
    dayLeftText: 'Day Left',
    dayLeftTextSpanish: 'Día Restante',
    daysLeftText: 'Days Left',
    daysLeftTextSpanish: 'Días Restantes',
    pillFontFamily: 'opensans',
    pillFontSize: 'sm',
    pillFontWeight: 'medium',
    pillTransform: 'uppercase',
    stickyEnabled: false,
    stickyHideOnScroll: false,
    previewHeaderText: 'SNEAK PEEK',
    previewHeaderTextSpanish: 'ADELANTO',
    previewPillText: 'Starts in',
    previewPillTextSpanish: 'Comienza en',
    previewDayText: 'Day',
    previewDayTextSpanish: 'Día',
    previewDaysText: 'Days',
    previewDaysTextSpanish: 'Días'
  },
  minimal: {
    bannerEnabled: true,
    layout: 'centered',
    showTitle: true,
    showDayNames: false,
    showYear: false,
    useFullDayNames: false,
    useFullMonthNames: false,
    backgroundColor: '#374151',
    textColor: '#ffffff',
    padding: 'sm',
    titleFontFamily: 'opensans',
    titleFontSize: 'sm',
    titleFontWeight: 'medium',
    titleTransform: 'uppercase',
    dateFontFamily: 'opensans',
    dateFontSize: 'sm',
    dateFontWeight: 'normal',
    dateTransform: 'capitalize',
    locale: 'en',
    headerText: 'WEEKLY AD',
    headerTextSpanish: 'OFERTAS SEMANALES',
    showValidityPill: false,
    validityText: 'Valid',
    validityTextSpanish: 'Válido',
    dayLeftText: 'Day Left',
    dayLeftTextSpanish: 'Día Restante',
    daysLeftText: 'Days Left',
    daysLeftTextSpanish: 'Días Restantes',
    pillFontFamily: 'opensans',
    pillFontSize: 'sm',
    pillFontWeight: 'normal',
    pillTransform: 'uppercase',
    stickyEnabled: false,
    stickyHideOnScroll: false,
    previewHeaderText: 'SNEAK PEEK',
    previewHeaderTextSpanish: 'ADELANTO',
    previewPillText: 'Starts in',
    previewPillTextSpanish: 'Comienza en',
    previewDayText: 'Day',
    previewDayTextSpanish: 'Día',
    previewDaysText: 'Days',
    previewDaysTextSpanish: 'Días'
  },
  bold: {
    bannerEnabled: true,
    layout: 'spread',
    showTitle: true,
    showDayNames: true,
    showYear: false,
    useFullDayNames: false,
    useFullMonthNames: false,
    backgroundColor: '#991b1b',
    textColor: '#ffffff',
    padding: 'lg',
    titleFontFamily: 'montserrat',
    titleFontSize: 'lg',
    titleFontWeight: 'bold',
    titleTransform: 'uppercase',
    dateFontFamily: 'montserrat',
    dateFontSize: 'md',
    dateFontWeight: 'semibold',
    dateTransform: 'capitalize',
    locale: 'en',
    headerText: 'WEEKLY AD',
    headerTextSpanish: 'OFERTAS SEMANALES',
    showValidityPill: true,
    validityText: 'Valid',
    validityTextSpanish: 'Válido',
    dayLeftText: 'Day Left',
    dayLeftTextSpanish: 'Día Restante',
    daysLeftText: 'Days Left',
    daysLeftTextSpanish: 'Días Restantes',
    pillFontFamily: 'montserrat',
    pillFontSize: 'sm',
    pillFontWeight: 'semibold',
    pillTransform: 'uppercase',
    stickyEnabled: true,
    stickyHideOnScroll: true,
    previewHeaderText: 'SNEAK PEEK',
    previewHeaderTextSpanish: 'ADELANTO',
    previewPillText: 'Starts in',
    previewPillTextSpanish: 'Comienza en',
    previewDayText: 'Day',
    previewDayTextSpanish: 'Día',
    previewDaysText: 'Days',
    previewDaysTextSpanish: 'Días'
  }
};

// =============================================================================
// Storage Availability Check
// =============================================================================
let storageAvailable = false;
try {
  localStorage.setItem('__test__', '1');
  localStorage.removeItem('__test__');
  storageAvailable = true;
} catch (e) {
  storageAvailable = false;
  console.warn('localStorage unavailable - using in-memory defaults');
}

// In-memory fallback
let inMemoryConfig = null;

// =============================================================================
// Validation
// =============================================================================
function validateConfig(config) {
  const errors = [];
  const allowedKeys = Object.keys(DEFAULT_CONFIG);

  // Check for unknown keys
  const configKeys = Object.keys(config);
  const unknownKeys = configKeys.filter(k => !allowedKeys.includes(k));
  if (unknownKeys.length > 0) {
    errors.push(`Unknown keys: ${unknownKeys.join(', ')}`);
  }

  // Type validations
  if (typeof config.bannerEnabled !== 'boolean' && config.bannerEnabled !== undefined) {
    errors.push('bannerEnabled must be a boolean');
  }

  if (config.layout && !['centered', 'spread', 'stacked'].includes(config.layout)) {
    errors.push('layout must be one of: centered, spread, stacked');
  }

  if (config.padding && !['sm', 'md', 'lg'].includes(config.padding)) {
    errors.push('padding must be one of: sm, md, lg');
  }

  if (config.locale && !['en', 'es'].includes(config.locale)) {
    errors.push('locale must be one of: en, es');
  }

  // Color validation
  const colorRegex = /^#[0-9A-Fa-f]{6}$/;
  if (config.backgroundColor && !colorRegex.test(config.backgroundColor)) {
    errors.push('backgroundColor must be a valid hex color');
  }
  if (config.textColor && !colorRegex.test(config.textColor)) {
    errors.push('textColor must be a valid hex color');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// =============================================================================
// Sanitization
// =============================================================================
function sanitizeConfig(config) {
  const sanitized = {};
  const allowedKeys = Object.keys(DEFAULT_CONFIG);

  for (const key of allowedKeys) {
    if (config.hasOwnProperty(key)) {
      let value = config[key];

      // Sanitize string values (strip HTML/scripts)
      // NOTE: Text fields are plain text only - no markup supported
      if (typeof value === 'string') {
        value = value
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/javascript:/gi, '') // Remove javascript: URLs
          .replace(/on\w+=/gi, '') // Remove event handlers
          .trim();
      }

      sanitized[key] = value;
    }
  }

  return sanitized;
}

// =============================================================================
// Migration
// =============================================================================
function migrateConfig(config) {
  if (!config || typeof config !== 'object') {
    console.warn('Invalid config, resetting to defaults');
    return { ...DEFAULT_CONFIG };
  }

  // Check version and migrate if needed
  const configVersion = config.version || 0;

  if (configVersion < CONFIG_VERSION) {
    console.log(`Migrating config from v${configVersion} to v${CONFIG_VERSION}`);
    // Future migrations go here
  }

  // Merge with defaults to fill any missing fields
  const migrated = { ...DEFAULT_CONFIG, ...config, version: CONFIG_VERSION };

  return migrated;
}

// =============================================================================
// Load Config
// =============================================================================
function loadConfig() {
  // Use in-memory if storage unavailable
  if (!storageAvailable) {
    if (inMemoryConfig) {
      return { ...inMemoryConfig };
    }
    return { ...DEFAULT_CONFIG };
  }

  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (!saved) {
      return { ...DEFAULT_CONFIG };
    }

    const parsed = JSON.parse(saved);

    // Validate
    const validation = validateConfig(parsed);
    if (!validation.valid) {
      console.warn('Invalid stored config:', validation.errors);
      return { ...DEFAULT_CONFIG };
    }

    // Migrate
    const migrated = migrateConfig(parsed);

    return migrated;
  } catch (e) {
    console.warn('Error loading config, using defaults:', e);
    return { ...DEFAULT_CONFIG };
  }
}

// =============================================================================
// Save Config
// =============================================================================
function saveConfig(config) {
  // Validate before saving
  const validation = validateConfig(config);
  if (!validation.valid) {
    console.error('Cannot save invalid config:', validation.errors);
    return false;
  }

  const toSave = { ...config, version: CONFIG_VERSION };

  if (!storageAvailable) {
    inMemoryConfig = toSave;
    return true;
  }

  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(toSave));
    return true;
  } catch (e) {
    console.error('Error saving config:', e);
    return false;
  }
}

// =============================================================================
// Reset Config
// =============================================================================
function resetConfig() {
  if (storageAvailable) {
    localStorage.removeItem(CONFIG_KEY);
  }
  inMemoryConfig = null;
  return { ...DEFAULT_CONFIG };
}

// =============================================================================
// Import Config
// =============================================================================
function importConfig(jsonString) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return { success: false, error: 'Invalid JSON' };
  }

  // Reject unknown keys (whitelist only)
  const allowedKeys = Object.keys(DEFAULT_CONFIG);
  const unknownKeys = Object.keys(parsed).filter(k => !allowedKeys.includes(k));
  if (unknownKeys.length > 0) {
    return { success: false, error: `Unknown keys: ${unknownKeys.join(', ')}` };
  }

  // Sanitize string values
  const sanitized = sanitizeConfig(parsed);

  // Validate types and ranges
  const validation = validateConfig(sanitized);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join(', ') };
  }

  // Merge with defaults and return
  const merged = { ...DEFAULT_CONFIG, ...sanitized, version: CONFIG_VERSION };
  return { success: true, config: merged };
}

// =============================================================================
// Export Config
// =============================================================================
function exportConfig(config) {
  // Create a clean copy without internal fields
  const exportable = { ...config };
  return JSON.stringify(exportable, null, 2);
}

// =============================================================================
// Apply Preset
// =============================================================================
function applyPreset(presetName, currentConfig) {
  const preset = PRESETS[presetName];
  if (!preset) {
    console.warn(`Unknown preset: ${presetName}`);
    return currentConfig;
  }

  // Full replacement with defaults as base
  const newConfig = { ...DEFAULT_CONFIG, ...preset, version: CONFIG_VERSION };
  return newConfig;
}

// =============================================================================
// Date Utilities (Timezone Safe)
// =============================================================================
function parseLocalDate(dateStr) {
  // Parse to local midnight explicitly
  // Avoids timezone issues with new Date("YYYY-MM-DD")
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date, locale, options) {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (e) {
    // Explicit fallback locale, not OS-dependent
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }
}

function getDemoDates() {
  // Get current date and calculate a week-long circular period
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday

  // Circulars typically run Wed-Tue
  // Calculate the start of current week's circular (Wednesday)
  const daysFromWed = (dayOfWeek + 4) % 7; // Days since last Wednesday
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - daysFromWed);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // Tuesday

  return { startDate, endDate };
}

function calculateDaysLeft(endDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  const timeDiff = end.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;

  return Math.max(0, daysLeft);
}

function getPreviewDates() {
  // Get current week's dates and add 7 days for next week
  const { startDate, endDate } = getDemoDates();

  const previewStart = new Date(startDate);
  previewStart.setDate(previewStart.getDate() + 7);

  const previewEnd = new Date(endDate);
  previewEnd.setDate(previewEnd.getDate() + 7);

  return { startDate: previewStart, endDate: previewEnd };
}

function calculateDaysUntilStart(startDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const timeDiff = start.getTime() - today.getTime();
  const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return Math.max(0, daysUntil);
}

// =============================================================================
// Clipboard Utilities (with fallback)
// =============================================================================
async function copyToClipboard(text, textareaElement) {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (e) {
    // Fallback: select textarea content and prompt manual copy
    if (textareaElement) {
      textareaElement.select();
      textareaElement.setSelectionRange(0, 99999); // For mobile
      return { success: false, fallback: true, message: 'Press Ctrl+C / Cmd+C to copy' };
    }
    return { success: false, error: 'Clipboard not available' };
  }
}

// =============================================================================
// Storage Warning
// =============================================================================
function isStorageAvailable() {
  return storageAvailable;
}

// =============================================================================
// Exports
// =============================================================================
// Make available globally for HTML script tags
if (typeof window !== 'undefined') {
  window.BannerConfigModule = {
    CONFIG_VERSION,
    CONFIG_KEY,
    DEFAULT_CONFIG,
    PRESETS,

    // Core functions
    loadConfig,
    saveConfig,
    resetConfig,
    validateConfig,
    sanitizeConfig,
    migrateConfig,
    importConfig,
    exportConfig,
    applyPreset,

    // Date utilities
    parseLocalDate,
    formatDate,
    getDemoDates,
    getPreviewDates,
    calculateDaysLeft,
    calculateDaysUntilStart,

    // Clipboard
    copyToClipboard,

    // Storage check
    isStorageAvailable
  };
}
