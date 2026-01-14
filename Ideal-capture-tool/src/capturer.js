/**
 * Main Site Capture Class
 */

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { CONFIG } from './config.js';
import { sanitizeTitle, ensureDir, formatBytes, getDateStamp } from './utils.js';
import { applyLazyBypass } from './lazy-bypass.js';

export class SiteCapture {
  constructor(options = {}) {
    this.config = { ...CONFIG, ...options };
    this.browser = null;
    this.page = null;
    this.capturedScreens = [];
    this.pageTitle = '';
    this.outputDir = '';
  }

  /**
   * Main capture method
   */
  async capture(url) {
    const startTime = Date.now();
    const results = {
      url,
      screens: [],
      metadata: {},
    };

    try {
      console.log('\n Ideal Circular Capture');
      console.log('='.repeat(50));
      console.log(`  URL: ${url}`);
      console.log(`  Viewport: ${this.config.viewport.width}x${this.config.viewport.height}`);
      console.log(`  Scale: ${this.config.deviceScaleFactor}x`);

      // Initialize browser
      await this.initBrowser();

      // Apply lazy-load bypass
      await applyLazyBypass(this.page, this.config.mode);

      // Load page
      await this.loadPage(url);

      // Get page title and create output directory with date stamp
      const rawTitle = await this.page.title();
      this.pageTitle = sanitizeTitle(rawTitle);
      const dateStamp = getDateStamp();
      const folderName = `${this.pageTitle}_${dateStamp}`;
      this.outputDir = ensureDir(path.join(this.config.outputDir, folderName));
      console.log(`\n  Output: ${this.outputDir}`);

      // Scroll and capture screens
      results.screens = await this.scrollAndCapture();

      // Save metadata
      const duration = Date.now() - startTime;
      results.metadata = {
        url,
        title: this.pageTitle,
        folder: folderName,
        timestamp: new Date().toISOString(),
        viewport: this.config.viewport,
        scale: this.config.deviceScaleFactor,
        mode: this.config.mode,
        screensCount: results.screens.length,
        durationMs: duration,
      };

      fs.writeFileSync(
        path.join(this.outputDir, 'metadata.json'),
        JSON.stringify(results.metadata, null, 2)
      );

      // Summary
      console.log('\n' + '='.repeat(50));
      console.log(' CAPTURE COMPLETE');
      console.log('='.repeat(50));
      console.log(`  Screens: ${results.screens.length}`);
      console.log(`  Duration: ${(duration / 1000).toFixed(1)}s`);
      console.log(`  Output: ${this.outputDir}`);

    } catch (error) {
      console.error('\n ERROR:', error.message);
      results.error = error.message;
    } finally {
      await this.cleanup();
    }

    return results;
  }

  /**
   * Initialize browser
   */
  async initBrowser() {
    console.log('\n  Launching browser...');

    this.browser = await chromium.launch({
      headless: !this.config.headed,
    });

    const context = await this.browser.newContext({
      viewport: this.config.viewport,
      deviceScaleFactor: this.config.deviceScaleFactor,
      userAgent: this.config.userAgent,
    });

    this.page = await context.newPage();
  }

  /**
   * Load the page
   */
  async loadPage(url) {
    console.log('  Loading page...');

    await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: this.config.navigationTimeout,
    });

    // Wait for JS frameworks to render
    await this.page.waitForTimeout(3000);

    // Try network idle briefly (don't block forever)
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch (e) {
      // Network still busy, that's okay
    }

    console.log('  Page loaded');
  }

  /**
   * Scroll through page and capture each viewport
   */
  async scrollAndCapture() {
    console.log('\n  Scrolling and capturing...');

    const screens = [];
    const { width, height } = this.config.viewport;
    const scrollStep = Math.floor(height * 0.85);

    let currentScroll = 0;
    let screenNum = 0;
    let lastPageHeight = 0;

    while (screenNum < this.config.maxScrolls) {
      // Get current page state
      const pageState = await this.page.evaluate(() => ({
        scrollY: Math.round(window.scrollY),
        pageHeight: document.body.scrollHeight,
        atBottom: window.scrollY + window.innerHeight >= document.body.scrollHeight - 10,
      }));

      // Guard against endless pages
      if (pageState.pageHeight > this.config.maxHeight) {
        console.log(`  Max height reached (${this.config.maxHeight}px)`);
        break;
      }

      // Capture screenshot
      const filename = `${this.pageTitle}_${String(screenNum + 1).padStart(3, '0')}.png`;
      const filepath = path.join(this.outputDir, filename);

      await this.page.screenshot({
        path: filepath,
        timeout: 30000,
      });

      screens.push(filepath);
      this.capturedScreens.push(filepath);

      const fileSize = fs.statSync(filepath).size;
      console.log(`    ${filename} (${formatBytes(fileSize)})`);

      // Check if at bottom
      if (pageState.atBottom) {
        console.log('  Reached bottom');
        break;
      }

      // Scroll down
      currentScroll += scrollStep;
      await this.page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), currentScroll);

      // Wait for lazy content
      await this.page.waitForTimeout(this.config.scrollDelay);

      screenNum++;
      lastPageHeight = pageState.pageHeight;
    }

    return screens;
  }

  /**
   * Cleanup browser
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
