/**
 * Engagement Dashboard Feature
 * Orchestrates chart rendering for the Engagement section.
 * Ported from analytics-dashboard/shared/app_new.js
 */

window.EngagementFeature = (function() {
  'use strict';

  let chartsInstance = null;
  let isInitialized = false;

  // ========================================
  // Init
  // ========================================

  function init() {
    if (isInitialized) {
      resizeCharts();
      return;
    }

    console.log('📊 Initializing Engagement feature...');

    try {
      chartsInstance = new DashboardCharts();
      const data = window.mockDatabase || {};
      loadYTDMetrics(data);
      initCharts(data);
      initTooltips();
      isInitialized = true;
      console.log('✅ Engagement feature initialized');
    } catch (err) {
      console.error('❌ Engagement init failed:', err);
    }
  }

  // ========================================
  // YTD Metrics
  // ========================================

  function loadYTDMetrics(data) {
    if (!data) return;
    const ytdStrip = document.querySelector('#engagement-dashboard .ytd-strip');
    if (!ytdStrip) return;

    let ytd;
    if (data.calculateYTDMetrics) {
      ytd = data.calculateYTDMetrics(null);
    } else if (data.ytdMetrics) {
      ytd = data.ytdMetrics;
    } else {
      return; // Use hardcoded HTML values
    }

    if (!ytd) return;

    const metrics = ytdStrip.querySelectorAll('.ytd-metric');
    if (metrics[0]) {
      const v = metrics[0].querySelector('.value');
      const t = metrics[0].querySelector('.trend');
      if (v && ytd.traffic) v.textContent = ytd.traffic.formatted + ' views';
      if (t && ytd.traffic) t.textContent = ytd.traffic.trend + ' ' + ytd.traffic.trendLabel;
    }
    if (metrics[1]) {
      const v = metrics[1].querySelector('.value');
      const t = metrics[1].querySelector('.trend');
      if (v && ytd.digitalAdoption) v.textContent = ytd.digitalAdoption.formatted;
      if (t && ytd.digitalAdoption) t.textContent = ytd.digitalAdoption.trend + ' ' + ytd.digitalAdoption.trendLabel;
    }
    if (metrics[2]) {
      const v = metrics[2].querySelector('.value');
      const t = metrics[2].querySelector('.trend');
      if (v && ytd.printRate) v.textContent = ytd.printRate.formatted;
      if (t && ytd.printRate) t.textContent = ytd.printRate.trend;
    }
  }

  // ========================================
  // Charts
  // ========================================

  function initCharts(data) {
    if (!chartsInstance) return;

    // Performance Day Chart
    chartsInstance.createPerformanceDayChart('performance-day-chart', data);

    // Interaction Rate Chart
    chartsInstance.createInteractionRateChart('interaction-rate-chart', data);

    // Size + Deal Charts (with delay for layout stability)
    setTimeout(() => {
      chartsInstance.createSizeClassMixChart('size-mix-chart', data);
      setTimeout(() => chartsInstance.charts.get('size-mix-chart')?.resize(), 100);
    }, 100);

    chartsInstance.createSizePerformanceChart('size-performance-chart', data);

    setTimeout(() => {
      chartsInstance.createDealTypeChart('deal-type-chart', data);
      setTimeout(() => chartsInstance.charts.get('deal-type-chart')?.resize(), 100);
    }, 200);
  }

  // ========================================
  // Resize
  // ========================================

  function resizeCharts() {
    if (chartsInstance) {
      chartsInstance.resizeAll();
    }
  }

  // ========================================
  // Tooltips
  // ========================================

  function initTooltips() {
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('#engagement-dashboard .info-btn');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        toggleTooltip(btn);
      } else {
        closeAllTooltips();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeAllTooltips();
    });
  }

  function toggleTooltip(btn) {
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    closeAllTooltips();
    if (!isExpanded) openTooltip(btn);
  }

  function openTooltip(btn) {
    const content = btn.getAttribute('data-tooltip-content');
    if (!content) return;

    try {
      const data = JSON.parse(decodeURIComponent(content));
      const overlay = document.createElement('div');
      overlay.className = 'tooltip-overlay';
      overlay.innerHTML = `
        <div class="tooltip-title">${escapeHtml(data.title)}</div>
        <div class="tooltip-content">${escapeHtml(data.tooltip)}</div>
        ${data.whyImportant ? `<div class="tooltip-why-important"><strong>Why this matters:</strong> ${escapeHtml(data.whyImportant)}</div>` : ''}
      `;
      document.body.appendChild(overlay);

      // Position
      const rect = btn.getBoundingClientRect();
      overlay.style.left = Math.min(rect.left, window.innerWidth - 320) + 'px';
      overlay.style.top = (rect.bottom + 8) + 'px';

      btn.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => overlay.classList.add('visible'));
    } catch (err) {
      // Ignore parse errors
    }
  }

  function closeAllTooltips() {
    document.querySelectorAll('.tooltip-overlay').forEach(o => {
      o.classList.remove('visible');
      setTimeout(() => o.parentNode && o.parentNode.removeChild(o), 200);
    });
    document.querySelectorAll('#engagement-dashboard .info-btn[aria-expanded="true"]').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  // ========================================
  // Mode / View Change (from app.js passthrough)
  // ========================================

  function handleModeChange(mode) {
    // In the combined prototype, mode changes don't navigate pages — just log
    console.log('Engagement mode change:', mode);
  }

  function handleViewChange(view) {
    console.log('Engagement view change:', view);
  }

  // ========================================
  // Public API
  // ========================================

  return {
    init,
    resizeCharts,
    handleModeChange,
    handleViewChange
  };

})();
