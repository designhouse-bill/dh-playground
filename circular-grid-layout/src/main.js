import {
  computeCategoryLayout,
  paginateDocument,
  maxSpanForColumns,
  maxColumnsForWidth,
  measureDocument,
} from './layout.js';
import { renderPages } from './render.js';
import { staterBros, generatePromos as sbPromos } from './sample-data-staterbros.js';
import { winnDixie, generatePromos as wdPromos } from './sample-data-winndixie.js';

const FIXTURES = {
  'stater-bros': { ad: staterBros, gen: sbPromos },
  'winn-dixie': { ad: winnDixie, gen: wdPromos },
};

const state = {
  fixture: 'stater-bros',
  N: 4,
  R: 4,
  emphasisOverride: null, // null = use fixture value
  packTight: true,
  gridMode: 'strict',
  variant: 'auto',
};

function $(sel) {
  return document.querySelector(sel);
}

function render() {
  const { ad, gen } = FIXTURES[state.fixture];
  const categories = state.emphasisOverride === null
    ? ad.categories
    : ad.categories.map((c, i) => (i === 0 ? { ...c, emphasis: state.emphasisOverride } : c));

  const promos = gen(categories);
  window.__categoryIdByIndex = categories.map((c) => c.id);

  const maxSpan = maxSpanForColumns(state.N);
  const { pages, warnings } = paginateDocument({
    categories,
    N: state.N,
    R: state.R,
    maxSpan,
    packTight: state.packTight,
  });

  const metrics = measureDocument({ pages, categories, N: state.N, R: state.R });

  const preview = $('#preview');
  if (preview) {
    renderPages(pages, preview, {
      N: state.N,
      R: state.R,
      gridMode: state.gridMode,
      promos,
      categories,
      variant: state.variant,
    });
  }

  const metricsEl = $('#metrics');
  if (metricsEl) {
    metricsEl.innerHTML = `
      <div><strong>Pages:</strong> ${metrics.pageCount}</div>
      <div><strong>Cards:</strong> ${metrics.totalCards} / capacity ${metrics.capacity}</div>
      <div><strong>Density:</strong> ${(metrics.density * 100).toFixed(1)}%</div>
      <div><strong>Rows:</strong> ${metrics.totalRows}</div>
      <div><strong>Span bumps:</strong> ${metrics.spanBumps}</div>
      <div><strong>Max span (N=${state.N}):</strong> ${maxSpan}</div>
      ${warnings.length ? `<div class="warn"><strong>Warnings:</strong> ${warnings.map((w) => `${w.category} (${w.reason})`).join(', ')}</div>` : ''}
    `;
  }

  // Per-category layout readout
  const readoutEl = $('#category-readout');
  if (readoutEl) {
    readoutEl.innerHTML = categories.map((cat) => {
      const layout = computeCategoryLayout({
        P: cat.P,
        N: state.N,
        maxSpan,
        emphasis: state.emphasisOverride !== null && categories.indexOf(cat) === 0
          ? state.emphasisOverride
          : (cat.emphasis ?? 0),
        packTight: state.packTight,
      });
      if (!layout.feasible) {
        return `<tr><td>${cat.name}</td><td>${cat.P}</td><td colspan="3" class="warn">infeasible</td></tr>`;
      }
      const rowsStr = layout.rows.map((r) => `[${r.join(',')}]`).join(' ');
      return `<tr><td>${cat.name}</td><td>${cat.P}</td><td>${layout.requiredE}</td><td>${layout.E}</td><td class="rows">${rowsStr}</td></tr>`;
    }).join('');
  }
}

function wireControls() {
  const fixtureSel = $('#fixture');
  const nSel = $('#cols');
  const rSel = $('#rows-per-page');
  const emphasisSel = $('#emphasis-override');
  const packChk = $('#pack-tight');
  const gridSel = $('#grid-mode');

  if (fixtureSel) fixtureSel.addEventListener('change', (e) => { state.fixture = e.target.value; render(); });
  if (nSel) nSel.addEventListener('change', (e) => { state.N = parseInt(e.target.value, 10); render(); });
  if (rSel) rSel.addEventListener('change', (e) => { state.R = parseInt(e.target.value, 10); render(); });
  if (emphasisSel) emphasisSel.addEventListener('change', (e) => {
    const v = e.target.value;
    state.emphasisOverride = v === 'default' ? null : parseInt(v, 10);
    render();
  });
  if (packChk) packChk.addEventListener('change', (e) => { state.packTight = e.target.checked; render(); });
  if (gridSel) gridSel.addEventListener('change', (e) => { state.gridMode = e.target.value; render(); });

  const variantSel = $('#card-variant');
  if (variantSel) variantSel.addEventListener('change', (e) => { state.variant = e.target.value; render(); });
}

