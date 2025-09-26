/* ==========================================================================
   Renderers (window.AD)
   - Header binding (banner, versions, week picker, YTD tiles)
   - Rows:
     Row1: Pulse, Engagement Rate, Audience Reach
     Row2: Trend (line), Promotion Position Performance (mini stack), Store Lift (scatter)
     Row3: Category Performance (donut) + Top Categories by Engagement (bar)
     Row4: Promotion Performance list (microbars)
     Row5: Size KPIs (donut + small bars + index)
     Row6: Sharing KPIs (slim)
   ========================================================================== */
(function(){
  const AD = window.AD = window.AD || {};
  const $ = sel => document.querySelector(sel);

  // KPI Tooltip Definitions
  const KPI_DEFINITIONS = {
    // Header KPIs
    'TRAFFIC (YTD)': {
      tooltip: 'Traffic (YTD) measures the cumulative number of circular views across all campaigns year-to-date, providing total exposure volume.',
      whyImportant: 'Essential baseline metric for measuring overall campaign reach and brand visibility; tracks aggregate performance trends over time.'
    },
    'VISITORS (YTD)': {
      tooltip: 'Visitors (YTD) counts unique individuals who have viewed circulars year-to-date, measuring actual audience reach beyond repeat views.',
      whyImportant: 'Shows true audience penetration and market coverage; key for understanding brand awareness and customer acquisition effectiveness.'
    },
    'MARKETING HEALTH (YTD)': {
      tooltip: 'Marketing Health (YTD) is a composite score measuring overall circular program effectiveness, combining engagement quality and audience growth.',
      whyImportant: 'Single north-star metric for marketing performance; indicates program health and optimization opportunities across all campaigns.'
    },
    // Row 1 KPIs
    'PULSE SCORE': {
      tooltip: 'Pulse Score distills engagement into a single score for a circular, blending exposure and actions into one comparable measure.',
      whyImportant: 'Single north-star score summarizing circular engagement; fast quality read for overall performance.'
    },
    'ENGAGEMENT RATE': {
      tooltip: 'Engagement Rate measures the percentage of circular viewers who took an action like clicking a promotion or adding to list.',
      whyImportant: 'Quantifies circular effectiveness by showing conversion from exposure to action; key metric for optimization.'
    },
    'AUDIENCE REACH': {
      tooltip: 'Audience Reach is the count of unique shoppers who saw the circular, measuring actual footprint rather than just views.',
      whyImportant: 'Defines circular footprint with transparent audience sizing for clear campaign reach assessment.'
    },
    // Row 2 KPIs
    'Trend Overview (4 weeks)': {
      tooltip: 'Trend Overview plots composite scores over the last four weeks to visualize momentum.',
      whyImportant: 'Shows short-term momentum up/down; helps spot patterns quickly for early trend identification.'
    },
    'Promotion Position Performance': {
      tooltip: 'Promotion Position Performance shows how promotions are distributed by position quartiles (Top/Upper-Mid/Lower-Mid/Bottom) in the circular.',
      whyImportant: 'Surfaces positional bias impacting performance; enables fair comparison by normalizing for layout effects.'
    },
    'Store Lift — Engagement vs Lift': {
      tooltip: 'Store Lift compares engagement rates across stores to identify outperformers and laggards relative to average performance.',
      whyImportant: 'Highlights stores exceeding or falling behind expectations; informs field operations and localization strategies.'
    },
    // Row 3 KPIs
    'Category Performance (Engagement Share)': {
      tooltip: 'Category Performance highlights which product categories shoppers engage with most, ranked by add-to-list conversion rates.',
      whyImportant: 'Identifies best and worst performing categories; informs merchandising priorities and category mix decisions.'
    },
    'Category Lift vs Baseline Performance': {
      tooltip: 'Category Lift vs Baseline shows which categories over/under-perform vs their historical average, highlighting seasonal effects and category momentum.',
      whyImportant: 'Identifies categories gaining or losing traction; enables proactive merchandising adjustments and inventory planning.'
    },
    'Category Size vs Engagement Quality': {
      tooltip: 'Category Size vs Engagement Quality plots traffic volume against engagement rate with conversion as bubble size to identify high-opportunity categories.',
      whyImportant: 'Reveals underperforming high-traffic categories and niche performers; guides resource allocation and promotional focus.'
    },
    // Row 4 KPIs
    'Promotion Performance': {
      tooltip: 'Promotion Performance ranks promotions based on composite or percentile scores.',
      whyImportant: 'Ranks promotions by overall engagement; answers what\'s hot this week for optimization and storytelling.'
    },
    'Digital Circular Heat Map': {
      tooltip: 'Circular Heat Map visualizes density of shopper attention across positions in the circular layout using impression data.',
      whyImportant: 'Shows where design placement impacts outcomes; aids layout optimization and position strategy decisions.'
    },
    // Row 5 KPIs
    'Size Class Mix': {
      tooltip: 'Size Class Mix shows the proportion of promotions by card size (Small/Medium/Large) to understand design footprint strategy.',
      whyImportant: 'Provides context for performance comparison; shows how much space each size class occupies in the layout.'
    },
    'Best Performing Size Class': {
      tooltip: 'Best Performing Size Class highlights which card size drives the most add-to-list actions relative to impressions received.',
      whyImportant: 'Quantifies ROI of footprint decisions; supports optimal size allocation and design layout choices.'
    },
    'Expanded Interaction Rate': {
      tooltip: 'Expanded Interaction Rate measures the percentage of promotion cards that were expanded or interacted with by shoppers.',
      whyImportant: 'Indicates content engagement depth; helps optimize card design for maximum interaction potential.'
    },
    'Deal Type Effectiveness': {
      tooltip: 'Deal Type Effectiveness compares performance across different promotional offer types (BOGO, discounts, etc.).',
      whyImportant: 'Identifies which deal structures resonate most with shoppers; guides promotional strategy decisions.'
    },
    // Row 6 KPIs
    'Shared Promotions': {
      tooltip: 'Shared Promotions counts how many promotions were shared externally by shoppers through social or messaging platforms.',
      whyImportant: 'Measures viral potential and organic reach amplification; identifies content that resonates beyond paid exposure.'
    },
    'Share Open Rate': {
      tooltip: 'Share Open Rate shows the percentage of shared promotion links that were actually opened by recipients.',
      whyImportant: 'Measures effectiveness of shared content; indicates quality and relevance of virally distributed promotions.'
    },
    'Share Add-to-List Rate': {
      tooltip: 'Share Add-to-List Rate measures conversion from shared promotions, showing percentage of share opens that led to list adds.',
      whyImportant: 'Quantifies end-to-end viral conversion; demonstrates business impact of social sharing and word-of-mouth marketing.'
    }
  };

  // Helper function to create card header with info button
  function createCardHeader(title, tooltip = '', whyImportant = '', additionalContent = '') {
    // Use predefined definitions if not provided
    const definition = KPI_DEFINITIONS[title];
    const finalTooltip = tooltip || (definition?.tooltip || '');
    const finalWhyImportant = whyImportant || (definition?.whyImportant || '');

    const hasTooltip = finalTooltip.trim() !== '';
    const infoButton = hasTooltip ? `
      <button class="info-btn"
              aria-label="Show definition for ${title}"
              aria-expanded="false"
              data-tooltip-content="${encodeURIComponent(JSON.stringify({
                title: title,
                tooltip: finalTooltip || 'Definition not available.',
                whyImportant: finalWhyImportant || 'Business value information not available.'
              }))}"
              tabindex="0">
        <span aria-hidden="true">i</span>
      </button>` : '';

    return `
      <div class="card-head">
        <div class="card-head-left">
          <h3>${title}</h3>
          ${infoButton}
        </div>
        <div class="card-head-right">
          ${additionalContent}
        </div>
      </div>`;
  }

  // State
  AD.state = {
    version: 'all',
    week: 'w36'
  };

  // ---------- Helpers ----------
  const fmtInt = n => (Number(n||0)).toLocaleString();
  const pct = n => `${Math.round(Number(n||0))}%`;

  // ---------- Header: bind banner, versions, weeks, YTD tiles ----------
  AD.renderHeaderRow = function(){
    AD.bindHeaderContext();
    // Header tiles content now moved to row-1
  };

  AD.bindHeaderContext = function(){
    const meta = window.DATA_META || {};
    const bannerEl = $('#banner-name');
    if (bannerEl) bannerEl.textContent = meta.bannerName || '—';

    // Store dropdown
    const storeSel = document.getElementById('store-select');
    if (storeSel && window.AnalyticsAPI) {
      const currentStore = AD.state.store || 'all';
      const storeOpts = [{value:'all',label:'All'}].concat(
        window.AnalyticsAPI.getStores().map(s=>({value:s,label:s}))
      );
      storeSel.innerHTML = storeOpts.map(o=>`<option value="${o.value}">${o.label}</option>`).join('');
      storeSel.value = currentStore;
      storeSel.onchange = () => {
        AD.state.store = storeSel.value || 'all';
        AD.applySelection();
      };
    }

    // Version dropdown
    const sel = document.getElementById('version-select');
    if (sel) {
      const current = AD.state.version || 'all';
      const opts = [{value:'all',label:'All'}].concat((meta.versions||[]).map(v=>({value:v.id,label:v.name})));
      sel.innerHTML = opts.map(o=>`<option value="${o.value}">${o.label}</option>`).join('');
      sel.value = current;
      sel.onchange = () => {
        AD.state.version = sel.value || 'all';
        AD.applySelection();
      };
    }
// Week select
const wc = $('#week-context');
if (wc) {
  wc.innerHTML = `
    <div class="week-line">
      <div class="week-select-wrapper">
      <div class="status" id="week-status" style="color:var(--muted)">—</div>
        <select id="week-select" class="week-select"></select>
      </div>
      
    </div>
  `;
}

const wsel = document.getElementById('week-select');
const ws = document.getElementById('week-status');

const weeks = window.DATA_WEEKS || {};
const order = (window.DATA_WEEK_ORDER || []);
if (wsel) {
  wsel.innerHTML = order.map(id=>{
    const w = weeks[id] || {};
    const start = new Date(w.startISO).toLocaleDateString(undefined,{month:'short',day:'numeric'});
    const end   = new Date(w.endISO).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
    return `<option value="${id}"><strong>Week ${id.replace('w','')}:</strong> ${start} – ${end}</option>`;
  }).join('');
  wsel.value = AD.state.week;
  wsel.onchange = () => {
    AD.state.week = wsel.value;
    AD.applySelection();
  };
}

// status text only
if (ws) {
  const cur = weeks[AD.state.week] || {};
  ws.textContent = cur.inProgress ? 'In Progress' : 'Last Completed Week';
}
  };

  AD.renderHeaderTiles = function () {
    const host = $('#header-tiles'); if (!host) return;
    host.innerHTML = '';
    const t = window.DATA || {};
    const ytdKpis = t.ytdKpis || [];

    ytdKpis.forEach((kpi, index) => {
      const card = document.createElement('div');
      card.className = 'card kpi';
      const displayValue = typeof kpi.value === 'string' ? kpi.value : fmtInt(kpi.value);

      // Map KPI labels to drill-down keys
      const drillDownKeys = ['traffic', 'engagement_rate', 'weekly_growth'];
      const drillDownKey = drillDownKeys[index] || 'traffic';

      card.innerHTML = `
        <div class="card-head">
          <div class="card-head-left">
            <h3>${kpi.label}</h3>
            <button class="info-btn"
                    aria-label="Show definition for ${kpi.label}"
                    aria-expanded="false"
                    data-tooltip-content="${encodeURIComponent(JSON.stringify({
                      title: kpi.label,
                      tooltip: kpi.tooltip || 'Definition not available.',
                      whyImportant: kpi.whyImportant || 'Business value information not available.'
                    }))}"
                    tabindex="0">
              <span aria-hidden="true">i</span>
            </button>
          </div>
          <div class="card-head-right">
            <!-- More detail button will go here if needed -->
          </div>
        </div>
        <div class="card-body">
          <div class="small">${displayValue}${kpi.unit || ''}</div>
        </div>`;
      host.appendChild(card);
    });
  };

  // ---------- Row 1: small KPI numbers ----------
  AD.renderRow1 = function(){
    const host = $('#row-1'); if(!host) return;
    const t = window.DATA || {};

    // YTD KPIs (from header-tiles)
    const ytdKpis = t.ytdKpis || [];

    // Digital Circular KPIs
    const digitalKpis = [
      {h:'PULSE SCORE', sub:'Composite', val: t.pulseScore ?? 0, key: 'pulse_score'},
      {h:'ENGAGEMENT RATE', sub:'Rate', val: (t.engagementRate ?? 0) + '%', key: 'engagement_rate'},
      {h:'AUDIENCE REACH', sub:'Visitors', val: fmtInt(t.audienceReach ?? 0), key: 'audience_reach'}
    ];

    // Generate YTD cards
    const ytdCards = ytdKpis.map((kpi, index) => {
      const displayValue = typeof kpi.value === 'string' ? kpi.value : fmtInt(kpi.value);

      return `
        <div class="card kpi">
          ${createCardHeader(kpi.label)}
          <div class="card-body"><div class="big">${displayValue}</div><div class="subtext">${kpi.unit || ''}</div></div>
        </div>`;
    }).join('');

    // Generate Digital Circular cards
    const digitalCards = digitalKpis.map(k=>`
      <div class="card kpi">
        ${createCardHeader(k.h)}
        <div class="card-body"><div class="big">${k.val}</div><div class="subtext">${k.sub}</div></div>
      </div>
    `).join('');

    host.innerHTML = `
      <div class='section-title'>Digital Circular</div>
      <div class="grid six-up">
        ${ytdCards}${digitalCards}
      </div>`;
  };

  // ---------- Row 2: three charts (Trend, Promotion Position Performance, Store Lift scatter) ----------
  AD.renderRow2 = function(){
    const host = $('#row-2'); if(!host) return;
    host.innerHTML = `
      <div class="three-up">
        <div class="card trend">
          ${createCardHeader('Trend Overview (4 weeks)', '', '', '<button class="detail-btn" onclick="drillDownToInquiry(\'trend_overview\')">Inquiry →</button>')}
          <div class="card-body"><div id="trend-line" class="chart-host"></div></div>
        </div>
        <div class="card">
          ${createCardHeader('Promotion Position Performance', '', '', '<button class="detail-btn" onclick="drillDownToInquiry(\'position_performance\')">Inquiry →</button>')}
          <div class="card-body">
            <div class="kpi"><div class="small" id="ppp-total">—</div></div>
            <div id="position-chart" class="chart-host"></div>
          </div>
        </div>
        <div class="card lift">
          ${createCardHeader('Store Lift — Engagement vs Lift', '', '', '<button class="detail-btn" onclick="drillDownToInquiry(\'store_lift\')">Inquiry →</button>')}
          <div class="card-body"><div id="store-scatter" class="chart-host"></div></div>
        </div>
      </div>
    `;

    // Trend line
    const t = window.DATA || {};
    const trend = t.trend4w || {labels:[], values:[]};
    window.ns.echartsLine('trend-line','Composite', trend.labels, trend.values);

    // PPP mini stack
    const ppp = t.ppp || {total:0, qTop:0, qUpMid:0, qLoMid:0, qBottom:0};
    const pppTotalEl = document.getElementById('ppp-total');
    if (pppTotalEl) { pppTotalEl.innerHTML = `<span class="total">${fmtInt(ppp.total)}</span> <span class="title">Total Promotions</span>`;}

    // Create position performance chart data
    const positionData = [
      { name: 'Top', value: ppp.qTop || 0, color: '#4272D8' }, // Blue
      { name: 'Upper Middle', value: ppp.qUpMid || ppp.qUpperMid || 0, color: '#10B981' }, // Green
      { name: 'Lower Middle', value: ppp.qLoMid || ppp.qLowerMid || 0, color: '#F59E0B' }, // Yellow/Orange
      { name: 'Bottom', value: ppp.qBottom || 0, color: '#EF4444' } // Red
    ];

    window.ns.echartsPositionPerformance('position-chart', positionData);

    // Store scatter
    window.ns.echartsScatter('store-scatter', (t.stores || []).map(s=>({
      name: s.name, x: s.engagementPct, y: s.liftPct, size: s.size
    })));
  };

  // ---------- Row 3: Category KPIs (Donut + Top categories bar) ----------
  AD.renderRow3 = function(){
    const host = $('#row-3'); if(!host) return;
    host.innerHTML = `
      <div class='section-title'>Category</div>
      <div class="grid three-up">
        <div class="card">
          ${createCardHeader('Category Performance (Engagement Share)', '', '', '<button class="detail-btn" onclick="drillDownToInquiry(\'category_share\')">Inquiry →</button>')}
          <div class="card-body"><div id="category-donut" class="chart-host"></div></div>
        </div>
        <div class="card">
          ${createCardHeader('Category Lift vs Baseline Performance', '', '', '<button class="detail-btn" onclick="drillDownToInquiry(\'category_lift\')">Inquiry →</button>')}
          <div class="card-body"><div id="category-lift" class="chart-host"></div></div>
        </div>
        <div class="card">
          ${createCardHeader('Category Size vs Engagement Quality', '', '', '<button class="detail-btn" onclick="drillDownToInquiry(\'category_quality\')">Inquiry →</button>')}
          <div class="card-body"><div id="category-bubble" class="chart-host"></div></div>
        </div>
      </div>
    `;
    const t = window.DATA || {};
    // Use custom color palette for Category Performance (replacing red with #FF9656)
    const categoryColors = ['#5470c6', '#91cc75', '#fac858', '#FF9656', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
    window.ns.echartsDonut('category-donut', (t.categoryShare||[]), categoryColors);

    // Force destroy any existing chart instance
    const categoryLiftEl = document.getElementById('category-lift');
    if (categoryLiftEl && categoryLiftEl._echarts_instance_) {
      echarts.dispose(categoryLiftEl);
    }
    window.ns.echartsCategoryLift('category-lift', (t.categoryLift||[]));
    window.ns.echartsCategoryBubble('category-bubble', (t.categoryBubble||[]));
  };

// ---------- Row 4: Promotion Performance list (unchanged microbar pattern) ----------
  AD.renderRow4 = function(){
    const host = $('#row-4'); if(!host) return;
    host.innerHTML = `
      <div class='section-title'>Promotions</div>
<div class="grid cols-2 promotions">
      <!-- Left: Promotion Performance (unchanged) -->
      <div class="card chart-card" id="promotion-performance">
        <div class="card-head" style="flex-direction: column; align-items: stretch;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div class="card-head-left">
              <h3>Promotion Performance</h3>
              <button class="info-btn"
                      aria-label="Show definition for Promotion Performance"
                      aria-expanded="false"
                      data-tooltip-content="${encodeURIComponent(JSON.stringify({
                        title: 'Promotion Performance',
                        tooltip: KPI_DEFINITIONS['Promotion Performance']?.tooltip || 'Definition not available.',
                        whyImportant: KPI_DEFINITIONS['Promotion Performance']?.whyImportant || 'Business value information not available.'
                      }))}"
                      tabindex="0">
                <span aria-hidden="true">i</span>
              </button>
            </div>
            <button class="detail-btn" onclick="drillDownToInquiry('promotion_performance')">Inquiry →</button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="center-controls">
              <label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted)">
                Top
                <select id="pp-topn" style="background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:4px 8px;font-size:12px">
                  <option value="10" selected>10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </label>
            </div>
            <div class="toggle" role="group" aria-label="Score Toggle">
              <button class="toggle-btn is-active" data-mode="composite"><span class="swatch s-top"></span>Composite</button>
              <button class="toggle-btn" data-mode="percentile"><span class="swatch s-upmid"></span>Percentile</button>
            </div>
          </div>
        </div>
        <div class="card-body bars-wrap"><div class="bars" role="list" id="pp-bars"></div></div>
      </div>

      <!-- Right: NEW fixed-size Digital Circular Heat Map -->
      <div class="card heatmap-card" id="digital-heatmap">
        ${createCardHeader('Digital Circular Heat Map', '', '',
          '<button id="heatmap-toggle" class="toggle-btn is-active" aria-pressed="true" data-state="on">On</button>')}
        <div class="card-body heatmap-body">
          <img id="heatmap-image"
               class="heatmap-img"
               src="assets/img/heat-map-on.png"
               alt="Digital circular heat map">
        </div>
      </div>
      </div>
    `;

    const modeBtn = (m) => document.querySelector(`.toggle-btn[data-mode="${m}"]`);
    const barsHost = $('#pp-bars');
    const sel = $('#pp-topn');
    function draw(){
      const mode = modeBtn('percentile').classList.contains('is-active') ? 'percentile' : 'composite';
      const topN = Number(sel.value||10);
      const items = (window.DATA?.promotions || []).slice(0, topN);


      if (barsHost){
        // Calculate max composite for normalization in composite mode
        const maxComposite = mode === 'composite' ? Math.max(...items.map(it => it.composite || 0)) : 100;

        barsHost.innerHTML = items.map(it=>{
          let val, pct;
          if (mode === 'percentile') {
            val = it.percentile || 0;
            pct = Math.max(0, Math.min(100, Math.round(val)));
          } else {
            // Composite mode: normalize to percentage of max composite
            val = it.composite || 0;
            pct = maxComposite > 0 ? Math.round((val / maxComposite) * 100) : 0;
          }

          const seed = encodeURIComponent(it.title||'p');

          const barColor = (mode === 'percentile')
            ? 'background: var(--blue);'
            : 'background: var(--green);';

          const valDisplay = (mode === 'percentile') ? pct + '%' : val; // Show raw composite score for composite mode

          return `
            <div class="bar" role="listitem">
              <img class="thumb" alt="" src="https://picsum.photos/seed/${seed}/72/48">
              <div class="label" title="${it.title}">${it.title}</div>
              <div class="meter">
                <div class="microbar">
                  <div class="microbar-shell">
                    <div class="microbar-fill"
                         data-target="${pct}"
                         style="width:0%;${barColor}"></div>
                  </div>
                </div>
              </div>
              <div class="val">${valDisplay}</div>
            </div>
          `;
        }).join('');

        // animate width to data-target
        requestAnimationFrame(()=>{
          barsHost.querySelectorAll('.microbar-fill').forEach(el=>{
            const target = el.getAttribute('data-target') || '0';
            el.style.width = target + '%';
          });
        });
      }
    }
    sel && (sel.onchange = draw);
    const btns = document.querySelectorAll('.toggle-btn');
    btns.forEach(b=>{
      b.onclick = ()=>{
        btns.forEach(x=>x.classList.remove('is-active'));
        b.classList.add('is-active');
        draw();
      };
    });
    draw();

    // --- Heat Map toggle wiring (PNG files) ---
    const hmBtn = document.getElementById('heatmap-toggle');
    const hmImg = document.getElementById('heatmap-image');
    if (hmBtn && hmImg){
      hmBtn.onclick = () => {
        const isOn = hmBtn.dataset.state === 'on';
        if (isOn){
          hmImg.src = 'assets/img/heat-map-off.png';
          hmBtn.dataset.state = 'off';
          hmBtn.classList.remove('is-active');
          hmBtn.textContent = 'Off';
          hmBtn.setAttribute('aria-pressed', 'false');
        } else {
          hmImg.src = 'assets/img/heat-map-on.png';
          hmBtn.dataset.state = 'on';
          hmBtn.classList.add('is-active');
          hmBtn.textContent = 'On';
          hmBtn.setAttribute('aria-pressed', 'true');
        }
      };
    }
  };

// ---------- Row 5: Size KPIs ----------
AD.renderRow5 = function(){
  const host = $('#row-5'); if(!host) return;
  host.innerHTML = `
    <div class="grid cols-4">
      <div class="col">
        <div class="card small">
          ${createCardHeader('Size Class Mix', '', '', '<button class="detail-btn" onclick="drillDownToInquiry(\'size_mix\')">Inquiry →</button>')}
          <div class="card-body"><div id="size-mix" class="chart-host"></div></div>
        </div>
      </div>
      <div class="col">
        <div class="card small">
          ${createCardHeader('Best Performing Size Class', '', '', '<button class="detail-btn" onclick="drillDownToInquiry(\'best_size\')">Inquiry →</button>')}
          <div class="card-body"><div id="best-size" class="chart-host"></div></div>
        </div>
      </div>
      <div class="col">
        <div class="card small">
          ${createCardHeader('Expanded Interaction Rate', '', '', '<button class="detail-btn" onclick="drillDownToInquiry(\'expand_rate\')">Inquiry →</button>')}
          <div class="card-body"><div id="expand-donut" class="chart-host"></div></div>
        </div>
      </div>
      <div class="col deal-type">
        <div class="card small">
          ${createCardHeader('Deal Type Effectiveness', '', '', '<button class="detail-btn" onclick="drillDownToInquiry(\'deal_effectiveness\')">Inquiry →</button>')}
          <div class="card-body">
            <!-- wrapper fills tile; lets ECharts compute size; scroll if long -->
            <div class="dealtype-wrap">
              <div id="dealtype-bars" class="chart-host" style="height: 100%;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const t = window.DATA || {};
  // Existing charts
  window.ns.echartsDonut('size-mix', (t.sizeMix||[]), ['#B8D64D', '#4272D8', '#4E5370']); // Small, Medium, Large
  window.ns.echartsBar('best-size', (t.bestSize||[]), ['#B8D64D', '#4272D8', '#4E5370']); // Small, Medium, Large
  window.ns.echartsDonut('expand-donut', (t.expandRate||[]), ['#B8D64D', '#4272D8']); // Expanded, Not Expanded

  // Deal Type Effectiveness (horizontal bar; scrolls when long)
  window.ns.echartsDealTypeHBars('dealtype-bars', (t.dealTypes || []), { showPercent: true });

  // (Optional) size index if present
  const idx = document.getElementById('size-index');
  if (idx) idx.textContent = String(t.sizeEffectIndex ?? '—');
};

  // ---------- Row 6: Sharing KPIs (slim) ----------
  AD.renderRow6 = function(){
    const host = $('#row-6'); if(!host) return;
    const t = window.DATA || {};
    const tiles = [
      { label:'Shared Promotions', value: fmtInt(t.sharedCount ?? 0), key: 'shared_promotions' },
      { label:'Share Open Rate', value: pct(t.shareOpenRate ?? 0), key: 'share_open_rate' },
      { label:'Share Add-to-List Rate', value: pct(t.shareAddRate ?? 0), key: 'share_add_rate' }
    ];
    host.innerHTML = `
      <div class="slim-kpis">
        ${tiles.map(k=>`
          <div class="card kpi">
            ${createCardHeader(k.label)}
            <div class="card-body"><div class="big">${k.value}</div></div>
          </div>
        `).join('')}
      </div>
    `;
  };

// ---------- Apply selection (week/version) ----------
AD.applySelection = function(){
  try{
    if (typeof window.getWeekData === 'function'){
      window.DATA = window.getWeekData(AD.state.week, AD.state.version);
    }

    // Update header status (no more week-range element in DOM)
    const weeks = window.DATA_WEEKS || {};
    const cur = weeks[AD.state.week] || {};
    const ws = document.getElementById('week-status');
    if (ws){
      ws.textContent = cur.inProgress ? 'In Progress' : 'Last Completed Week';
    }

    AD.renderAll();
  }catch(e){
    console.error('[applySelection]', e);
  }
};

  // ---------- Render all ----------
  AD.renderAll = function(){
    AD.renderHeaderTiles();
    AD.renderRow1();
    AD.renderRow2();
    AD.renderRow3();
    AD.renderRow4();
    AD.renderRow5();
    AD.renderRow6();
  };
})();