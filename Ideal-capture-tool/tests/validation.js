/**
 * Phase 0: Validation Tests for ideal.sale
 *
 * Run: npm run validate
 *
 * This script tests the target site to understand:
 * 1. Which lazy-load method it uses
 * 2. Whether IO patch is safe
 * 3. Optimal scroll delay
 * 4. Progressive vs jump scroll behavior
 */

import { chromium } from 'playwright';

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  url: 'https://lakemillsmarket.ideal.sale/1182555/browse?useV3=true&developerMode=true&date=202601140500',
  viewport: { width: 414, height: 896 },
  deviceScaleFactor: 2,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
};

// ============================================
// TEST FUNCTIONS
// ============================================

/**
 * Test 1: Comprehensive Image Audit
 */
async function testImageAudit(page) {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: Comprehensive Image Audit');
  console.log('='.repeat(60));

  const results = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    const sources = document.querySelectorAll('picture source');

    // Get unique image URLs
    const allSrcs = new Set();
    imgs.forEach(img => img.src && !img.src.startsWith('data:') && allSrcs.add(img.src));

    return {
      // Element counts
      imgElements: imgs.length,
      pictureElements: document.querySelectorAll('picture').length,
      sourceElements: sources.length,

      // Lazy-load patterns on <img>
      imgDataSrc: document.querySelectorAll('img[data-src]').length,
      imgDataLazy: document.querySelectorAll('img[data-lazy]').length,
      imgLoadingLazy: document.querySelectorAll('img[loading="lazy"]').length,
      imgDataSrcset: document.querySelectorAll('img[data-srcset]').length,
      imgDataOriginal: document.querySelectorAll('img[data-original]').length,

      // Lazy-load patterns on <source>
      sourceDataSrcset: document.querySelectorAll('source[data-srcset]').length,
      sourceSrcset: document.querySelectorAll('source[srcset]').length,

      // Background images
      dataBgElements: document.querySelectorAll('[data-bg], [data-background]').length,
      inlineStyleBg: document.querySelectorAll('[style*="background"]').length,

      // Unique URLs
      uniqueImageUrls: allSrcs.size,

      // Loaded vs broken
      loadedCorrectly: Array.from(imgs).filter(i => i.complete && i.naturalWidth > 0).length,
      brokenImages: Array.from(imgs).filter(i => i.complete && i.naturalWidth === 0 && i.src).length,
      pendingImages: Array.from(imgs).filter(i => !i.complete && i.src).length,
    };
  });

  console.log('\nElement Counts:');
  console.log(`  <img> elements: ${results.imgElements}`);
  console.log(`  <picture> elements: ${results.pictureElements}`);
  console.log(`  <source> elements: ${results.sourceElements}`);

  console.log('\nLazy-Load Patterns on <img>:');
  console.log(`  data-src: ${results.imgDataSrc}`);
  console.log(`  data-lazy: ${results.imgDataLazy}`);
  console.log(`  loading="lazy": ${results.imgLoadingLazy}`);
  console.log(`  data-srcset: ${results.imgDataSrcset}`);
  console.log(`  data-original: ${results.imgDataOriginal}`);

  console.log('\nLazy-Load Patterns on <source>:');
  console.log(`  data-srcset: ${results.sourceDataSrcset}`);
  console.log(`  srcset: ${results.sourceSrcset}`);

  console.log('\nBackground Images:');
  console.log(`  data-bg/data-background: ${results.dataBgElements}`);
  console.log(`  inline style background: ${results.inlineStyleBg}`);

  console.log('\nImage Load Status:');
  console.log(`  Unique URLs: ${results.uniqueImageUrls}`);
  console.log(`  Loaded correctly (complete + naturalWidth > 0): ${results.loadedCorrectly}`);
  console.log(`  Broken (complete but naturalWidth = 0): ${results.brokenImages}`);
  console.log(`  Pending (not complete): ${results.pendingImages}`);

  return results;
}

/**
 * Test 2: CSS Class-Based Lazy Loading
 */
async function testCSSBackgroundImages(page) {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: CSS Class-Based Background Images');
  console.log('='.repeat(60));

  const results = await page.evaluate(() => {
    const elementsWithBg = [];
    document.querySelectorAll('*').forEach(el => {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none' && !el.style.backgroundImage && !el.dataset.bg) {
        elementsWithBg.push({
          tag: el.tagName,
          className: el.className?.toString().slice(0, 50) || '',
          bg: bg.slice(0, 80)
        });
      }
    });
    return {
      count: elementsWithBg.length,
      samples: elementsWithBg.slice(0, 10)
    };
  });

  console.log(`\nCSS class-based background images found: ${results.count}`);
  if (results.samples.length > 0) {
    console.log('\nSamples:');
    results.samples.forEach((s, i) => {
      console.log(`  ${i + 1}. <${s.tag}> class="${s.className}" bg=${s.bg}`);
    });
  }

  return results;
}

/**
 * Test 3: Scroll and measure image loading
 */
