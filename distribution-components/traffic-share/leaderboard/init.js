/* leaderboard init — the By Store leaderboard engine slice of
   js/distribution/distribution.js (renderLeaderboard / renderLeaderboardInto /
   bindStoreTabInteractions / haversineDistance + LEADERBOARD_BRAND_COLORS),
   carved verbatim. D = static snapshot (data/traffic-share-data.js); the
   page-level `elements` cache shrinks to the one entry this slice reads.
   All StoreMap calls stay verbatim behind their typeof guards — they become
   live again when the store-map carve lands beside this fragment.
   Entry seam: window.DistLeaderboard.build(), called by the chart-card store
   hook on first tab show (proto: DistributionTraffic.buildStorePane).
   Angular twin: dh-traffic-share-leaderboard (module) → p-treetable. */
(function () {
  'use strict';

  var D = window.DIST_TRAFFIC_DATA;
  var elements = { leaderboardTable: null };

  let _leaderboardSort = 'change';  // current sort column
  let _leaderboardView = 'ours';    // 'ours' | 'competitors'

  // Brand pip colors matching crossover chart
  var LEADERBOARD_BRAND_COLORS = {
    'Publix': '#E07850',
    'Walmart': '#A8BF6E',
    'ALDI': '#2AADDB',
    'Other Retailers': '#9CA3AF',
    'Save A Lot': '#9B7FD4'
  };

  function renderLeaderboard(sortBy) {
    if (sortBy) _leaderboardSort = sortBy;

    // Competitors view: flat list of competitor stores sorted by share.
    if (_leaderboardView === 'competitors') {
      var comps = [].concat(D.competitorStores).sort(function(a, b) {
        return (b.wk2_share || 0) - (a.wk2_share || 0);
      });
      // Competitor → Our Stores within trade-area radius. Trade area = grocery
      // industry default 5 mi (Bill: shown to Adam/Max as "directly competing").
      // Future: per-format threshold (supercenter ~7–10 mi, convenience ~1 mi)
      // and panel-crossover overlay where available.
      var COMPETITOR_TRADE_AREA_MI = 5;
      var shareByStoreId = {};
      (D.trafficShareMetrics && D.trafficShareMetrics.storeLeaderboard || []).forEach(function(lb) {
        shareByStoreId['store-' + lb.store_id] = lb;
      });
      var compStoreMap = {};
      D.competitorStores.forEach(function(cs) {
        if (!cs.lat || !cs.lng) return;
        var inRange = D.entities.stores
          .filter(function(s) { return s.lat && s.lng; })
          .map(function(s) { return { s: s, dist: haversineDistance(cs.lat, cs.lng, s.lat, s.lng) }; })
          .filter(function(x) { return x.dist <= COMPETITOR_TRADE_AREA_MI; })
          .sort(function(a, b) {
            var sa = (shareByStoreId[a.s.id] || {}).wk2_share || 0;
            var sb = (shareByStoreId[b.s.id] || {}).wk2_share || 0;
            return sb - sa;
          })
          .map(function(x) { return x.s; });
        if (inRange.length) compStoreMap[cs.id] = inRange;
      });

      var compHtml = '<div class="lb-header">' +
        '<span class="lb-col lb-col--expand"></span>' +
        '<span class="lb-col lb-col--store">Competitor</span>' +
        '<span class="lb-col lb-col--city">City</span>' +
        '<span class="lb-col lb-col--share">Share</span>' +
      '</div>';
      comps.forEach(function(cs, i) {
        var pipColor = LEADERBOARD_BRAND_COLORS[cs.brand] || '#9CA3AF';
        var ourStores = compStoreMap[cs.id] || [];
        var hasChildren = ourStores.length > 0;
        compHtml += '<div class="lb-row lb-row--parent' + (hasChildren ? '' : ' lb-row--leaf') + '" data-comp-id="' + cs.id + '">' +
          '<span class="lb-col lb-col--expand">' +
            (hasChildren
              ? '<button class="lb-expand-btn" aria-expanded="false" title="Show our stores in range"><span class="material-symbols-outlined">chevron_right</span></button>'
              : '') +
          '</span>' +
          '<span class="lb-col lb-col--store">' +
            '<span class="lb-rank">' + (i + 1) + '</span>' +
            '<span class="lb-comp-pip" style="background:' + pipColor + ';"></span>' +
            (cs.storeName || cs.brand) +
          '</span>' +
          '<span class="lb-col lb-col--city">' + (cs.city || '') + '</span>' +
          '<span class="lb-col lb-col--share">' + (cs.wk2_share != null ? cs.wk2_share + '%' : '—') + '</span>' +
        '</div>';
        if (hasChildren) {
          compHtml += '<div class="lb-children" id="lb-children-comp-' + cs.id + '">';
          ourStores.forEach(function(s) {
            var lb = shareByStoreId[s.id] || {};
            var displayName = '#' + (s.storeNumber != null ? s.storeNumber : s.id.replace(/^store-/, '')) + (s.name ? ' ' + s.name : '');
            compHtml += '<div class="lb-row lb-row--child" data-store-id="' + s.id + '" data-parent-comp-id="' + cs.id + '">' +
              '<span class="lb-col lb-col--expand"></span>' +
              '<span class="lb-col lb-col--store">' + displayName + '</span>' +
              '<span class="lb-col lb-col--city">' + (s.city || '') + '</span>' +
              '<span class="lb-col lb-col--share">' + (lb.wk2_share != null ? lb.wk2_share + '%' : '—') + '</span>' +
            '</div>';
          });
          compHtml += '</div>';
        }
      });
      elements.leaderboardTable.innerHTML = compHtml;
      return;
    }

    var stores = [].concat(D.trafficShareMetrics.storeLeaderboard);
    if (_leaderboardSort === 'share') {
      stores.sort(function(a, b) { return b.wk2_share - a.wk2_share; });
    } else {
      stores.sort(function(a, b) { return b.change_pp - a.change_pp; });
    }

    // Build store → its 5 brand competitors (UX-846 D2). competitorStores now
    // carries exactly 5 per store (one per canonical brand), bound via threatens[].
    // Filter by threatens, sort by share desc — one distinct competitor entity each.
    var storeCompMap = {};
    var storeEntityById = {};
    var allComps = D.competitorStores;
    D.entities.stores.forEach(function(store) {
      storeEntityById[store.id] = store;
      storeCompMap[store.id] = allComps
        .filter(function(cs) { return cs.threatens.indexOf(store.id) !== -1; })
        .sort(function(a, b) { return (b.wk2_share || 0) - (a.wk2_share || 0); });
    });

    var sortIcon = function(col) {
      return col === _leaderboardSort
        ? '<span class="material-symbols-outlined lb-sort-icon lb-sort-icon--active">arrow_downward</span>'
        : '<span class="material-symbols-outlined lb-sort-icon lb-sort-icon--inactive">unfold_more</span>';
    };

    var html = '<div class="lb-header">' +
      '<span class="lb-col lb-col--expand"></span>' +
      '<span class="lb-col lb-col--store">Store</span>' +
      '<span class="lb-col lb-col--city">City</span>' +
      '<span class="lb-col lb-col--share lb-col--sortable' + (_leaderboardSort === 'share' ? ' lb-col--sorted' : '') + '" data-sort="share">Share ' + sortIcon('share') + '</span>' +
    '</div>';

    stores.forEach(function(s, i) {
      var storeId = 'store-' + s.store_id;
      var competitors = storeCompMap[storeId] || [];
      var hasChildren = competitors.length > 0;
      var ent = storeEntityById[storeId];
      var storeLabel = (ent && ent.name)
        ? '#' + (ent.storeNumber != null ? ent.storeNumber : s.store_id) + ' ' + ent.name
        : 'Store #' + s.store_id;

      html += '<div class="lb-row lb-row--parent' + (hasChildren ? '' : ' lb-row--leaf') + '" data-store-id="' + storeId + '">' +
        '<span class="lb-col lb-col--expand">' +
          (hasChildren
            ? '<button class="lb-expand-btn" aria-expanded="false" title="Show competitors"><span class="material-symbols-outlined">chevron_right</span></button>'
            : '') +
        '</span>' +
        '<span class="lb-col lb-col--store">' +
          '<span class="lb-rank">' + (i + 1) + '</span>' +
          storeLabel +
        '</span>' +
        '<span class="lb-col lb-col--city">' + s.city + '</span>' +
        '<span class="lb-col lb-col--share">' + s.wk2_share + '%</span>' +
      '</div>';

      if (hasChildren) {
        html += '<div class="lb-children" id="lb-children-' + storeId + '">';
        competitors.forEach(function(cs) {
          var pipColor = LEADERBOARD_BRAND_COLORS[cs.brand] || '#9CA3AF';
          html += '<div class="lb-row lb-row--child" data-comp-id="' + cs.id + '" data-parent-store-id="' + storeId + '">' +
            '<span class="lb-col lb-col--expand"></span>' +
            '<span class="lb-col lb-col--store">' +
              '<span class="lb-comp-pip" style="background:' + pipColor + ';"></span>' +
              (cs.storeName || cs.brand) +
            '</span>' +
            '<span class="lb-col lb-col--city">' + cs.city + '</span>' +
            '<span class="lb-col lb-col--share">' + cs.wk2_share + '%</span>' +
          '</div>';
        });
        html += '</div>';
      }
    });

    elements.leaderboardTable.innerHTML = html;
  }

  function renderLeaderboardInto(targetEl, viewOverride, sortBy) {
    if (!targetEl) return;
    var savedTable = elements.leaderboardTable;
    var savedView = _leaderboardView;
    elements.leaderboardTable = targetEl;
    if (viewOverride) _leaderboardView = viewOverride;
    renderLeaderboard(sortBy);
    elements.leaderboardTable = savedTable;
    _leaderboardView = savedView;
  }

  // ── By Store tab interactions ─────────────────────────────────────────────
  function bindStoreTabInteractions() {
    var table = document.getElementById('leaderboard-table-store');
    if (!table) return;
    table.addEventListener('click', function(e) {
      var expandBtn = e.target.closest('.lb-expand-btn');
      if (expandBtn) {
        e.stopPropagation();
        var parentRow = expandBtn.closest('.lb-row--parent');
        var sid = parentRow ? parentRow.dataset.storeId : null;
        if (!sid) return;
        var children = document.getElementById('lb-children-' + sid);
        if (!children) return;
        children.classList.toggle('open', !children.classList.contains('open'));
        expandBtn.setAttribute('aria-expanded', String(children.classList.contains('open')));
        return;
      }
      // Competitor child row → zoom to its diamond marker AND draw the parent
      // store's proximity rings, so it's clear which store this is a competitor of.
      var childRow = e.target.closest('.lb-row--child');
      if (childRow && childRow.dataset.compId) {
        table.querySelectorAll('.lb-row--selected').forEach(function(r) { r.classList.remove('lb-row--selected'); });
        childRow.classList.add('lb-row--selected');
        var parentStoreId = childRow.dataset.parentStoreId;
        if (typeof StoreMap !== 'undefined') {
          if (parentStoreId && StoreMap.showParentAndCompetitor) {
            StoreMap.showParentAndCompetitor(parentStoreId, childRow.dataset.compId);
            var clegend = document.getElementById('ring-legend-store');
            if (clegend) clegend.style.display = 'flex'; // rings now visible at parent
          } else {
            StoreMap.highlightCompetitor(childRow.dataset.compId);
          }
        }
        return;
      }
      var parentRow = e.target.closest('.lb-row--parent');
      if (!parentRow || !parentRow.dataset.storeId) return;
      table.querySelectorAll('.lb-row--selected').forEach(function(r) { r.classList.remove('lb-row--selected'); });
      parentRow.classList.add('lb-row--selected');
      parentRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      if (typeof StoreMap !== 'undefined') StoreMap.highlightStore(parentRow.dataset.storeId);
      var legend = document.getElementById('ring-legend-store');
      if (legend) legend.style.display = 'flex';
    });
    var resetBtn = document.getElementById('traffic-map-reset-btn-store');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        table.querySelectorAll('.lb-row--selected').forEach(function(r) { r.classList.remove('lb-row--selected'); });
        var legend = document.getElementById('ring-legend-store');
        if (legend) legend.style.display = 'none';
        if (typeof StoreMap !== 'undefined') StoreMap.fitBounds();
      });
    }
  }

  function haversineDistance(lat1, lng1, lat2, lng2) {
    var R = 3959; // Earth radius in miles
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLng = (lng2 - lng1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Entry seam — the store-pane slice of proto buildStorePane() (map half
  // arrives with the store-map carve). Locked to Our Stores, like the proto.
  window.DistLeaderboard = {
    build: function () {
      renderLeaderboardInto(document.getElementById('leaderboard-table-store'), 'ours');
      bindStoreTabInteractions();
    }
  };
})();
