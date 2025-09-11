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
    AD.renderHeaderTiles();
  };

  AD.bindHeaderContext = function(){
    const meta = window.DATA_META || {};
    const bannerEl = $('#banner-name');
    if (bannerEl) bannerEl.textContent = meta.bannerName || '—';

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
        <select id="week-select" class="week-select"></select>
      </div>
      <div class="status" id="week-status" style="color:var(--muted)">—</div>
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
    const tiles = [
      { label:'Traffic (YTD)',  value: fmtInt(t.trafficYTD ?? 0) },
      { label:'Visitors (YTD)', value: fmtInt(t.visitorsYTD ?? 0) },
      { label:'Health (YTD)', value: String(t.marketingHealthYTD ?? '—') }
    ];
    tiles.forEach(k=>{
      const card = document.createElement('div');
      card.className = 'card kpi';
      card.innerHTML = `<div class="card-head"><h3>${k.label}</h3></div>
                        <div class="card-body"><div class="small">${k.value}</div></div>`;
      host.appendChild(card);
    });
  };

  // ---------- Row 1: small KPI numbers ----------
  AD.renderRow1 = function(){
    const host = $('#row-1'); if(!host) return;
    const t = window.DATA || {};
    const labels = [
      {h:'PULSE SCORE', sub:'Composite', val: t.pulseScore ?? 0},
      {h:'ENGAGEMENT RATE', sub:'Rate', val: (t.engagementRate ?? 0) + '%'},
      {h:'AUDIENCE REACH', sub:'Visitors', val: fmtInt(t.audienceReach ?? 0)}
    ];
    host.innerHTML = `
      <div class='section-title'>Digital Circular</div>
      <div class="grid three-up">
        ${labels.map(k=>`
          <div class="card kpi">
            <div class="card-head"><h3>${k.h}</h3></div>
            <div class="card-body"><div class="big">${k.val}</div><div class="subtext">${k.sub}</div></div>
          </div>
        `).join('')}
      </div>`;
  };

  // ---------- Row 2: three charts (Trend, Promotion Position Performance, Store Lift scatter) ----------
  AD.renderRow2 = function(){
    const host = $('#row-2'); if(!host) return;
    host.innerHTML = `
      <div class="three-up">
        <div class="card trend">
          <div class="card-head"><h3>Trend Overview (4 weeks)</h3></div>
          <div class="card-body"><div id="trend-line" class="chart-host"></div></div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Promotion Position Performance</h3></div>
          <div class="card-body">
            <div class="kpi"><div class="small" id="ppp-total">—</div></div>
            <div class="stack-legend" id="ppp-stack"></div>
          </div>
        </div>
        <div class="card lift">
          <div class="card-head"><h3>Store Lift — Engagement vs Lift</h3></div>
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
    const stackHost = document.getElementById('ppp-stack');
    if (stackHost){
      stackHost.innerHTML = `
        <div class="stack-row"><span class="swatch s-top"></span><span>Top</span><span class="pct">${pct(ppp.qTop)}</span></div>
        <div class="stack-row"><span class="swatch s-upmid"></span><span>Upper Middle</span><span class="pct">${pct(ppp.qUpMid)}</span></div>
        <div class="stack-row"><span class="swatch s-lomid"></span><span>Lower Middle</span><span class="pct">${pct(ppp.qLoMid)}</span></div>
        <div class="stack-row"><span class="swatch s-bottom"></span><span>Bottom</span><span class="pct">${pct(ppp.qBottom)}</span></div>
      `;
    }

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
      <div class="grid cols-2">
        <div class="col">
          <div class="card">
            <div class="card-head"><h3>Category Performance (Engagement Share)</h3></div>
            <div class="card-body"><div id="category-donut" class="chart-host"></div></div>
          </div>
        </div>
        <div class="col">
          <div class="card">
            <div class="card-head"><h3>Top Categories by Avg Engagement</h3></div>
            <div class="card-body"><div id="category-topbar" class="chart-host"></div></div>
          </div>
        </div>
      </div>
    `;
    const t = window.DATA || {};
    window.ns.echartsDonut('category-donut', (t.categoryShare||[]));
    window.ns.echartsBar('category-topbar', (t.categoryTop||[]));
  };

// ---------- Row 4: Promotion Performance list (unchanged microbar pattern) ----------
  AD.renderRow4 = function(){
    const host = $('#row-4'); if(!host) return;
    host.innerHTML = `
      <div class='section-title'>Promotions</div>
<div class="grid cols-2 promotions">
      <!-- Left: Promotion Performance (unchanged) -->
      <div class="card chart-card" id="promotion-performance">
        <div class="card-head">
          <h3>Promotion Performance</h3>
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
        <div class="card-body bars-wrap"><div class="bars" role="list" id="pp-bars"></div></div>
      </div>

      <!-- Right: NEW fixed-size Digital Circular Heat Map -->
      <div class="card heatmap-card" id="digital-heatmap">
        <div class="card-head">
          <h3>Digital Circular Heat Map</h3>
          <button id="heatmap-toggle"
                  class="toggle-btn is-active"
                  aria-pressed="true"
                  data-state="on">On</button>
        </div>
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
        barsHost.innerHTML = items.map(it=>{
          const val = (mode==='percentile'? it.percentile : it.composite) || 0;
          const pct = Math.max(0, Math.min(100, Math.round(val)));
          const seed = encodeURIComponent(it.title||'p');

          const barColor = (mode === 'percentile')
            ? 'background: var(--green);'
            : 'background: var(--blue);';

          const valDisplay = (mode === 'percentile') ? pct + '%' : pct;

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
          <div class="card-head"><h3>Size Class Mix</h3></div>
          <div class="card-body"><div id="size-mix" class="chart-host"></div></div>
        </div>
      </div>
      <div class="col">
        <div class="card small">
          <div class="card-head"><h3>Best Performing Size Class</h3></div>
          <div class="card-body"><div id="best-size" class="chart-host"></div></div>
        </div>
      </div>
      <div class="col">
        <div class="card small">
          <div class="card-head"><h3>Expanded Interaction Rate</h3></div>
          <div class="card-body"><div id="expand-donut" class="chart-host"></div></div>
        </div>
      </div>
      <div class="col deal-type">
        <div class="card small">
          <div class="card-head"><h3>Deal Type Effectiveness</h3></div>
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
  window.ns.echartsDonut('size-mix', (t.sizeMix||[]));
  window.ns.echartsBar('best-size', (t.bestSize||[]));
  window.ns.echartsDonut('expand-donut', (t.expandRate||[]));

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
      { label:'Shared Promotions', value: fmtInt(t.sharedCount ?? 0) },
      { label:'Share Open Rate', value: pct(t.shareOpenRate ?? 0) },
      { label:'Share Add-to-List Rate', value: pct(t.shareAddRate ?? 0) }
    ];
    host.innerHTML = `
      <div class="slim-kpis">
        ${tiles.map(k=>`
          <div class="card kpi">
            <div class="card-head"><h3>${k.label}</h3></div>
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