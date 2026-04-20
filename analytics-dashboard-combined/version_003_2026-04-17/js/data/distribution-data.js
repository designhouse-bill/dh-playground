/**
 * Distribution Data Module — Context Management + Aggregation
 * Mirrors Engagement's MockData pattern with context-driven filtering.
 *
 * Dependencies: DistributionEntities, DistributionRecords
 */

const DistributionData = (function() {
  'use strict';

  const Entities = DistributionEntities;
  const Records = DistributionRecords;

  // ========================================
  // Week Definitions (calendar weeks)
  // ========================================

  const flightWeeks = [
    { id: 'wk50', label: 'Week 50', start: '2025-12-10', end: '2025-12-16' },
    { id: 'wk51', label: 'Week 51', start: '2025-12-17', end: '2025-12-23' },
    { id: 'wk52', label: 'Week 52', start: '2025-12-24', end: '2025-12-30' },
    { id: 'wk1',  label: 'Week 1',  start: '2025-12-31', end: '2026-01-06' },
    { id: 'wk2',  label: 'Week 2',  start: '2026-01-07', end: '2026-01-13' }
  ];

  // ========================================
  // Context State
  // ========================================

  let currentContext = {
    flightWeek: 'wk2',              // 'all' | 'wk50' | 'wk51' | 'wk52' | 'wk1' | 'wk2'
    entityId: 'all',
    entityLevel: 'all',             // 'all' | 'brand' | 'sub-brand' | 'store'
    entityName: 'All Stores'
  };

  // ========================================
  // Context Setters
  // ========================================

  function setFlightWeek(weekId) {
    currentContext.flightWeek = weekId;
  }

  function setEntity(id, level, name) {
    currentContext.entityId = id;
    currentContext.entityLevel = level;
    currentContext.entityName = name;
  }

  // ========================================
  // Record Filtering
  // ========================================

  function getStoreIds() {
    return Entities.getStoresForEntity(currentContext.entityId, currentContext.entityLevel);
  }

  function filterByContext(records) {
    const storeIds = getStoreIds();
    return records.filter(r => {
      const storeMatch = storeIds.includes(r.store_id);
      const weekMatch = currentContext.flightWeek === 'all' || r.week_id === currentContext.flightWeek;
      return storeMatch && weekMatch;
    });
  }

  function filterCrossoverByWeek(records) {
    if (currentContext.flightWeek === 'all') return records;
    return records.filter(r => r.week_id === currentContext.flightWeek);
  }

  // ========================================
  // Raw Record Access
  // ========================================

  function getMediaRecords(weekId, storeIds) {
    return Records.mediaRecords.filter(r => {
      const storeMatch = !storeIds || storeIds.includes(r.store_id);
      const weekMatch = !weekId || weekId === 'all' || r.week_id === weekId;
      return storeMatch && weekMatch;
    });
  }

  function getVisitRecords(weekId, storeIds) {
    return Records.visitationRecords.filter(r => {
      const storeMatch = !storeIds || storeIds.includes(r.store_id);
      const weekMatch = !weekId || weekId === 'all' || r.week_id === weekId;
      return storeMatch && weekMatch;
    });
  }

  function getTrafficRecords(weekId, storeIds) {
    return Records.trafficRecords.filter(r => {
      const storeMatch = !storeIds || storeIds.includes(r.store_id);
      const weekMatch = !weekId || weekId === 'all' || r.week_id === weekId;
      return storeMatch && weekMatch;
    });
  }

  function getCrossoverRecords(weekId) {
    if (!weekId || weekId === 'all') return Records.crossoverRecords;
    return Records.crossoverRecords.filter(r => r.week_id === weekId);
  }

  // ========================================
  // Aggregation: Media Buy
  // ========================================

  function aggregateMedia(records) {
    if (!records.length) return null;

    const totals = records.reduce((acc, r) => {
      acc.impressions += r.impressions;
      acc.clicks += r.clicks;
      acc.budget += r.budget_allocated;
      acc.gross_visits += r.gross_visits;
      return acc;
    }, { impressions: 0, clicks: 0, budget: 0, gross_visits: 0 });

    return {
      impressions: totals.impressions,
      clicks: totals.clicks,
      ctr: parseFloat(((totals.clicks / totals.impressions) * 100).toFixed(2)),
      cost_per_impression: parseFloat((totals.budget / totals.impressions).toFixed(4)),
      budget: totals.budget,
      gross_visits: totals.gross_visits,
      cost_per_visit: parseFloat((totals.budget / totals.gross_visits).toFixed(2)),
      visits_per_thousand: parseFloat(((totals.gross_visits / totals.impressions) * 1000).toFixed(1))
    };
  }

  function getMediaBuyMetrics() {
    const storeIds = getStoreIds();
    const allRecords = getMediaRecords('all', storeIds);

    // Summary: aggregate all matching records for context week (or all weeks)
    let summaryRecords;
    if (currentContext.flightWeek === 'all') {
      summaryRecords = allRecords;
    } else {
      summaryRecords = allRecords.filter(r => r.week_id === currentContext.flightWeek);
    }
    const summary = aggregateMedia(summaryRecords);

    // Weekly trend: aggregate per week across matching stores
    const weeklyTrend = flightWeeks.map(week => {
      const weekRecords = allRecords.filter(r => r.week_id === week.id);
      const agg = aggregateMedia(weekRecords);
      return agg ? { week: week.id, ...agg } : null;
    }).filter(Boolean);

    return { summary, weeklyTrend };
  }

  // ========================================
  // Aggregation: Creatives (with per-creative metrics from atomic records)
  // ========================================

  function getCreativeRecords() {
    const storeIds = getStoreIds();

    return Records.creativeRecords.map(cr => {
      // Filter stores in this creative that match current entity
      const matchingStores = cr.store_group.filter(s => storeIds.includes(s));
      // Get media records for matching stores, filtered by current week
      const mediaRecs = Records.mediaRecords.filter(r =>
        matchingStores.includes(r.store_id) && r.creative_id === cr.creative_id &&
        (currentContext.flightWeek === 'all' || r.week_id === currentContext.flightWeek)
      );
      const metrics = aggregateMedia(mediaRecs);

      return {
        ...cr,
        store_group: matchingStores.length > 0 ? matchingStores : cr.store_group,
        metrics: metrics
      };
    });
  }

  // ========================================
  // Aggregation: Visitation
  // ========================================

  function aggregateVisitation(records) {
    if (!records.length) return null;

    const totals = records.reduce((acc, r) => {
      acc.gross_visits += r.gross_visits;
      acc.visits_zero_prev += r.visits_zero_prev;
      acc.visits_one_three_prev += r.visits_one_three_prev;
      acc.visits_four_plus_prev += r.visits_four_plus_prev;
      return acc;
    }, { gross_visits: 0, visits_zero_prev: 0, visits_one_three_prev: 0, visits_four_plus_prev: 0 });

    // Get total budget for CPV calculation
    const storeIds = [...new Set(records.map(r => r.store_id))];
    const weekIds = [...new Set(records.map(r => r.week_id))];
    let totalBudget = 0;
    Records.mediaRecords.forEach(r => {
      if (storeIds.includes(r.store_id) && weekIds.includes(r.week_id)) {
        totalBudget += r.budget_allocated;
      }
    });

    return {
      ...totals,
      cost_per_visit: totals.gross_visits > 0 ? parseFloat((totalBudget / totals.gross_visits).toFixed(2)) : 0,
      visits_per_thousand: 0 // calculated separately with impressions context
    };
  }

  function getVisitationMetrics() {
    const storeIds = getStoreIds();
    const allRecords = getVisitRecords('all', storeIds);

    // Summary: latest week or selected week
    let summaryRecords;
    if (currentContext.flightWeek === 'all') {
      summaryRecords = allRecords.filter(r => r.week_id === 'wk2');
    } else {
      summaryRecords = allRecords.filter(r => r.week_id === currentContext.flightWeek);
    }
    const summary = aggregateVisitation(summaryRecords);

    // Add visits_per_thousand from media data
    if (summary) {
      const mediaSummary = aggregateMedia(
        getMediaRecords(currentContext.flightWeek === 'all' ? 'wk2' : currentContext.flightWeek, storeIds)
      );
      if (mediaSummary) {
        summary.visits_per_thousand = mediaSummary.visits_per_thousand;
      }
    }

    // Weekly trend
    const weeklyTrend = flightWeeks.map(week => {
      const weekRecords = allRecords.filter(r => r.week_id === week.id);
      const agg = aggregateVisitation(weekRecords);
      if (!agg) return null;

      // Add visits_per_thousand from media
      const mediaAgg = aggregateMedia(getMediaRecords(week.id, storeIds));
      if (mediaAgg) {
        agg.visits_per_thousand = mediaAgg.visits_per_thousand;
        agg.cost_per_visit = mediaAgg.cost_per_visit;
      }

      return { week: week.id, ...agg };
    }).filter(Boolean);

    return { summary, weeklyTrend };
  }

  // ========================================
  // Aggregation: Competitive Crossover
  // ========================================

  function getCompetitiveCrossover() {
    // Crossover is panel-level (not per-store), so only week filtering applies
    const latestWeek = currentContext.flightWeek === 'all' ? 'wk2' : currentContext.flightWeek;
    const latestRecords = getCrossoverRecords(latestWeek);

    // Build with trend data
    return latestRecords.map(r => {
      // Get all weeks for this competitor for trend
      const allWeeks = Records.crossoverRecords.filter(
        cr => cr.competitor_name === r.competitor_name
      );
      const trend = flightWeeks.map(w => {
        const weekRec = allWeeks.find(cr => cr.week_id === w.id);
        return weekRec ? weekRec.crossover_pct : 0;
      });

      return {
        competitor_name: r.competitor_name,
        competitor_store_address: r.competitor_store_address,
        crossover_pct: r.crossover_pct,
        crossover_visits_zero_prev: r.crossover_visits_zero_prev,
        crossover_visits_one_three: r.crossover_visits_one_three,
        crossover_visits_four_plus: r.crossover_visits_four_plus,
        trend: trend
      };
    });
  }

  // ========================================
  // Aggregation: Traffic Share
  // ========================================

  function getTrafficShareMetrics() {
    const storeIds = getStoreIds();
    const allRecords = getTrafficRecords('all', storeIds);

    // Latest week summary
    const latestWeek = currentContext.flightWeek === 'all' ? 'wk2' : currentContext.flightWeek;
    const firstWeek = currentContext.flightWeek === 'all' ? 'wk50' : currentContext.flightWeek;

    const latestRecords = allRecords.filter(r => r.week_id === latestWeek);
    const firstRecords = allRecords.filter(r => r.week_id === firstWeek);

    // Aggregate share
    const latestRetailerVisits = latestRecords.reduce((s, r) => s + r.retailer_visits, 0);
    const latestCompVisits = latestRecords.reduce((s, r) => s + r.comp_visits, 0);
    const latestTotal = latestRetailerVisits + latestCompVisits;
    const latestShare = latestTotal > 0 ? parseFloat(((latestRetailerVisits / latestTotal) * 100).toFixed(1)) : 0;

    const firstRetailerVisits = firstRecords.reduce((s, r) => s + r.retailer_visits, 0);
    const firstCompVisits = firstRecords.reduce((s, r) => s + r.comp_visits, 0);
    const firstTotal = firstRetailerVisits + firstCompVisits;
    const firstShare = firstTotal > 0 ? parseFloat(((firstRetailerVisits / firstTotal) * 100).toFixed(1)) : 0;

    const shareChange = parseFloat((latestShare - firstShare).toFixed(1));

    // Stores outperforming (share increased)
    let outperforming = 0;
    storeIds.forEach(storeId => {
      const latestStore = allRecords.find(r => r.store_id === storeId && r.week_id === latestWeek);
      const firstStore = allRecords.find(r => r.store_id === storeId && r.week_id === firstWeek);
      if (latestStore && firstStore && latestStore.retailer_share > firstStore.retailer_share) {
        outperforming++;
      }
    });

    // Growth rates
    const retailerGrowthRate = firstRetailerVisits > 0 ? parseFloat((((latestRetailerVisits - firstRetailerVisits) / firstRetailerVisits) * 100).toFixed(1)) : 0;
    const compGrowthRate = firstCompVisits > 0 ? parseFloat((((latestCompVisits - firstCompVisits) / firstCompVisits) * 100).toFixed(1)) : 0;

    // Concentration counts
    const highlyConcentrated = latestRecords.filter(r => r.hhi > 2500).length;
    const moderatelyConcentrated = latestRecords.filter(r => r.hhi >= 2000 && r.hhi <= 2500).length;

    const summary = {
      retailer_traffic_share: latestShare,
      share_change_pp: shareChange,
      stores_outperforming: outperforming,
      stores_total: storeIds.length,
      retailer_growth_rate: retailerGrowthRate,
      comp_growth_rate: compGrowthRate,
      growth_advantage: parseFloat((retailerGrowthRate - compGrowthRate).toFixed(1)),
      highly_concentrated_count: highlyConcentrated,
      moderately_concentrated_count: moderatelyConcentrated
    };

    // Weekly trend
    const trend = flightWeeks.map(week => {
      const weekRecords = allRecords.filter(r => r.week_id === week.id);
      const retailerV = weekRecords.reduce((s, r) => s + r.retailer_visits, 0);
      const compV = weekRecords.reduce((s, r) => s + r.comp_visits, 0);
      const total = retailerV + compV;
      const retailerShare = total > 0 ? parseFloat(((retailerV / total) * 100).toFixed(1)) : 0;
      return {
        week: week.id,
        retailer_share: retailerShare,
        comp_share: parseFloat((100 - retailerShare).toFixed(1)),
        retailer_visits: retailerV,
        comp_visits: compV
      };
    });

    // Store leaderboard (latest week data per store)
    const storeLeaderboard = storeIds.map(storeId => {
      const latest = allRecords.find(r => r.store_id === storeId && r.week_id === latestWeek);
      const first = allRecords.find(r => r.store_id === storeId && r.week_id === firstWeek);
      if (!latest) return null;

      const store = Entities.getStoreById(storeId);
      return {
        store_id: storeId.replace('store-', ''),
        city: store ? store.city : '',
        wk3_share: first ? first.retailer_share : 0,
        wk2_share: latest.retailer_share,
        change_pp: first ? parseFloat((latest.retailer_share - first.retailer_share).toFixed(1)) : 0,
        alert_type: latest.alert_type,
        hhi: latest.hhi,
        hhi_status: latest.hhi > 2500 ? 'Highly Concentrated' : 'Moderately Concentrated',
        primary_threat: latest.primary_threat,
        primary_threat_address: latest.primary_threat_address,
        group: latest.group
      };
    }).filter(Boolean);

    return { summary, trend, storeLeaderboard };
  }

  // ========================================
  // Store Groups
  // ========================================

  function getStoreGroups() {
    const storeIds = getStoreIds();
    const groups = [
      { id: 'green', label: 'Green — Strong Performers', color: '#10b981', stores: [] },
      { id: 'amber', label: 'Amber — Moderate / Watch', color: '#f59e0b', stores: [] },
      { id: 'red', label: 'Red — Critical / Data QA', color: '#ef4444', stores: [] }
    ];

    storeIds.forEach(storeId => {
      const group = Records.GROUP_MAP[storeId] || 'amber';
      const g = groups.find(g => g.id === group);
      if (g) g.stores.push(storeId.replace('store-', ''));
    });

    return groups;
  }

  // ========================================
  // Primary Threats
  // ========================================

  function getPrimaryThreats() {
    const storeIds = getStoreIds();
    const latestWeek = currentContext.flightWeek === 'all' ? 'wk2' : currentContext.flightWeek;
    const competitorStores = Records.COMPETITOR_STORES || [];

    // Build brand → { store_count, locations[] }
    const brandMap = {};
    storeIds.forEach(storeId => {
      const record = Records.trafficRecords.find(
        r => r.store_id === storeId && r.week_id === latestWeek
      );
      if (!record) return;
      const threat = record.primary_threat;
      if (!brandMap[threat]) brandMap[threat] = { brand: threat, store_count: 0, locations: [] };
      brandMap[threat].store_count++;
    });

    // Attach individual competitor store locations per brand
    competitorStores.forEach(cs => {
      if (!brandMap[cs.brand]) return;
      // Check if this competitor store threatens any of the current entity's stores
      const relevant = cs.threatens.some(tid => storeIds.includes(tid));
      if (relevant) {
        // Compute a threat % from the traffic record of the store it threatens
        let threatPct = null;
        cs.threatens.forEach(tid => {
          if (!storeIds.includes(tid)) return;
          const rec = Records.trafficRecords.find(r => r.store_id === tid && r.week_id === latestWeek);
          if (rec) {
            const total = rec.retailer_visits + rec.comp_visits;
            const compShare = total > 0 ? parseFloat(((rec.comp_visits / total) * 100).toFixed(1)) : 0;
            if (threatPct === null || compShare > threatPct) threatPct = compShare;
          }
        });

        brandMap[cs.brand].locations.push({
          id: cs.id,
          address: cs.address,
          lat: cs.lat,
          lng: cs.lng,
          threatens: cs.threatens.filter(tid => storeIds.includes(tid)),
          threat_pct: threatPct
        });
      }
    });

    return Object.values(brandMap)
      .sort((a, b) => b.store_count - a.store_count)
      .map(b => ({
        ...b,
        locations: b.locations.sort((a, b) => (b.threat_pct || 0) - (a.threat_pct || 0))
      }));
  }

  // ========================================
  // Week Label Helper
  // ========================================

  function getWeekLabel(weekId) {
    const week = flightWeeks.find(w => w.id === weekId);
    if (!week) return weekId;
    const start = new Date(week.start);
    const end = new Date(week.end);
    const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
    return `${week.label} (${fmt(start)}-${fmt(end)})`;
  }

  // ========================================
  // Public API (Property getters for live aggregation)
  // ========================================

  return {
    // Context
    get context() { return { ...currentContext }; },
    setFlightWeek,
    setEntity,

    // Week definitions
    flightWeeks,
    getWeekLabel,

    // Section 1: Media Buy
    get mediaBuyMetrics() { return getMediaBuyMetrics(); },
    get creativeRecords() { return getCreativeRecords(); },
    get videoEngagement() { return Records.videoEngagement; },
    get demographics() { return Records.demographics; },

    // Section 2: Store Visitation
    get visitationMetrics() { return getVisitationMetrics(); },
    get competitiveCrossover() { return getCompetitiveCrossover(); },

    // Section 3: Traffic Share
    get trafficShareMetrics() { return getTrafficShareMetrics(); },
    get storeGroups() { return getStoreGroups(); },
    get primaryThreats() { return getPrimaryThreats(); },

    // Raw record access
    getMediaRecords,
    getVisitRecords,
    getTrafficRecords,
    getCrossoverRecords,

    // Entity access
    get entities() { return Entities; },
    get retailerConfig() { return Entities.retailerConfig; },

    // Competitor store locations
    get competitorStores() { return Records.COMPETITOR_STORES || []; }
  };
})();
