/* ==========================================================================
   Boot (Master-aligned)
   - Waits for AD, echarts, DATA scaffolds
   - Renders header first, then rows
   ========================================================================== */
(function(){
  function ready(){
    return !!(window.AD && window.echarts && window.DATA_META && window.DATA_WEEKS && document.body);
  }

  function waitUntil(pred, cb, timeoutMs=8000){
    const t0 = Date.now();
    (function tick(){
      if (pred()) return cb();
      if (Date.now()-t0 > timeoutMs) return cb(); // fail-open
      requestAnimationFrame(tick);
    })();
  }

  function boot(){
    // 1) Render header + YTD tiles (uses DATA_META and DATA_WEEKS)
    if (window.AD && AD.renderHeaderRow) AD.renderHeaderRow();

    // 2) Scope DATA to current week/version
    if (typeof window.getWeekData === 'function'){
      const versionSel = document.getElementById('version-select');
      const weekSel = document.getElementById('week-select');
      const v = (versionSel && versionSel.value) || (AD.state?.version) || 'all';
      const w = (weekSel && weekSel.value) || (AD.state?.week) || 'w36';
      AD.state.version = v;
      AD.state.week = w;
      window.DATA = window.getWeekData(w, v);
    }

    // 3) Render rows
    if (window.AD && AD.renderAll) AD.renderAll();

    // 4) resize guard
    window.addEventListener('resize', () => {
      if (window.AD && AD.renderRow2) AD.renderRow2();
    }, {passive:true});
  }

  waitUntil(ready, boot);
})();