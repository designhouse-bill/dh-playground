#!/usr/bin/env node

/**
 * Ideal Circular Capture Tool - CLI
 *
 * Usage:
 *   capture <url>
 *   capture <url> --mode io-patch --delay 2000
 *   capture <url> --headed
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { SiteCapture } from '../src/capturer.js';
import { CONFIG, VALID_MODES } from '../src/config.js';
import { resolveOutputPath } from '../src/utils.js';

const program = new Command();

program
  .name('capture')
  .description('Capture full-page screenshots of lazy-loading websites')
  .version('1.0.0')
  .argument('<url>', 'URL to capture')
  .option('-o, --output <dir>', 'Output directory', CONFIG.outputDir)
  .option('-w, --width <px>', 'Viewport width', String(CONFIG.viewport.width))
  .option('-h, --height <px>', 'Viewport height', String(CONFIG.viewport.height))
  .option('-d, --delay <ms>', 'Scroll delay for lazy-load', String(CONFIG.scrollDelay))
  .option('-s, --scale <factor>', 'Device scale factor (1 or 2)', String(CONFIG.deviceScaleFactor))
  .option('--mode <mode>', `Lazy-load mode: ${VALID_MODES.join('|')}`, CONFIG.mode)
  .option('--settle <ms>', 'Final settle cooldown', String(CONFIG.settleCooldown))
  .option('--image-timeout <ms>', 'Max wait for images', String(CONFIG.imageTimeout))
  .option('--max-scrolls <n>', 'Guard against infinite scroll', String(CONFIG.maxScrolls))
  .option('--max-height <px>', 'Guard against endless pages', String(CONFIG.maxHeight))
  .option('--headed', 'Run browser visibly (debugging)', false)
  .option('--stitch', 'Stitch screenshots into one combined image', false)
  .option('--no-stitch', 'Disable stitching (default)')
  .option('--sticky-footer <px>', 'Height of sticky footer to account for during scroll (CSS px)', String(CONFIG.stickyFooter))
  .action(async (url, options) => {
    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      console.error(chalk.red('Error: Invalid URL'));
      process.exit(1);
    }

    // Validate mode
    if (!VALID_MODES.includes(options.mode)) {
      console.error(chalk.red(`Error: Invalid mode "${options.mode}". Must be one of: ${VALID_MODES.join(', ')}`));
      process.exit(1);
    }

    // Build config
    const config = {
      viewport: {
        width: parseInt(options.width, 10),
        height: parseInt(options.height, 10),
      },
      deviceScaleFactor: parseInt(options.scale, 10),
      scrollDelay: parseInt(options.delay, 10),
      settleCooldown: parseInt(options.settle, 10),
      imageTimeout: parseInt(options.imageTimeout, 10),
      maxScrolls: parseInt(options.maxScrolls, 10),
      maxHeight: parseInt(options.maxHeight, 10),
      mode: options.mode,
      outputDir: resolveOutputPath(options.output),
      headed: options.headed,
      stitch: options.stitch,
      stickyFooter: parseInt(options.stickyFooter, 10),
    };

    // Run capture
    const capturer = new SiteCapture(config);
    const results = await capturer.capture(url);

    // Exit code based on success
    if (results.error) {
      process.exit(1);
    }
  });

program.parse();
