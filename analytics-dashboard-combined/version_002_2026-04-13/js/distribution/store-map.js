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

    markersLayer = L.layerGroup().addTo(map);
    competitorLayer = L.layerGroup(); // not added to map until toggled on

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
      marker.on('click', function () {
        if (_onCompetitorClick) _onCompetitorClick(cs);
      });

      marker.bindPopup(
        '<div style="font-family:system-ui;font-size:13px;line-height:1.5;min-width:160px;">' +
          '<div style="font-weight:600;font-size:14px;margin-bottom:2px;">' +
            (pipColor ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + pipColor + ';margin-right:6px;vertical-align:middle;"></span>' : '') +
            cs.brand +
          '</div>' +
          '<div style="color:#6b7280;font-size:12px;">' + cs.address + '</div>' +
        '</div>',
        { maxWidth: 220 }
      );

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
        radius: 8,
        fillColor: BRAND_COLOR,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
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

      marker.bindPopup(popup, { maxWidth: 280 });
      marker.storeId = store.id;
      marker.on('click', function () {
        if (_onStoreClick) _onStoreClick(store.id);
      });
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

  function highlightStore(storeId, opts) {
    if (!map || !markersLayer) return;
    opts = opts || {};

    markersLayer.eachLayer(marker => {
      if (marker.storeId === storeId) {
        var ll = marker.getLatLng();
        if (!opts.skipZoom) map.setView(ll, 12, { animate: true });
        marker.openPopup();
        // Show proximity rings if on traffic page
        if (opts.showRings !== false) {
          showProximityRings(ll.lat, ll.lng);
        }
      }
    });
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
    onStoreClick,
    onCompetitorClick,
    fitBounds,
    destroy,
    invalidateSize
  };
})();
