# Ideal Circular Capture Tool

CLI tool to capture full-page screenshots of lazy-loading websites, specifically optimized for ideal.sale circulars.

## Installation

```bash
cd /Users/billklingensmith/Code/mydarndest-playground/Ideal-capture-tool
npm install
```

## Quick Start

```bash
# Basic capture
node bin/capture.js "https://lakemillsmarket.ideal.sale/1182555/browse"

# With date parameter (for specific circular date)
node bin/capture.js "https://lakemillsmarket.ideal.sale/1182555/browse?useV3=true&developerMode=true&date=202601140500"
```

## Output

Screenshots are saved to: `~/Desktop/ideal-circular-captures/{Page Title}_{YYYY-MM-DD}/`

Each capture creates:
- `{Page Title}_001.png`, `_002.png`, etc. - Individual viewport screenshots
- `metadata.json` - Capture metadata

The date stamp allows capturing the same URL on different dates without folder conflicts.

## CLI Options

```bash
node bin/capture.js <url> [options]

Options:
  -o, --output <dir>       Output directory (default: ~/Desktop/ideal-circular-captures)
  -w, --width <px>         Viewport width (default: 414)
  -h, --height <px>        Viewport height (default: 896)
  -d, --delay <ms>         Scroll delay for lazy-load (default: 1500)
  -s, --scale <factor>     Device scale factor 1 or 2 (default: 2)

  --mode <mode>            Lazy-load mode: conservative|io-patch|aggressive (default: conservative)
  --settle <ms>            Final settle cooldown (default: 3000)
  --image-timeout <ms>     Max wait for images (default: 10000)
  --max-scrolls <n>        Guard against infinite scroll (default: 50)
  --max-height <px>        Guard against endless pages (default: 50000)

  --headed                 Run browser visibly (debugging)

  --help                   Display help
```

## Examples

### Capture with debugging (see browser)
```bash
node bin/capture.js "https://store.ideal.sale/123/browse" --headed
```

### Faster capture (smaller files)
```bash
node bin/capture.js "https://store.ideal.sale/123/browse" --scale 1
```

### Different output directory
```bash
node bin/capture.js "https://store.ideal.sale/123/browse" -o ./my-captures
```

### Aggressive lazy-load handling
```bash
node bin/capture.js "https://store.ideal.sale/123/browse" --mode aggressive
```

## Lazy-Load Modes

| Mode | Description | When to use |
|------|-------------|-------------|
| `conservative` | Scroll + wait only | Default, safest option |
| `io-patch` | Patches IntersectionObserver | If conservative misses images |
| `aggressive` | IO patch + force attributes | Last resort for stubborn sites |

## Validation Tests

Run validation tests to understand how a site handles lazy-loading:

```bash
npm run validate
```

## Troubleshooting

### Images missing?
Try increasing the scroll delay:
```bash
node bin/capture.js <url> --delay 2500
```

Or try a more aggressive mode:
```bash
node bin/capture.js <url> --mode io-patch
```

### Page times out?
The site may have persistent network connections. This is usually fine - the tool will continue after timeout.

### Very large files?
Use scale factor 1 instead of 2:
```bash
node bin/capture.js <url> --scale 1
```

## File Structure

```
Ideal-capture-tool/
├── bin/
│   └── capture.js       # CLI entry point
├── src/
│   ├── capturer.js      # Main capture class
│   ├── config.js        # Default configuration
│   ├── lazy-bypass.js   # Lazy-load handling modes
│   └── utils.js         # Utility functions
├── tests/
│   └── validation.js    # Site validation tests
├── package.json
└── README.md
```
