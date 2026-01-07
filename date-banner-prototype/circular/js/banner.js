/**
 * Date Banner - Circular View
 * Renders the banner and listens for storage events
 */

(function() {
  'use strict';

  const {
    loadConfig,
    CONFIG_KEY,
    getDemoDates,
    calculateDaysLeft,
    isStorageAvailable
  } = window.BannerConfigModule;

  // ==========================================================================
  // State
  // ==========================================================================
  let currentConfig = null;
  let lastAnnouncedDays = null;
  let lastScrollY = 0;
  let ticking = false;

  // ==========================================================================
  // DOM Elements
  // ==========================================================================
  let bannerElement = null;
  let liveRegion = null;

  // ==========================================================================
  // Date Formatting
  // ==========================================================================
  function formatDateRange(config, startDate, endDate) {
    const locale = config.locale || 'en';
    const fullDay = config.useFullDayNames;
    const fullMonth = config.useFullMonthNames;
    const showDayNames = config.showDayNames;
    const showYear = config.showYear;

    // Day names
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
      // Fallback to en-US
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
      // Spanish: "Mié, 1 Ene - Mar, 7 Ene" or "1 Ene - 7 Ene"
      if (showDayNames) {
        dateText = `${startDay}, ${startNum} ${startMonth} - ${endDay}, ${endNum} ${endMonth}`;
      } else {
        dateText = `${startNum} ${startMonth} - ${endNum} ${endMonth}`;
      }
    } else {
      // English: "Wed, Jan 1 - Tue, Jan 7" or "Jan 1 - Jan 7"
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

  // ==========================================================================
  // Validity Pill Text
  // ==========================================================================
  function getValidityPillText(config, daysLeft) {
    const locale = config.locale || 'en';

    if (daysLeft === 1) {
      // Singular: "1 Day Left"
      const label = locale === 'es'
        ? (config.dayLeftTextSpanish || 'Día Restante')
        : (config.dayLeftText || 'Day Left');
      return `${daysLeft} ${label}`;
    } else if (daysLeft === 2) {
      // Plural: "2 Days Left"
      const label = locale === 'es'
        ? (config.daysLeftTextSpanish || 'Días Restantes')
        : (config.daysLeftText || 'Days Left');
      return `${daysLeft} ${label}`;
    } else {
      // Default: "Valid"
      return locale === 'es'
        ? (config.validityTextSpanish || 'Válido')
        : (config.validityText || 'Valid');
    }
  }

  // ==========================================================================
  // ARIA Live Region Update (only on meaningful changes)
  // ==========================================================================
  function updateLiveRegion(daysLeft) {
    if (!liveRegion) return;

    if (daysLeft !== lastAnnouncedDays) {
      if (daysLeft <= 2 && daysLeft > 0) {
        liveRegion.textContent = `${daysLeft} day${daysLeft > 1 ? 's' : ''} remaining`;
      } else {
        liveRegion.textContent = '';
      }
      lastAnnouncedDays = daysLeft;
    }
  }

  // ==========================================================================
  // Render Banner
  // ==========================================================================
  function renderBanner(config) {
    if (!bannerElement) return;

    currentConfig = config;

    // Get demo dates
    const { startDate, endDate } = getDemoDates();
    const daysLeft = calculateDaysLeft(endDate);

    // Handle visibility
    if (!config.bannerEnabled) {
      bannerElement.style.display = 'none';
      return;
    }
    bannerElement.style.display = '';

    // Get elements
    const title = bannerElement.querySelector('.dh-banner__title');
    const datesContainer = bannerElement.querySelector('.dh-banner__dates');
    const datesText = bannerElement.querySelector('.dh-banner__dates-text');
    const pill = bannerElement.querySelector('.dh-banner__validity-pill');

    // Banner classes
    bannerElement.className = `dh-banner dh-banner--${config.layout} dh-banner--padding-${config.padding}`;
    if (config.stickyEnabled) {
      bannerElement.classList.add('dh-banner--sticky-enabled');
    }

    // Title
    if (title) {
      title.className = `dh-banner__title dh-banner__title--font-${config.titleFontFamily} dh-banner__title--size-${config.titleFontSize} dh-banner__title--weight-${config.titleFontWeight} dh-banner__title--${config.titleTransform}`;
      if (!config.showTitle) {
        title.classList.add('dh-banner__title--hidden');
      }
      title.textContent = config.locale === 'es' ? config.headerTextSpanish : config.headerText;
    }

    // Dates container
    if (datesContainer) {
      datesContainer.className = `dh-banner__dates dh-banner__dates--font-${config.dateFontFamily} dh-banner__dates--size-${config.dateFontSize} dh-banner__dates--weight-${config.dateFontWeight} dh-banner__dates--${config.dateTransform}`;
    }

    // Date text
    if (datesText) {
      datesText.textContent = formatDateRange(config, startDate, endDate);
    }

    // Validity pill
    if (pill) {
      pill.style.display = config.showValidityPill ? 'inline-block' : 'none';
      pill.className = `dh-banner__validity-pill dh-banner__validity-pill--font-${config.pillFontFamily} dh-banner__validity-pill--size-${config.pillFontSize} dh-banner__validity-pill--weight-${config.pillFontWeight} dh-banner__validity-pill--${config.pillTransform}`;
      pill.textContent = getValidityPillText(config, daysLeft);
    }

    // Colors
    bannerElement.style.backgroundColor = config.backgroundColor;
    bannerElement.style.color = config.textColor;

    // Update ARIA live region
    updateLiveRegion(daysLeft);

    // Update sticky behavior
    handleScroll();
  }

  // ==========================================================================
  // Sticky Scroll Handling
  // ==========================================================================
  function handleScroll() {
    if (!bannerElement || !currentConfig) return;

    const config = currentConfig;
    const currentScrollY = window.scrollY;
    const threshold = config.stickyThreshold || 200;

    if (!config.stickyEnabled) {
      bannerElement.classList.remove('dh-banner--hidden', 'dh-banner--visible', 'dh-banner--sticky-active');
      bannerElement.style.position = '';
      bannerElement.style.top = '';
      return;
    }

    // Make banner sticky
    bannerElement.style.position = 'sticky';
    bannerElement.style.top = '0';
    bannerElement.classList.add('dh-banner--sticky-active');

    if (config.stickyHideOnScroll) {
      if (currentScrollY > lastScrollY && currentScrollY > threshold) {
        // Scrolling down past threshold - hide
        bannerElement.classList.add('dh-banner--hidden');
        bannerElement.classList.remove('dh-banner--visible');
      } else {
        // Scrolling up or above threshold - show
        bannerElement.classList.remove('dh-banner--hidden');
        bannerElement.classList.add('dh-banner--visible');
      }
    } else {
      bannerElement.classList.remove('dh-banner--hidden');
      bannerElement.classList.add('dh-banner--visible');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }

  // ==========================================================================
  // Resize Observer (with fallback)
  // ==========================================================================
  function setupResizeHandling() {
    if (!bannerElement) return;

    function recalculateStickyThreshold() {
      // Re-run scroll handler to update positioning
      handleScroll();
    }

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        recalculateStickyThreshold();
      });
      resizeObserver.observe(bannerElement);
    } else {
      // Fallback: throttled polling for older browsers/WebViews
      let lastHeight = bannerElement.offsetHeight;
      setInterval(() => {
        const currentHeight = bannerElement.offsetHeight;
        if (currentHeight !== lastHeight) {
          lastHeight = currentHeight;
          recalculateStickyThreshold();
        }
      }, 250);
    }

    // Also recalculate on window resize
    window.addEventListener('resize', recalculateStickyThreshold);
  }

  // ==========================================================================
  // Storage Event Listener (Cross-tab sync)
  // ==========================================================================
  function setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === CONFIG_KEY) {
        const config = loadConfig();
        renderBanner(config);
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
    bannerElement = document.getElementById('main-banner');
    liveRegion = document.getElementById('banner-live-region');

    if (!bannerElement) {
      console.error('Banner element not found');
      return;
    }

    // Check storage availability
    if (!isStorageAvailable()) {
      showStorageWarning();
    }

    // Load and render
    const config = loadConfig();
    renderBanner(config);

    // Setup listeners
    setupStorageListener();
    setupResizeHandling();
    window.addEventListener('scroll', onScroll);

    console.log('[Banner] Initialized with config:', config);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.BannerView = {
    renderBanner,
    getCurrentConfig: () => currentConfig
  };

})();
