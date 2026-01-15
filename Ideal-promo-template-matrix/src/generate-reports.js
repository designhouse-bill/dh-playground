/**
 * generate-reports.js
 * Phase 7: Generate CSV and HTML reports
 */

import fs from 'fs';
import path from 'path';

const INPUT_DIR = '/Users/billklingensmith/Desktop/ideal-circular-captures/template-analysis';
const OUTPUT_DIR = INPUT_DIR;

// Generate CSV export
function generateCSV(templates) {
  const headers = [
    'gridSize',
    'productCount',
    'templateId',
    'displayName',
    'source',
    'instances',
    'confidence',
    'layoutPattern',
    'dominantShape',
    'product1_cx',
    'product1_cy',
    'product1_width',
    'product1_height',
    'product2_cx',
    'product2_cy',
    'product3_cx',
    'product3_cy',
    'product4_cx',
    'product4_cy',
    'product5_cx',
    'product5_cy'
  ];

  const rows = templates.map(t => {
    const row = [
      t.gridSize,
      t.productCount,
      t.id,
      `"${t.displayName}"`,
      t.source,
      t.stats.instances,
      t.stats.confidence,
      t.layoutPattern,
      t.shapeProfile?.dominant || 'unknown'
    ];

    // Add product positions
    for (let i = 1; i <= 5; i++) {
      const p = t.products[String(i)];
      if (p) {
        row.push(p.cx, p.cy);
        if (i <= 3) row.push(p.width, p.height);
      } else {
        row.push('', '');
        if (i <= 3) row.push('', '');
      }
    }

    return row.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// Generate HTML report
function generateHTML(data) {
  const { metadata, templates } = data;

  // Group templates by grid size for heatmap
  const gridSizes = ['1x1', '1x2', '1x3', '2x1', '2x2', '2x3', '3x1', '3x2', '3x3'];
  const heatmapData = {};
  gridSizes.forEach(gs => {
    heatmapData[gs] = {};
    for (let pc = 1; pc <= 5; pc++) {
      const template = templates.find(t => t.gridSize === gs && t.productCount === pc);
      heatmapData[gs][pc] = template ? template.stats.instances : 0;
    }
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hero Template Matrix Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      color: #333;
      line-height: 1.5;
      padding: 20px;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { font-size: 28px; margin-bottom: 8px; }
    h2 { font-size: 20px; margin: 30px 0 15px; color: #555; border-bottom: 2px solid #ddd; padding-bottom: 8px; }
    h3 { font-size: 16px; margin: 20px 0 10px; color: #666; }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-card .value { font-size: 32px; font-weight: bold; color: #2563eb; }
    .summary-card .label { color: #666; font-size: 14px; }

    .heatmap {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow-x: auto;
    }
    .heatmap table { border-collapse: collapse; width: 100%; }
    .heatmap th, .heatmap td {
      padding: 12px;
      text-align: center;
      border: 1px solid #e5e5e5;
    }
    .heatmap th { background: #f9fafb; font-weight: 600; }
    .heatmap td { min-width: 80px; }

    .cell-high { background: #22c55e; color: white; }
    .cell-good { background: #86efac; }
    .cell-adequate { background: #fef08a; }
    .cell-low { background: #fed7aa; }
    .cell-none { background: #fecaca; }

    .legend {
      display: flex;
      gap: 15px;
      margin-top: 15px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
    }
    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
    }

    .template-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .template-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .template-card.derived { border-top: 4px solid #22c55e; }
    .template-card.derived-low-sample { border-top: 4px solid #fbbf24; }
    .template-card.fallback-generated { border-top: 4px solid #ef4444; }

    .template-header {
      padding: 15px;
      border-bottom: 1px solid #e5e5e5;
    }
    .template-header h4 { font-size: 14px; margin-bottom: 4px; }
    .template-header .meta { font-size: 12px; color: #666; }

    .template-preview {
      position: relative;
      height: 150px;
      background: #f9fafb;
      margin: 15px;
      border-radius: 4px;
      border: 1px solid #e5e5e5;
    }
    .product-dot {
      position: absolute;
      background: #3b82f6;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 11px;
      font-weight: bold;
      transform: translate(-50%, -50%);
    }

    .template-stats {
      padding: 15px;
      background: #f9fafb;
      font-size: 12px;
    }
    .template-stats .stat-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .data-table {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .data-table table { width: 100%; border-collapse: collapse; }
    .data-table th {
      background: #f9fafb;
      padding: 12px;
      text-align: left;
      font-size: 13px;
      cursor: pointer;
      user-select: none;
      border-bottom: 2px solid #e5e5e5;
    }
    .data-table th:hover { background: #f3f4f6; }
    .data-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e5e5e5;
      font-size: 13px;
    }
    .data-table tr:hover { background: #f9fafb; }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-derived { background: #dcfce7; color: #166534; }
    .badge-low { background: #fef3c7; color: #92400e; }
    .badge-fallback { background: #fee2e2; color: #991b1b; }

    .gap-analysis {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .gap-list { list-style: none; }
    .gap-list li {
      padding: 8px 0;
      border-bottom: 1px solid #e5e5e5;
      display: flex;
      justify-content: space-between;
    }
    .gap-list li:last-child { border-bottom: none; }

    .timestamp { color: #999; font-size: 12px; margin-top: 30px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hero Template Matrix Report</h1>
    <p style="color: #666; margin-bottom: 20px;">Analysis of ${metadata.coverage.totalPromotions} promotions across ${metadata.totalTemplates} template slots</p>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card">
        <div class="value">${metadata.totalTemplates}</div>
        <div class="label">Total Templates</div>
      </div>
      <div class="summary-card">
        <div class="value" style="color: #22c55e;">${metadata.sources.derived}</div>
        <div class="label">Data-Derived (10+ instances)</div>
      </div>
      <div class="summary-card">
        <div class="value" style="color: #fbbf24;">${metadata.sources['derived-low-sample']}</div>
        <div class="label">Low-Sample (1-9 instances)</div>
      </div>
      <div class="summary-card">
        <div class="value" style="color: #ef4444;">${metadata.sources['fallback-generated']}</div>
        <div class="label">Fallback Generated</div>
      </div>
      <div class="summary-card">
        <div class="value">${metadata.coverage.coveragePercent}</div>
        <div class="label">Data Coverage</div>
      </div>
    </div>

    <!-- Heatmap -->
    <h2>Coverage Heatmap</h2>
    <div class="heatmap">
      <table>
        <thead>
          <tr>
            <th>Grid Size</th>
            <th>1 Product</th>
            <th>2 Products</th>
            <th>3 Products</th>
            <th>4 Products</th>
            <th>5 Products</th>
          </tr>
        </thead>
        <tbody>
          ${gridSizes.map(gs => `
            <tr>
              <th>${gs}</th>
              ${[1, 2, 3, 4, 5].map(pc => {
    const count = heatmapData[gs][pc];
    let cellClass = 'cell-none';
    if (count >= 100) cellClass = 'cell-high';
    else if (count >= 20) cellClass = 'cell-good';
    else if (count >= 10) cellClass = 'cell-adequate';
    else if (count >= 1) cellClass = 'cell-low';
    return `<td class="${cellClass}">${count}</td>`;
  }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="legend">
        <div class="legend-item"><div class="legend-color cell-high"></div> 100+ instances</div>
        <div class="legend-item"><div class="legend-color cell-good"></div> 20-99 instances</div>
        <div class="legend-item"><div class="legend-color cell-adequate"></div> 10-19 instances</div>
        <div class="legend-item"><div class="legend-color cell-low"></div> 1-9 instances</div>
        <div class="legend-item"><div class="legend-color cell-none"></div> 0 instances (fallback)</div>
      </div>
    </div>

    <!-- Template Cards -->
    <h2>Template Previews</h2>
    <div class="template-grid">
      ${templates.map(t => {
    const products = t.products;
    const productDots = Object.entries(products).map(([key, p]) => {
      const width = Math.max(15, (p.width || 30) * 0.5);
      const height = Math.max(15, (p.height || 50) * 0.4);
      return `<div class="product-dot" style="left: ${p.cx}%; top: ${p.cy}%; width: ${width}px; height: ${height}px;">${key}</div>`;
    }).join('');

    return `
              <div class="template-card ${t.source}">
                <div class="template-header">
                  <h4>${t.displayName}</h4>
                  <div class="meta">${t.id}</div>
                </div>
                <div class="template-preview">
                  ${productDots}
                </div>
                <div class="template-stats">
                  <div class="stat-row">
                    <span>Source:</span>
                    <span class="badge ${t.source === 'derived' ? 'badge-derived' : t.source === 'derived-low-sample' ? 'badge-low' : 'badge-fallback'}">${t.source}</span>
                  </div>
                  <div class="stat-row">
                    <span>Instances:</span>
                    <span>${t.stats.instances}</span>
                  </div>
                  <div class="stat-row">
                    <span>Dominant Shape:</span>
                    <span>${t.shapeProfile?.dominant || 'unknown'}</span>
                  </div>
                </div>
              </div>
            `;
  }).join('')}
    </div>

    <!-- Data Table -->
    <h2>All Templates (Sortable)</h2>
    <div class="data-table">
      <table id="templateTable">
        <thead>
          <tr>
            <th onclick="sortTable(0)">Grid Size</th>
            <th onclick="sortTable(1)">Products</th>
            <th onclick="sortTable(2)">Pattern</th>
            <th onclick="sortTable(3)">Source</th>
            <th onclick="sortTable(4)">Instances</th>
            <th onclick="sortTable(5)">Shape</th>
          </tr>
        </thead>
        <tbody>
          ${templates.map(t => `
            <tr>
              <td>${t.gridSize}</td>
              <td>${t.productCount}</td>
              <td>${t.layoutPattern}</td>
              <td><span class="badge ${t.source === 'derived' ? 'badge-derived' : t.source === 'derived-low-sample' ? 'badge-low' : 'badge-fallback'}">${t.source}</span></td>
              <td>${t.stats.instances}</td>
              <td>${t.shapeProfile?.dominant || 'unknown'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Gap Analysis -->
    <h2>Gap Analysis</h2>
    <div class="gap-analysis">
      <h3>Fallback Templates (No Data - May Need Review)</h3>
      <ul class="gap-list">
        ${templates.filter(t => t.source === 'fallback-generated').map(t => `
          <li>
            <span>${t.displayName}</span>
            <span class="badge badge-fallback">fallback</span>
          </li>
        `).join('') || '<li>None - all templates have data!</li>'}
      </ul>

      <h3 style="margin-top: 20px;">Low-Sample Templates (1-9 Instances)</h3>
      <ul class="gap-list">
        ${templates.filter(t => t.source === 'derived-low-sample').map(t => `
          <li>
            <span>${t.displayName}</span>
            <span>${t.stats.instances} instances</span>
          </li>
        `).join('') || '<li>None</li>'}
      </ul>
    </div>

    <p class="timestamp">Generated: ${metadata.generatedAt}</p>
  </div>

  <script>
    let sortDirection = {};

    function sortTable(columnIndex) {
      const table = document.getElementById('templateTable');
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));

      sortDirection[columnIndex] = !sortDirection[columnIndex];
      const dir = sortDirection[columnIndex] ? 1 : -1;

      rows.sort((a, b) => {
        let aVal = a.cells[columnIndex].textContent.trim();
        let bVal = b.cells[columnIndex].textContent.trim();

        // Try numeric comparison
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return (aNum - bNum) * dir;
        }

        return aVal.localeCompare(bVal) * dir;
      });

      rows.forEach(row => tbody.appendChild(row));
    }
  </script>
</body>
</html>`;
}

// Main execution
function main() {
  console.log('=== Report Generation ===\n');

  // Load template data
  const data = JSON.parse(fs.readFileSync(path.join(INPUT_DIR, 'base-defaults.json'), 'utf8'));
  console.log(`Loaded ${data.templates.length} templates\n`);

  // Generate CSV
  console.log('Generating CSV...');
  const csv = generateCSV(data.templates);
  const csvPath = path.join(OUTPUT_DIR, 'template-matrix.csv');
  fs.writeFileSync(csvPath, csv);
  console.log(`Saved: ${csvPath}`);

  // Generate HTML
  console.log('Generating HTML report...');
  const html = generateHTML(data);
  const htmlPath = path.join(OUTPUT_DIR, 'template-report.html');
  fs.writeFileSync(htmlPath, html);
  console.log(`Saved: ${htmlPath}`);

  console.log('\n=== Report Generation Complete ===');
  console.log(`\nOpen in browser: file://${htmlPath}`);
}

// Export
export { main, generateCSV, generateHTML };

// Run if called directly
if (process.argv[1]?.includes('generate-reports.js')) {
  main();
}
