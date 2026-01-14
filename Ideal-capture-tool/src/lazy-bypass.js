/**
 * Lazy-Load Bypass Module
 *
 * Three modes with increasing aggressiveness:
 * 1. Conservative: Just scroll + wait (safest)
 * 2. IO Patch: Patch IntersectionObserver
 * 3. Aggressive: IO patch + force all lazy attributes
 */

/**
 * Conservative mode - no patching, just rely on scroll
 */
export async function applyConservativeMode(page) {
  // No-op - just rely on natural scrolling to trigger lazy-load
  console.log('  Mode: conservative (scroll only)');
}

/**
 * IO Patch mode - patch IntersectionObserver to report everything as visible
 */
export async function applyIOPatchMode(page) {
  console.log('  Mode: io-patch (IntersectionObserver patched)');

  await page.addInitScript(() => {
    window.IntersectionObserver = class {
      constructor(callback) {
        this.callback = callback;
      }
      observe(el) {
        setTimeout(() => {
          this.callback([{
            target: el,
            isIntersecting: true,
            intersectionRatio: 1,
            boundingClientRect: el.getBoundingClientRect(),
          }]);
        }, 100);
      }
      unobserve() {}
      disconnect() {}
      takeRecords() { return []; }
    };
  });
}

/**
 * Aggressive mode - IO patch + force all lazy attributes
 */
export async function applyAggressiveMode(page) {
  console.log('  Mode: aggressive (IO patch + force attributes)');

  // Apply IO patch first
  await applyIOPatchMode(page);

  // Add attribute forcing
  await page.addInitScript(() => {
    let debounceTimer = null;
    let totalCalls = 0;
    const MAX_CALLS = 50;

    function forceLoadAll() {
      if (totalCalls >= MAX_CALLS) return;
      totalCalls++;

      // Handle <img> elements
      document.querySelectorAll('img').forEach(img => {
        img.removeAttribute('loading');
        img.loading = 'eager';

        // Only swap if no src or placeholder
        const needsSwap = !img.src || img.src.startsWith('data:');

        ['data-src', 'data-lazy', 'data-original', 'data-url'].forEach(attr => {
          if (needsSwap && img.getAttribute(attr)) {
            img.src = img.getAttribute(attr);
          }
        });

        if (img.dataset.srcset && !img.srcset) {
          img.srcset = img.dataset.srcset;
        }
      });

      // Handle <picture>/<source> elements
      document.querySelectorAll('picture source').forEach(source => {
        if (source.dataset.srcset && !source.srcset) {
          source.srcset = source.dataset.srcset;
        }
      });

      // Handle background images
      document.querySelectorAll('[data-bg], [data-background]').forEach(el => {
        const bg = el.dataset.bg || el.dataset.background;
        if (bg && !el.style.backgroundImage) {
          el.style.backgroundImage = `url(${bg})`;
        }
      });
    }

    document.addEventListener('DOMContentLoaded', forceLoadAll);

    // Debounced MutationObserver
    if (document.body) {
      new MutationObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(forceLoadAll, 250);
      }).observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  });
}

/**
 * Apply the specified lazy-load bypass mode
 */
export async function applyLazyBypass(page, mode) {
  switch (mode) {
    case 'io-patch':
      return applyIOPatchMode(page);
    case 'aggressive':
      return applyAggressiveMode(page);
    case 'conservative':
    default:
      return applyConservativeMode(page);
  }
}
