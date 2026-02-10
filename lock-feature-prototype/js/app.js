/* ==========================================================================
   App — Init, header bar, view tabs, profile toggle, view switching
   Exposes window.app
   ========================================================================== */

(function () {
  'use strict';

  var currentBuilder = null; // reference to active builder (circular or pd)

  // ── Init ───────────────────────────────────────────────────────────

  function init() {
    window.lockState.init();

    var appEl = document.getElementById('app');
    if (!appEl) return;

    // Render header
    renderHeader(appEl);

    // Create view container
    var viewEl = document.createElement('div');
    viewEl.id = 'view-container';
    viewEl.style.cssText = 'display:flex;flex-direction:column;flex:1;overflow:hidden';
    appEl.appendChild(viewEl);

    // Start with Circular Builder
    switchView('circular');

    // Subscribe to profile changes
    window.lockState.on('profile-changed', onProfileChanged);
  }

  // ── Header ─────────────────────────────────────────────────────────

  function renderHeader(appEl) {
    var header = document.createElement('div');
    header.className = 'app-header';
    header.innerHTML =
      '<div class="app-header__logo">Ideal Sale Admin</div>' +

      '<div class="app-header__nav">' +
        '<button class="app-header__tab app-header__tab--active" data-view="circular">Circular Builder</button>' +
        '<button class="app-header__tab" data-view="pd">PD Builder</button>' +
      '</div>' +

      '<div class="app-header__profile">' +
        '<button class="app-header__profile-btn app-header__profile-btn--active" data-profile="wholesaler">Wholesaler (PCC)</button>' +
        '<button class="app-header__profile-btn" data-profile="retailer">Retailer (RCC)</button>' +
      '</div>';

    appEl.appendChild(header);

    // View tab clicks
    header.querySelectorAll('[data-view]').forEach(function (el) {
      el.addEventListener('click', function () {
        var view = this.getAttribute('data-view');
        if (view === window.lockState.state.currentView) return;

        // Update tab styles
        header.querySelectorAll('[data-view]').forEach(function (btn) {
          btn.classList.remove('app-header__tab--active');
        });
        this.classList.add('app-header__tab--active');

        switchView(view);
      });
    });

    // Profile toggle clicks
    header.querySelectorAll('[data-profile]').forEach(function (el) {
      el.addEventListener('click', function () {
        var profile = this.getAttribute('data-profile');
        if (profile === window.lockState.state.currentProfile) return;

        // Update button styles
        header.querySelectorAll('[data-profile]').forEach(function (btn) {
          btn.classList.remove('app-header__profile-btn--active');
        });
        this.classList.add('app-header__profile-btn--active');

        window.lockState.setProfile(profile);
      });
    });
  }

  // ── View Switching ─────────────────────────────────────────────────

  function switchView(view) {
    var viewEl = document.getElementById('view-container');
    if (!viewEl) return;

    // Destroy current builder
    if (currentBuilder && currentBuilder.destroy) {
      currentBuilder.destroy();
    }

    // Deselect current promotion (but preserve lock state)
    window.lockState.state.selectedPromotionHash = null;
    window.lockState.state.bottomMenuOpen = false;

    // Set new view
    window.lockState.state.currentView = view;

    // Init new builder
    if (view === 'circular') {
      currentBuilder = window.circularBuilder;
      window.circularBuilder.init(viewEl);
    } else {
      currentBuilder = window.pdBuilder;
      window.pdBuilder.init(viewEl);
    }
  }

  // ── Profile Change Handler ─────────────────────────────────────────

  function onProfileChanged() {
    // Re-render current view to reflect profile change
    switchView(window.lockState.state.currentView);
  }

  // ── Boot ───────────────────────────────────────────────────────────

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Public API ─────────────────────────────────────────────────────

  window.app = {
    init: init,
    switchView: switchView
  };
})();