/* ─────────────────────────────────────────────────────────────── */
/* Console test harness — verifies plan §7 test cases on load.     */
/* ─────────────────────────────────────────────────────────────── */

function assertDeepEqual(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`%c✓ ${label}`, 'color: #0a0');
    return true;
  }
  console.error(`✗ ${label}\n  expected: ${e}\n  actual:   ${a}`);
  return false;
}

function assertEqual(actual, expected, label) {
  if (actual === expected) {
    console.log(`%c✓ ${label}`, 'color: #0a0');
    return true;
  }
  console.error(`✗ ${label}\n  expected: ${expected}\n  actual:   ${actual}`);
  return false;
}

function runTests() {
  console.group('%ccircular-grid-layout — plan §7 test cases', 'font-weight: bold');

  // Case 1: even fit, no extras needed
  let r = computeCategoryLayout({ P: 30, N: 5, maxSpan: 3, emphasis: 0, packTight: true });
  assertEqual(r.E, 0, 'P=30 N=5 → E=0');
  assertEqual(r.rows.length, 6, 'P=30 N=5 → 6 rows');
  assertEqual(r.feasible, true, 'P=30 N=5 → feasible');
  assertDeepEqual(r.rows[0], [1, 1, 1, 1, 1], 'P=30 N=5 → row 1 = [1,1,1,1,1]');

  // Case 2: signature [3,3] opening at N=6 P=14
  r = computeCategoryLayout({ P: 14, N: 6, maxSpan: 3, emphasis: 0, packTight: true });
  assertEqual(r.E, 4, 'P=14 N=6 → E=4');
  assertDeepEqual(r.rows[0], [3, 3], 'P=14 N=6 → row 1 = [3,3]');
  assertEqual(r.rows.length, 3, 'P=14 N=6 → 3 rows');

  // Case 3: N=4 with requiredE=1
  r = computeCategoryLayout({ P: 11, N: 4, maxSpan: 2, emphasis: 0, packTight: true });
  assertEqual(r.E, 1, 'P=11 N=4 → E=1');
  assertDeepEqual(r.rows[0], [2, 1, 1], 'P=11 N=4 → row 1 = [2,1,1]');
  assertEqual(r.rows.length, 3, 'P=11 N=4 → 3 rows');

  // Case 4: small category, tight
  r = computeCategoryLayout({ P: 2, N: 5, maxSpan: 3, emphasis: 0, packTight: true });
  assertEqual(r.E, 3, 'P=2 N=5 → E=3');
  assertDeepEqual(r.rows[0], [3, 2], 'P=2 N=5 → row 1 = [3,2]');
  assertEqual(r.rows.length, 1, 'P=2 N=5 → 1 row');

  // Case 5: emphasis forces extra row
  r = computeCategoryLayout({ P: 30, N: 5, maxSpan: 3, emphasis: 2, packTight: true });
  assertEqual(r.E, 5, 'P=30 N=5 emphasis=2 → E=5');
  assertEqual(r.rows.length, 7, 'P=30 N=5 emphasis=2 → 7 rows');

  // Case 6: P=1 infeasible at N=4 maxSpan=2 (min cells per row = 2)
  r = computeCategoryLayout({ P: 1, N: 4, maxSpan: 2, emphasis: 0, packTight: true });
  assertEqual(r.feasible, false, 'P=1 N=4 → infeasible');

  // Extra: maxColumnsForWidth
  assertEqual(maxColumnsForWidth(7.5, 0.125, 1.4), 5, 'maxColsForWidth 7.5/0.125/1.4 → 5');
  // N=6 yields 1.146" cols, just below 1.15 threshold → max N = 5
  assertEqual(maxColumnsForWidth(7.5, 0.125, 1.14), 6, 'maxColsForWidth 7.5/0.125/1.14 → 6');
  assertEqual(maxColumnsForWidth(7.5, 0.125, 1.78), 4, 'maxColsForWidth 7.5/0.125/1.78 → 4');

  // Extra: maxSpanForColumns
  assertEqual(maxSpanForColumns(3), 2, 'maxSpan(3) → 2');
  assertEqual(maxSpanForColumns(4), 2, 'maxSpan(4) → 2');
  assertEqual(maxSpanForColumns(5), 2, 'maxSpan(5) → 2');
  assertEqual(maxSpanForColumns(6), 2, 'maxSpan(6) → 2');

  console.groupEnd();
}

window.addEventListener('DOMContentLoaded', () => {
  wireControls();
  render();
  runTests();
});
