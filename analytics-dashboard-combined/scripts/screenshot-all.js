// UX-846 — screenshot every canonical page × every tab state.
// Run: cd analytics-dashboard-combined && npx playwright test scripts/screenshot-all.js
// Or:  node scripts/screenshot-all.js  (after `npm i -D playwright`)
// Output: screenshots/<page>__<tab>.png

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8765';
const OUT = path.join(__dirname, '..', 'screenshots');

// Per-page: which attribute drives tabs, which values to iterate.
// "" = baseline (no tab click) — first shot is always baseline.
// Engagement sub-tabs only fire on non-overview metric tabs.
const EP_METRIC_TABS = ['sessions', 'users', 'duration', 'cardevents'];
const EP_SUB_TABS = ['store', 'day', 'trend', 'data'];
const EP_SUB_ATTR = 'data-ep-sub';

function epPage(file) {
  return {
    file,
    tabAttr: 'data-ep-tab',
    tabs: ['overview', ...EP_METRIC_TABS],
    subTabs: { attr: EP_SUB_ATTR, parents: EP_METRIC_TABS, values: EP_SUB_TABS }
  };
}

const PAGES = [
  epPage('engagement-report.html'),
  epPage('engagement-explore.html'),
  { file: 'engagement-compare.html', tabAttr: null, tabs: [] },
  // Visitation: data-perf-tab top + view-toggle on By Store
  {
    file: 'distribution-visitation.html', tabAttr: 'data-perf-tab',
    tabs: ['overview', 'store', 'creative', 'day'],
    viewToggles: { parent: 'store', attr: 'data-perf-view', values: ['bar', 'data', 'trend'] }
  },
  // Media: data-mb-tab top + nested data-mv-tab subsection (separate, captured as own loop)
  {
    file: 'distribution-media.html', tabAttr: 'data-mb-tab',
    tabs: ['overview', 'store', 'creative', 'trend', 'data'],
    nestedTabs: { attr: 'data-mv-tab', values: ['overview', 'store', 'trendovertime'] }
  },
  { file: 'distribution-traffic.html', tabAttr: 'data-ts-tab', tabs: ['overview', 'compare', 'trend', 'data'] },
];

async function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();

  let count = 0;
  for (const p of PAGES) {
    const url = `${BASE}/${p.file}`;
    process.stdout.write(`\n${p.file}\n`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    // give charts a beat to render
    await page.waitForTimeout(1500);

    // Baseline shot
    const baseName = p.file.replace('.html', '');
    const basePath = path.join(OUT, `${baseName}__baseline.png`);
    await page.screenshot({ path: basePath, fullPage: true });
    process.stdout.write(`  ✓ baseline\n`);
    count++;

    if (!p.tabAttr || !p.tabs.length) continue;

    for (const tab of p.tabs) {
      const sel = `[${p.tabAttr}="${tab}"]`;
      try {
        const el = await page.$(sel);
        if (!el) { process.stdout.write(`  ✗ ${tab} (no element)\n`); continue; }
        await el.click();
        await page.waitForTimeout(800);
        const out = path.join(OUT, `${baseName}__${tab}.png`);
        await page.screenshot({ path: out, fullPage: true });
        process.stdout.write(`  ✓ ${tab}\n`);
        count++;
      } catch (e) {
        process.stdout.write(`  ✗ ${tab} — ${e.message}\n`);
      }

      // Engagement sub-tabs within this metric tab
      if (p.subTabs && p.subTabs.parents.includes(tab)) {
        for (const sub of p.subTabs.values) {
          const subSel = `[${p.subTabs.attr}="${sub}"]`;
          try {
            const subEl = await page.$(subSel + ':visible, .perf-tab-pane.active ' + subSel);
            // Fallback: find within the active pane
            const active = await page.$(`.perf-tab-pane[data-ep-pane="${tab}"]`);
            const target = active ? await active.$(subSel) : null;
            if (!target) { process.stdout.write(`    ✗ ${tab}/${sub} (not found)\n`); continue; }
            await target.click();
            await page.waitForTimeout(700);
            const out = path.join(OUT, `${baseName}__${tab}__${sub}.png`);
            await page.screenshot({ path: out, fullPage: true });
            process.stdout.write(`    ✓ ${tab}/${sub}\n`);
            count++;
          } catch (e) {
            process.stdout.write(`    ✗ ${tab}/${sub} — ${e.message}\n`);
          }
        }
      }

      // Visitation By-Store view toggles
      if (p.viewToggles && p.viewToggles.parent === tab) {
        for (const v of p.viewToggles.values) {
          const vSel = `[${p.viewToggles.attr}="${v}"]`;
          try {
            const vEl = await page.$(vSel);
            if (!vEl) { process.stdout.write(`    ✗ ${tab}/view-${v} (not found)\n`); continue; }
            await vEl.click();
            await page.waitForTimeout(800);
            const out = path.join(OUT, `${baseName}__${tab}__view-${v}.png`);
            await page.screenshot({ path: out, fullPage: true });
            process.stdout.write(`    ✓ ${tab}/view-${v}\n`);
            count++;
          } catch (e) {
            process.stdout.write(`    ✗ ${tab}/view-${v} — ${e.message}\n`);
          }
        }
      }
    }

    // Media nested mv-tab subsection (separate from main tabs)
    if (p.nestedTabs) {
      for (const v of p.nestedTabs.values) {
        const sel = `[${p.nestedTabs.attr}="${v}"]`;
        try {
          const el = await page.$(sel);
          if (!el) { process.stdout.write(`  ✗ mv-${v} (not found)\n`); continue; }
          await el.click();
          await page.waitForTimeout(800);
          const out = path.join(OUT, `${baseName}__mv-${v}.png`);
          await page.screenshot({ path: out, fullPage: true });
          process.stdout.write(`  ✓ mv-${v}\n`);
          count++;
        } catch (e) {
          process.stdout.write(`  ✗ mv-${v} — ${e.message}\n`);
        }
      }
    }
  }

  await browser.close();
  console.log(`\nDone. ${count} screenshots in ${OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
