/* ==========================================================================
   Data scaffolding for prototype
   Exposes:
   - DATA_META
   - DATA_WEEKS and DATA_WEEK_ORDER
   - DATA (current)
   - getScopedData(version)
   - getWeekData(weekId, version)
   ========================================================================== */

(function(){
  // ---- Meta (banner + versions)
  window.DATA_META = {
    bannerName: 'Fresh Local Market',
    versions: [
      {id:'v1', name:'Version Name 1'},
      {id:'v2', name:'Version Name 2'},
      {id:'v3', name:'Version Name 3'}
    ]
  };
  // --- Deal Type Effectiveness (static demo list) ---
    const DEAL_TYPES = [
      { name: 'BOGO',              value: 78 },
      { name: 'Percent Off',       value: 72 },
      { name: 'Dollars Off',       value: 65 },
      { name: 'Multi-Buy',         value: 58 },
      { name: 'Bundle',            value: 54 },
      { name: 'Price Drop',        value: 49 },
      { name: 'Loyalty Exclusive', value: 43 },
      { name: 'Limited Time',      value: 39 },
      { name: 'Clearance',         value: 31 }
    ];
  // ---- Weeks
  const mkISO = (y,m,d)=>new Date(Date.UTC(y,m-1,d)).toISOString();
  const weeks = {
    w29:{startISO: mkISO(2025,7,14), endISO: mkISO(2025,7,20), inProgress:false},
    w30:{startISO: mkISO(2025,7,21), endISO: mkISO(2025,7,27), inProgress:false},
    w31:{startISO: mkISO(2025,7,28), endISO: mkISO(2025,8,3),  inProgress:false},
    w32:{startISO: mkISO(2025,8,4),  endISO: mkISO(2025,8,10), inProgress:false},
    w33:{startISO: mkISO(2025,8,11), endISO: mkISO(2025,8,17), inProgress:false},
    w34:{startISO: mkISO(2025,8,18), endISO: mkISO(2025,8,24), inProgress:false},
    w35:{startISO: mkISO(2025,8,25), endISO: mkISO(2025,8,31), inProgress:false},
    w36:{startISO: mkISO(2025,9,1),  endISO: mkISO(2025,9,7),  inProgress:false},
    w37:{startISO: mkISO(2025,9,8),  endISO: mkISO(2025,9,14), inProgress:true}
  };
  window.DATA_WEEKS = weeks;
  window.DATA_WEEK_ORDER = ['w29','w30','w31','w32','w33','w34','w35','w36','w37'];

  // ---- Utility generators (deterministic-ish)
  function rnd(seed){ // linear congruential
    let x = seed % 2147483647; if (x<=0) x += 2147483646;
    return function(){ return (x = x*16807 % 2147483647) / 2147483647; };
  }
  function weekSeed(weekId, version){
    const n = Number((weekId||'').replace(/\D/g,'')) || 36;
    const v = {all:0,v1:1,v2:2,v3:3}[version||'all']||0;
    return n*101 + v*13 + 7;
  }

  function makeWeekData(weekId, version){
    const R = rnd(weekSeed(weekId, version));

    // Row1
    const pulse = Math.round(65 + R()*10);
    const engagementRate = Math.round(35 + R()*10);
    const audience = Math.round(50000 + R()*60000);

    // Trend (last 4 weeks composites)
    const idx = window.DATA_WEEK_ORDER.indexOf(weekId);
    const labels = [];
    const values = [];
    for (let i=Math.max(0,idx-3); i<=idx; i++){
      const id = window.DATA_WEEK_ORDER[i] || weekId;
      labels.push(id.toUpperCase());
      values.push(Math.round(55 + R()*20)/100); // 0.xx
    }

    // PPP
    const totalPromos = Math.round(600 + R()*500);
    const qTop = Math.round(35 + R()*15);
    const qUpMid = Math.round(25 + R()*10);
    const qLoMid = Math.round(20 + R()*10);
    let qBottom = 100 - (qTop+qUpMid+qLoMid); if (qBottom<0) qBottom=10;

    // Stores (1–10)
    const storeCount = 1 + Math.floor(R()*10);
    const stores = Array.from({length:storeCount}).map((_,i)=>({
      name: `Store ${100+i}`,
      engagementPct: Math.round(20 + R()*70),
      liftPct: Math.round(-10 + R()*40),
      size: Math.round(8 + R()*20)
    }));

    // Category
    const cats = ['Dairy','Produce','Meat','Bakery','Snacks','Beverages','Household','Frozen','Pantry','Other'];
    const share = cats.map(c=>({name:c, value: Math.round(5 + R()*20)}));
    // normalize to ~100 by scaling
    const sum = share.reduce((s,d)=>s+d.value,0); share.forEach(d=>d.value = Math.round(d.value/sum*100));
    const topCats = [...share].sort((a,b)=>b.value-a.value).slice(0,5);

    // Promotions list (top N)
    const promoTitles = [
      'Buy 1 Get 1 Dairy','Back-to-School Snacks','20% Off Beverages','Fresh Produce Deal','Household Essentials',
      'Weekly Meat Special','Bakery Morning Bundle','Frozen Dinner Value','Pantry Staples Pack','Snack Attack Variety'
    ];
    const promotions = promoTitles.map((t,i)=>({
      title: t,
      composite: Math.round(40 + R()*40),      // 40–80
      percentile: Math.round(20 + R()*70)      // 20–90
    }));

    // Size KPIs
    const sizeMix = [{name:'S',value:Math.round(20+R()*20)},{name:'M',value:Math.round(30+R()*20)},{name:'L',value:Math.round(20+R()*20)}];
    const bestSize = [{name:'S',value:Math.round(30+R()*20)},{name:'M',value:Math.round(40+R()*20)},{name:'L',value:Math.round(35+R()*20)}];
    const expandRate = [{name:'Expanded',value:Math.round(40+R()*40)},{name:'Not Expanded',value:0}];
    expandRate[1].value = Math.max(0, 100 - expandRate[0].value);
    const sizeEffectIndex = (1.10 + R()*0.4).toFixed(2);

    // Sharing slim
    const sharedCount = Math.round(80 + R()*150);
    const shareOpenRate = Math.round(40 + R()*30);
    const shareAddRate = Math.round(20 + R()*20);

    // YTD tiles
    const trafficYTD = Math.round(900000 + R()*500000);
    const visitorsYTD = Math.round(250000 + R()*150000);
    const mhYTD = Math.round(70 + R()*10);

    return {
      // Row1
      pulseScore: pulse,
      engagementRate,
      audienceReach: audience,

      // Row2
      trend4w: {labels, values},
      ppp: {total: totalPromos, qTop, qUpMid, qLoMid, qBottom},
      stores,

      // Row3
      categoryShare: share,
      categoryTop: topCats,

      // Row4
      promotions,
      // Row5
      sizeMix,
      bestSize,
      expandRate,
      sizeEffectIndex,
      // NEW: Row5 - Deal Type Effectiveness
      dealTypes: DEAL_TYPES,
      // Row6 / header, etc.
      sharedCount,
      shareOpenRate,
      shareAddRate,
      trafficYTD,
      visitorsYTD,
      marketingHealthYTD: mhYTD


    };
  }

  // API surface
  // Add or merge into your existing DATA object
window.DATA = Object.assign({}, window.DATA, {
  dealTypes: [
    { name: 'BOGO',              value: 78 },
    { name: 'Percent Off',       value: 72 },
    { name: 'Dollars Off',       value: 65 },
    { name: 'Multi-Buy',         value: 58 },
    { name: 'Bundle',            value: 54 },
    { name: 'Price Drop',        value: 49 },
    { name: 'Loyalty Exclusive', value: 43 },
    { name: 'Limited Time',      value: 39 },
    { name: 'Clearance',         value: 31 }
  ]
});
  window.getScopedData = function(version){
    // version-only variance: just re-run different seed with same "current" week
    const wk = 'w36';
    return makeWeekData(wk, version||'all');
  };

  window.getWeekData = function(weekId, version){
    return makeWeekData(weekId || 'w36', version || 'all');
  };

  // Initial DATA
  window.DATA = getWeekData('w36','all');
})();