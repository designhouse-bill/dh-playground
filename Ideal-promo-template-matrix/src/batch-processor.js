import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import PQueue from 'p-queue';
import { analyzeImage, computeImageHash } from './analyze-single.js';

// Configuration
const CONFIG = {
  // Rate limiting: 3 concurrent requests with higher throughput
  // Anthropic rate limits: ~50 req/min for most tiers
  // With 3 concurrent and intervalCap 2, we get ~6 req/sec burst, ~40 req/min sustained
  concurrency: 3,
  intervalMs: 1000,
  intervalCap: 2, // 2 new requests per interval (better utilization)

  // Supported image extensions (as brace pattern for single glob pass)
  extensionPattern: '*.{jpg,jpeg,png,gif,webp}',

  // Directories to exclude from scanning
  excludeDirs: ['node_modules', '_template-matrix-output', '.git', 'dist', 'build', 'output'],

  // Batched save interval (save progress every N images instead of per-image)
  saveInterval: 5,

  // Output directory - fixed location for all runs
  outputDir: '/Users/billklingensmith/Desktop/ideal-circular-captures/output',

  // Output filenames
  resultsFileName: 'matrix.json',
  promotionsFileName: 'all-promotions.json',
  progressFileName: 'progress.json',
};

/**
 * Get output directory path (fixed location)
 */
function getOutputDir() {
  return CONFIG.outputDir;
}

/**
 * Get timestamp string for filenames
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
}

/**
 * Get output file paths
 * @param {string} weekLabel - Label for the week (derived from source folder name)
 * @param {boolean} includeTimestamp - Include timestamp in filename
 */
function getOutputPaths(weekLabel = '', includeTimestamp = false) {
  const outputDir = getOutputDir();
  const timestamp = includeTimestamp ? `_${getTimestamp()}` : '';
  const prefix = weekLabel ? `${weekLabel}_` : '';
  return {
    outputDir,
    resultsFile: path.join(outputDir, `${prefix}matrix${timestamp}.json`),
    promotionsFile: path.join(outputDir, `${prefix}all-promotions${timestamp}.json`),
    progressFile: path.join(outputDir, `${prefix}progress.json`),
  };
}

/**
 * Load progress from previous run (for resume capability)
 */
function loadProgress(weekLabel) {
  const { progressFile } = getOutputPaths(weekLabel);
  try {
    if (fs.existsSync(progressFile)) {
      const progress = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
      // Ensure arrays exist for backwards compatibility
      if (!progress.failed) progress.failed = [];
      if (!progress.processedHashes) progress.processedHashes = {};
      if (!progress.failureStats) progress.failureStats = {};
      return progress;
    }
  } catch (e) {
    console.warn('Could not load progress file, starting fresh');
  }
  return {
    processed: [],
    failed: [],
    processedHashes: {},  // hash -> { file, result } for cache lookup
    failureStats: {},     // reason -> count for tracking
    screenshots: [],
    allPromotions: [],
  };
}

/**
 * Save progress for resume capability
 */
function saveProgress(progress, weekLabel) {
  const { outputDir, progressFile } = getOutputPaths(weekLabel);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
}

/**
 * Find all images in a directory (recursively)
 * Uses single brace glob pattern for efficiency
 */
async function findImages(sourceDir) {
  // Single glob pass with brace expansion - more efficient than multiple passes
  const pattern = `${sourceDir}/**/${CONFIG.extensionPattern}`;

  // Build ignore patterns for excluded directories
  const ignorePatterns = CONFIG.excludeDirs.map((dir) => `**/${dir}/**`);

  const files = await glob(pattern, {
    nocase: true,
    ignore: ignorePatterns,
  });

  // Sort for consistent ordering
  return files.sort();
}

/**
 * Extract folder name from full path relative to source
 */
function getFolderName(filePath, sourceDir) {
  const relativePath = path.relative(sourceDir, filePath);
  const parts = relativePath.split(path.sep);
  return parts.length > 1 ? parts[0] : 'root';
}

/**
 * Process all images in source directory
 */
