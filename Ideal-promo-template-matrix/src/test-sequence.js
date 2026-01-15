/**
 * Test script to analyze a sequence of images and track cross-image continuity
 */
import fs from 'fs';
import path from 'path';
import { analyzeImage } from './analyze-single.js';

const IMAGES = [
  '/Users/billklingensmith/Desktop/ideal-circular-captures/Lunds & Byerlys 50th Street Edina Local Ad_2026-01-14/Lunds & Byerlys 50th Street Edina Local Ad_003.png',
  '/Users/billklingensmith/Desktop/ideal-circular-captures/Lunds & Byerlys 50th Street Edina Local Ad_2026-01-14/Lunds & Byerlys 50th Street Edina Local Ad_004.png',
  '/Users/billklingensmith/Desktop/ideal-circular-captures/Lunds & Byerlys 50th Street Edina Local Ad_2026-01-14/Lunds & Byerlys 50th Street Edina Local Ad_005.png',
  '/Users/billklingensmith/Desktop/ideal-circular-captures/Lunds & Byerlys 50th Street Edina Local Ad_2026-01-14/Lunds & Byerlys 50th Street Edina Local Ad_006.png',
  '/Users/billklingensmith/Desktop/ideal-circular-captures/Lunds & Byerlys 50th Street Edina Local Ad_2026-01-14/Lunds & Byerlys 50th Street Edina Local Ad_007.png',
];

/**
 * Check if two promotions likely match (for dedup)
 */
function promotionsMatch(p1, p2) {
  if (!p1 || !p2) return false;
  const desc1 = p1.products?.['1']?.description?.toLowerCase() || '';
  const desc2 = p2.products?.['1']?.description?.toLowerCase() || '';

  // Simple fuzzy match: check if key words overlap
  const words1 = desc1.split(/\s+/).filter(w => w.length > 3);
  const words2 = desc2.split(/\s+/).filter(w => w.length > 3);

  const matches = words1.filter(w => words2.includes(w));
  return matches.length >= 2 || (desc1 && desc2 && (desc1.includes(desc2.substring(0, 10)) || desc2.includes(desc1.substring(0, 10))));
}

