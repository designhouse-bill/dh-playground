/* ==========================================================================
   WIREFRAME NAVIGATION
   Handles tab switching, state management, and screen transitions
   ========================================================================== */

(function() {
  'use strict';

  // ==========================================================================
  // STATE
  // ==========================================================================

  const state = {
    currentScreen: 'grid',
    currentTab: 'editor',
    selectedPromotion: null,
    selectedCount: 0,
    promptDismissed: false
  };

  // Promotion data for context
  const promotions = [
    { id: 1, title: 'Long Drink', size: '1x2', price: '$11.99', category: 'Drinks' },
    { id: 2, title: 'Powerade', size: '3x2', price: '$8.49', category: 'Drinks' },
    { id: 3, title: 'Aquafina Water', size: '2x2', price: '$1', category: 'Drinks' },
    { id: 4, title: 'Coca-Cola Products', size: '3x3', price: '$5', category: 'Drinks' },
    { id: 5, title: 'Coca-Cola Products', size: '1x1', price: '$9', category: 'Drinks' },
    { id: 6, title: 'Pepsi Products', size: '3x2', price: '$1.99', category: 'Drinks' }
  ];

  // ==========================================================================
  // DOM HELPERS
  // ==========================================================================

  function $(selector, context = document) {
    return context.querySelector(selector);
  }

  function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
  }

  function show(el) {
    if (el) el.classList.remove('screen--hidden');
  }

  function hide(el) {
    if (el) el.classList.add('screen--hidden');
  }

  // ==========================================================================
  // SCREEN MANAGEMENT
  // ==========================================================================

  function showScreen(screenId) {
    // Hide all screens
    $$('.screen').forEach(screen => hide(screen));

    // Show target screen
    const target = $(`#screen-${screenId}`);
    if (target) {
      show(target);
      state.currentScreen = screenId;
    }
  }

  function showTab(tabId) {
    state.currentTab = tabId;

    // Update header tab states
    $$('.header-tab').forEach(tab => {
      tab.classList.remove('header-tab--active');
      if (tab.dataset.tab === tabId) {
        tab.classList.add('header-tab--active');
      }
    });

    // Show corresponding panel content
    $$('.panel-content').forEach(panel => hide(panel));
    const targetPanel = $(`#panel-${tabId}`);
    if (targetPanel) show(targetPanel);

    // Update context display
    updateContextDisplay();
  }

  // ==========================================================================
  // SELECTION MANAGEMENT
  // ==========================================================================

  function selectPromotion(promoId) {
    state.selectedPromotion = promotions.find(p => p.id === promoId);
    state.selectedCount = 1;
    updateSelectionUI();
    updateMediaLayoutTabState();
  }

  function updateSelectionCount(count) {
    state.selectedCount = count;
    if (count !== 1) {
      state.selectedPromotion = null;
    }
    updateSelectionUI();
    updateMediaLayoutTabState();
  }

  function updateSelectionUI() {
    // Update selection count display
    const countDisplay = $('.selection-count');
    if (countDisplay) {
      countDisplay.textContent = `(${state.selectedCount} Selected)`;
    }

    // Update row selection states
    $$('.data-grid tbody tr').forEach(row => {
      row.classList.remove('selected');
      const checkbox = $('input[type="checkbox"]', row);
      if (checkbox && checkbox.checked) {
        row.classList.add('selected');
      }
    });
  }

  function updateMediaLayoutTabState() {
    const mediaLayoutTabs = $$('[data-tab="media-layout"]');

    mediaLayoutTabs.forEach(tab => {
      if (state.selectedCount === 1) {
        tab.classList.remove('footer-tab--disabled', 'header-tab--disabled');
        tab.removeAttribute('disabled');

        // Hide tooltip
        const tooltip = $('.tooltip', tab);
        if (tooltip) tooltip.classList.remove('tooltip--visible');
      } else {
        tab.classList.add('footer-tab--disabled', 'header-tab--disabled');
        tab.setAttribute('disabled', 'true');

        // Show tooltip on hover handled by CSS
      }
    });
  }

  // ==========================================================================
  // CONTEXT DISPLAY
  // ==========================================================================

  function updateContextDisplay() {
    if (!state.selectedPromotion) return;

    // Update promotion name displays
    $$('.promo-name').forEach(el => {
      el.textContent = state.selectedPromotion.title;
    });

    // Update category displays
    $$('.promo-category').forEach(el => {
      el.textContent = state.selectedPromotion.category;
    });

    // Update size displays
    $$('.promo-size').forEach(el => {
      el.textContent = state.selectedPromotion.size;
    });
  }

  // ==========================================================================
  // PROMPT MANAGEMENT (Option 3)
  // ==========================================================================

  function dismissPrompt() {
    state.promptDismissed = true;
    $$('.prompt-card').forEach(card => hide(card));
  }

  function showPrompt() {
    if (!state.promptDismissed) {
      $$('.prompt-card').forEach(card => show(card));
    }
  }

  // ==========================================================================
  // NAVIGATION ACTIONS
  // ==========================================================================

  function openEditor() {
    showScreen('modal');
    showTab('editor');
  }

  function openMedia() {
    showScreen('modal');
    showTab('media');
  }

  function openMediaLayout() {
    if (state.selectedCount !== 1) {
      alert('Please select exactly one promotion to edit its media layout.');
      return;
    }
    showScreen('modal');
    showTab('media-layout');
  }

  function closeModal() {
    showScreen('grid');
    state.currentTab = null;
  }

  function navigatePrevious() {
    const currentIndex = promotions.findIndex(p => p.id === state.selectedPromotion?.id);
    if (currentIndex > 0) {
      selectPromotion(promotions[currentIndex - 1].id);
      updateContextDisplay();
    }
  }

  function navigateNext() {
    const currentIndex = promotions.findIndex(p => p.id === state.selectedPromotion?.id);
    if (currentIndex < promotions.length - 1) {
      selectPromotion(promotions[currentIndex + 1].id);
      updateContextDisplay();
    }
  }

  // ==========================================================================
  // EVENT BINDING
  // ==========================================================================

  function bindEvents() {
    // Footer tab clicks
    $$('.footer-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        if (tab.classList.contains('footer-tab--disabled')) {
          e.preventDefault();
          return;
        }

        const tabId = tab.dataset.tab;
        if (tabId === 'editor') openEditor();
        else if (tabId === 'media') openMedia();
        else if (tabId === 'media-layout') openMediaLayout();
      });
    });

    // Header tab clicks
    $$('.header-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        if (tab.classList.contains('header-tab--disabled')) {
          e.preventDefault();
          return;
        }
        showTab(tab.dataset.tab);
      });
    });

    // Edit button clicks
    $$('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const promoId = parseInt(btn.dataset.promoId);
        selectPromotion(promoId);
        openEditor();
      });
    });

    // Checkbox changes
    $$('.row-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const checked = $$('.row-checkbox:checked');
        updateSelectionCount(checked.length);

        if (checked.length === 1) {
          const promoId = parseInt(checked[0].dataset.promoId);
          selectPromotion(promoId);
        }
      });
    });

    // Close button
    $$('.btn-close').forEach(btn => {
      btn.addEventListener('click', closeModal);
    });

    // Previous/Next navigation
    $$('.btn-prev').forEach(btn => {
      btn.addEventListener('click', navigatePrevious);
    });

    $$('.btn-next').forEach(btn => {
      btn.addEventListener('click', navigateNext);
    });

    // Media Layout navigation links
    $$('.link-media-layout').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openMediaLayout();
      });
    });

    // Prompt dismiss buttons
    $$('.prompt-dismiss').forEach(btn => {
      btn.addEventListener('click', dismissPrompt);
    });

    // Prompt action buttons
    $$('.prompt-action').forEach(btn => {
      btn.addEventListener('click', openMediaLayout);
    });
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  function init() {
    // Select first promotion by default for demo
    selectPromotion(5); // Coca-Cola Products 1x1

    // Bind all events
    bindEvents();

    // Show grid screen initially
    showScreen('grid');

    // Update initial states
    updateMediaLayoutTabState();
    updateContextDisplay();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose to window for debugging
  window.wireframe = {
    state,
    showScreen,
    showTab,
    selectPromotion,
    openMediaLayout
  };

})();
