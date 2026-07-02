/* section-hero init — fills the hero-stat fragment from a section config
   (data/sections.js). Owns the cohort-pill + week/date text slice that
   distribution-page-app.js renderCohortNote targeted (a no-op on the 2.0
   markup — it queries .ep-cohort-note__* but the pill uses .ep-cohort-pill__*).
   Values must match the frozen proto exactly for the static oracle gate. */
(function () {
  function render(host, cfg) {
    if (!host || !cfg) return host;
    function set(sel, text) {
      var el = host.querySelector(sel);
      if (el && text != null) el.textContent = text;
    }
    set('.narrative-header__section', cfg.section);
    set('.narrative-header__title', cfg.title);
    set('.narrative-header__question', cfg.question);
    set('.ep-cohort-pill__count', cfg.cohort);
    set('[id^="subtitle-date-week"]', cfg.week);
    set('[id^="subtitle-date-range"]', cfg.dateRange);
    return host;
  }
  window.DistSectionHero = { render: render };
})();
