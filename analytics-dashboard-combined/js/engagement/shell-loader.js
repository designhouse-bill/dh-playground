/**
 * shell-loader.js — UX-846 Phase 1
 *
 * Runtime fetch+inject for partials/engagement-tabs-shell.html.
 * Mount: <div data-shell="engagement-tabs"></div> placeholder in consumer page.
 * Active perf-tab: body[data-active-tab="overview|sessions|users|duration|cardevents|data-grid"].
 *
 * After inject, dispatches `engagement-shell:loaded` on document so downstream
 * scripts (canonical-shell-tabs.js, header-slide.js, page-app) can wire up.
 */
(function () {
  'use strict';

  function markActiveTab(root, activeKey) {
    if (!activeKey) return;
    var tabs = root.querySelectorAll('.perf-tabs .perf-tab');
    tabs.forEach(function (t) {
      var on = t.dataset.epTab === activeKey;
      t.classList.toggle('active', on);
      if (on) t.setAttribute('aria-selected', 'true');
      else t.removeAttribute('aria-selected');
    });
  }

  function wireTabNav(root) {
    var tabs = root.querySelectorAll('.perf-tabs .perf-tab[data-href]');
    tabs.forEach(function (t) {
      if (t.tagName === 'A' && t.dataset.href) t.setAttribute('href', t.dataset.href);
    });
  }

  // Phase 1 layout: perf-tabs strip renders below per-page ep-circular-info.
  // Shell injects perf-tabs at top; we move it post-injection so the entity-counts
  // row appears above the metric tab strip without duplicating the partial.
  function relocatePerfTabs(root) {
    var perfTabs = root.querySelector('.perf-tabs');
    var infoRow = document.querySelector('.ep-circular-info');
    if (perfTabs && infoRow && infoRow.parentNode) {
      infoRow.parentNode.insertBefore(perfTabs, infoRow.nextSibling);
    }
  }

  function wireDashboardSwitcherLinks(root) {
    root.querySelectorAll('[data-href]').forEach(function (el) {
      if (el.tagName === 'A' && !el.getAttribute('href')) el.setAttribute('href', el.dataset.href);
    });
  }

  function load() {
    var mount = document.querySelector('[data-shell="engagement-tabs"]');
    if (!mount) return;
    var src = mount.dataset.src || 'partials/engagement-tabs-shell.html';
    fetch(src, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('shell fetch ' + r.status);
        return r.text();
      })
      .then(function (html) {
        mount.innerHTML = html;
        var activeKey = document.body.dataset.activeTab;
        markActiveTab(mount, activeKey);
        wireTabNav(mount);
        wireDashboardSwitcherLinks(mount);
        relocatePerfTabs(mount);
        document.dispatchEvent(new CustomEvent('engagement-shell:loaded', { detail: { activeTab: activeKey } }));
      })
      .catch(function (e) {
        console.error('[shell-loader] failed:', e);
        mount.innerHTML = '<div style="padding:1rem;color:#b00;">Shell failed to load.</div>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
