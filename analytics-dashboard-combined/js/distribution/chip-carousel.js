/**
 * ChipCarousel — paged carousel wrapper for .creative-chips strips.
 * Replaces native horizontal scroll with PrimeNG-styled prev/next pagination.
 * Page = viewport width. Advance translates the strip by one viewport.
 *
 * Usage:
 *   ChipCarousel.init(stripEl);          // wrap once, bind handlers
 *   ChipCarousel.refresh(stripEl);       // after innerHTML changes (re-render)
 */
(function (global) {
  'use strict';

  const STATE = '__chipCarouselState';

  function ensureWrapped(stripEl) {
    if (stripEl[STATE]) return stripEl[STATE];

    const carousel = document.createElement('div');
    carousel.className = 'p-carousel chip-carousel';

    const row = document.createElement('div');
    row.className = 'p-carousel-content-container';

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'p-carousel-prev-button';
    prev.setAttribute('aria-label', 'Previous page');
    prev.innerHTML = '<span class="material-symbols-outlined">chevron_left</span>';

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'p-carousel-next-button';
    next.setAttribute('aria-label', 'Next page');
    next.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';

    const viewport = document.createElement('div');
    viewport.className = 'p-carousel-viewport';

    stripEl.parentNode.insertBefore(carousel, stripEl);
    viewport.appendChild(stripEl);
    row.append(prev, viewport, next);
    carousel.append(row);

    stripEl.style.transition = 'transform 250ms ease';
    stripEl.style.willChange = 'transform';

    const state = { stripEl, viewport, prev, next, page: 0, pages: 1 };
    stripEl[STATE] = state;

    prev.addEventListener('click', () => goTo(state, state.page - 1));
    next.addEventListener('click', () => goTo(state, state.page + 1));

    if (!ChipCarousel._resizeBound) {
      ChipCarousel._resizeBound = true;
      let raf;
      window.addEventListener('resize', () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => ChipCarousel._all.forEach(refresh));
      });
    }
    ChipCarousel._all.add(stripEl);

    return state;
  }

  function measure(state) {
    const pageWidth = state.viewport.clientWidth;
    const totalWidth = state.stripEl.scrollWidth;
    const pages = pageWidth > 0 ? Math.max(1, Math.ceil(totalWidth / pageWidth)) : 1;
    state.pageWidth = pageWidth;
    state.pages = pages;
    if (state.page >= pages) state.page = pages - 1;
    if (state.page < 0) state.page = 0;
  }

  function paint(state) {
    state.stripEl.style.transform = 'translateX(' + (-state.page * state.pageWidth) + 'px)';
    state.prev.disabled = state.page <= 0;
    state.next.disabled = state.page >= state.pages - 1;
    state.prev.style.visibility = state.pages > 1 ? '' : 'hidden';
    state.next.style.visibility = state.pages > 1 ? '' : 'hidden';
  }

  function goTo(state, page) {
    state.page = Math.max(0, Math.min(page, state.pages - 1));
    paint(state);
  }

  function init(stripEl) {
    if (!stripEl) return;
    const state = ensureWrapped(stripEl);
    measure(state);
    paint(state);
  }

  function refresh(stripEl) {
    const state = stripEl && stripEl[STATE];
    if (!state) return init(stripEl);
    measure(state);
    paint(state);
  }

  const ChipCarousel = { init, refresh, _all: new Set() };
  global.ChipCarousel = ChipCarousel;
})(window);
