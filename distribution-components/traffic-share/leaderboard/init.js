/* leaderboard init — By Store leaderboard rendered as PrimeNG v20 TreeTable
   DOM (UX-928 PrimeNG-first conversion of the verbatim lb- grid carve; the
   carved engine's data shaping is kept intact below, only the DOM emit
   changed). Class scheme + toggler anatomy read from ISC-pinned
   primeng@20.4 TreeTableStyle.classes / TreeTableToggler template:
   toggler = button.p-treetable-toggler, marginInlineStart = level*16px,
   chevron svgs data-p-icon="chevron-right|chevron-down"; sortable th =
   p-sortable-column (+ p-treetable-sortable-column for the @primeuix base
   styles) with div.p-treetable-column-header-content wrapper. Chrome comes
   from vendor/aura.css; density overrides = --p-treetable-* tokens in
   leaderboard.css (the Angular twin's [dt] input analog).
   Behavior: expand/collapse (only expanded children render, like PrimeNG),
   single row-select, WORKING Share sort (desc/asc cycle — behavior ADD per
   #16, proto header was display-only). StoreMap calls verbatim behind
   typeof guards (live at store-map carve).
   Entry seam unchanged: window.DistLeaderboard.build() from the chart-card
   store hook. Angular twin: dh-traffic-share-leaderboard (p-treetable). */