async function runTest() {
  console.log('='.repeat(80));
  console.log('SEQUENTIAL IMAGE ANALYSIS - Testing Cross-Image Continuity');
  console.log('='.repeat(80));
  console.log('');

  const results = [];
  const observations = [];
  let previousCroppedBottom = [];
  let currentCategory = null;

  for (let i = 0; i < IMAGES.length; i++) {
    const imagePath = IMAGES[i];
    const imageNum = imagePath.match(/_(\d+)\.png$/)?.[1] || i;

    console.log(`\n${'─'.repeat(80)}`);
    console.log(`IMAGE ${imageNum}: ${imagePath.split('/').pop()}`);
    console.log('─'.repeat(80));

    const result = await analyzeImage(imagePath);
    results.push({ imageNum, ...result });

    // Show category headers found
    if (result.categoryHeaders?.length > 0) {
      console.log('\n📁 CATEGORY HEADERS:');
      result.categoryHeaders.forEach((h) => {
        console.log(`   [${h.gridSize}] "${h.name}"`);
        currentCategory = h.name;
      });
    }

    // Check for continuity with previous image
    if (previousCroppedBottom.length > 0 && result.croppedTop?.length > 0) {
      console.log('\n🔗 CONTINUITY CHECK:');
      result.croppedTop.forEach((topCard) => {
        const topDesc = topCard.products?.['1']?.description || 'unknown';
        const matchingBottom = previousCroppedBottom.find(b => promotionsMatch(b, topCard));

        if (matchingBottom) {
          const bottomDesc = matchingBottom.products?.['1']?.description || 'unknown';
          console.log(`   ✅ MATCH: "${bottomDesc}" → "${topDesc}"`);
          observations.push(`Dedup: ${bottomDesc} matched across images`);
        } else {
          console.log(`   ❓ NO MATCH for cropped-top: "${topDesc}"`);
        }
      });
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Complete: ${result.promotions.length} | Cropped-top: ${result.croppedTop?.length || 0} | Cropped-bottom: ${result.croppedBottom?.length || 0}`);

    // List complete cards with categories
    if (result.promotions.length > 0) {
      console.log('\n   ✅ COMPLETE CARDS:');
      result.promotions.forEach((p, idx) => {
        const desc = p.products?.['1']?.description || p.title || 'unknown';
        const hasPlus = p.hasPlusIcon ? '✓+' : '✗+';
        const cat = p.category ? `[${p.category}]` : '';
        const type = p.templateType === 'static' ? '📢' : '';
        console.log(`      ${idx + 1}. [${p.gridSize}] ${hasPlus} ${cat} ${type} ${desc.substring(0, 40)} - "${p.title?.substring(0, 25) || ''}"`);

        // Spot static/announcement cards
        if (p.templateType === 'static') {
          observations.push(`Static card found: ${p.title}`);
        }
      });
    }

    // List cropped cards
    if (result.croppedTop?.length > 0) {
      console.log('\n   ⬆️  CROPPED-TOP:');
      result.croppedTop.forEach((p) => {
        const desc = p.products?.['1']?.description || 'unknown';
        console.log(`      [${p.gridSize}] ${desc.substring(0, 50)}`);
      });
    }

    if (result.croppedBottom?.length > 0) {
      console.log('\n   ⬇️  CROPPED-BOTTOM:');
      result.croppedBottom.forEach((p) => {
        const desc = p.products?.['1']?.description || 'unknown';
        console.log(`      [${p.gridSize}] ${desc.substring(0, 50)}`);
      });
    }

    // Track for next iteration
    previousCroppedBottom = result.croppedBottom || [];
  }

  // Final summary
  console.log('\n\n' + '='.repeat(80));
  console.log('FINAL SUMMARY');
  console.log('='.repeat(80));

  let totalComplete = 0;
  let totalCroppedTop = 0;
  let totalCroppedBottom = 0;
  let totalHeaders = 0;

  results.forEach((r) => {
    totalComplete += r.promotions.length;
    totalCroppedTop += r.croppedTop?.length || 0;
    totalCroppedBottom += r.croppedBottom?.length || 0;
    totalHeaders += r.categoryHeaders?.length || 0;
  });

  console.log(`Total complete cards: ${totalComplete}`);
  console.log(`Total category headers: ${totalHeaders}`);
  console.log(`Total cropped-top: ${totalCroppedTop}`);
  console.log(`Total cropped-bottom: ${totalCroppedBottom}`);
  console.log(`Dedup candidates: ${Math.min(totalCroppedTop, totalCroppedBottom)}`);

  // Observations
  if (observations.length > 0) {
    console.log('\n🔍 OBSERVATIONS:');
    observations.forEach((o) => console.log(`   • ${o}`));
  }

  // Save results to both JSON (full data) and CSV (quick viewing)
  const outputDir = '/Users/billklingensmith/Desktop/ideal-circular-captures/output';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const sourceFolder = path.basename(path.dirname(IMAGES[0]));
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);

  // Save JSON (full hierarchical data for analysis)
  const jsonPath = path.join(outputDir, `${sourceFolder}_${timestamp}.json`);
  const jsonOutput = {
    timestamp: new Date().toISOString(),
    sourceFolder: path.dirname(IMAGES[0]),
    storeName: sourceFolder,
    imagesAnalyzed: IMAGES.length,
    summary: {
      totalComplete: totalComplete,
      totalCategoryHeaders: totalHeaders,
      totalCroppedTop: totalCroppedTop,
      totalCroppedBottom: totalCroppedBottom,
    },
    observations,
    results,
  };
  fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2));
  console.log(`\n📄 JSON saved to: ${jsonPath}`);
}

runTest().catch(console.error);
