// UX-846 β-2 — Section Summary cards.
//
// Renders a sparkline + value + delta into each .ux846-section-card and
// wires whole-card clicks to flip Advanced ON + activate the matching
// perf-tab. MVP uses synthetic trend data; future revision will read from
// the same data store the Advanced panes consume.

(function () {
  'use strict';

  // MVP placeholders — replace with real reads off engagement-mock-data.js
  // or the live data service when wiring Phase 4+.
  const MOCK = {
    sessions:   { value: 12420, delta: 0.182, trend: [78,82,80,90,95,88,99,104,112,108,116,124,128] },
    users:      { value:  9105, delta: 0.094, trend: [62,65,68,67,72,70,75,80,82,85,87,89,92] },
    cardevents: { value: 38712, delta: 0.241, trend: [110,118,124,132,140,145,156,168,178,184,192,210,235] },
    coupon:     { value:  4230, delta:-0.071, trend: [55,60,58,52,50,48,46,44,42,40,42,40,38] },
    dealtype:   { value:  7588, delta: 0.058, trend: [40,42,41,44,46,48,47,50,52,51,54,55,57] },
  };

  const formatValue = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  };

  const formatDelta = (d) => {
    const sign = d >= 0 ? '▲' : '▼';
    return sign + ' ' + Math.abs(d * 100).toFixed(1) + '%';
  };

  function renderSparkline(target, data, color) {
    if (!target || !data || data.length === 0) return;
    const rect = target.getBoundingClientRect();
    const w = rect.width || 200;
    const h = rect.height || 48;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = w / (data.length - 1);
    const points = data.map((v, i) => {
      const x = i * stepX;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    const last = data[data.length - 1];
    const lastX = (data.length - 1) * stepX;
    const lastY = h - ((last - min) / range) * (h - 4) - 2;
    target.innerHTML = ''
      + '<svg width="100%" height="100%" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true">'
      + '<polyline fill="none" stroke="' + color + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" points="' + points + '"></polyline>'
      + '<circle cx="' + lastX.toFixed(1) + '" cy="' + lastY.toFixed(1) + '" r="2.5" fill="' + color + '"></circle>'
      + '</svg>';
  }

  function colorForMetric(metric) {
    // Use existing series tokens with sensible defaults.
    const css = getComputedStyle(document.documentElement);
    const tokens = {
      sessions:   css.getPropertyValue('--series-v').trim() || '#2196F3',
      users:      css.getPropertyValue('--series-v').trim() || '#2196F3',
      cardevents: css.getPropertyValue('--series-c').trim() || '#f59e0b',
      coupon:     '#FFCD3E',
      dealtype:   css.getPropertyValue('--section-dealtype').trim() || '#d3151b',
    };
    return tokens[metric] || (css.getPropertyValue('--color-primary-600').trim() || '#2196F3');
  }

  function paintCards() {
    document.querySelectorAll('.ux846-section-card').forEach((card) => {
      const metric = card.dataset.jumpTab;
      const data = MOCK[metric];
      if (!data) return;

      const valueEl = card.querySelector('[data-value="' + metric + '"]');
      const deltaEl = card.querySelector('[data-delta="' + metric + '"]');
      const chartEl = card.querySelector('[data-sparkline="' + metric + '"]');

      if (valueEl) valueEl.textContent = formatValue(data.value);
      if (deltaEl) {
        deltaEl.textContent = formatDelta(data.delta);
        deltaEl.classList.toggle('ux846-section-card__delta--up', data.delta >= 0);
        deltaEl.classList.toggle('ux846-section-card__delta--down', data.delta < 0);
      }
      if (chartEl) renderSparkline(chartEl, data.trend, colorForMetric(metric));
    });
  }

  function jumpToSection(card) {
    const tabKey = card.dataset.jumpTab;
    if (!tabKey || !window.UX846Surface) return;
    window.UX846Surface.setAdvanced(true);
    // Activate matching perf-tab. Existing tab-switching JS lives in
    // canonical-shell-tabs.js / engagement-page-app.js — synthetic click
    // triggers their handlers without re-implementing the logic.
    const tab = document.querySelector('.perf-tab[data-ep-tab="' + tabKey + '"]');
    if (tab) {
      tab.click();
      // Defer scroll until after the pane swap so we scroll into final position.
      requestAnimationFrame(() => tab.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }

  function wireClicks() {
    document.querySelectorAll('.ux846-section-card').forEach((card) => {
      if (card.dataset.wired === '1') return;
      card.dataset.wired = '1';
      card.addEventListener('click', () => jumpToSection(card));
    });
  }

  function init() {
    paintCards();
    wireClicks();
    // Re-paint on resize so sparklines redraw at new widths.
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(paintCards, 120);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
