/* traffic-share/store-map — Leaflet map (UX-928, 2026-07-02). Two parts:
   1) StoreMap module, verbatim from js/distribution/store-map.js (top-level
      `const StoreMap`, unchanged — this is the exact global name every other
      carved component's `typeof StoreMap !== 'undefined'` guard expects, so
      it stays un-renamed rather than folded into a window.Dist* seam).
   2) A thin build/invalidate wrapper carved from distribution.js renderMap()
      + DistributionTraffic.buildStorePane() (the map half only — the
      leaderboard half is traffic-share/leaderboard). Entry seam:
      window.DistStoreMap.build()/.invalidate(), called from chart-card's
      onSub('store') lazy-build (mirrors window.DistLeaderboard.build()).
      Marker click → row-select routes through window.DistLeaderboard.selectStore()
      since the leaderboard's PrimeNG treetable conversion replaced the old
      .lb-row--parent[data-store-id] selectors renderMap() used to touch. */

/**
 * Store Map — Leaflet Map Component
 * Renders store locations color-coded by performance group.
 *
 * Dependencies: Leaflet (L global), DistributionEntities
 */

const StoreMap = (function() {
  'use strict';

  let map = null;
  let markersLayer = null;
  let competitorLayer = null;
  let _proximityLayer = null;
  let _proximityVisible = true;
  let _competitorVisible = false;
  let _onStoreClick = null;
  let _onCompetitorClick = null;
  let _pendingTimeout = null; // tracks pending post-animation popup so we can cancel on new nav

  // Crossover chart colors — top 5 competitors get colored pips matching chart segments
  const CROSSOVER_COLORS = ['#E07850', '#A8BF6E', '#2AADDB', '#9CA3AF', '#9B7FD4'];

  // Map brand name → crossover color (order matches crossover chart sort)
  // Updated dynamically by setCompetitorRanking()
  let COMPETITOR_PIP_COLORS = {
    'Publix': CROSSOVER_COLORS[0],
    'Walmart': CROSSOVER_COLORS[1],
    'ALDI': CROSSOVER_COLORS[2],
    'Other Retailers': CROSSOVER_COLORS[3],
    'Save A Lot': CROSSOVER_COLORS[4]
  };

  /**
   * Update pip color mapping based on current crossover ranking.
   * @param {Array<string>} rankedNames - Top 5 competitor names in crossover sort order
   */
  function setCompetitorRanking(rankedNames) {
    COMPETITOR_PIP_COLORS = {};
    rankedNames.forEach(function (name, i) {
      if (i < CROSSOVER_COLORS.length) {
        COMPETITOR_PIP_COLORS[name] = CROSSOVER_COLORS[i];
      }
    });
  }

  // Brand color for our store pins (replaces health-graded green/amber/red)
  const BRAND_COLOR = '#4272D8';

  // Segment colors matching bar view
  const SEGMENT_COLORS = {
    new: '#4272D8',
    returning: '#F59E0B',
    loyal: '#10B981'
  };

  // ========================================
  // Dark hover tooltip — reuses the canonical chart-hover overlay
  // (.ov-tooltip / .ov-tooltip--dark in distribution.css) so the map hover
  // is styled identically to every other hover overlay on the dashboard.
  // Hard rule: all maps use the dark overlay on hover.
  // ========================================

  let _mapTip = null;
  let _mapTipVisible = false;

  function ensureMapTip() {
    if (_mapTip) return _mapTip;
    _mapTip = document.createElement('div');
    _mapTip.className = 'ov-tooltip ov-tooltip--dark';
    document.body.appendChild(_mapTip);
    document.addEventListener('mousemove', function (e) {
      if (_mapTipVisible) positionMapTip(e);
    });
    return _mapTip;
  }
  function positionMapTip(e) {
    if (!_mapTip) return;
    var r = _mapTip.getBoundingClientRect();
    var x = e.clientX + 14, y = e.clientY + 14;
    if (x + r.width  > window.innerWidth  - 8) x = e.clientX - r.width  - 14;
    if (y + r.height > window.innerHeight - 8) y = e.clientY - r.height - 14;
    _mapTip.style.left = x + 'px';
    _mapTip.style.top  = y + 'px';
  }
  function showMapTip(html, originalEvent) {
    var t = ensureMapTip();
    t.innerHTML = html;
    t.classList.add('ov-tooltip--visible');
    _mapTipVisible = true;
    if (originalEvent) positionMapTip(originalEvent);
  }
  function hideMapTip() {
    _mapTipVisible = false;
    if (_mapTip) _mapTip.classList.remove('ov-tooltip--visible');
  }
  function tipRow(color, name, val) {
    return '<div class="ov-tooltip__row">' +
      '<span class="ov-tooltip__dot" style="background:' + color + ';"></span>' +
      '<span class="ov-tooltip__name">' + name + '</span>' +
      '<span class="ov-tooltip__val">' + val + '</span>' +
    '</div>';
  }
  function storeTipHTML(store, data) {
    var newPct = data.new_pct || 0, retPct = data.ret_pct || 0, loyPct = data.loy_pct || 0;
    var visits = data.visits || 0;
    return '<div class="ov-tooltip__title">' + store.name + ' (#' + store.storeNumber + ') · ' + store.city + '</div>' +
      tipRow(SEGMENT_COLORS.new,       'New',       newPct.toFixed(0) + '%') +
      tipRow(SEGMENT_COLORS.returning, 'Returning', retPct.toFixed(0) + '%') +
      tipRow(SEGMENT_COLORS.loyal,     'Loyal',     loyPct.toFixed(0) + '%') +
      '<div class="ov-tooltip__total"><span class="ov-tooltip__name">Total Visits</span>' +
        '<span class="ov-tooltip__val">' + visits.toLocaleString() + '</span></div>';
  }
  function competitorTipHTML(cs) {
    var pip = COMPETITOR_PIP_COLORS[cs.brand] || '#9CA3AF';
    var rows = '';
    if (cs.wk2_share != null) rows += tipRow(pip, 'Share of visits', cs.wk2_share + '%');
    var addr = cs.address ? cs.address.split(',')[0] : '';
    return '<div class="ov-tooltip__title">' + cs.brand + '</div>' + rows +
      (addr ? '<div class="ov-tooltip__total"><span class="ov-tooltip__name">' + addr + '</span></div>' : '');
  }

  // ========================================
  // Init / Destroy
  // ========================================

  function init(containerId) {
    if (map) destroy();

    map = L.map(containerId, {
      scrollWheelZoom: true,
      zoomControl: true
    }).setView([28.5, -82.5], 7);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Panes pin z-order: our stores always paint above competitors
    map.createPane('competitors').style.zIndex = 450;
    map.createPane('stores').style.zIndex = 550;

    competitorLayer = L.layerGroup();   // built but NOT added — client-first default
    markersLayer = L.layerGroup().addTo(map);
    _competitorVisible = false;

    return map;
  }

  // ========================================
  // Competitor Store Pins
  // ========================================

  /**
   * @param {Array} competitors - COMPETITOR_STORES array from Records
   * @param {Array} [filterStoreIds] - If provided, only show competitors that threaten these stores
   */
  function renderCompetitors(competitors, filterStoreIds) {
    if (!map || !competitorLayer) return;
    competitorLayer.clearLayers();

    competitors.forEach(cs => {
      // Filter to relevant competitors if storeIds provided
      if (filterStoreIds && filterStoreIds.length > 0) {
        const relevant = cs.threatens.some(tid => filterStoreIds.includes(tid));
        if (!relevant) return;
      }

      const pipColor = COMPETITOR_PIP_COLORS[cs.brand];
      // Top 5 get colored pip; "All Other" get plain gray diamond
      const pipHtml = pipColor
        ? '<div class="comp-marker__pip" style="background:' + pipColor + ';"></div>'
        : '';

      const marker = L.marker([cs.lat, cs.lng], {
        pane: 'competitors',
        icon: L.divIcon({
          className: 'comp-marker',
          html: '<div class="comp-marker__pin">' + pipHtml + '</div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      });

      marker.competitorId = cs.id;
      marker.competitorBrand = cs.brand;
      marker.competitorData = cs;

      // Parse "Street, City, ST Zip" → three display lines
      var addrParts = cs.address.split(', ');
      var addrStreet = addrParts[0] || cs.address;
      var addrCity = addrParts[1] || '';
      var addrStateZip = addrParts[2] || '';
      var addrSZParts = addrStateZip.split(' ');
      var addrCityState = addrCity + (addrSZParts[0] ? ', ' + addrSZParts[0] : '');
      var addrZip = addrSZParts[1] || '';

      var shareHtml = cs.wk2_share != null
        ? '<div style="font-weight:700;font-size:13px;margin:4px 0 6px;">Share: ' + cs.wk2_share + '%</div>'
        : '';

      marker.bindPopup(
        '<div style="font-family:system-ui;font-size:13px;line-height:1.6;min-width:180px;">' +
          '<div style="font-weight:600;font-size:14px;margin-bottom:2px;">' +
            (pipColor ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + pipColor + ';margin-right:6px;vertical-align:middle;"></span>' : '') +
            cs.brand +
          '</div>' +
          shareHtml +
          '<div style="color:#6b7280;font-size:12px;line-height:1.5;">' +
            addrStreet + '<br>' +
            addrCityState + '<br>' +
            addrZip +
          '</div>' +
          '<button class="comp-popup-compare-btn" data-comp-id="' + cs.id + '" style="margin-top:10px;width:100%;padding:6px 0;border:1px solid #d1d5db;border-radius:6px;background:#fff;font-size:13px;font-weight:500;cursor:pointer;">Compare</button>' +
        '</div>',
        { maxWidth: 240, autoPan: false }
      );

      marker.on('popupopen', function () {
        hideMapTip();
        var btn = document.querySelector('.comp-popup-compare-btn[data-comp-id="' + cs.id + '"]');
        if (btn) {
          btn.addEventListener('click', function () {
            if (_onCompetitorClick) _onCompetitorClick(cs);
          });
        }
      });
      marker.on('mouseover', function (e) { showMapTip(competitorTipHTML(cs), e.originalEvent); });
      marker.on('mouseout', hideMapTip);

      competitorLayer.addLayer(marker);
    });

    // Re-apply visibility state
    if (_competitorVisible && !map.hasLayer(competitorLayer)) {
      map.addLayer(competitorLayer);
    }
  }

  function toggleCompetitors(show) {
    if (!map || !competitorLayer) return;
    _competitorVisible = typeof show === 'boolean' ? show : !_competitorVisible;

    if (_competitorVisible) {
      map.addLayer(competitorLayer);
    } else {
      map.removeLayer(competitorLayer);
    }
    return _competitorVisible;
  }

  function isCompetitorVisible() {
    return _competitorVisible;
  }

  // ========================================
  // Render Stores
  // ========================================

  // Build SVG donut chart for popup
  function buildDonutSVG(newPct, retPct, loyPct, size) {
    size = size || 80;
    var r = size / 2;
    var ir = r * 0.55; // inner radius (donut hole)
    var cx = r, cy = r;

    function arcPath(startAngle, endAngle, outerR, innerR) {
      if (endAngle - startAngle >= 359.99) endAngle = startAngle + 359.99;
      var s1 = startAngle * Math.PI / 180;
      var e1 = endAngle * Math.PI / 180;
      var large = (endAngle - startAngle > 180) ? 1 : 0;
      var x1 = cx + outerR * Math.cos(s1), y1 = cy + outerR * Math.sin(s1);
      var x2 = cx + outerR * Math.cos(e1), y2 = cy + outerR * Math.sin(e1);
      var x3 = cx + innerR * Math.cos(e1), y3 = cy + innerR * Math.sin(e1);
      var x4 = cx + innerR * Math.cos(s1), y4 = cy + innerR * Math.sin(s1);
      return 'M ' + x1 + ' ' + y1 +
             ' A ' + outerR + ' ' + outerR + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2 +
             ' L ' + x3 + ' ' + y3 +
             ' A ' + innerR + ' ' + innerR + ' 0 ' + large + ' 0 ' + x4 + ' ' + y4 + ' Z';
    }

    var total = newPct + retPct + loyPct;
    if (total === 0) total = 1;
    var segments = [
      { pct: newPct / total * 100, color: SEGMENT_COLORS.new },
      { pct: retPct / total * 100, color: SEGMENT_COLORS.returning },
      { pct: loyPct / total * 100, color: SEGMENT_COLORS.loyal }
    ];

    var paths = '';
    var angle = -90; // start at top
    segments.forEach(function(seg) {
      if (seg.pct < 0.5) return;
      var sweep = seg.pct / 100 * 360;
      paths += '<path d="' + arcPath(angle, angle + sweep, r - 2, ir) + '" fill="' + seg.color + '" />';
      angle += sweep;
    });

    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
      paths +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + ir + '" fill="white" />' +
      '</svg>';
  }

  /**
   * @param {Array} stores - Store objects from DistributionEntities.stores
   * @param {Object} storeData - Map of storeId → { group, share, change_pp, primary_threat, new_pct, ret_pct, loy_pct, visits }
   */
  function renderStores(stores, storeData) {
    if (!map || !markersLayer) return;
    markersLayer.clearLayers();

    stores.forEach(store => {
      if (!store.lat || !store.lng) return;

      const data = storeData[store.id] || {};

      const marker = L.circleMarker([store.lat, store.lng], {
        pane: 'stores',
        radius: 10,
        fillColor: BRAND_COLOR,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      });

      // Donut popup data
      const newPct = data.new_pct || 0;
      const retPct = data.ret_pct || 0;
      const loyPct = data.loy_pct || 0;
      const visits = data.visits || 0;
      const share = data.share != null ? data.share + '%' : '—';
      const changePp = data.change_pp != null
        ? (data.change_pp >= 0 ? '+' : '') + data.change_pp + ' pp'
        : '—';
      const threat = data.primary_threat || '—';

      const donutSvg = buildDonutSVG(newPct, retPct, loyPct, 80);

      const popup = `
        <div style="font-family: var(--font-family, system-ui); font-size: 13px; line-height: 1.5; min-width: 220px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px;">${store.name} (#${store.storeNumber})</div>
          <div style="color: #6b7280; margin-bottom: 10px;">${store.city}</div>
          <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 10px;">
            <div style="flex-shrink: 0;">${donutSvg}</div>
            <div style="font-size: 12px; line-height: 1.8;">
              <div><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${SEGMENT_COLORS.new};margin-right:6px;"></span>New: <b>${newPct.toFixed(0)}%</b></div>
              <div><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${SEGMENT_COLORS.returning};margin-right:6px;"></span>Returning: <b>${retPct.toFixed(0)}%</b></div>
              <div><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${SEGMENT_COLORS.loyal};margin-right:6px;"></span>Loyal: <b>${loyPct.toFixed(0)}%</b></div>
              <div style="margin-top: 4px; color: #6b7280;">${visits.toLocaleString()} visits</div>
            </div>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; display: flex; gap: 12px; font-size: 12px;">
            <div><span style="color:#6b7280;">Share:</span> <b>${share}</b></div>
            <div><span style="color:#6b7280;">Change:</span> <b>${changePp}</b></div>
            <div><span style="color:#6b7280;">Threat:</span> <b>${threat}</b></div>
          </div>
        </div>
      `;

      marker.bindPopup(popup, { maxWidth: 280, autoPan: false });
      marker.storeId = store.id;
      marker.on('click', function () {
        hideMapTip();
        if (_onStoreClick) _onStoreClick(store.id);
      });
      marker.on('mouseover', function (e) { showMapTip(storeTipHTML(store, data), e.originalEvent); });
      marker.on('mouseout', hideMapTip);
      markersLayer.addLayer(marker);
    });
  }

  function onStoreClick(callback) {
    _onStoreClick = callback;
  }

  function onCompetitorClick(callback) {
    _onCompetitorClick = callback;
  }

  // ========================================
  // Proximity Rings
  // ========================================

  const PROXIMITY_RINGS = [
    { radius: 1609,  label: '1 mi', opacity: 0.08 },  // 1 mile in meters
    { radius: 4828,  label: '3 mi', opacity: 0.05 },  // 3 miles
    { radius: 8047,  label: '5 mi', opacity: 0.03 }   // 5 miles
  ];

  function showProximityRings(lat, lng) {
    clearProximityRings();
    if (!map) return;
    _proximityLayer = L.layerGroup();

    PROXIMITY_RINGS.forEach(function (ring) {
      var circle = L.circle([lat, lng], {
        radius: ring.radius,
        color: BRAND_COLOR,
        weight: 1.5,
        dashArray: '8, 6',
        fillColor: BRAND_COLOR,
        fillOpacity: ring.opacity,
        interactive: false
      });
      _proximityLayer.addLayer(circle);
    });

    if (_proximityVisible) {
      _proximityLayer.addTo(map);
    }
  }

  function clearProximityRings() {
    if (_proximityLayer && map) {
      map.removeLayer(_proximityLayer);
    }
    _proximityLayer = null;
  }

  function toggleProximity(show) {
    _proximityVisible = typeof show === 'boolean' ? show : !_proximityVisible;
    if (!_proximityLayer || !map) return _proximityVisible;
    if (_proximityVisible) {
      map.addLayer(_proximityLayer);
    } else {
      map.removeLayer(_proximityLayer);
    }
    return _proximityVisible;
  }

  // ========================================
  // Highlight / Fit
  // ========================================

  // Cancel any pending post-animation callback and schedule a new one.
  // Uses setTimeout (400ms) rather than moveend — more reliable when map is already
  // at the target position (moveend won't fire if nothing moves).
  function _scheduleAfterMove(fn) {
    if (_pendingTimeout !== null) {
      clearTimeout(_pendingTimeout);
      _pendingTimeout = null;
    }
    if (!fn) return;
    _pendingTimeout = setTimeout(function() {
      _pendingTimeout = null;
      fn();
    }, 400);
  }

  // Zoom to a store marker, draw proximity rings, open store popup after animation.
  function highlightStore(storeId) {
    if (!map || !markersLayer) return;
    markersLayer.eachLayer(function(marker) {
      if (marker.storeId === storeId) {
        var ll = marker.getLatLng();
        showProximityRings(ll.lat, ll.lng);
        map.setView(ll, 12, { animate: true });
        _scheduleAfterMove(function() { marker.openPopup(); });
      }
    });
  }

  // Zoom to a competitor marker and open its popup after animation.
  function highlightCompetitor(compId) {
    if (!map || !competitorLayer) return;
    if (!_competitorVisible) toggleCompetitors(true);
    competitorLayer.eachLayer(function(marker) {
      if (marker.competitorId === compId) {
        var ll = marker.getLatLng();
        map.setView(ll, 12, { animate: true });
        _scheduleAfterMove(function() { marker.openPopup(); });
      }
    });
  }

  // Navigate to competitor marker and open its popup; draw proximity rings at parent store.
  // Rings stay at parent location for context — competitor popup is the primary interaction.
  function showParentAndCompetitor(parentStoreId, compId) {
    if (!map || !markersLayer || !competitorLayer) return;
    if (!_competitorVisible) toggleCompetitors(true);
    var parentMarker = null;
    var compMarker = null;

    markersLayer.eachLayer(function(m) { if (m.storeId === parentStoreId) parentMarker = m; });
    competitorLayer.eachLayer(function(m) { if (m.competitorId === compId) compMarker = m; });

    if (!parentMarker) return;

    // Draw rings at parent store to show catchment context (may be off-screen if competitor is far)
    showProximityRings(parentMarker.getLatLng().lat, parentMarker.getLatLng().lng);
    map.closePopup();

    if (compMarker) {
      map.setView(compMarker.getLatLng(), 12, { animate: true });
      _scheduleAfterMove(function() { compMarker.openPopup(); });
    } else {
      // Fallback: navigate to parent if no competitor marker
      map.setView(parentMarker.getLatLng(), 12, { animate: true });
    }
  }

  function fitBounds() {
    if (!map || !markersLayer) return;
    clearProximityRings();

    const layers = [];
    markersLayer.eachLayer(l => layers.push(l));
    if (layers.length === 0) return;

    const group = L.featureGroup(layers);
    map.fitBounds(group.getBounds().pad(0.1));
  }

  function destroy() {
    hideMapTip();
    if (map) {
      clearProximityRings();
      map.remove();
      map = null;
      markersLayer = null;
      competitorLayer = null;
      _proximityLayer = null;
      _competitorVisible = false;
    }
  }

  // ========================================
  // Invalidate size (for container resizes)
  // ========================================

  function invalidateSize() {
    if (map) {
      // invalidateSize() corrects container dimensions; fitBounds() must follow
      // so the map re-zooms to the store markers rather than defaulting to world view
      setTimeout(function() {
        map.invalidateSize();
        fitBounds();
      }, 100);
    }
  }

  // ========================================
  // Public API
  // ========================================

  return {
    init,
    renderStores,
    renderCompetitors,
    toggleCompetitors,
    isCompetitorVisible,
    setCompetitorRanking,
    showProximityRings,
    clearProximityRings,
    toggleProximity,
    highlightStore,
    highlightCompetitor,
    showParentAndCompetitor,
    onStoreClick,
    onCompetitorClick,
    fitBounds,
    destroy,
    invalidateSize
  };
})();

// ── Wiring layer — carved from distribution.js renderMap() +
//    DistributionTraffic.buildStorePane() (map half only) ─────────────────
(function () {
  'use strict';

  var storeMapBuilt = false;

  function renderMap(containerId) {
    if (typeof StoreMap === 'undefined') return;
    var D = window.DIST_TRAFFIC_DATA;

    StoreMap.init(containerId || 'store-map');
    var stores = D.entities.stores;
    var storeData = {};

    D.trafficShareMetrics.storeLeaderboard.forEach(function (s) {
      storeData['store-' + s.store_id] = {
        share: s.wk2_share,
        change_pp: s.change_pp,
        primary_threat: s.primary_threat,
        new_pct: s.new_pct || 33,
        ret_pct: s.ret_pct || 33,
        loy_pct: s.loy_pct || 34,
        visits: s.total_visits || 0
      };
    });

    StoreMap.renderStores(stores, storeData);
    StoreMap.fitBounds();

    // Brand-store marker click → same effect as a table row click (proximity
    // rings + radius-key legend + row highlight). Row highlight now routes
    // through DistLeaderboard.selectStore() — the p-treetable conversion
    // replaced the old .lb-row--parent[data-store-id] markup this callback
    // used to touch directly.
    if (StoreMap.onStoreClick) {
      StoreMap.onStoreClick(function (storeId) {
        StoreMap.highlightStore(storeId);
        var legend = document.getElementById('ring-legend-store');
        if (legend) legend.style.display = 'flex';
        if (window.DistLeaderboard && window.DistLeaderboard.selectStore) {
          window.DistLeaderboard.selectStore(storeId);
        }
      });
    }

    // Competitor diamond pips use StoreMap's default brand→color map, which
    // matches the leaderboard's LEADERBOARD_BRAND_COLORS exactly — so a
    // diamond's pip color equals its expanded-row pip.
    var competitorStores = D.competitorStores;
    var storeIds = stores.map(function (s) { return s.id; });
    StoreMap.renderCompetitors(competitorStores, storeIds);
  }

  // Entry seam — the map half of proto DistributionTraffic.buildStorePane()
  // (leaderboard half = window.DistLeaderboard.build()). Called once, lazily,
  // from chart-card's onSub('store') on first show; invalidate() on return.
  window.DistStoreMap = {
    build: function () {
      renderMap('store-map-store-pane');
      // Show competitor diamonds alongside our stores (renderMap renders them hidden).
      if (typeof StoreMap !== 'undefined' && StoreMap.toggleCompetitors) StoreMap.toggleCompetitors(true);
      storeMapBuilt = true;
    },
    invalidate: function () {
      if (typeof StoreMap !== 'undefined' && StoreMap.invalidateSize) StoreMap.invalidateSize();
    },
    isBuilt: function () { return storeMapBuilt; }
  };
})();
