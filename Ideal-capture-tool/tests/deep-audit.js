/**
 * Deep Audit: Understand how ideal.sale renders content
 */

import { chromium } from 'playwright';

const CONFIG = {
  url: 'https://lakemillsmarket.ideal.sale/1182555/browse?useV3=true&developerMode=true&date=202601140500',
  viewport: { width: 414, height: 896 },
  deviceScaleFactor: 2,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
};

async function deepAudit() {
  console.log('Deep Audit: How does ideal.sale render content?\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: CONFIG.viewport,
    deviceScaleFactor: CONFIG.deviceScaleFactor,
    userAgent: CONFIG.userAgent,
  });
  const page = await context.newPage();

  await page.goto(CONFIG.url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);

  const audit = await page.evaluate(() => {
    return {
      // Standard images
      imgElements: document.querySelectorAll('img').length,
      imgSrcs: Array.from(document.querySelectorAll('img')).map(i => i.src?.slice(0, 80)),

      // Canvas elements (could be used for rendering)
      canvasElements: document.querySelectorAll('canvas').length,

      // SVG images
      svgElements: document.querySelectorAll('svg').length,
      svgImages: document.querySelectorAll('svg image').length,

      // Background images via computed style (sample first 20 elements with backgrounds)
      backgroundImages: (() => {
        const results = [];
        document.querySelectorAll('*').forEach(el => {
          if (results.length >= 20) return;
          const bg = getComputedStyle(el).backgroundImage;
          if (bg && bg !== 'none') {
            results.push({
              tag: el.tagName,
              class: el.className?.toString().slice(0, 30) || '',
              bg: bg.slice(0, 100)
            });
          }
        });
        return results;
      })(),

      // Video elements
      videoElements: document.querySelectorAll('video').length,

      // iframes
      iframeElements: document.querySelectorAll('iframe').length,

      // Object/embed elements
      objectElements: document.querySelectorAll('object, embed').length,

      // Check for Angular/React indicators
      angularApp: !!document.querySelector('[ng-version], [_ngcontent], [_nghost]'),
      reactApp: !!document.querySelector('[data-reactroot], [data-reactid]'),

      // Check for specific product/item containers
      productContainers: document.querySelectorAll('[class*="product"], [class*="item"], [class*="card"]').length,

      // Total element count
      totalElements: document.querySelectorAll('*').length,

      // Page structure
      pageHeight: document.body.scrollHeight,
      bodyChildren: document.body.children.length,
    };
  });

  console.log('Results:');
  console.log('=========\n');

  console.log('Image Elements:');
  console.log(`  <img>: ${audit.imgElements}`);
  console.log(`  <canvas>: ${audit.canvasElements}`);
  console.log(`  <svg>: ${audit.svgElements}`);
  console.log(`  <svg image>: ${audit.svgImages}`);
  console.log(`  <video>: ${audit.videoElements}`);
  console.log(`  <iframe>: ${audit.iframeElements}`);

  console.log('\nImage sources:');
  audit.imgSrcs.forEach((src, i) => console.log(`  ${i + 1}. ${src}`));

  console.log('\nBackground images found:', audit.backgroundImages.length);
  audit.backgroundImages.slice(0, 10).forEach((bg, i) => {
    console.log(`  ${i + 1}. <${bg.tag}> .${bg.class} -> ${bg.bg}`);
  });

  console.log('\nFramework Detection:');
  console.log(`  Angular: ${audit.angularApp}`);
  console.log(`  React: ${audit.reactApp}`);

  console.log('\nPage Structure:');
  console.log(`  Total elements: ${audit.totalElements}`);
  console.log(`  Product containers: ${audit.productContainers}`);
  console.log(`  Page height: ${audit.pageHeight}px`);

  await browser.close();
}

deepAudit().catch(console.error);
