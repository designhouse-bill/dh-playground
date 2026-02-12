/* ==========================================================================
   App — Init, header bar, view tabs, profile toggle, view switching
   Exposes window.app
   ========================================================================== */

(function () {
  'use strict';

  var currentBuilder = null; // reference to active builder (circular or pd)
  var profileDropdownOpen = false;

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

    // Close profile dropdown on outside click
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.app-header__profile-toggle')) {
        closeProfileDropdown();
      }
    });
  }

  // ── Header ─────────────────────────────────────────────────────────

  function renderHeader(appEl) {
    var profile = window.lockState.state.currentProfile;
    var profileLabel = profile === 'wholesaler' ? 'PCC' : 'RCC';
    var indicatorClass = profile === 'wholesaler' ? ' app-header__profile-indicator--wholesaler' : '';

    var header = document.createElement('div');
    header.className = 'app-header';
    header.innerHTML =
      // Left zone: Logo + Store badge
      '<div class="app-header__logo-area">' +
        '<span class="app-header__brand">' +
          '<span class="app-header__brand-ideal">ideal</span>' +
          '<span class="app-header__brand-sale">sale</span>' +
        '</span>' +
        '<div class="app-header__store-badge">' +
          '<i class="pi pi-building" style="font-size:1rem"></i>' +
          '<span class="app-header__store-name">Winn Dixie</span>' +
          '<span class="app-header__store-scope">All Stores</span>' +
          '<button class="app-header__store-change">Change</button>' +
        '</div>' +
      '</div>' +

      // Center zone: Section label + date + week tabs
      '<div class="app-header__center">' +
        '<span class="app-header__section-label">CIRCULAR BUILDER</span>' +
        '<i class="pi pi-calendar app-header__date-icon"></i>' +
        '<span class="app-header__date-day">Sunday</span>' +
        '<span class="app-header__date-display">FEB 15</span>' +
        '<div class="app-header__week-tabs">' +
          '<button class="app-header__tab">JAN<br>25</button>' +
          '<button class="app-header__tab">FEB<br>01</button>' +
          '<button class="app-header__tab">FEB<br>08</button>' +
          '<button class="app-header__tab app-header__tab--active">FEB<br>15</button>' +
          '<button class="app-header__tab">FEB<br>22</button>' +
          '<button class="app-header__tab">MAR<br>01</button>' +
          '<button class="app-header__tab" style="font-size:0.6rem">Custom<br>Date</button>' +
        '</div>' +
      '</div>' +

      // Right zone: Profile toggle + View toggle + User info
      '<div class="app-header__user-area">' +
        '<div class="app-header__profile-toggle">' +
          '<button class="app-header__profile-indicator' + indicatorClass + '" id="profile-indicator">' +
            '<i class="pi pi-user" style="margin-right:3px"></i> ' + profileLabel +
          '</button>' +
          '<div class="app-header__profile-dropdown" id="profile-dropdown">' +
            '<button class="app-header__profile-option' + (profile === 'wholesaler' ? ' app-header__profile-option--active' : '') + '" data-profile="wholesaler">Wholesaler (PCC)</button>' +
            '<button class="app-header__profile-option' + (profile === 'retailer' ? ' app-header__profile-option--active' : '') + '" data-profile="retailer">Retailer (RCC)</button>' +
          '</div>' +
        '</div>' +
        '<div class="app-header__view-toggle">' +
          '<button class="app-header__view-btn app-header__view-btn--active" data-view="circular">Circular</button>' +
          '<button class="app-header__view-btn" data-view="pd">PD</button>' +
        '</div>' +
        '<span class="app-header__user-name">User: Klingensmith Bill</span>' +
        '<button class="app-header__logout-btn">Logout</button>' +
      '</div>';

    appEl.appendChild(header);

    // Profile indicator toggle
    var indicator = header.querySelector('#profile-indicator');
    if (indicator) {
      indicator.addEventListener('click', function (e) {
        e.stopPropagation();
        profileDropdownOpen = !profileDropdownOpen;
        var dd = header.querySelector('#profile-dropdown');
        if (dd) dd.classList.toggle('app-header__profile-dropdown--open', profileDropdownOpen);
      });
    }

    // Profile option clicks
    header.querySelectorAll('[data-profile]').forEach(function (el) {
      el.addEventListener('click', function () {
        var profile = this.getAttribute('data-profile');
        if (profile === window.lockState.state.currentProfile) {
          closeProfileDropdown();
          return;
        }
        closeProfileDropdown();
        window.lockState.setProfile(profile);

        // Update indicator text & style
        var ind = document.getElementById('profile-indicator');
        if (ind) {
          var label = profile === 'wholesaler' ? 'PCC' : 'RCC';
          ind.innerHTML = '<i class="pi pi-user" style="margin-right:3px"></i> ' + label;
          ind.classList.toggle('app-header__profile-indicator--wholesaler', profile === 'wholesaler');
        }

        // Update option active states
        header.querySelectorAll('[data-profile]').forEach(function (btn) {
          btn.classList.toggle('app-header__profile-option--active', btn.getAttribute('data-profile') === profile);
        });
      });
    });

    // View tab clicks
    header.querySelectorAll('[data-view]').forEach(function (el) {
      el.addEventListener('click', function () {
        var view = this.getAttribute('data-view');
        if (view === window.lockState.state.currentView) return;

        header.querySelectorAll('[data-view]').forEach(function (btn) {
          btn.classList.remove('app-header__view-btn--active');
        });
        this.classList.add('app-header__view-btn--active');

        // Update section label
        var sectionLabel = header.querySelector('.app-header__section-label');
        if (sectionLabel) {
          sectionLabel.textContent = view === 'circular' ? 'CIRCULAR BUILDER' : 'PD BUILDER';
        }

        switchView(view);
      });
    });
  }

  function closeProfileDropdown() {
    profileDropdownOpen = false;
    var dd = document.getElementById('profile-dropdown');
    if (dd) dd.classList.remove('app-header__profile-dropdown--open');
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