async function testScrollBehavior(page) {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: Scroll Behavior & Image Loading');
  console.log('='.repeat(60));

  // Get initial state
  const initialState = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')).filter(i => i.src && !i.src.startsWith('data:'));
    return {
      total: imgs.length,
      loaded: imgs.filter(i => i.complete && i.naturalWidth > 0).length,
      pageHeight: document.body.scrollHeight,
    };
  });

  console.log(`\nInitial state (before scroll):`);
  console.log(`  Images: ${initialState.loaded}/${initialState.total} loaded`);
  console.log(`  Page height: ${initialState.pageHeight}px`);

  // Progressive scroll down (12 steps)
  const SCROLL_STEPS = 12;
  const stepSize = Math.ceil(initialState.pageHeight / SCROLL_STEPS);

  console.log(`\nProgressive scroll (${SCROLL_STEPS} steps, ${stepSize}px each):`);

  for (let i = 1; i <= SCROLL_STEPS; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), stepSize * i);
    await page.waitForTimeout(300);

    const state = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img')).filter(i => i.src && !i.src.startsWith('data:'));
      return {
        loaded: imgs.filter(i => i.complete && i.naturalWidth > 0).length,
        total: imgs.length,
      };
    });

    console.log(`  Step ${i}: ${state.loaded}/${state.total} loaded`);
  }

  // Final state after scroll
  const finalState = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')).filter(i => i.src && !i.src.startsWith('data:'));
    return {
      total: imgs.length,
      loaded: imgs.filter(i => i.complete && i.naturalWidth > 0).length,
      broken: imgs.filter(i => i.complete && i.naturalWidth === 0).length,
      pageHeight: document.body.scrollHeight,
    };
  });

  console.log(`\nFinal state (after scroll):`);
  console.log(`  Images: ${finalState.loaded}/${finalState.total} loaded`);
  console.log(`  Broken: ${finalState.broken}`);
  console.log(`  Page height: ${finalState.pageHeight}px`);

  const improvement = finalState.loaded - initialState.loaded;
  console.log(`\n  Improvement: +${improvement} images loaded by scrolling`);

  return { initial: initialState, final: finalState, improvement };
}

/**
 * Test 4: Page title extraction
 */
async function testTitleExtraction(page) {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: Page Title Extraction');
  console.log('='.repeat(60));

  const title = await page.title();
  console.log(`\nRaw title: "${title}"`);
  console.log(`  Length: ${title.length} characters`);

  // Test sanitization
  const sanitized = title
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);

  console.log(`  Sanitized: "${sanitized}"`);

  return { raw: title, sanitized };
}

/**
 * Test 5: Mutation rate check
 */
async function testMutationRate(page) {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 5: DOM Mutation Rate');
  console.log('='.repeat(60));

  // Inject mutation counter
  await page.evaluate(() => {
    window._mutationCount = 0;
    window._mutationObserver = new MutationObserver(() => {
      window._mutationCount++;
    });
    window._mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  });

  // Wait 3 seconds and count mutations
  console.log('\nMonitoring mutations for 3 seconds...');
  await page.waitForTimeout(3000);

  const mutationCount = await page.evaluate(() => {
    window._mutationObserver.disconnect();
    return window._mutationCount;
  });

  console.log(`  Mutations in 3s: ${mutationCount}`);
  console.log(`  Rate: ${(mutationCount / 3).toFixed(1)} mutations/second`);

  if (mutationCount > 30) {
    console.log('  Status: HIGH - debouncing recommended for MutationObserver');
  } else if (mutationCount > 10) {
    console.log('  Status: MODERATE - debouncing may help');
  } else {
    console.log('  Status: LOW - debouncing optional');
  }

  return { count: mutationCount, rate: mutationCount / 3 };
}

// ============================================
// MAIN
// ============================================
async function runValidation() {
  console.log('='.repeat(60));
  console.log('IDEAL.SALE VALIDATION TESTS');
  console.log('='.repeat(60));
  console.log(`URL: ${CONFIG.url}`);
  console.log(`Viewport: ${CONFIG.viewport.width}x${CONFIG.viewport.height}`);
  console.log(`Scale: ${CONFIG.deviceScaleFactor}x`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: CONFIG.viewport,
    deviceScaleFactor: CONFIG.deviceScaleFactor,
    userAgent: CONFIG.userAgent,
  });
  const page = await context.newPage();

  const results = {
    timestamp: new Date().toISOString(),
    url: CONFIG.url,
    tests: {},
  };

  try {
    console.log('\nLoading page...');
    await page.goto(CONFIG.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000); // Wait for JS frameworks

    // Run tests
    results.tests.imageAudit = await testImageAudit(page);
    results.tests.cssBackgrounds = await testCSSBackgroundImages(page);
    results.tests.scrollBehavior = await testScrollBehavior(page);
    results.tests.titleExtraction = await testTitleExtraction(page);
    results.tests.mutationRate = await testMutationRate(page);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('VALIDATION SUMMARY');
    console.log('='.repeat(60));

    const audit = results.tests.imageAudit;
    console.log('\nLazy-load method detected:');
    if (audit.imgLoadingLazy > 0) console.log('  - Native loading="lazy"');
    if (audit.imgDataSrc > 0) console.log('  - data-src attribute');
    if (audit.imgDataLazy > 0) console.log('  - data-lazy attribute');
    if (audit.imgDataSrcset > 0) console.log('  - data-srcset attribute');
    if (audit.sourceDataSrcset > 0) console.log('  - <source> data-srcset');

    const scroll = results.tests.scrollBehavior;
    console.log(`\nScroll effectiveness:`);
    console.log(`  Before: ${scroll.initial.loaded}/${scroll.initial.total} images`);
    console.log(`  After: ${scroll.final.loaded}/${scroll.final.total} images`);
    console.log(`  Improvement: +${scroll.improvement} images`);

    if (scroll.improvement > 0) {
      console.log('  Recommendation: Progressive scroll IS effective');
    } else {
      console.log('  Recommendation: May need IO patch or aggressive mode');
    }

    console.log('\n' + '='.repeat(60));
    console.log('VALIDATION COMPLETE');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\nERROR:', error.message);
    results.error = error.message;
  } finally {
    await browser.close();
  }

  return results;
}

// Run
runValidation().catch(console.error);
