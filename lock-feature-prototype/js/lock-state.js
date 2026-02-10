/* ==========================================================================
   Lock State — Central state management with pub/sub
   Exposes window.lockState
   ========================================================================== */

(function () {
  'use strict';

  // ── LOCKABLE_FIELDS Registry ──────────────────────────────────────────
  // Each entry: key → { displayName, section, formControls[], supportsConstrained, group? }

  var LOCKABLE_FIELDS = {
    'title':               { displayName: 'Title',              section: 'General',     formControls: ['title'],              supportsConstrained: false },
    'description':         { displayName: 'Description',        section: 'General',     formControls: ['description'],        supportsConstrained: false },
    'dateText':            { displayName: 'Date Text',          section: 'General',     formControls: ['dateText'],           supportsConstrained: false },
    'categoryHash':        { displayName: 'Category',           section: 'General',     formControls: ['categoryHash'],       supportsConstrained: false },
    'promoSize':           { displayName: 'Size',               section: 'General',     formControls: ['promoSize'],          supportsConstrained: false },
    'dateRange':           { displayName: 'Date Range',         section: 'Date Range',  formControls: ['validFrom', 'validTo'], supportsConstrained: false, group: ['validFrom', 'validTo'] },
    'cardStyleHash':       { displayName: 'Card Style',         section: 'Card',        formControls: ['cardStyleHash'],      supportsConstrained: false },
    'deal.type':           { displayName: 'Deal Type',          section: 'Card',        formControls: ['deal.type'],          supportsConstrained: false },
    'deal.price':          { displayName: 'Price',              section: 'Card',        formControls: ['deal.price'],         supportsConstrained: true },
    'deal.units':          { displayName: 'Units',              section: 'Card',        formControls: ['deal.units'],         supportsConstrained: false },
    'deal.couponAmountOff':{ displayName: 'Coupon Amount Off',  section: 'Coupon',      formControls: ['deal.couponAmountOff'], supportsConstrained: true },
    'upc':                 { displayName: 'UPC',                section: 'Card',        formControls: ['upc'],                supportsConstrained: false },
    'couponId':            { displayName: 'Coupon ID',          section: 'Card',        formControls: ['couponId'],           supportsConstrained: false },
    'loyaltyDeal.type':    { displayName: 'Loyalty Deal Type',  section: 'Card',        formControls: ['loyaltyDeal.type'],   supportsConstrained: false },
    'loyaltyDeal.price':   { displayName: 'Loyalty Price',      section: 'Card',        formControls: ['loyaltyDeal.price'],  supportsConstrained: true },
    'icons':               { displayName: 'Icons',              section: 'Media/Icons', formControls: ['icons'],              supportsConstrained: false },
    'mediaSize':           { displayName: 'Media Size',         section: 'Media/Icons', formControls: ['mediaSize'],          supportsConstrained: false },
    'headline':            { displayName: 'Headline',           section: 'Headline',    formControls: ['headline'],           supportsConstrained: false },
    'background':          { displayName: 'Background',         section: 'Background',  formControls: ['backgroundColor', 'backgroundImage', 'position', 'size', 'repeat'], supportsConstrained: false, group: ['backgroundColor', 'backgroundImage', 'position', 'size', 'repeat'] },
    'bogoDeal':            { displayName: 'BOGO Deal',          section: 'Card',        formControls: ['buyQuantity', 'getQuantity', 'getDeal', 'getDealType'], supportsConstrained: false, group: ['buyQuantity', 'getQuantity', 'getDeal', 'getDealType'] }
  };

  // Section → Field keys mapping (for section-level lock checks)
  var SECTIONS = {
    'General':     ['title', 'description', 'dateText', 'categoryHash', 'promoSize'],
    'Date Range':  ['dateRange'],
    'Card':        ['cardStyleHash', 'deal.type', 'deal.price', 'deal.units', 'upc', 'couponId', 'loyaltyDeal.type', 'loyaltyDeal.price', 'bogoDeal'],
    'Coupon':      ['deal.couponAmountOff'],
    'Media/Icons': ['icons', 'mediaSize'],
    'Headline':    ['headline'],
    'Background':  ['background']
  };

  // Ordered section list for rendering
  var SECTION_ORDER = ['General', 'Date Range', 'Card', 'Coupon', 'Media/Icons', 'Headline', 'Background'];

  // ── Pub/Sub ───────────────────────────────────────────────────────────

  var listeners = {};

  function on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
  }

  function off(event, callback) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(function (cb) { return cb !== callback; });
  }

  function emit(event, data) {
    if (!listeners[event]) return;
    listeners[event].forEach(function (cb) { cb(data); });
  }

  // ── State ─────────────────────────────────────────────────────────────

  var state = {
    currentProfile: 'wholesaler',   // 'wholesaler' | 'retailer'
    currentView: 'circular',        // 'circular' | 'pd'
    selectedPromotionHash: null,
    promotions: [],                  // deep clone of MOCK_PROMOTIONS
    categories: [],
    sidebarOpen: false,
    bottomMenuOpen: false
  };

  // Deep-clone promotions from mock data on init
  function init() {
    state.promotions = JSON.parse(JSON.stringify(window.MOCK_PROMOTIONS));
    state.categories = JSON.parse(JSON.stringify(window.MOCK_CATEGORIES));
    state.selectedPromotionHash = null;
    state.sidebarOpen = false;
    state.bottomMenuOpen = false;
  }

  // ── Getters ───────────────────────────────────────────────────────────

  function getPromotion(hash) {
    for (var i = 0; i < state.promotions.length; i++) {
      if (state.promotions[i].hash === hash) return state.promotions[i];
    }
    return null;
  }

  function getSelectedPromotion() {
    if (!state.selectedPromotionHash) return null;
    return getPromotion(state.selectedPromotionHash);
  }

  function getPromotionsByCategory(categoryHash) {
    return state.promotions.filter(function (p) { return p.categoryHash === categoryHash; });
  }

  // ── Setters (with event emission) ─────────────────────────────────────

  function selectPromotion(hash) {
    state.selectedPromotionHash = hash;
    state.sidebarOpen = !!hash;
    emit('promotion-selected', { hash: hash, promotion: getPromotion(hash) });
  }

  function deselectPromotion() {
    state.selectedPromotionHash = null;
    state.sidebarOpen = false;
    emit('promotion-deselected', {});
  }

  function setProfile(profile) {
    state.currentProfile = profile;
    emit('profile-changed', { profile: profile });
  }

  function setView(view) {
    state.currentView = view;
    emit('view-changed', { view: view });
  }

  function setSidebarOpen(open) {
    state.sidebarOpen = open;
    emit('sidebar-toggled', { open: open });
  }

  function setBottomMenuOpen(open) {
    state.bottomMenuOpen = open;
    emit('bottom-menu-toggled', { open: open });
  }

  function updatePromotion(hash, updates) {
    var promo = getPromotion(hash);
    if (!promo) return;
    Object.keys(updates).forEach(function (key) {
      promo[key] = updates[key];
    });
    emit('promotion-updated', { hash: hash, promotion: promo });
  }

  function notifyLockChanged(hash) {
    var promo = getPromotion(hash);
    emit('lock-changed', { hash: hash, promotion: promo });
  }

  // ── Public API ────────────────────────────────────────────────────────

  window.lockState = {
    LOCKABLE_FIELDS: LOCKABLE_FIELDS,
    SECTIONS: SECTIONS,
    SECTION_ORDER: SECTION_ORDER,

    state: state,
    init: init,

    on: on,
    off: off,
    emit: emit,

    getPromotion: getPromotion,
    getSelectedPromotion: getSelectedPromotion,
    getPromotionsByCategory: getPromotionsByCategory,

    selectPromotion: selectPromotion,
    deselectPromotion: deselectPromotion,
    setProfile: setProfile,
    setView: setView,
    setSidebarOpen: setSidebarOpen,
    setBottomMenuOpen: setBottomMenuOpen,
    updatePromotion: updatePromotion,
    notifyLockChanged: notifyLockChanged
  };
})();
