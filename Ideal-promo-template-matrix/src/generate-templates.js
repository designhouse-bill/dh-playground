/**
 * generate-templates.js
 * Phase 3-6: Clustering, Fallback Generation, and Template Output
 *
 * Analyzes position patterns and generates the 45 base templates
 */

import fs from 'fs';
import path from 'path';

// Configuration
const INPUT_DIR = '/Users/billklingensmith/Desktop/ideal-circular-captures/template-analysis';
const OUTPUT_DIR = INPUT_DIR;

const VALID_GRID_SIZES = ['1x1', '1x2', '1x3', '2x1', '2x2', '2x3', '3x1', '3x2', '3x3'];

// Layout vocabulary for naming
const LAYOUT_NAMES = {
  1: {
    centered: 'hero',
    left: 'hero-left',
    right: 'hero-right'
  },
  2: {
    horizontal: 'row',
    vertical: 'stacked',
    diagonal: 'diagonal'
  },
  3: {
    horizontal: 'row',
    pyramid: 'pyramid',
    heroSide: 'hero-side',
    cascade: 'cascade'
  },
  4: {
    grid: 'grid',
    row: 'row',
    heroGrid: 'hero-grid'
  },
  5: {
    heroGrid: 'hero-grid',
    spread: 'spread'
  }
};

// Fallback layouts for when no data exists
const FALLBACK_LAYOUTS = {
  1: {
    layoutPattern: 'hero',
    products: {
      '1': { cx: 50, cy: 50, width: 60, height: 70, scale: 1, rotation: 0, zIndex: 1 }
    }
  },
  2: {
    layoutPattern: 'row',
    products: {
      '1': { cx: 30, cy: 50, width: 35, height: 60, scale: 1, rotation: 0, zIndex: 1 },
      '2': { cx: 70, cy: 50, width: 35, height: 60, scale: 1, rotation: 0, zIndex: 1 }
    }
  },
  3: {
    layoutPattern: 'hero-side',
    products: {
      '1': { cx: 30, cy: 50, width: 40, height: 65, scale: 1.1, rotation: 0, zIndex: 2 },
      '2': { cx: 65, cy: 35, width: 25, height: 45, scale: 0.9, rotation: 0, zIndex: 1 },
      '3': { cx: 65, cy: 65, width: 25, height: 45, scale: 0.9, rotation: 0, zIndex: 1 }
    }
  },
  4: {
    layoutPattern: 'grid',
    products: {
      '1': { cx: 30, cy: 35, width: 30, height: 45, scale: 1, rotation: 0, zIndex: 1 },
      '2': { cx: 70, cy: 35, width: 30, height: 45, scale: 1, rotation: 0, zIndex: 1 },
      '3': { cx: 30, cy: 65, width: 30, height: 45, scale: 1, rotation: 0, zIndex: 1 },
      '4': { cx: 70, cy: 65, width: 30, height: 45, scale: 1, rotation: 0, zIndex: 1 }
    }
  },
  5: {
    layoutPattern: 'hero-grid',
    products: {
      '1': { cx: 30, cy: 50, width: 35, height: 60, scale: 1.1, rotation: 0, zIndex: 2 },
      '2': { cx: 62, cy: 25, width: 22, height: 35, scale: 0.85, rotation: 0, zIndex: 1 },
      '3': { cx: 85, cy: 25, width: 22, height: 35, scale: 0.85, rotation: 0, zIndex: 1 },
      '4': { cx: 62, cy: 60, width: 22, height: 35, scale: 0.85, rotation: 0, zIndex: 1 },
      '5': { cx: 85, cy: 60, width: 22, height: 35, scale: 0.85, rotation: 0, zIndex: 1 }
    }
  }
};

// Calculate mean position from instances
function calculateMeanPositions(instances) {
  if (instances.length === 0) return null;

  const productCount = instances[0].productCount;
  const sums = {};
  const counts = {};

  // Initialize
  for (let i = 1; i <= productCount; i++) {
    sums[i] = { cx: 0, cy: 0, width: 0, height: 0, scale: 0, rotation: 0, zIndex: 0 };
    counts[i] = 0;
  }

  // Accumulate
  instances.forEach(instance => {
    // Sort products by cx for consistent ordering
    const sortedProducts = Object.entries(instance.products)
      .map(([key, val]) => ({ key, ...val }))
      .sort((a, b) => a.cx - b.cx);

    sortedProducts.forEach((product, idx) => {
      const slotIdx = idx + 1;
      if (sums[slotIdx]) {
        sums[slotIdx].cx += product.cx || 0;
        sums[slotIdx].cy += product.cy || 0;
        sums[slotIdx].width += product.width || 30;
        sums[slotIdx].height += product.height || 50;
        sums[slotIdx].scale += product.scale || 1;
        sums[slotIdx].rotation += product.rotation || 0;
        sums[slotIdx].zIndex += product.zIndex || 1;
        counts[slotIdx]++;
      }
    });
  });

  // Calculate means
  const meanProducts = {};
  for (let i = 1; i <= productCount; i++) {
    if (counts[i] > 0) {
      meanProducts[String(i)] = {
        cx: Math.round(sums[i].cx / counts[i]),
        cy: Math.round(sums[i].cy / counts[i]),
        width: Math.round(sums[i].width / counts[i]),
        height: Math.round(sums[i].height / counts[i]),
        scale: Math.round((sums[i].scale / counts[i]) * 100) / 100,
        rotation: Math.round(sums[i].rotation / counts[i]),
        zIndex: Math.round(sums[i].zIndex / counts[i])
      };
    }
  }

  return meanProducts;
}

