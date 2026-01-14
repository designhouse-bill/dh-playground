/**
 * Utility functions for Ideal Capture Tool
 */

import os from 'os';
import path from 'path';
import fs from 'fs';

/**
 * Resolve output path, expanding ~ to home directory
 */
export function resolveOutputPath(outputDir) {
  if (outputDir.startsWith('~')) {
    return path.join(os.homedir(), outputDir.slice(1));
  }
  return path.resolve(outputDir);
}

/**
 * Sanitize page title for use as folder/file name
 */
export function sanitizeTitle(title, maxLength = 100) {
  if (!title || title.trim() === '') {
    return `capture-${Date.now()}`;
  }

  return title
    .replace(/[<>:"/\\|?*]/g, '')  // Remove illegal filesystem chars
    .replace(/\s+/g, ' ')          // Normalize whitespace
    .trim()
    .slice(0, maxLength);           // Truncate long titles
}

/**
 * Create output directory if it doesn't exist
 */
export function ensureDir(dirPath) {
  const resolved = resolveOutputPath(dirPath);
  if (!fs.existsSync(resolved)) {
    fs.mkdirSync(resolved, { recursive: true });
  }
  return resolved;
}

/**
 * Generate timestamp string for filenames
 */
export function getTimestamp() {
  return new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
}

/**
 * Generate date stamp for folder names (YYYY-MM-DD format)
 */
export function getDateStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format file size for display
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