async function processDirectory(sourceDir) {
  // Extract week label from source folder name (e.g., "circulars-week-2026-01-14" -> "week-2026-01-14")
  const sourceFolderName = path.basename(sourceDir);
  const weekMatch = sourceFolderName.match(/week-\d{4}-\d{2}-\d{2}/);
  const weekLabel = weekMatch ? weekMatch[0] : sourceFolderName;

  const outputPaths = getOutputPaths(weekLabel);

  console.log('='.repeat(60));
  console.log('Hero Template Matrix - Batch Processor');
  console.log('='.repeat(60));
  console.log(`Source: ${sourceDir}`);
  console.log(`Week: ${weekLabel}`);
  console.log(`Output: ${outputPaths.outputDir}`);
  console.log(`Concurrency: ${CONFIG.concurrency} parallel requests`);
  console.log(`Rate limit: ${CONFIG.intervalCap} new request per ${CONFIG.intervalMs}ms`);
  console.log(`Save interval: every ${CONFIG.saveInterval} images`);
  console.log('');

  // Find all images (exclusions handled in glob)
  const allImages = await findImages(sourceDir);
  console.log(`Found ${allImages.length} screenshots total`);

  // Load progress
  const progress = loadProgress(weekLabel);
  const alreadyProcessed = new Set(progress.processed);
  const previouslyFailed = new Set(progress.failed);

  // Check for hash-based cache hits (same image content, different path)
  console.log('Checking image hashes for duplicates...');
  const hashCache = progress.processedHashes || {};
  let cacheHits = 0;
  let cacheReusedPromotions = 0;

  // Filter images: skip processed, retry failed, check hash cache
  const imagesToProcess = [];

  for (const img of allImages) {
    if (alreadyProcessed.has(img) && !previouslyFailed.has(img)) {
      continue; // Already successfully processed
    }

    // Check hash cache for duplicate content
    try {
      const hash = computeImageHash(img);
      const cached = hashCache[hash];
      if (cached && !previouslyFailed.has(img)) {
        cacheHits++;

        // Reuse cached result with updated file path
        const folder = getFolderName(img, sourceDir);
        const filename = path.basename(img);

        // Create a result entry for this duplicate
        const reusedResult = {
          sourceFile: filename,
          folder,
          imageHash: hash,
          promotions: [], // Don't duplicate promotions in allPromotions
          cachedFrom: cached.file,
          totalPromotionsFound: cached.promotionCount || 0,
          screenshotNotes: `Duplicate of ${cached.file} (hash: ${hash})`,
        };

        progress.processed.push(img);
        progress.screenshots.push(reusedResult);
        cacheReusedPromotions += cached.promotionCount || 0;

        console.log(`  [cache] ${filename} → duplicate of ${path.basename(cached.file)} (${cached.promotionCount} promos)`);
        continue;
      }
    } catch (e) {
      // If hash fails, process the image normally
    }

    imagesToProcess.push(img);
  }

  const retryCount = imagesToProcess.filter((img) => previouslyFailed.has(img)).length;

  console.log(`Already processed: ${alreadyProcessed.size}`);
  console.log(`Skipped (duplicate hash): ${cacheHits} (representing ${cacheReusedPromotions} promotions)`);
  console.log(`Previously failed (retrying): ${retryCount}`);
  console.log(`New images to process: ${imagesToProcess.length - retryCount}`);
  console.log(`Total to process: ${imagesToProcess.length}`);

  if (imagesToProcess.length === 0) {
    console.log('\nAll screenshots already processed!');
    console.log(`Total promotions extracted: ${progress.allPromotions.length}`);
    console.log(`Results: ${outputPaths.promotionsFile}`);
    return { progress, sourceDir };
  }

  // Estimate time with concurrency factored in
  const effectiveTimePerImage = CONFIG.intervalMs / CONFIG.concurrency;
  const estimatedMinutes = (imagesToProcess.length * effectiveTimePerImage) / 1000 / 60;
  const estimatedCost = imagesToProcess.length * 0.004; // ~$0.004 per screenshot with retries
  console.log(`\nEstimated time: ${estimatedMinutes.toFixed(1)} minutes`);
  console.log(`Estimated cost: $${estimatedCost.toFixed(2)}`);
  console.log('');

  // Create rate-limited queue with higher concurrency
  const queue = new PQueue({
    concurrency: CONFIG.concurrency,
    interval: CONFIG.intervalMs,
    intervalCap: CONFIG.intervalCap,
  });

  let completed = 0;
  let pendingSaves = 0;
  const total = imagesToProcess.length;

  // Process each image
  const processingPromises = imagesToProcess.map((imagePath) =>
    queue.add(async () => {
      const folder = getFolderName(imagePath, sourceDir);
      const currentNum = ++completed;

      try {
        console.log(`[${currentNum}/${total}] Processing: ${path.basename(imagePath)} (${folder})`);

        const result = await analyzeImage(imagePath, folder);

        // Check if analysis failed (has error)
        if (result.error) {
          // Track failure reasons
          const reasons = result.failureReasons || ['unknown'];
          reasons.forEach((reason) => {
            progress.failureStats[reason] = (progress.failureStats[reason] || 0) + 1;
          });

          // Track as failed for retry
          if (!progress.failed.includes(imagePath)) {
            progress.failed.push(imagePath);
          }

          pendingSaves++;
          console.log(`    ✗ Failed: ${result.error}`);

          if (pendingSaves >= CONFIG.saveInterval) {
            saveProgress(progress, weekLabel);
            pendingSaves = 0;
          }

          return null;
        }

        // Success - update progress
        progress.processed.push(imagePath);
        progress.screenshots.push(result);

        // Cache by hash for future duplicate detection
        if (result.imageHash) {
          progress.processedHashes[result.imageHash] = {
            file: imagePath,
            promotionCount: result.totalPromotionsFound,
          };
        }

        // Remove from failed list if it was a retry
        if (previouslyFailed.has(imagePath)) {
          progress.failed = progress.failed.filter((f) => f !== imagePath);
        }

        // Flatten promotions into single array (complete promos)
        if (result.promotions && result.promotions.length > 0) {
          progress.allPromotions.push(...result.promotions);
        }

        // Also track cropped promos for continuity across screenshots
        if (!progress.croppedPromotions) progress.croppedPromotions = [];
        if (result.croppedTop && result.croppedTop.length > 0) {
          progress.croppedPromotions.push(...result.croppedTop.map((p) => ({ ...p, cropType: 'top' })));
        }
        if (result.croppedBottom && result.croppedBottom.length > 0) {
          progress.croppedPromotions.push(...result.croppedBottom.map((p) => ({ ...p, cropType: 'bottom' })));
        }

        pendingSaves++;
        const pct = ((currentNum / total) * 100).toFixed(1);
        const retryNote = result.retryAttempts > 0 ? ` (${result.retryAttempts} retries)` : '';
        const croppedNote = result.totalCropped > 0 ? ` +${result.totalCropped} cropped` : '';
        console.log(
          `    ✓ Found ${result.totalPromotionsFound} promotions${croppedNote}${retryNote} (${pct}% complete, ${progress.allPromotions.length} total)`
        );

        // Batched save: only save every N images to reduce I/O
        if (pendingSaves >= CONFIG.saveInterval) {
          saveProgress(progress, weekLabel);
          pendingSaves = 0;
        }

        return result;
      } catch (error) {
        console.error(`    ✗ Error: ${error.message}`);

        // Track failure
        progress.failureStats['unhandled_error'] = (progress.failureStats['unhandled_error'] || 0) + 1;
        if (!progress.failed.includes(imagePath)) {
          progress.failed.push(imagePath);
        }

        pendingSaves++;
        if (pendingSaves >= CONFIG.saveInterval) {
          saveProgress(progress, weekLabel);
          pendingSaves = 0;
        }

        return null;
      }
    })
  );

  await Promise.all(processingPromises);

  // Final save to capture any pending changes
  saveProgress(progress, weekLabel);

  // Save final results with timestamp
  const finalPaths = getOutputPaths(weekLabel, true); // true = include timestamp
  fs.writeFileSync(finalPaths.resultsFile, JSON.stringify(progress.screenshots, null, 2));
  fs.writeFileSync(finalPaths.promotionsFile, JSON.stringify(progress.allPromotions, null, 2));

  // Save cropped promotions for continuity analysis
  const croppedCount = progress.croppedPromotions?.length || 0;
  if (croppedCount > 0) {
    const croppedFile = finalPaths.promotionsFile.replace('all-promotions', 'cropped-promotions');
    fs.writeFileSync(croppedFile, JSON.stringify(progress.croppedPromotions, null, 2));
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Processing complete!');
  console.log(`Screenshots processed: ${progress.screenshots.length}`);
  console.log(`Complete promotions: ${progress.allPromotions.length}`);
  if (croppedCount > 0) {
    console.log(`Cropped promotions (for continuity): ${croppedCount}`);
  }
  if (progress.failed.length > 0) {
    console.log(`Failed (will retry on next run): ${progress.failed.length}`);
  }
  if (Object.keys(progress.failureStats).length > 0) {
    console.log('Failure breakdown:');
    for (const [reason, count] of Object.entries(progress.failureStats)) {
      console.log(`  - ${reason}: ${count}`);
    }
  }
  console.log('');
  console.log(`Output folder: ${outputPaths.outputDir}`);
  console.log(`Screenshots data: ${path.basename(finalPaths.resultsFile)}`);
  console.log(`All promotions: ${path.basename(finalPaths.promotionsFile)}`);
  if (croppedCount > 0) {
    console.log(`Cropped promotions: cropped-promotions-*.json`);
  }
  console.log('='.repeat(60));

  return { progress, sourceDir, outputPaths: finalPaths };
}

/**
 * CLI entry point
 */
async function main() {
  const sourceDir = process.argv[2];

  if (!sourceDir) {
    console.log('Hero Template Matrix - Batch Processor');
    console.log('');
    console.log('Usage: node src/batch-processor.js <source-directory>');
    console.log('');
    console.log('Example:');
    console.log('  node src/batch-processor.js ~/Desktop/ideal-circular-captures');
    console.log('');
    console.log('Options:');
    console.log('  --reset  Clear progress and start fresh');
    process.exit(1);
  }

  // Resolve ~ in paths
  const resolvedDir = sourceDir.replace(/^~/, process.env.HOME);

  if (!fs.existsSync(resolvedDir)) {
    console.error(`Directory not found: ${resolvedDir}`);
    process.exit(1);
  }

  // Handle reset flag
  if (process.argv.includes('--reset')) {
    const sourceFolderName = path.basename(resolvedDir);
    const weekMatch = sourceFolderName.match(/week-\d{4}-\d{2}-\d{2}/);
    const weekLabel = weekMatch ? weekMatch[0] : sourceFolderName;
    const paths = getOutputPaths(weekLabel);
    console.log('Resetting progress...');
    if (fs.existsSync(paths.progressFile)) {
      fs.unlinkSync(paths.progressFile);
    }
    console.log('Progress cleared. Previous exports preserved.');
  }

  await processDirectory(resolvedDir);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
