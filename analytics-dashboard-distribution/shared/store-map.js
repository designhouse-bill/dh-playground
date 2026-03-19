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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    return map;
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
      markersLayer.addLayer(marker);
    });
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
    }
  }

  // ========================================
  // Invalidate size (for container resizes)
  // ========================================

  function invalidateSize() {
    if (map) {
      setTimeout(() => map.invalidateSize(), 100);
    }
  }

  // ========================================
  // Public API
  // ========================================

  return {
    init,
    renderStores,
    highlightStore,
    fitBounds,
    destroy,
    invalidateSize
  };
})();
