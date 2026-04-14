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
  let _competitorVisible = false;
  let _onStoreClick = null;

  const COMPETITOR_BRAND_COLORS = {
    'Publix': '#4a7c59',
    'Walmart': '#0071ce',
    'ALDI': '#00205b',
    'Save A Lot': '#e31837'
  };

  const GROUP_COLORS = {
    green: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444'
  };

  const GROUP_LABELS = {
    green: 'Strong',
    amber: 'Watch',
    red: 'Critical'
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
      attribution: '&copy; <a href="https://carto.com/">CartoDB</a> | Google Maps in production',
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

      const color = COMPETITOR_BRAND_COLORS[cs.brand] || '#6b7280';

      const marker = L.marker([cs.lat, cs.lng], {
        icon: L.divIcon({
          className: 'comp-marker',
          html: '<div class="comp-marker__pin" style="background:' + color + ';"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      });

      marker.bindPopup(
        '<div style="font-family:system-ui;font-size:13px;line-height:1.5;min-width:160px;">' +
          '<div style="font-weight:600;font-size:14px;margin-bottom:2px;">' + cs.brand + '</div>' +
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

  /**
   * @param {Array} stores - Store objects from DistributionEntities.stores
   * @param {Object} storeData - Map of storeId → { group, share, change_pp, primary_threat }
   */
  function renderStores(stores, storeData) {
    if (!map || !markersLayer) return;
    markersLayer.clearLayers();

    stores.forEach(store => {
      if (!store.lat || !store.lng) return;

      const data = storeData[store.id] || {};
      const group = data.group || 'amber';
      const color = GROUP_COLORS[group] || GROUP_COLORS.amber;
      const label = GROUP_LABELS[group] || 'Watch';

      const marker = L.circleMarker([store.lat, store.lng], {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      });

      // Build popup content
      const share = data.share != null ? data.share + '%' : '—';
      const changePp = data.change_pp != null
        ? (data.change_pp >= 0 ? '+' : '') + data.change_pp + ' pp'
        : '—';
      const threat = data.primary_threat || '—';

      const popup = `
        <div style="font-family: var(--font-family, system-ui); font-size: 13px; line-height: 1.5; min-width: 180px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${store.name} (#${store.storeNumber})</div>
          <div style="color: #6b7280; margin-bottom: 8px;">${store.city}</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Share:</span>
            <span style="font-weight: 600;">${share}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Change:</span>
            <span style="font-weight: 600;">${changePp}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Threat:</span>
            <span style="font-weight: 600;">${threat}</span>
          </div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #e5e7eb;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; color: #fff; background: ${color};">${label}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popup, { maxWidth: 240 });
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

  // ========================================
  // Highlight / Fit
  // ========================================

  function highlightStore(storeId) {
    if (!map || !markersLayer) return;

    markersLayer.eachLayer(marker => {
      if (marker.storeId === storeId) {
        map.setView(marker.getLatLng(), 12, { animate: true });
        marker.openPopup();
      }
    });
  }

  function fitBounds() {
    if (!map || !markersLayer) return;

    const layers = [];
    markersLayer.eachLayer(l => layers.push(l));
    if (layers.length === 0) return;

    const group = L.featureGroup(layers);
    map.fitBounds(group.getBounds().pad(0.1));
  }

  function destroy() {
    if (map) {
      map.remove();
      map = null;
      markersLayer = null;
      competitorLayer = null;
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
    highlightStore,
    onStoreClick,
    fitBounds,
    destroy,
    invalidateSize
  };
})();
