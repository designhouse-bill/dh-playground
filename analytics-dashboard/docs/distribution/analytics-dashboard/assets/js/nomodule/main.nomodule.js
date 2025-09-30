/* ==========================================================================
   Boot (Master-aligned)
   - Waits for AD, echarts, DATA scaffolds
   - Renders header first, then rows
   ========================================================================== */
(function(){
  function ready(){
    return !!(window.AD && window.echarts && window.DATA_META && window.DATA_WEEKS && window.DATA && document.body);
  }

  function waitUntil(pred, cb, timeoutMs=8000){
    const t0 = Date.now();
    (function tick(){
      if (pred()) return cb();
      if (Date.now()-t0 > timeoutMs) return cb(); // fail-open
      requestAnimationFrame(tick);
    })();
  }

  function boot(){
    console.log('Booting dashboard with data:', window.DATA);

    // 1) Render header + YTD tiles (uses DATA_META and DATA_WEEKS)
    if (window.AD && AD.renderHeaderRow) AD.renderHeaderRow();

    // 2) Scope DATA to current week/version/store
    if (typeof window.getWeekData === 'function'){
      const versionSel = document.getElementById('version-select');
      const weekSel = document.getElementById('week-select');
      const storeSel = document.getElementById('store-select');
      const v = (versionSel && versionSel.value) || (AD.state?.version) || 'all';
      const w = (weekSel && weekSel.value) || (AD.state?.week) || 'w36';
      const s = (storeSel && storeSel.value) || (AD.state?.store) || 'all';
      AD.state.version = v;
      AD.state.week = w;
      AD.state.store = s;
      window.DATA = window.getWeekData(w, v);
    }

    // 3) Render rows
    if (window.AD && AD.renderAll) AD.renderAll();

    // 4) Responsive resize handling
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        handleResponsiveResize();
      }, 150); // Debounce resize events
    }, {passive:true});

    // 5) KPI tooltip functionality
    initKpiTooltips();
  }

  function initKpiTooltips() {
    // Use event delegation for dynamically rendered content
    document.addEventListener('click', function(e) {
      if (e.target.closest('.info-btn')) {
        e.preventDefault();
        e.stopPropagation();
        const btn = e.target.closest('.info-btn');
        toggleTooltip(btn);
      }
      // Close tooltips when clicking outside
      else {
        closeAllTooltips();
      }
    });

    // Keyboard support
    document.addEventListener('keydown', function(e) {
      if (e.target.matches('.info-btn') && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        const btn = e.target;
        toggleTooltip(btn);
      }
      // Close on Escape key
      else if (e.key === 'Escape') {
        closeAllTooltips();
      }
    });

    // Close tooltips on window resize
    window.addEventListener('resize', closeAllTooltips, { passive: true });
  }

  function toggleTooltip(btn) {
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';

    // Close all tooltips first (single tooltip behavior)
    closeAllTooltips();

    if (!isExpanded) {
      openTooltip(btn);
    }
  }

  function openTooltip(btn) {
    const tooltipContent = btn.getAttribute('data-tooltip-content');
    if (!tooltipContent) return;

    try {
      const data = JSON.parse(decodeURIComponent(tooltipContent));

      // Create overlay element
      const overlay = createTooltipOverlay(data);
      document.body.appendChild(overlay);

      // Position the tooltip
      positionTooltip(btn, overlay);

      // Update button state
      btn.setAttribute('aria-expanded', 'true');
      btn.tooltipOverlay = overlay;

      // Show with animation
      requestAnimationFrame(() => {
        overlay.classList.add('visible');
      });

    } catch (error) {
      console.error('Error parsing tooltip content:', error);
    }
  }

  function createTooltipOverlay(data) {
    const overlay = document.createElement('div');
    overlay.className = 'tooltip-overlay';
    overlay.setAttribute('role', 'tooltip');
    overlay.setAttribute('aria-hidden', 'false');

    overlay.innerHTML = `
      <div class="tooltip-title">${escapeHtml(data.title)}</div>
      <div class="tooltip-content">${escapeHtml(data.tooltip)}</div>
      ${data.whyImportant ? `<div class="tooltip-why-important"><strong>Why this matters:</strong> ${escapeHtml(data.whyImportant)}</div>` : ''}
    `;

    return overlay;
  }

  function positionTooltip(btn, overlay) {
    const btnRect = btn.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Set initial position to measure tooltip dimensions
    overlay.style.left = '0px';
    overlay.style.top = '0px';

    const overlayRect = overlay.getBoundingClientRect();
    const overlayWidth = overlayRect.width;
    const overlayHeight = overlayRect.height;

    let left, top, position = 'bottom';

    // Try to position below the button first (preferred)
    if (btnRect.bottom + overlayHeight + 10 <= viewportHeight) {
      position = 'bottom';
      top = btnRect.bottom + 8;
      left = btnRect.left + (btnRect.width / 2) - 32; // Offset for arrow position
    }
    // Try above if no room below
    else if (btnRect.top - overlayHeight - 10 >= 0) {
      position = 'top';
      top = btnRect.top - overlayHeight - 8;
      left = btnRect.left + (btnRect.width / 2) - 32;
      overlay.classList.add('position-top');
    }
    // Try to the right
    else if (btnRect.right + overlayWidth + 10 <= viewportWidth) {
      position = 'right';
      top = btnRect.top + (btnRect.height / 2) - (overlayHeight / 2);
      left = btnRect.right + 8;
      overlay.classList.add('position-right');
    }
    // Try to the left
    else if (btnRect.left - overlayWidth - 10 >= 0) {
      position = 'left';
      top = btnRect.top + (btnRect.height / 2) - (overlayHeight / 2);
      left = btnRect.left - overlayWidth - 8;
      overlay.classList.add('position-left');
    }
    // Fallback: position below but adjust horizontally to fit
    else {
      position = 'bottom';
      top = btnRect.bottom + 8;
      left = Math.max(10, Math.min(viewportWidth - overlayWidth - 10, btnRect.left));
    }

    // Ensure tooltip stays within viewport bounds
    left = Math.max(10, Math.min(viewportWidth - overlayWidth - 10, left));
    top = Math.max(10, Math.min(viewportHeight - overlayHeight - 10, top));

    overlay.style.left = left + 'px';
    overlay.style.top = top + 'px';
  }

  function closeAllTooltips() {
    // Close all existing tooltips
    document.querySelectorAll('.tooltip-overlay').forEach(overlay => {
      overlay.classList.remove('visible');
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 200); // Match CSS transition duration
    });

    // Reset all button states
    document.querySelectorAll('.info-btn[aria-expanded="true"]').forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
      btn.tooltipOverlay = null;
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function handleResponsiveResize() {
    // Re-render all chart-containing rows to handle responsive changes
    if (window.AD) {
      if (AD.renderRow2) AD.renderRow2(); // Charts row
      if (AD.renderRow3) AD.renderRow3(); // Category charts

      // Handle ECharts instances directly
      if (window.echarts) {
        // Find all chart containers and resize their charts
        document.querySelectorAll('.chart-host').forEach(container => {
          const chartInstance = window.echarts.getInstanceByDom(container);
          if (chartInstance) {
            chartInstance.resize();
          }
        });
      }

      // Close any open tooltips on resize to prevent positioning issues
      closeAllTooltips();
    }
  }

  waitUntil(ready, boot);
})();