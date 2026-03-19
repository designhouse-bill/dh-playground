#!/usr/bin/env node
/**
 * Convert generated ES module to browser-compatible global variable
 *
 * Usage: node convert-to-browser.js
 *
 * Input:  output/mock-data-generated.js (ES module)
 * Output: ../shared/promotion-records-data.js (global variable)
 */

const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'output', 'mock-data-generated.js');
const outputPath = path.join(__dirname, '..', 'shared', 'promotion-records-data.js');

console.log('Converting generated data to browser format...');

// Read the generated file
const content = fs.readFileSync(inputPath, 'utf-8');

// Extract the promotionRecords array
const match = content.match(/export const promotionRecords = (\[[\s\S]*?\]);/);

if (!match) {
  console.error('Could not find promotionRecords in generated file');
  process.exit(1);
}

const recordsJson = match[1];

// Count records
const recordCount = (recordsJson.match(/\{[\s\S]*?"storeId"/g) || []).length;

// Create browser-compatible version
const browserContent = `/**
 * Promotion Records Data for Analytics Dashboard
 * Auto-converted from generated ES module
 *
 * Generated: ${new Date().toISOString()}
 * Records: ${recordCount}
 *
 * This file provides atomic promotion data (store × week × promotion).
 * Include this BEFORE mock-data.js to automatically load the data.
 */

// Global variable for browser use
window.promotionRecordsData = ${recordsJson};

// Notify that data is ready
console.log('📦 Promotion records data loaded: ' + window.promotionRecordsData.length + ' records');
`;

// Write output
fs.writeFileSync(outputPath, browserContent);

console.log(`✅ Converted ${recordCount} records`);
console.log(`   Input:  ${inputPath}`);
console.log(`   Output: ${outputPath}`);