// Determine layout pattern name based on positions
function determineLayoutPattern(products, productCount) {
  const positions = Object.values(products);

  if (productCount === 1) {
    const p = positions[0];
    if (p.cx < 40) return 'hero-left';
    if (p.cx > 60) return 'hero-right';
    return 'hero';
  }

  if (productCount === 2) {
    const [p1, p2] = positions.sort((a, b) => a.cx - b.cx);
    const horizontalSpread = Math.abs(p1.cx - p2.cx);
    const verticalSpread = Math.abs(p1.cy - p2.cy);

    if (horizontalSpread > verticalSpread * 1.5) return 'row';
    if (verticalSpread > horizontalSpread * 1.5) return 'stacked';
    return 'diagonal';
  }

  if (productCount === 3) {
    const sorted = positions.sort((a, b) => a.cx - b.cx);
    const horizontalSpread = sorted[2].cx - sorted[0].cx;

    // Check if one product is notably larger
    const scales = positions.map(p => p.scale || 1);
    const maxScale = Math.max(...scales);
    const hasHero = maxScale > 1.05;

    if (hasHero) return 'hero-side';
    if (horizontalSpread > 50) return 'row';
    return 'cascade';
  }

  if (productCount === 4) {
    // Check if arranged in 2x2 grid
    const sorted = positions.sort((a, b) => a.cx - b.cx);
    const leftTwo = sorted.slice(0, 2);
    const rightTwo = sorted.slice(2, 4);

    const leftXSpread = Math.abs(leftTwo[0].cx - leftTwo[1].cx);
    const rightXSpread = Math.abs(rightTwo[0].cx - rightTwo[1].cx);

    if (leftXSpread < 20 && rightXSpread < 20) return 'grid';
    return 'row';
  }

  if (productCount === 5) {
    const scales = positions.map(p => p.scale || 1);
    const maxScale = Math.max(...scales);
    if (maxScale > 1.05) return 'hero-grid';
    return 'spread';
  }

  return 'custom';
}

// Calculate shape profile from instances
function calculateShapeProfile(instances) {
  const shapes = { tall: 0, square: 0, wide: 0, unknown: 0 };
  const shapePatterns = { 'all-tall': 0, 'all-square': 0, 'all-wide': 0, 'mixed': 0 };

  instances.forEach(instance => {
    let instanceShapes = { tall: 0, square: 0, wide: 0, unknown: 0 };

    Object.values(instance.products).forEach(product => {
      const shape = (product.shape || 'unknown').toLowerCase();
      shapes[shape] = (shapes[shape] || 0) + 1;
      instanceShapes[shape] = (instanceShapes[shape] || 0) + 1;
    });

    const totalProducts = instance.productCount;
    if (instanceShapes.tall === totalProducts) shapePatterns['all-tall']++;
    else if (instanceShapes.square === totalProducts) shapePatterns['all-square']++;
    else if (instanceShapes.wide === totalProducts) shapePatterns['all-wide']++;
    else shapePatterns['mixed']++;
  });

  // Find dominant
  let dominant = 'mixed';
  let maxCount = 0;
  for (const [shape, count] of Object.entries(shapes)) {
    if (count > maxCount) {
      maxCount = count;
      dominant = shape;
    }
  }

  return {
    dominant,
    distribution: shapes,
    instancesByShape: shapePatterns
  };
}

