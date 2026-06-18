/* ============================================================
   nav-a1.js — UX-846 Variant A1 shared header loader

   Fetch+inject partials/canonical-topbar.html into <div data-shell="topbar">,
   then populate Row 1 (product buttons) + Row 2 (section tabs) + Actions menu
   from window.NAV_CONFIG. Single source of truth for the header across pages.

   NAV_CONFIG shape:
   {
     title: 'Analytics Dashboard',
     product: 'distribution',                 // active product id
     entitlements: ['engagement','distribution'],  // length 1 → collapse Row 1
     products: [ {id,label,icon?,href}, ... ],
     sections: [ {id,label,section?,href}, ... ],   // section = color key (data-section)
     activeSection: 'traffic',
     actions: ['export','print','share'],
   }

   Dispatches `nav-a1:loaded` on document after render.
   ============================================================ */
(function () {
  'use strict';

  var ACTION_ORDER = ['customize', 'export', 'print', 'share'];
  var ACTION_DEFS = {
    customize: { label: 'Customize', icon: 'tune' },
    export:    { label: 'Export CSV', icon: 'download' },
    print:     { label: 'Print View', icon: 'print' },
    share:     { label: 'Share',      icon: 'share' }
  };
  var PRODUCT_LABEL = { engagement: 'Engagement', distribution: 'Distribution' };

  // Central nav catalog — pages declare only {product, activeSection, actions}.
  // (Angular port: this becomes a NavRegistry service.)
  var DEFAULT_ENTITLEMENTS = ['engagement', 'distribution'];
  var PRODUCTS = [
    { id: 'engagement',   label: 'Engagement',   href: 'engagement-report.html?tab=performance' },
    { id: 'distribution', label: 'Distribution', href: 'distribution-traffic.html' }
  ];
  var SECTIONS = {
    engagement: [
      { id: 'report',  label: 'Report',       href: 'engagement-report.html?tab=performance' },
      { id: 'explore', label: 'Explore Data', href: 'engagement-explore-base.html' },
      { id: 'compare', label: 'Compare',      href: 'engagement-compare.html' }
    ],
    distribution: [
      { id: 'media',        label: 'Paid Media',            href: 'distribution-media.html' },
      { id: 'traffic',      label: 'Traffic Share',         href: 'distribution-traffic.html' },
      { id: 'visitation',   label: 'Observed Visits',       href: 'distribution-visitation.html' },
      { id: 'demographics', label: 'Observed Demographics', href: 'distribution-demographics.html' }
    ]
  };
  function normalize(cfg) {
    cfg.title = cfg.title || 'Analytics Dashboard';
    cfg.products = cfg.products || PRODUCTS;
    cfg.entitlements = cfg.entitlements || DEFAULT_ENTITLEMENTS;
    cfg.sections = (cfg.sections != null) ? cfg.sections : (SECTIONS[cfg.product] || []);
    cfg.actions = cfg.actions || [];
    return cfg;
  }

  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function icon(name) {
    var s = el('span', 'material-symbols-outlined', { 'aria-hidden': 'true' });
    s.textContent = name;
    return s;
  }

  function renderProduct(root, cfg) {
    var slot = root.querySelector('[data-nav="product"]');
    var sep  = root.querySelector('[data-nav="sep"]');
    var title = root.querySelector('[data-nav="title"]');
    if (title) {
      title.textContent = cfg.title || 'Analytics Dashboard';
      // Brand title navigates home to the Analytics Dashboard (index.html).
      title.style.cursor = 'pointer';
      title.setAttribute('role', 'link');
      title.setAttribute('tabindex', '0');
      title.addEventListener('click', function () { location.href = 'index.html'; });
      title.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); location.href = 'index.html'; } });
    }

    var ent = cfg.entitlements || (cfg.products || []).map(function (p) { return p.id; });
    // Single product → no switcher; fold product name into the title.
    if (ent.length <= 1) {
      if (sep) sep.remove();
      if (slot) slot.remove();
      if (title && cfg.product) {
        var suffix = el('small', 'title__suffix');
        suffix.textContent = ' · ' + (PRODUCT_LABEL[cfg.product] || cfg.product);
        title.appendChild(suffix);
      }
      return;
    }
    (cfg.products || []).forEach(function (p) {
      if (ent.indexOf(p.id) === -1) return;
      var a = el('a', 'product-btn' + (p.id === cfg.product ? ' active' : ''), { href: p.href });
      if (p.id === cfg.product) a.setAttribute('aria-current', 'page');
      if (p.icon) a.appendChild(icon(p.icon));
      a.appendChild(document.createTextNode(p.label || PRODUCT_LABEL[p.id] || p.id));
      slot.appendChild(a);
    });
  }

  function renderSections(root, cfg) {
    var slot = root.querySelector('[data-nav="section"]');
    if (!slot) return;
    var sections = cfg.sections || [];
    if (!sections.length) { slot.remove(); return; }  // e.g. index Combined
    sections.forEach(function (s) {
      var active = s.id === cfg.activeSection;
      var a = el('a', 'perf-tab' + (active ? ' active' : ''),
        { href: s.href, role: 'tab', 'data-section': s.section || s.id });
      a.setAttribute('aria-selected', active ? 'true' : 'false');
      if (active) a.setAttribute('aria-current', 'page');
      a.textContent = s.label;
      slot.appendChild(a);
    });
  }

  function renderActions(root, cfg) {
    var slot = root.querySelector('[data-nav="actions"]');
    if (!slot) return;
    var actions = (cfg.actions || []).slice().sort(function (a, b) {
      return ACTION_ORDER.indexOf(a) - ACTION_ORDER.indexOf(b);
    });
    if (!actions.length) { slot.remove(); return; }

    var menu = el('div', 'action-menu');
    var trigger = el('button', 'action-menu__trigger',
      { 'aria-haspopup': 'true', 'aria-expanded': 'false', 'aria-label': 'Page actions' });
    trigger.appendChild(icon('more_horiz'));
    var lbl = el('span'); lbl.textContent = 'Actions'; trigger.appendChild(lbl);
    var list = el('div', 'action-menu__list', { role: 'menu', hidden: 'hidden' });
    actions.forEach(function (key) {
      var def = ACTION_DEFS[key]; if (!def) return;
      var item = el('button', 'action-menu__item', { role: 'menuitem', 'data-action': key });
      item.appendChild(icon(def.icon));
      item.appendChild(document.createTextNode(def.label));
      item.addEventListener('click', function () {
        list.hidden = true;
        // Behaviour contract: pages listen for nav-a1:action and act (export/print/
        // share/customize). Stub until each is wired (Export gated on design pass).
        document.dispatchEvent(new CustomEvent('nav-a1:action', { detail: { action: key } }));
      });
      list.appendChild(item);
    });
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !list.hidden;
      document.querySelectorAll('.action-menu__list').forEach(function (l) { l.hidden = true; });
      list.hidden = open;
      trigger.setAttribute('aria-expanded', String(!open));
    });
    menu.appendChild(trigger); menu.appendChild(list);
    slot.appendChild(menu);
  }

  // Hero eyebrow shows "Product | Section" (e.g. "Engagement | Report") so the
  // active sub-tab is named in the hero-stat. Targets the page hero's eyebrow.
  function updateHeroEyebrow(cfg) {
    var eyebrow = document.querySelector('.hero-stat .narrative-header__section')
               || document.querySelector('.narrative-header__section');
    if (!eyebrow) return;
    var productLabel = PRODUCT_LABEL[cfg.product];
    var section = (cfg.sections || []).filter(function (s) { return s.id === cfg.activeSection; })[0];
    if (!productLabel || !section) return;
    // Suppress the "| Section" when the page H1 already names the section
    // (Distribution: title "Traffic Share" == section label) so the eyebrow
    // doesn't echo the title. Engagement keeps it — its title is per-tab
    // ("Performance Score") and never equals the section label ("Report").
    var header = (eyebrow.closest && eyebrow.closest('.narrative-header')) || document;
    var titleEl = header.querySelector('.narrative-header__title');
    var title = titleEl ? titleEl.textContent.trim() : '';
    var redundant = title && title.toLowerCase() === section.label.toLowerCase();
    eyebrow.textContent = redundant ? productLabel : productLabel + ' | ' + section.label;
  }

  function render(mount, cfg) {
    renderProduct(mount, cfg);
    renderSections(mount, cfg);
    renderActions(mount, cfg);
    updateHeroEyebrow(cfg);
    document.addEventListener('click', function () {
      document.querySelectorAll('.action-menu__list').forEach(function (l) { l.hidden = true; });
    });
    document.dispatchEvent(new CustomEvent('nav-a1:loaded'));
  }

  // Topbar shell — EMBEDDED, not fetched, so the prototype works on file://
  // (Chrome blocks fetch of local files from a file:// origin) as well as a
  // server. Mirror of partials/canonical-topbar.html — keep the two in sync.
  var TOPBAR_HTML =
    '<div class="topbar topbar--a1">' +
      '<div class="topbar__row topbar__row--product">' +
        '<div class="brand"><h1 class="title" data-nav="title">Analytics Dashboard</h1></div>' +
        '<span class="topbar__separator" data-nav="sep">|</span>' +
        '<nav class="product-nav" data-nav="product" aria-label="Product dashboard"></nav>' +
        '<div class="topbar__actions" data-nav="actions"></div>' +
      '</div>' +
      '<div class="topbar__row topbar__row--section">' +
        '<nav class="perf-tabs perf-tabs--nav" data-nav="section" role="tablist" aria-label="Section"></nav>' +
      '</div>' +
    '</div>';

  function boot() {
    var mountPoint = document.querySelector('[data-shell="topbar"]');
    var cfg = window.NAV_CONFIG;
    if (!mountPoint || !cfg) return;
    normalize(cfg);
    mountPoint.innerHTML = TOPBAR_HTML;   // synchronous → no CORS, works on file://
    render(mountPoint, cfg);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
