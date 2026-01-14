/**
 * Default configuration for Ideal Capture Tool
 */

export const CONFIG = {
  viewport: { width: 414, height: 896 },  // iPhone 11 Pro Max
  deviceScaleFactor: 2,                    // Retina quality
  scrollDelay: 1500,                       // ms after each scroll
  settleCooldown: 3000,                    // Final settle wait
  imageTimeout: 10000,                     // Max wait for images
  maxScrolls: 50,                          // Guard against infinite scroll
  maxHeight: 50000,                        // Guard against endless pages
  navigationTimeout: 30000,                // Page load timeout
  overallTimeout: 120000,                  // 2 minute max
  mode: 'conservative',                    // Default lazy-load mode
  outputDir: '~/Desktop/ideal-circular-captures',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
};

export const VALID_MODES = ['conservative', 'io-patch', 'aggressive'];