// Generate template for a specific gridSize + productCount
function generateTemplate(gridSize, productCount, instances) {
  const instanceCount = instances.length;

  // Determine source type
  let source, confidence;
  if (instanceCount >= 10) {
    source = 'derived';
    confidence = 'high';
  } else if (instanceCount >= 1) {
    source = 'derived-low-sample';
    confidence = 'low';
  } else {
    source = 'fallback-generated';
    confidence = 'fallback';
  }

  // Get products (mean from data or fallback)
  let products;
  let layoutPattern;

  if (instanceCount > 0) {
    products = calculateMeanPositions(instances);
    layoutPattern = determineLayoutPattern(products, productCount);
  } else {
    const fallback = FALLBACK_LAYOUTS[productCount];
    products = JSON.parse(JSON.stringify(fallback.products));
    layoutPattern = fallback.layoutPattern;
  }

  // Parse grid dimensions
  const [cols, rows] = gridSize.split('x').map(Number);

  // Generate template ID
  const templateId = `size-${gridSize}_${productCount}img_${layoutPattern}`;
  const displayName = `${gridSize} - ${productCount} Product ${layoutPattern.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;

  // Calculate shape profile
  const shapeProfile = instanceCount > 0
    ? calculateShapeProfile(instances)
    : { dominant: 'unknown', distribution: {}, instancesByShape: {} };

  // Calculate frequency (within this gridSize)
  const frequency = instanceCount > 0 ? 1.0 : 0; // Since we're taking mean, it's 100% of this group

  return {
    id: templateId,
    displayName,
    gridSize,
    gridColumns: cols,
    gridRows: rows,
    productCount,
    layoutPattern,
    source,
    products,
    shapeProfile: {
      dominant: shapeProfile.dominant,
      distribution: shapeProfile.distribution
    },
    shapePatterns: {
      note: 'Raw shape data preserved for v1.1 analysis',
      instancesByShape: shapeProfile.instancesByShape
    },
    stats: {
      instances: instanceCount,
      frequency,
      confidence,
    },
    mirrorVariant: layoutPattern.includes('left') ? templateId.replace('left', 'right') :
      layoutPattern.includes('right') ? templateId.replace('right', 'left') : null
  };
}

// Main execution
function main() {
  console.log('=== Template Generation ===\n');

  // Load cleaned data
  console.log('Loading cleaned data...');
  const cleanedData = JSON.parse(fs.readFileSync(path.join(INPUT_DIR, 'cleaned-data.json'), 'utf8'));
  console.log(`Loaded ${cleanedData.length} cleaned promotions\n`);

  // Group by gridSize + productCount
  const groups = {};
  VALID_GRID_SIZES.forEach(gridSize => {
    for (let pc = 1; pc <= 5; pc++) {
      groups[`${gridSize}_${pc}`] = [];
    }
  });

  cleanedData.forEach(promo => {
    const key = `${promo.gridSize}_${promo.productCount}`;
    if (groups[key]) {
      groups[key].push(promo);
    }
  });

  // Generate templates
  console.log('Generating templates...\n');
  const templates = [];
  const stats = { derived: 0, 'derived-low-sample': 0, 'fallback-generated': 0 };

  VALID_GRID_SIZES.forEach(gridSize => {
    for (let pc = 1; pc <= 5; pc++) {
      const key = `${gridSize}_${pc}`;
      const instances = groups[key];
      const template = generateTemplate(gridSize, pc, instances);
      templates.push(template);
      stats[template.source]++;

      const indicator = template.source === 'derived' ? '✓' :
        template.source === 'derived-low-sample' ? '○' : '×';
      console.log(`  ${indicator} ${template.id} (${instances.length} instances)`);
    }
  });

  // Calculate coverage
  const totalInstances = cleanedData.length;
  let coveredInstances = 0;
  templates.forEach(t => {
    if (t.source !== 'fallback-generated') {
      coveredInstances += t.stats.instances;
    }
  });

  // Build output
  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0',
      totalTemplates: templates.length,
      sources: stats,
      coverage: {
        totalPromotions: totalInstances,
        coveredByDerivedTemplates: coveredInstances,
        coveragePercent: ((coveredInstances / totalInstances) * 100).toFixed(1) + '%'
      }
    },
    templates
  };

  // Summary
  console.log('\n=== Generation Summary ===');
  console.log(`Total templates: ${templates.length}`);
  console.log(`  Derived (≥10 instances): ${stats.derived}`);
  console.log(`  Low-sample (1-9 instances): ${stats['derived-low-sample']}`);
  console.log(`  Fallback (0 instances): ${stats['fallback-generated']}`);
  console.log(`\nData coverage: ${output.metadata.coverage.coveragePercent}`);

  // Save output
  const outputPath = path.join(OUTPUT_DIR, 'base-defaults.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nSaved: ${outputPath}`);

  console.log('\n=== Template Generation Complete ===');

  return output;
}

// Export
export { main, generateTemplate, FALLBACK_LAYOUTS };

// Run if called directly
if (process.argv[1]?.includes('generate-templates.js')) {
  main();
}
