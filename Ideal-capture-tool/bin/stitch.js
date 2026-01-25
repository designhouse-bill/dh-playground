#!/usr/bin/env node

/**
 * Ideal Circular Capture Tool - Stitch Command
 *
 * Usage:
 *   stitch <directory>
 *   stitch ~/Desktop/ideal-circular-captures/my-capture_2026-01-16
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { stitchDirectory } from '../src/stitcher.js';

const program = new Command();

program
  .name('stitch')
  .description('Stitch multiple viewport screenshots into one combined image')
  .version('1.0.0')
  .argument('<directory>', 'Directory containing numbered PNG screenshots')
  .option('-o, --overlap <percent>', 'Overlap percentage (0-1)', '0.15')
  .option('-c, --crop-bottom <px>', 'Pixels to crop from bottom (removes sticky nav)', '0')
  .option('-m, --max-height <px>', 'Max height before splitting into multiple files (0=unlimited)', '40000')
  .action(async (directory, options) => {
    try {
      console.log('\n Ideal Circular Stitch');
      console.log('='.repeat(50));
      console.log(`  Directory: ${directory}`);

      const result = await stitchDirectory(directory, {
        overlapPercent: parseFloat(options.overlap),
        cropBottom: parseInt(options.cropBottom, 10),
        maxHeight: parseInt(options.maxHeight, 10),
      });

      console.log('\n' + '='.repeat(50));
      console.log(' STITCH COMPLETE');
      console.log('='.repeat(50));
      if (result.paths) {
        // Split result
        console.log(`  Files: ${result.paths.length}`);
        result.paths.forEach(p => console.log(`    - ${p}`));
      } else {
        console.log(`  Combined: ${result.path}`);
      }
      console.log(`  Size: ${result.width} x ${result.height}px`);

    } catch (error) {
      console.error(chalk.red('\n ERROR:'), error.message);
      process.exit(1);
    }
  });

program.parse();
