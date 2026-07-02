/* Shared section configs — one entry per distribution section.
   Values mirror the frozen proto (proto-2.0-baseline answer key) verbatim;
   the static oracle gate depends on exact-match text.
   panelCopy/defaultSub = the traffic page's inline PANEL_COPY + showSub('store')
   default, consumed by shared/chart-card/init.js. */
window.DIST_SECTIONS = {
  traffic: {
    section: 'Distribution',
    title: 'Traffic Share',
    question: 'How is our share of shopper visits shifting against nearby competitors?',
    cohort: '83 of 83 stores',
    week: 'Week 47',
    dateRange: 'Nov 17 – Nov 23, 2026',
    defaultSub: 'store',
    panelCopy: {
      trend: {
        title: 'Traffic Share Over Time',
        sub: 'Weekly share of observed shopper visits across our stores vs. nearby competitors.<br><span class="panel-subtitle__muted">Panel-tracked — directional, not a census.</span>'
      },
      store: {
        title: 'Traffic Share by Store',
        sub: 'Per-store share of observed visits. Click a row to zoom the map to that store; expand a row to see its competitors in range.<br><span class="panel-subtitle__muted">Proximity rings show 1/3/5-mile catchment.</span>'
      },
      competitor: {
        title: 'Competitive Crossover',
        sub: 'Where our media-exposed visitors also shop — top competitors + All Other.<br><span class="panel-subtitle__muted">Source: Greenberg cross-shopping panel.</span>'
      }
    }
  }
};
