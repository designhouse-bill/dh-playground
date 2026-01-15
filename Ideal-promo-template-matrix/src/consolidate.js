/**
 * Consolidate all store JSON files into one master file for analysis
 * Run after batch processing: node src/consolidate.js
 */
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const OUTPUT_DIR = '/Users/billklingensmith/Desktop/ideal-circular-captures/output';

async function consolidate() {
  console.log('Consolidating JSON files from:', OUTPUT_DIR);

  // Find all JSON files (excluding any existing master file)
  const jsonFiles = await glob(`${OUTPUT_DIR}/*.json`);
  const storeFiles = jsonFiles.filter((f) => !f.includes('_MASTER_'));

  console.log(`Found ${storeFiles.length} store JSON files\n`);

  const allPromotions = [];
  const storeStats = [];
  let totalImages = 0;

  for (const file of storeFiles) {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    const storeName = data.storeName || path.basename(file, '.json');

    // Extract all promotions with store context
    if (data.results) {
      data.results.forEach((imageResult) => {
        imageResult.promotions?.forEach((promo) => {
          allPromotions.push({
            storeName,
            sourceFile: imageResult.sourceFile,
            ...promo,
          });
        });
      });
    }

    // Track store stats
    storeStats.push({
      storeName,
      imagesAnalyzed: data.imagesAnalyzed || 0,
      totalPromotions: data.summary?.totalComplete || 0,
      categoryHeaders: data.summary?.totalCategoryHeaders || 0,
    });

    totalImages += data.imagesAnalyzed || 0;
  }

  // Aggregate statistics by grid size and template type
  const gridSizeStats = {};
  const templateTypeStats = {};
  const cxCyByGridSize = {};

  allPromotions.forEach((promo) => {
    // Grid size distribution
    const grid = promo.gridSize || 'unknown';
    gridSizeStats[grid] = (gridSizeStats[grid] || 0) + 1;

    // Template type distribution
    const type = promo.templateType || 'unknown';
    templateTypeStats[type] = (templateTypeStats[type] || 0) + 1;

    // Collect cx/cy values by grid size for normalization analysis
    if (promo.products?.['1']) {
      if (!cxCyByGridSize[grid]) {
        cxCyByGridSize[grid] = [];
      }
      cxCyByGridSize[grid].push({
        cx: promo.products['1'].cx,
        cy: promo.products['1'].cy,
        desc: promo.products['1'].description,
      });
    }
  });

  // Calculate cx/cy averages by grid size
  const cxCyAverages = {};
  for (const [grid, values] of Object.entries(cxCyByGridSize)) {
    const cxValues = values.map((v) => v.cx).filter((v) => v != null);
    const cyValues = values.map((v) => v.cy).filter((v) => v != null);
    cxCyAverages[grid] = {
      count: values.length,
      avgCx: cxValues.length ? Math.round(cxValues.reduce((a, b) => a + b, 0) / cxValues.length) : null,
      avgCy: cyValues.length ? Math.round(cyValues.reduce((a, b) => a + b, 0) / cyValues.length) : null,
      minCx: cxValues.length ? Math.min(...cxValues) : null,
      maxCx: cxValues.length ? Math.max(...cxValues) : null,
      minCy: cyValues.length ? Math.min(...cyValues) : null,
      maxCy: cyValues.length ? Math.max(...cyValues) : null,
    };
  }

  // Create master output
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const masterOutput = {
    consolidatedAt: new Date().toISOString(),
    summary: {
      totalStores: storeFiles.length,
      totalImages,
      totalPromotions: allPromotions.length,
    },
    gridSizeDistribution: gridSizeStats,
    templateTypeDistribution: templateTypeStats,
    positionAnalysis: cxCyAverages,
    storeStats,
    promotions: allPromotions,
  };

  // Save master JSON
  const masterPath = path.join(OUTPUT_DIR, `_MASTER_${timestamp}.json`);
  fs.writeFileSync(masterPath, JSON.stringify(masterOutput, null, 2));
  console.log(`📊 Master JSON saved to: ${masterPath}`);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('CONSOLIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total stores: ${storeFiles.length}`);
  console.log(`Total images: ${totalImages}`);
  console.log(`Total promotions: ${allPromotions.length}`);
  console.log('\nGrid Size Distribution:');
  Object.entries(gridSizeStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([grid, count]) => {
      const pct = ((count / allPromotions.length) * 100).toFixed(1);
      console.log(`  ${grid}: ${count} (${pct}%)`);
    });
  console.log('\nTemplate Type Distribution:');
  Object.entries(templateTypeStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const pct = ((count / allPromotions.length) * 100).toFixed(1);
      console.log(`  ${type}: ${count} (${pct}%)`);
    });
  console.log('\nProduct Position Averages by Grid Size:');
  Object.entries(cxCyAverages).forEach(([grid, stats]) => {
    console.log(`  ${grid}: avgCx=${stats.avgCx}, avgCy=${stats.avgCy} (n=${stats.count})`);
  });
}

consolidate().catch(console.error);
