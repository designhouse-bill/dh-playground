# Ideal Circular Capture Tool

CLI tool to capture full-page screenshots of lazy-loading websites and stitch them into a single image. Optimized for ideal.sale circulars.

## Prerequisites

- **Node.js** 18+ (https://nodejs.org)

## Installation

```bash
cd Ideal-capture-tool
npm install
npx playwright install chromium
```

## Quick Start

```bash
# Capture and stitch in one step
node bin/capture.js "https://superecono.ideal.sale/lorenzo/browse" --stitch

# Capture only (no stitching)
node bin/capture.js "https://lakemillsmarket.ideal.sale/1182555/browse"

# With date parameter (for a specific circular date)
node bin/capture.js "https://lakemillsmarket.ideal.sale/1182555/browse?date=202601140500" --stitch

# High-res capture (4x scale = 1656px wide)
node bin/capture.js "https://superecono.ideal.sale/lorenzo/browse" --scale 4 --stitch
```

## Output

Screenshots are saved to: `~/Desktop/ideal-circular-captures/{Page Title}_{YYYY-MM-DD}/`

Each capture creates:
- `{Page Title}_001.png`, `_002.png`, etc. — Individual viewport screenshots
- `metadata.json` — Capture metadata
- `combined.png` — Stitched full-page image (when using `--stitch`)

If the stitched image exceeds 40,000px tall, it auto-splits into `combined_001.png`, `combined_002.png`, etc.

## Capture Options

```bash
node bin/capture.js <url> [options]

Options:
  -o, --output <dir>       Output directory (default: ~/Desktop/ideal-circular-captures)
  -w, --width <px>         Viewport width (default: 414)
  -h, --height <px>        Viewport height (default: 896)
  -d, --delay <ms>         Scroll delay for lazy-load (default: 1500)
  -s, --scale <factor>     Device scale factor (default: 2)

  --mode <mode>            Lazy-load mode: conservative|io-patch|aggressive (default: conservative)
  --settle <ms>            Final settle cooldown (default: 3000)
  --image-timeout <ms>     Max wait for images (default: 10000)
  --max-scrolls <n>        Guard against infinite scroll (default: 50)
  --max-height <px>        Guard against endless pages (default: 50000)
  --sticky-footer <px>     Sticky footer height to crop (default: 64)

  --stitch                 Auto-stitch screenshots into combined.png after capture
  --headed                 Run browser visibly (for debugging)

  --help                   Display help
```

## Stitch Command (standalone)

Stitch previously captured screenshots into a single image:

```bash
node bin/stitch.js <directory> [options]

Options:
  --overlap <ratio>        Overlap ratio between images (default: 0.15)
  --crop-bottom <px>       Pixels to crop from bottom of each image (default: 128)
  --max-height <px>        Max output height before splitting (default: 40000)
```

Example:
```bash
node bin/stitch.js ~/Desktop/ideal-circular-captures/Browse_2026-02-10
```

## Scale Factor

The `--scale` flag controls output resolution. The viewport stays the same (414px CSS), but the rendered pixels change:

| Scale | Output Width | Use Case |
|-------|-------------|----------|
| `1`   | 414px       | Fast captures, smaller files |
| `2`   | 828px       | Default (Retina quality) |
| `4`   | 1656px      | High-res for print or zoom |

## Lazy-Load Modes

| Mode | Description | When to use |
|------|-------------|-------------|
| `conservative` | Scroll + wait only | Default, safest option |
| `io-patch` | Patches IntersectionObserver | If conservative misses images |
| `aggressive` | IO patch + force attributes | Last resort for stubborn sites |

## Examples

```bash
# Capture + stitch (most common)
node bin/capture.js "https://store.ideal.sale/123/browse" --stitch

# High-res for print
node bin/capture.js "https://store.ideal.sale/123/browse" --scale 4 --stitch

# Debug with visible browser
node bin/capture.js "https://store.ideal.sale/123/browse" --headed --stitch

# Aggressive mode for stubborn lazy-loading
node bin/capture.js "https://store.ideal.sale/123/browse" --mode aggressive --delay 2500 --stitch

# Different output directory
node bin/capture.js "https://store.ideal.sale/123/browse" -o ./my-captures --stitch
```

## Troubleshooting

### Images missing?
Escalate the lazy-load mode:
```bash
node bin/capture.js <url> --mode io-patch --stitch
node bin/capture.js <url> --mode aggressive --delay 2500 --stitch
```

### Page times out?
The site may have persistent network connections. This is usually fine — the tool continues after timeout.

### Very large files?
Use a lower scale factor:
```bash
node bin/capture.js <url> --scale 1 --stitch
```

## File Structure

```
Ideal-capture-tool/
├── bin/
│   ├── capture.js       # CLI: capture screenshots
│   └── stitch.js        # CLI: stitch images together
├── src/
│   ├── capturer.js      # Main capture class
│   ├── stitcher.js      # Image stitching logic
│   ├── config.js        # Default configuration
│   ├── lazy-bypass.js   # Lazy-load handling modes
│   └── utils.js         # Utility functions
├── tests/
│   ├── validation.js    # Site validation tests
│   └── deep-audit.js    # Additional audit tools
├── package.json
└── README.md
```