(function () {
  'use strict';

  var D = window.DIST_TRAFFIC_DATA;

  var _leaderboardView = 'ours';    // 'ours' | 'competitors' (locked 'ours' in store pane)
  var _sortKey = 'change';          // proto default: change_pp desc (header shows Share unsorted)
  var _sortOrder = -1;              // for share: -1 desc, 1 asc
  var _expanded = {};               // rowId -> true
  var _selectedId = null;

  // Brand pip colors matching crossover chart
  var LEADERBOARD_BRAND_COLORS = {
    'Publix': '#E07850',
    'Walmart': '#A8BF6E',
    'ALDI': '#2AADDB',
    'Other Retailers': '#9CA3AF',
    'Save A Lot': '#9B7FD4'
  };

  // PrimeNG v20 icon svgs (primeng/icons, viewBox 0 0 14 14, fill currentColor).
  var ICON = {
    chevronRight: '<svg data-p-icon="chevron-right" class="p-icon p-treetable-node-toggle-icon" width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M4.38708 13C4.28408 13.0005 4.18203 12.9804 4.08691 12.9409C3.99178 12.9014 3.9055 12.8433 3.83313 12.7701C3.68634 12.6231 3.60388 12.4238 3.60388 12.2161C3.60388 12.0084 3.68634 11.8091 3.83313 11.6622L8.50507 6.99022L3.83313 2.31827C3.69467 2.16968 3.61928 1.97313 3.62287 1.77005C3.62645 1.56698 3.70872 1.37322 3.85234 1.22959C3.99596 1.08597 4.18972 1.00371 4.3928 1.00012C4.59588 0.996539 4.79242 1.07192 4.94102 1.21039L10.1669 6.43628C10.3137 6.58325 10.3962 6.78249 10.3962 6.99022C10.3962 7.19795 10.3137 7.39718 10.1669 7.54416L4.94102 12.7701C4.86865 12.8433 4.78237 12.9014 4.68724 12.9409C4.59212 12.9804 4.49007 13.0005 4.38708 13Z"/></svg>',
    chevronDown: '<svg data-p-icon="chevron-down" class="p-icon p-treetable-node-toggle-icon" width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M7.01744 10.398C6.91269 10.3985 6.8089 10.378 6.71215 10.3379C6.61541 10.2977 6.52766 10.2386 6.45405 10.1641L1.13907 4.84913C1.03306 4.69404 0.985221 4.5065 1.00399 4.31958C1.02276 4.13266 1.10693 3.95838 1.24166 3.82747C1.37639 3.69655 1.55301 3.61742 1.74039 3.60402C1.92777 3.59062 2.11386 3.64382 2.26584 3.75424L7.01744 8.47394L11.769 3.75424C11.9189 3.65709 12.097 3.61306 12.2748 3.62921C12.4527 3.64535 12.6199 3.72073 12.7498 3.84328C12.8797 3.96582 12.9647 4.12842 12.9912 4.30502C13.0177 4.48162 12.9841 4.662 12.8958 4.81724L7.58083 10.1322C7.50996 10.2125 7.42344 10.2775 7.32656 10.3232C7.22968 10.3689 7.12449 10.3944 7.01744 10.398Z"/></svg>',
    sortAlt: '<svg data-p-icon="sort-alt" class="p-icon p-treetable-sort-icon" width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M5.64515 3.61291C5.47353 3.61291 5.30192 3.54968 5.16644 3.4142L3.38708 1.63484L1.60773 3.4142C1.34579 3.67613 0.912244 3.67613 0.650309 3.4142C0.388374 3.15226 0.388374 2.71871 0.650309 2.45678L2.90837 0.198712C3.17031 -0.0632236 3.60386 -0.0632236 3.86579 0.198712L6.12386 2.45678C6.38579 2.71871 6.38579 3.15226 6.12386 3.4142C5.98837 3.54968 5.81676 3.61291 5.64515 3.61291Z"/><path d="M3.38714 14C3.01681 14 2.70972 13.6929 2.70972 13.3226V0.677419C2.70972 0.307097 3.01681 0 3.38714 0C3.75746 0 4.06456 0.307097 4.06456 0.677419V13.3226C4.06456 13.6929 3.75746 14 3.38714 14Z"/><path d="M10.6129 14C10.4413 14 10.2697 13.9368 10.1342 13.8013L7.87611 11.5432C7.61418 11.2813 7.61418 10.8477 7.87611 10.5858C8.13805 10.3239 8.5716 10.3239 8.83353 10.5858L10.6129 12.3652L12.3922 10.5858C12.6542 10.3239 13.0877 10.3239 13.3497 10.5858C13.6116 10.8477 13.6116 11.2813 13.3497 11.5432L11.0916 13.8013C10.9561 13.9368 10.7845 14 10.6129 14Z"/><path d="M10.6129 14C10.2426 14 9.93552 13.6929 9.93552 13.3226V0.677419C9.93552 0.307097 10.2426 0 10.6129 0C10.9833 0 11.2904 0.307097 11.2904 0.677419V13.3226C11.2904 13.6929 10.9832 14 10.6129 14Z"/></svg>',
    sortDesc: '<svg data-p-icon="sort-amount-down" class="p-icon p-treetable-sort-icon" width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M4.93953 10.5858L3.83759 11.6877V0.677419C3.83759 0.307097 3.53049 0 3.16017 0C2.78985 0 2.48275 0.307097 2.48275 0.677419V11.6877L1.38082 10.5858C1.11888 10.3239 0.685331 10.3239 0.423396 10.5858C0.16146 10.8477 0.16146 11.2813 0.423396 11.5432L2.68146 13.8013C2.74469 13.8645 2.81694 13.9097 2.89823 13.9458C2.97952 13.9819 3.06985 14 3.16017 14C3.25049 14 3.33178 13.9819 3.42211 13.9458C3.5034 13.9097 3.57565 13.8645 3.63888 13.8013L5.89694 11.5432C6.15888 11.2813 6.15888 10.8477 5.89694 10.5858C5.63501 10.3239 5.20146 10.3239 4.93953 10.5858ZM13.0957 0H7.22468C6.85436 0 6.54726 0.307097 6.54726 0.677419C6.54726 1.04774 6.85436 1.35484 7.22468 1.35484H13.0957C13.466 1.35484 13.7731 1.04774 13.7731 0.677419C13.7731 0.307097 13.466 0 13.0957 0ZM7.22468 5.41935H9.48275C9.85307 5.41935 10.1602 5.72645 10.1602 6.09677C10.1602 6.4671 9.85307 6.77419 9.48275 6.77419H7.22468C6.85436 6.77419 6.54726 6.4671 6.54726 6.09677C6.54726 5.72645 6.85436 5.41935 7.22468 5.41935ZM7.6763 8.12903H7.22468C6.85436 8.12903 6.54726 8.43613 6.54726 8.80645C6.54726 9.17677 6.85436 9.48387 7.22468 9.48387H7.6763C8.04662 9.48387 8.35372 9.17677 8.35372 8.80645C8.35372 8.43613 8.04662 8.12903 7.6763 8.12903ZM7.22468 2.70968H11.2892C11.6595 2.70968 11.9666 3.01677 11.9666 3.3871C11.9666 3.75742 11.6595 4.06452 11.2892 4.06452H7.22468C6.85436 4.06452 6.54726 3.75742 6.54726 3.3871C6.54726 3.01677 6.85436 2.70968 7.22468 2.70968Z"/></svg>',
    sortAsc: '<svg data-p-icon="sort-amount-up-alt" class="p-icon p-treetable-sort-icon" width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M3.63435 0.19871C3.57113 0.135484 3.49887 0.0903226 3.41758 0.0541935C3.255 -0.0180645 3.06532 -0.0180645 2.90274 0.0541935C2.82145 0.0903226 2.74919 0.135484 2.68597 0.19871L0.427901 2.45677C0.165965 2.71871 0.165965 3.15226 0.427901 3.41419C0.689836 3.67613 1.12338 3.67613 1.38532 3.41419L2.48726 2.31226V13.3226C2.48726 13.6929 2.79435 14 3.16467 14C3.535 14 3.84209 13.6929 3.84209 13.3226V2.31226L4.94403 3.41419C5.07951 3.54968 5.25113 3.6129 5.42274 3.6129C5.59435 3.6129 5.76597 3.54968 5.90145 3.41419C6.16338 3.15226 6.16338 2.71871 5.90145 2.45677L3.64338 0.19871H3.63435ZM13.7685 13.3226C13.7685 12.9523 13.4615 12.6452 13.0911 12.6452H7.22016C6.84984 12.6452 6.54274 12.9523 6.54274 13.3226C6.54274 13.6929 6.84984 14 7.22016 14H13.0911C13.4615 14 13.7685 13.6929 13.7685 13.3226ZM7.22016 8.58064C6.84984 8.58064 6.54274 8.27355 6.54274 7.90323C6.54274 7.5329 6.84984 7.22581 7.22016 7.22581H9.47823C9.84855 7.22581 10.1556 7.5329 10.1556 7.90323C10.1556 8.27355 9.84855 8.58064 9.47823 8.58064H7.22016ZM7.22016 5.87097H7.67177C8.0421 5.87097 8.34919 5.56387 8.34919 5.19355C8.34919 4.82323 8.0421 4.51613 7.67177 4.51613H7.22016C6.84984 4.51613 6.54274 4.82323 6.54274 5.19355C6.54274 5.56387 6.84984 5.87097 7.22016 5.87097ZM11.2847 11.2903H7.22016C6.84984 11.2903 6.54274 10.9832 6.54274 10.6129C6.54274 10.2426 6.84984 9.93548 7.22016 9.93548H11.2847C11.655 9.93548 11.9621 10.2426 11.9621 10.6129C11.9621 10.9832 11.655 11.2903 11.2847 11.2903Z"/></svg>'
  };

  function haversineDistance(lat1, lng1, lat2, lng2) {
    var R = 3959; // Earth radius in miles
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLng = (lng2 - lng1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // ── Node building (data shaping verbatim from the carved renderLeaderboard;
  //    emits TreeNode-shaped objects instead of lb- grid HTML) ──────────────
  function buildOursNodes() {
    var stores = [].concat(D.trafficShareMetrics.storeLeaderboard);
    if (_sortKey === 'share') {
      stores.sort(function(a, b) { return _sortOrder * (a.wk2_share - b.wk2_share); });
    } else {
      stores.sort(function(a, b) { return b.change_pp - a.change_pp; });
    }

    // Build store → its 5 brand competitors (UX-846 D2). competitorStores now
    // carries exactly 5 per store (one per canonical brand), bound via threatens[].
    var storeCompMap = {};
    var storeEntityById = {};
    var allComps = D.competitorStores;
    D.entities.stores.forEach(function(store) {
      storeEntityById[store.id] = store;
      storeCompMap[store.id] = allComps
        .filter(function(cs) { return cs.threatens.indexOf(store.id) !== -1; })
        .sort(function(a, b) { return (b.wk2_share || 0) - (a.wk2_share || 0); });
    });

    return stores.map(function(s, i) {
      var storeId = 'store-' + s.store_id;
      var ent = storeEntityById[storeId];
      var storeLabel = (ent && ent.name)
        ? '#' + (ent.storeNumber != null ? ent.storeNumber : s.store_id) + ' ' + ent.name
        : 'Store #' + s.store_id;
      return {
        id: storeId, kind: 'store', rank: i + 1, label: storeLabel,
        city: s.city, share: s.wk2_share,
        children: (storeCompMap[storeId] || []).map(function(cs) {
          return {
            id: cs.id, kind: 'comp', parentId: storeId,
            label: cs.storeName || cs.brand, pip: LEADERBOARD_BRAND_COLORS[cs.brand] || '#9CA3AF',
            city: cs.city, share: cs.wk2_share
          };
        })
      };
    });
  }

  // Competitors view (verbatim data shaping, carried for the Angular twin's
  // view input; store pane stays locked to 'ours').
  function buildCompetitorsNodes() {
    var comps = [].concat(D.competitorStores).sort(function(a, b) {
      return (b.wk2_share || 0) - (a.wk2_share || 0);
    });
    // Competitor → Our Stores within trade-area radius. Trade area = grocery
    // industry default 5 mi (Bill: shown to Adam/Max as "directly competing").
    var COMPETITOR_TRADE_AREA_MI = 5;
    var shareByStoreId = {};
    (D.trafficShareMetrics && D.trafficShareMetrics.storeLeaderboard || []).forEach(function(lb) {
      shareByStoreId['store-' + lb.store_id] = lb;
    });
    return comps.map(function(cs, i) {
      var inRange = (!cs.lat || !cs.lng) ? [] : D.entities.stores
        .filter(function(s) { return s.lat && s.lng; })
        .map(function(s) { return { s: s, dist: haversineDistance(cs.lat, cs.lng, s.lat, s.lng) }; })
        .filter(function(x) { return x.dist <= COMPETITOR_TRADE_AREA_MI; })
        .sort(function(a, b) {
          var sa = (shareByStoreId[a.s.id] || {}).wk2_share || 0;
          var sb = (shareByStoreId[b.s.id] || {}).wk2_share || 0;
          return sb - sa;
        })
        .map(function(x) { return x.s; });
      return {
        id: cs.id, kind: 'comp', rank: i + 1,
        label: cs.storeName || cs.brand, pip: LEADERBOARD_BRAND_COLORS[cs.brand] || '#9CA3AF',
        city: cs.city || '', share: cs.wk2_share,
        children: inRange.map(function(s) {
          var lb = shareByStoreId[s.id] || {};
          return {
            id: s.id, kind: 'store', parentId: cs.id,
            label: '#' + (s.storeNumber != null ? s.storeNumber : s.id.replace(/^store-/, '')) + (s.name ? ' ' + s.name : ''),
            city: s.city || '', share: lb.wk2_share
          };
        })
      };
    });
  }

  // ── TreeTable DOM emit ────────────────────────────────────────────────────
  function fmtShare(v) { return v != null ? v + '%' : '—'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function togglerHtml(node, level) {
    var hasChildren = node.children && node.children.length > 0;
    return '<button type="button" class="p-treetable-toggler" tabindex="-1"' +
      ' style="visibility:' + (hasChildren ? 'visible' : 'hidden') + ';margin-inline-start:' + (level * 16) + 'px"' +
      ' aria-label="Toggle row" data-toggle-id="' + node.id + '">' +
      (_expanded[node.id] ? ICON.chevronDown : ICON.chevronRight) +
    '</button>';
  }

  function rowHtml(node, level) {
    var seamAttr = node.kind === 'store'
      ? 'data-store-id="' + node.id + '"' + (node.parentId ? ' data-parent-comp-id="' + node.parentId + '"' : '')
      : 'data-comp-id="' + node.id + '"' + (node.parentId ? ' data-parent-store-id="' + node.parentId + '"' : '');
    var html = '<tr role="row" aria-level="' + (level + 1) + '"' +
      ' class="' + (_selectedId === node.id ? 'p-treetable-row-selected' : '') + '" ' + seamAttr + '>' +
      '<td role="cell"><div class="p-treetable-body-cell-content">' +
        togglerHtml(node, level) +
        (node.rank != null ? '<span class="lb-rank">' + node.rank + '</span>' : '') +
        (node.pip ? '<span class="lb-comp-pip" style="background:' + node.pip + ';"></span>' : '') +
        '<span class="lb-store-label">' + esc(node.label) + '</span>' +
      '</div></td>' +
      '<td role="cell" class="lb-td-city">' + esc(node.city || '') + '</td>' +
      '<td role="cell" class="lb-td-share">' + fmtShare(node.share) + '</td>' +
    '</tr>';
    if (_expanded[node.id] && node.children) {
      node.children.forEach(function(c) { html += rowHtml(c, level + 1); });
    }
    return html;
  }

  function render(root) {
    var thead = root.querySelector('.p-treetable-thead');
    var tbody = root.querySelector('.p-treetable-tbody');
    if (!thead || !tbody) return;

    var shareSorted = _sortKey === 'share';
    thead.innerHTML = '<tr role="row">' +
      '<th role="columnheader" class="p-treetable-header-cell">Store</th>' +
      '<th role="columnheader" class="p-treetable-header-cell lb-td-city">City</th>' +
      '<th role="columnheader" class="p-treetable-header-cell p-sortable-column p-treetable-sortable-column lb-td-share' +
        (shareSorted ? ' p-treetable-column-sorted' : '') + '"' +
        ' data-sort="share" tabindex="0" aria-sort="' + (shareSorted ? (_sortOrder === -1 ? 'descending' : 'ascending') : 'none') + '">' +
        '<div class="p-treetable-column-header-content">' +
          '<span class="p-treetable-column-title">Share</span>' +
          (shareSorted ? (_sortOrder === -1 ? ICON.sortDesc : ICON.sortAsc) : ICON.sortAlt) +
        '</div>' +
      '</th>' +
    '</tr>';

    var nodes = _leaderboardView === 'competitors' ? buildCompetitorsNodes() : buildOursNodes();
    var html = '';
    nodes.forEach(function(n) { html += rowHtml(n, 0); });
    tbody.innerHTML = html;
  }

  // ── Interactions (StoreMap seams identical to the verbatim carve) ────────
  function bindStoreTabInteractions(root) {
    var container = root.querySelector('.p-treetable-table-container');
    root.addEventListener('click', function(e) {
      var toggler = e.target.closest('.p-treetable-toggler');
      if (toggler) {
        e.stopPropagation();
        var id = toggler.dataset.toggleId;
        _expanded[id] = !_expanded[id];
        var scroll = container ? container.scrollTop : 0;
        render(root);
        if (container) container.scrollTop = scroll;
        return;
      }
      var sortTh = e.target.closest('[data-sort="share"]');
      if (sortTh) {
        // PrimeNG single-sort cycle on the Share column; default state = proto's
        // change_pp order (behavior ADD per #16 — proto header was display-only).
        if (_sortKey === 'share') { _sortOrder = -_sortOrder; }
        else { _sortKey = 'share'; _sortOrder = -1; }
        var s2 = container ? container.scrollTop : 0;
        render(root);
        if (container) container.scrollTop = s2;
        return;
      }
      // Competitor child row → zoom to its diamond marker AND draw the parent
      // store's proximity rings, so it's clear which store this is a competitor of.
      var childRow = e.target.closest('tr[data-comp-id]');
      if (childRow && childRow.dataset.parentStoreId) {
        selectRow(root, childRow);
        if (typeof StoreMap !== 'undefined') {
          if (StoreMap.showParentAndCompetitor) {
            StoreMap.showParentAndCompetitor(childRow.dataset.parentStoreId, childRow.dataset.compId);
            var clegend = document.getElementById('ring-legend-store');
            if (clegend) clegend.style.display = 'flex'; // rings now visible at parent
          } else {
            StoreMap.highlightCompetitor(childRow.dataset.compId);
          }
        }
        return;
      }
      var parentRow = e.target.closest('tr[data-store-id]');
      if (!parentRow || parentRow.dataset.parentCompId) return;
      selectRow(root, parentRow);
      parentRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      if (typeof StoreMap !== 'undefined') StoreMap.highlightStore(parentRow.dataset.storeId);
      var legend = document.getElementById('ring-legend-store');
      if (legend) legend.style.display = 'flex';
    });
    var resetBtn = document.getElementById('traffic-map-reset-btn-store');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        _selectedId = null;
        root.querySelectorAll('.p-treetable-row-selected').forEach(function(r) { r.classList.remove('p-treetable-row-selected'); });
        var legend = document.getElementById('ring-legend-store');
        if (legend) legend.style.display = 'none';
        if (typeof StoreMap !== 'undefined') StoreMap.fitBounds();
      });
    }
  }

  function selectRow(root, tr) {
    _selectedId = tr.dataset.storeId || tr.dataset.compId;
    root.querySelectorAll('.p-treetable-row-selected').forEach(function(r) { r.classList.remove('p-treetable-row-selected'); });
    tr.classList.add('p-treetable-row-selected');
  }

  // Entry seam — the store-pane slice of proto buildStorePane(). Locked to
  // Our Stores, like the proto.
  window.DistLeaderboard = {
    build: function () {
      var root = document.getElementById('leaderboard-table-store');
      if (!root) return;
      _leaderboardView = 'ours';
      render(root);
      bindStoreTabInteractions(root);
    },
    // Reverse seam for the store-map carve: a marker click needs to select
    // the matching row. Old proto renderMap() touched .lb-row--parent
    // directly; the p-treetable conversion replaced that markup, so
    // store-map/init.js calls this instead of reaching into our DOM itself.
    selectStore: function (storeId) {
      var root = document.getElementById('leaderboard-table-store');
      var tr = root && root.querySelector('tr[data-store-id="' + storeId + '"]');
      if (tr) selectRow(root, tr);
    }
  };
})();
