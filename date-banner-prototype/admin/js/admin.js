/**
 * Admin Panel - Configuration Interface
 */

(function() {
  'use strict';

  const {
    loadConfig,
    saveConfig,
    resetConfig,
    exportConfig,
    importConfig,
    applyPreset,
    copyToClipboard,
    isStorageAvailable,
    getDemoDates,
    getPreviewDates,
    calculateDaysLeft,
    calculateDaysUntilStart,
    PRESETS,
    CONFIG_KEY
  } = window.BannerConfigModule;

  // ==========================================================================
  // State
  // ==========================================================================
  let currentConfig = null;
  let presetConfirmDismissed = false;
  let pendingPreset = null;
  let previewMode = 'browse'; // 'browse' or 'preview'

  // Check if preset confirmation was dismissed before
  try {
    presetConfirmDismissed = localStorage.getItem('presetConfirmDismissed') === 'true';
  } catch (e) {
    presetConfirmDismissed = false;
  }

  // ==========================================================================
  // Date Formatting (same as banner.js)
  // ==========================================================================
  function formatDateRange(config, startDate, endDate) {
    const locale = config.locale || 'en';
    const fullDay = config.useFullDayNames;
    const fullMonth = config.useFullMonthNames;
    const showDayNames = config.showDayNames;
    const showYear = config.showYear;

    const dayOptions = { weekday: fullDay ? 'long' : 'short' };
    const monthOptions = { month: fullMonth ? 'long' : 'short' };

    let startDay = '', endDay = '', startMonth = '', endMonth = '';

    try {
      if (showDayNames) {
        startDay = new Intl.DateTimeFormat(locale, dayOptions).format(startDate);
        endDay = new Intl.DateTimeFormat(locale, dayOptions).format(endDate);
      }
      startMonth = new Intl.DateTimeFormat(locale, monthOptions).format(startDate);
      endMonth = new Intl.DateTimeFormat(locale, monthOptions).format(endDate);
    } catch (e) {
      if (showDayNames) {
        startDay = new Intl.DateTimeFormat('en-US', dayOptions).format(startDate);
        endDay = new Intl.DateTimeFormat('en-US', dayOptions).format(endDate);
      }
      startMonth = new Intl.DateTimeFormat('en-US', monthOptions).format(startDate);
      endMonth = new Intl.DateTimeFormat('en-US', monthOptions).format(endDate);
    }

    const startNum = startDate.getDate();
    const endNum = endDate.getDate();
    const year = startDate.getFullYear();

    let dateText = '';

    if (locale === 'es') {
      if (showDayNames) {
        dateText = `${startDay}, ${startNum} ${startMonth} - ${endDay}, ${endNum} ${endMonth}`;
      } else {
        dateText = `${startNum} ${startMonth} - ${endNum} ${endMonth}`;
      }
    } else {
      if (showDayNames) {
        dateText = `${startDay}, ${startMonth} ${startNum} - ${endDay}, ${endMonth} ${endNum}`;
      } else {
        dateText = `${startMonth} ${startNum} - ${endMonth} ${endNum}`;
      }
    }

    if (showYear) {
      dateText += `, ${year}`;
    }

    return dateText;
  }

  function getValidityPillText(config, daysLeft) {
    const locale = config.locale || 'en';

    if (daysLeft === 1) {
      const label = locale === 'es'
        ? (config.dayLeftTextSpanish || 'Día Restante')
        : (config.dayLeftText || 'Day Left');
      return `${daysLeft} ${label}`;
    } else if (daysLeft === 2) {
      const label = locale === 'es'
        ? (config.daysLeftTextSpanish || 'Días Restantes')
        : (config.daysLeftText || 'Days Left');
      return `${daysLeft} ${label}`;
    } else {
      return locale === 'es'
        ? (config.validityTextSpanish || 'Válido')
        : (config.validityText || 'Valid');
    }
  }

  function getPreviewPillText(config, daysUntilStart) {
    const locale = config.locale || 'en';

    const prefix = locale === 'es'
      ? (config.previewPillTextSpanish || 'Comienza en')
      : (config.previewPillText || 'Starts in');

    if (daysUntilStart === 1) {
      const suffix = locale === 'es'
        ? (config.previewDayTextSpanish || 'Día')
        : (config.previewDayText || 'Day');
      return `${prefix} ${daysUntilStart} ${suffix}`;
    } else {
      const suffix = locale === 'es'
        ? (config.previewDaysTextSpanish || 'Días')
        : (config.previewDaysText || 'Days');
      return `${prefix} ${daysUntilStart} ${suffix}`;
    }
  }

  // ==========================================================================
  // Render Preview Banner (same-tab update)
  // ==========================================================================
  function renderPreviewBanner(config) {
    const banner = document.getElementById('preview-banner');
    if (!banner) return;

    // Get dates based on preview mode
    const isPreviewMode = previewMode === 'preview';
    const { startDate, endDate } = isPreviewMode ? getPreviewDates() : getDemoDates();

    // Get elements
    const title = banner.querySelector('.dh-banner__title');
    const datesContainer = banner.querySelector('.dh-banner__dates');
    const datesText = banner.querySelector('.dh-banner__dates-text');
    const pill = banner.querySelector('.dh-banner__validity-pill');

    // Banner classes
    banner.className = `dh-banner dh-banner--${config.layout} dh-banner--padding-${config.padding}`;

    // Title - use preview header text when in preview mode
    if (title) {
      title.className = `dh-banner__title dh-banner__title--font-${config.titleFontFamily} dh-banner__title--size-${config.titleFontSize} dh-banner__title--weight-${config.titleFontWeight} dh-banner__title--${config.titleTransform}`;
      if (!config.showTitle) {
        title.classList.add('dh-banner__title--hidden');
      }

      if (isPreviewMode) {
        title.textContent = config.locale === 'es'
          ? (config.previewHeaderTextSpanish || 'ADELANTO')
          : (config.previewHeaderText || 'SNEAK PEEK');
      } else {
        title.textContent = config.locale === 'es'
          ? config.headerTextSpanish
          : config.headerText;
      }
    }

    // Dates container
    if (datesContainer) {
      datesContainer.className = `dh-banner__dates dh-banner__dates--font-${config.dateFontFamily} dh-banner__dates--size-${config.dateFontSize} dh-banner__dates--weight-${config.dateFontWeight} dh-banner__dates--${config.dateTransform}`;
    }

    // Date text
    if (datesText) {
      datesText.textContent = formatDateRange(config, startDate, endDate);
    }

    // Validity pill - different text for preview mode
    if (pill) {
      pill.style.display = config.showValidityPill ? 'inline-block' : 'none';
      pill.className = `dh-banner__validity-pill dh-banner__validity-pill--font-${config.pillFontFamily} dh-banner__validity-pill--size-${config.pillFontSize} dh-banner__validity-pill--weight-${config.pillFontWeight} dh-banner__validity-pill--${config.pillTransform}`;

      if (isPreviewMode) {
        const daysUntilStart = calculateDaysUntilStart(startDate);
        pill.textContent = getPreviewPillText(config, daysUntilStart);
      } else {
        const daysLeft = calculateDaysLeft(endDate);
        pill.textContent = getValidityPillText(config, daysLeft);
      }
    }

    // Colors
    banner.style.backgroundColor = config.backgroundColor;
    banner.style.color = config.textColor;
  }

  // ==========================================================================
  // Sync Controls with Config
  // ==========================================================================
  function syncControlsWithConfig(config) {
    // Layout options
    document.querySelectorAll('.layout-option').forEach(option => {
      option.classList.toggle('active', option.dataset.layout === config.layout);
    });

    // Toggle groups (language)
    document.querySelectorAll('.toggle-group[data-config]').forEach(group => {
      const configKey = group.dataset.config;
      const value = config[configKey];
      group.querySelectorAll('.toggle-group__btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === value);
      });
    });

    // Text inputs
    document.querySelectorAll('input[type="text"][data-config]').forEach(input => {
      input.value = config[input.dataset.config] || '';
    });

    // Number inputs
    document.querySelectorAll('input[type="number"][data-config]').forEach(input => {
      input.value = config[input.dataset.config] || 200;
    });

    // Checkboxes
    document.querySelectorAll('input[type="checkbox"][data-config]').forEach(checkbox => {
      checkbox.checked = config[checkbox.dataset.config];
    });

    // Color inputs
    document.querySelectorAll('input[type="color"][data-config]').forEach(input => {
      input.value = config[input.dataset.config];
    });

    // Radio groups
    document.querySelectorAll('.radio-group[data-config]').forEach(group => {
      const configKey = group.dataset.config;
      const value = config[configKey];
      group.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = radio.value === value;
      });
    });

    // Selects
    document.querySelectorAll('select[data-config]').forEach(select => {
      select.value = config[select.dataset.config];
    });
  }

  // ==========================================================================
  // Update Config and Save
  // ==========================================================================
  function updateConfig(key, value) {
    currentConfig[key] = value;
    saveConfig(currentConfig);
    renderPreviewBanner(currentConfig);
  }

  function updateConfigMultiple(updates) {
    Object.assign(currentConfig, updates);
    saveConfig(currentConfig);
    syncControlsWithConfig(currentConfig);
    renderPreviewBanner(currentConfig);
  }

  // ==========================================================================
  // Color Input Sync Helpers
  // ==========================================================================
  function syncColorPickers(configKey, value) {
    // Sync color picker input when text input changes
    if (isValidHexColor(value)) {
      document.querySelectorAll(`input[type="color"][data-config="${configKey}"]`).forEach(picker => {
        picker.value = value;
      });
    }
  }

  function syncColorTextInputs(configKey, value) {
    // Sync text input when color picker changes
    document.querySelectorAll(`input[type="text"][data-config="${configKey}"]`).forEach(textInput => {
      textInput.value = value;
    });
  }

  function isValidHexColor(value) {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
  }

  // ==========================================================================
  // Wire Up Controls
  // ==========================================================================
  function wireUpControls() {
    // Layout selector
    document.querySelectorAll('.layout-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.layout-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        updateConfig('layout', option.dataset.layout);
      });
    });

    // Toggle groups (language selector)
    document.querySelectorAll('.toggle-group[data-config]').forEach(group => {
      group.querySelectorAll('.toggle-group__btn').forEach(btn => {
        btn.addEventListener('click', () => {
          group.querySelectorAll('.toggle-group__btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          updateConfig(group.dataset.config, btn.dataset.value);
        });
      });
    });

    // Preview mode toggle (Browse/Sneak Peek)
    const previewModeToggle = document.querySelector('.toggle-group[data-preview-mode]');
    if (previewModeToggle) {
      previewModeToggle.querySelectorAll('.toggle-group__btn').forEach(btn => {
        btn.addEventListener('click', () => {
          previewModeToggle.querySelectorAll('.toggle-group__btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          previewMode = btn.dataset.value;
          renderPreviewBanner(currentConfig);
        });
      });
    }

    // Text inputs (including color hex values)
    document.querySelectorAll('input[type="text"][data-config]').forEach(input => {
      input.addEventListener('input', () => {
        const configKey = input.dataset.config;
        const value = input.value;
        updateConfig(configKey, value);
        // Sync paired color picker if exists
        syncColorPickers(configKey, value);
      });
    });

    // Number inputs
    document.querySelectorAll('input[type="number"][data-config]').forEach(input => {
      input.addEventListener('input', () => {
        updateConfig(input.dataset.config, parseInt(input.value, 10) || 200);
      });
    });

    // Checkboxes
    document.querySelectorAll('input[type="checkbox"][data-config]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        updateConfig(checkbox.dataset.config, checkbox.checked);
      });
    });

    // Color inputs (color pickers)
    document.querySelectorAll('input[type="color"][data-config]').forEach(input => {
      input.addEventListener('input', () => {
        const configKey = input.dataset.config;
        const value = input.value;
        updateConfig(configKey, value);
        // Sync paired text input if exists
        syncColorTextInputs(configKey, value);
      });
    });

    // Radio buttons
    document.querySelectorAll('.radio-group[data-config]').forEach(group => {
      group.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
          if (radio.checked) {
            updateConfig(group.dataset.config, radio.value);
          }
        });
      });
    });

    // Selects
    document.querySelectorAll('select[data-config]').forEach(select => {
      select.addEventListener('change', () => {
        updateConfig(select.dataset.config, select.value);
      });
    });

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (presetConfirmDismissed) {
          applyPresetAndUpdate(btn.dataset.preset);
        } else {
          pendingPreset = btn.dataset.preset;
          showPresetConfirm();
        }
      });
    });

    // Reset button
    document.querySelectorAll('[data-action="reset"]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentConfig = resetConfig();
        syncControlsWithConfig(currentConfig);
        renderPreviewBanner(currentConfig);
      });
    });

    // View JSON button
    document.querySelectorAll('[data-action="view-json"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const textarea = document.getElementById('config-json');
        if (textarea) {
          textarea.value = exportConfig(currentConfig);
        }
      });
    });

    // Copy JSON button
    document.querySelectorAll('[data-action="copy-json"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const textarea = document.getElementById('config-json');
        if (textarea) {
          const jsonStr = exportConfig(currentConfig);
          textarea.value = jsonStr;
          const result = await copyToClipboard(jsonStr, textarea);
          if (result.success) {
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.innerHTML = '<i class="pi pi-copy"></i> Copy'; }, 2000);
          } else if (result.fallback) {
            alert(result.message);
          }
        }
      });
    });

    // Import JSON button
    document.querySelectorAll('[data-action="import-json"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const textarea = document.getElementById('config-json');
        const errorEl = document.getElementById('import-error');
        if (textarea && errorEl) {
          const result = importConfig(textarea.value);
          if (result.success) {
            currentConfig = result.config;
            saveConfig(currentConfig);
            syncControlsWithConfig(currentConfig);
            renderPreviewBanner(currentConfig);
            errorEl.textContent = '';
            errorEl.style.display = 'none';
          } else {
            errorEl.textContent = result.error;
            errorEl.style.display = 'block';
          }
        }
      });
    });

    // Download JSON button
    const downloadBtn = document.querySelector('[data-action="download-json"]');
    if (downloadBtn) {
      // Check if download is supported
      const isDownloadSupported = 'download' in document.createElement('a');
      if (!isDownloadSupported) {
        downloadBtn.style.display = 'none';
      } else {
        downloadBtn.addEventListener('click', () => {
          const jsonStr = exportConfig(currentConfig);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'banner-config.json';
          a.click();
          URL.revokeObjectURL(url);
        });
      }
    }
  }

  // ==========================================================================
  // Preset Confirmation
  // ==========================================================================
  function showPresetConfirm() {
    const modal = document.getElementById('preset-confirm');
    if (modal) {
      modal.classList.add('show');
    }
  }

  function hidePresetConfirm() {
    const modal = document.getElementById('preset-confirm');
    if (modal) {
      modal.classList.remove('show');
    }
    pendingPreset = null;
  }

  function applyPresetAndUpdate(presetName) {
    currentConfig = applyPreset(presetName, currentConfig);
    saveConfig(currentConfig);
    syncControlsWithConfig(currentConfig);
    renderPreviewBanner(currentConfig);
  }

  function setupPresetConfirm() {
    const modal = document.getElementById('preset-confirm');
    if (!modal) return;

    const confirmBtn = modal.querySelector('[data-action="confirm-preset"]');
    const cancelBtn = modal.querySelector('[data-action="cancel-preset"]');
    const dontShowCheckbox = modal.querySelector('#dont-show-again');

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (dontShowCheckbox && dontShowCheckbox.checked) {
          presetConfirmDismissed = true;
          try {
            localStorage.setItem('presetConfirmDismissed', 'true');
          } catch (e) {}
        }
        if (pendingPreset) {
          applyPresetAndUpdate(pendingPreset);
        }
        hidePresetConfirm();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        hidePresetConfirm();
      });
    }

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hidePresetConfirm();
      }
    });
  }

  // ==========================================================================
  // Storage Warning
  // ==========================================================================
  function showStorageWarning() {
    const warningEl = document.getElementById('storage-warning');
    if (warningEl) {
      warningEl.style.display = 'block';
    }
  }

  // ==========================================================================
  // Initialize
  // ==========================================================================
  function init() {
    // Check storage availability
    if (!isStorageAvailable()) {
      showStorageWarning();
    }

    // Load config
    currentConfig = loadConfig();

    // Sync controls
    syncControlsWithConfig(currentConfig);

    // Render preview
    renderPreviewBanner(currentConfig);

    // Wire up controls
    wireUpControls();

    // Setup preset confirmation
    setupPresetConfirm();

    console.log('[Admin] Initialized with config:', currentConfig);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.AdminPanel = {
    getCurrentConfig: () => currentConfig,
    updateConfig,
    updateConfigMultiple
  };

})();
