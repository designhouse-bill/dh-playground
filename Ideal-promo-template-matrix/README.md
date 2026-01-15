# Hero Template Matrix Analyzer

Analyzes full-page digital circular screenshots to extract template layout data for each promotional card.

## What It Does

Processes folders of mobile circular screenshots (like those from `Ideal-capture-tool`) and extracts:
- **Grid size** of each promo card (1x1, 2x2, 3x2, etc.)
- **Template type** (product-only, lifestyle, product-on-solid, etc.)
- **Product positions** (x, y, width, height, scale, rotation, z-index)
- **Layout patterns** (side-by-side, overlapped, cascade, etc.)

Each screenshot may contain multiple promotional cards. The analyzer identifies and extracts data for ALL promotions in each screenshot.

## Cost

Uses **Claude Sonnet 4** (best accuracy for grid detection):
- ~$0.003-0.005 per screenshot (with adaptive compression)
- 100 screenshots ≈ $0.30-0.50

**Cost optimizations:**
- Adaptive image compression (JPEG for photos, PNG for text-heavy)
- Hash-based caching skips duplicate images
- 3x parallel processing reduces wall-clock time

## Setup

```bash
cd Ideal-promo-template-matrix
npm install
```

Requires `ANTHROPIC_API_KEY` environment variable.

## Usage

### 1. Test Single Screenshot

```bash
npm run analyze ~/Desktop/ideal-circular-captures/Store_2026-01-14/Store_001.png
```

### 2. Batch Process All Screenshots

```bash
npm run batch ~/Desktop/ideal-circular-captures
```

Features:
- **3x parallel processing** with rate limiting (3 concurrent, 1 new/sec)
- **Resume capability** - tracks progress, resumes where it left off
- **Auto-retry with escalation** - failed images retry with higher quality
- **Hash-based caching** - skips duplicate images automatically
- **Adaptive compression** - PNG for text-heavy, JPEG for photos
- **Failure tracking** - categorizes errors for debugging
- Batched saves (every 5 images) to reduce I/O
- Excludes node_modules and build directories

### 3. Export to CSV

```bash
npm run export
```

Generates:
- `output/hero-template-matrix.csv` - Summary (one row per promotion)
- `output/hero-template-matrix-products.csv` - Detailed (one row per product image)
- `output/stats.json` - Statistics

## Output Schema

Each promotion extracted:

```json
{
  "id": "Store_2026-01-14_Store_001-png_promo1",
  "sourceFile": "Store_001.png",
  "folder": "Store_2026-01-14",
  "position": 1,
  "gridSize": "2x2",
  "gridColumns": 2,
  "gridRows": 2,
  "templateType": "product-on-solid",
  "backgroundType": "solid",
  "backgroundColor": "#F5D033",
  "productCount": 4,
  "products": {
    "1": {
      "cx": 30,
      "cy": 40,
      "width": 40,
      "height": 50,
      "scale": 1,
      "rotation": 0,
      "zIndex": 1,
      "shape": "tall"
    },
    "2": {
      "cx": 72,
      "cy": 42,
      "width": 35,
      "height": 45,
      "scale": 0.9,
      "rotation": 5,
      "zIndex": 2,
      "shape": "tall"
    }
  },
  "layoutPattern": "side-by-side",
  "confidence": 80,
  "notes": "Yoplait yogurt cups on yellow background"
}
```

## Resume Processing

If batch processing is interrupted, simply run the same command again:

```bash
npm run batch ~/Desktop/ideal-circular-captures
```

It will skip already-processed screenshots.

To start fresh:

```bash
npm run batch ~/Desktop/ideal-circular-captures --reset
```

## File Structure

```
Ideal-promo-template-matrix/
├── src/
│   ├── analyze-single.js   # Single screenshot analyzer
│   ├── batch-processor.js  # Batch processing with rate limits
│   ├── export-csv.js       # CSV export
│   └── schema.js           # Data types and layout patterns
├── output/
│   ├── all-promotions.json # All extracted promotions (flattened)
│   ├── matrix.json         # Screenshot-level results
│   ├── progress.json       # Processing progress
│   ├── hero-template-matrix.csv
│   └── hero-template-matrix-products.csv
└── samples/                # Test screenshots
```

## Integration with Ideal-capture-tool

This tool is designed to work with screenshots captured by `Ideal-capture-tool`:

```bash
# 1. Capture circulars with Ideal-capture-tool
cd ../Ideal-capture-tool
npm run capture https://example.com/circular

# 2. Analyze the captured screenshots
cd ../Ideal-promo-template-matrix
npm run batch ~/Desktop/ideal-circular-captures

# 3. Export to CSV
npm run export
```
