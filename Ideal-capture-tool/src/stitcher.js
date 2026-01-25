/**
 * Image Stitcher - Combines viewport screenshots into one tall image
 *
 * Handles the 15% overlap from scroll capture (scrollStep = height * 0.85)
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { formatBytes } from './utils.js';

/**
 * Stitch multiple screenshots vertically into one image
 * @param {string[]} imagePaths - Array of image file paths in order
 * @param {string} outputPath - Path for combined output image
 * @param {object} options - Stitch options
 * @returns {object} - Result with path and dimensions
 */
export async function stitchImages(imagePaths, outputPath, options = {}) {
  const {
    overlapPercent = 0.15, // 15% overlap from 85% scroll step
    quality = 90,
    cropBottom = 0, // Pixels to crop from bottom (e.g., sticky nav bar)
    maxHeight = 40000, // Max height before splitting into multiple files
  } = options;

  if (!imagePaths || imagePaths.length === 0) {
    throw new Error('No images to stitch');
  }

  // Read first image to get dimensions
  const firstMeta = await sharp(imagePaths[0]).metadata();
  const imgWidth = firstMeta.width;
  const imgHeight = firstMeta.height;

  // Effective height after cropping bottom bar
  const effectiveHeight = imgHeight - cropBottom;
  const overlapPx = Math.floor(effectiveHeight * overlapPercent);
  const sliceHeight = effectiveHeight - overlapPx; // Height each image adds after first

  // Calculate total height
  const totalHeight = effectiveHeight + (imagePaths.length - 1) * sliceHeight;

  // Check if we need to split
  if (totalHeight > maxHeight && maxHeight > 0) {
    console.log(`\n  Total height (${totalHeight}px) exceeds max (${maxHeight}px), splitting...`);
    return stitchWithSplit(imagePaths, outputPath, {
      ...options,
      imgWidth,
      imgHeight,
      effectiveHeight,
      overlapPx,
      sliceHeight,
      totalHeight,
    });
  }

  console.log(`\n  Stitching ${imagePaths.length} images...`);
  console.log(`    Dimensions: ${imgWidth} x ${totalHeight}px`);
  console.log(`    Overlap: ${overlapPx}px per image`);
  if (cropBottom > 0) {
    console.log(`    Cropping: ${cropBottom}px from bottom of each image`);
  }

  // Create array of composite operations
  const composites = [];
  let yOffset = 0;

  for (let i = 0; i < imagePaths.length; i++) {
    const imgPath = imagePaths[i];

    if (i === 0) {
      // First image: crop bottom bar only
      const cropped = await sharp(imgPath)
        .extract({
          left: 0,
          top: 0,
          width: imgWidth,
          height: effectiveHeight,
        })
        .toBuffer();

      composites.push({
        input: cropped,
        top: 0,
        left: 0,
      });
      yOffset = effectiveHeight - overlapPx;
    } else {
      // Subsequent images: crop top overlap AND bottom bar
      const cropped = await sharp(imgPath)
        .extract({
          left: 0,
          top: overlapPx,
          width: imgWidth,
          height: effectiveHeight - overlapPx,
        })
        .toBuffer();

      composites.push({
        input: cropped,
        top: yOffset,
        left: 0,
      });
      yOffset += effectiveHeight - overlapPx;
    }
  }

  // Create blank canvas and composite all images
  await sharp({
    create: {
      width: imgWidth,
      height: totalHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite(composites)
    .png({ quality })
    .toFile(outputPath);

  const fileSize = fs.statSync(outputPath).size;
  console.log(`    Output: ${path.basename(outputPath)} (${formatBytes(fileSize)})`);

  return {
    path: outputPath,
    width: imgWidth,
    height: totalHeight,
    fileSize,
  };
}

/**
 * Stitch images with auto-split when exceeding max height
 * @param {string[]} imagePaths - Array of image file paths
 * @param {string} outputPath - Base path for output (will add _001, _002, etc.)
 * @param {object} options - Stitch options plus pre-calculated dimensions
 * @returns {object} - Result with paths array and total dimensions
 */
async function stitchWithSplit(imagePaths, outputPath, options) {
  const {
    quality = 90,
    cropBottom = 0,
    maxHeight = 40000,
    imgWidth,
    effectiveHeight,
    overlapPx,
    sliceHeight,
  } = options;

  // Calculate how many images fit in each chunk
  // First chunk: effectiveHeight + (n-1) * sliceHeight <= maxHeight
  // Subsequent chunks: n * sliceHeight <= maxHeight (start fresh, no overlap carryover)
  const imagesInFirstChunk = Math.floor((maxHeight - effectiveHeight) / sliceHeight) + 1;
  const imagesPerChunk = Math.floor(maxHeight / sliceHeight);

  const results = [];
  let imageIndex = 0;
  let chunkNum = 1;

  // Parse output path for naming
  const dir = path.dirname(outputPath);
  const ext = path.extname(outputPath);
  const base = path.basename(outputPath, ext);

  while (imageIndex < imagePaths.length) {
    const isFirstChunk = chunkNum === 1;
    const chunkSize = isFirstChunk
      ? Math.min(imagesInFirstChunk, imagePaths.length - imageIndex)
      : Math.min(imagesPerChunk, imagePaths.length - imageIndex);

    const chunkImages = imagePaths.slice(imageIndex, imageIndex + chunkSize);
    const chunkPath = path.join(dir, `${base}_${String(chunkNum).padStart(3, '0')}${ext}`);

    // Calculate this chunk's height
    const chunkHeight = effectiveHeight + (chunkImages.length - 1) * sliceHeight;

    console.log(`\n  Stitching chunk ${chunkNum} (${chunkImages.length} images, ${chunkHeight}px)...`);

    // Build composites for this chunk
    const composites = [];
    let yOffset = 0;

    for (let i = 0; i < chunkImages.length; i++) {
      const imgPath = chunkImages[i];

      if (i === 0) {
        // First image in chunk: crop bottom bar only
        const cropped = await sharp(imgPath)
          .extract({
            left: 0,
            top: 0,
            width: imgWidth,
            height: effectiveHeight,
          })
          .toBuffer();

        composites.push({ input: cropped, top: 0, left: 0 });
        yOffset = effectiveHeight - overlapPx;
      } else {
        // Subsequent images: crop top overlap AND bottom bar
        const cropped = await sharp(imgPath)
          .extract({
            left: 0,
            top: overlapPx,
            width: imgWidth,
            height: effectiveHeight - overlapPx,
          })
          .toBuffer();

        composites.push({ input: cropped, top: yOffset, left: 0 });
        yOffset += sliceHeight;
      }
    }

    // Create this chunk's image
    await sharp({
      create: {
        width: imgWidth,
        height: chunkHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite(composites)
      .png({ quality })
      .toFile(chunkPath);

    const fileSize = fs.statSync(chunkPath).size;
    console.log(`    Output: ${path.basename(chunkPath)} (${formatBytes(fileSize)})`);

    results.push({
      path: chunkPath,
      width: imgWidth,
      height: chunkHeight,
      fileSize,
    });

    imageIndex += chunkSize;
    chunkNum++;
  }

  const totalHeight = results.reduce((sum, r) => sum + r.height, 0);
  const totalSize = results.reduce((sum, r) => sum + r.fileSize, 0);

  console.log(`\n  Split complete: ${results.length} files, ${totalHeight}px total`);

  return {
    paths: results.map(r => r.path),
    width: imgWidth,
    height: totalHeight,
    fileSize: totalSize,
    chunks: results,
  };
}

/**
 * Stitch all PNGs in a directory (by filename order)
 * @param {string} dirPath - Directory containing numbered screenshots
 * @param {object} options - Stitch options
 * @returns {object} - Result with path and dimensions
 */
export async function stitchDirectory(dirPath, options = {}) {
  // Find all numbered PNG files
  const files = fs.readdirSync(dirPath)
    .filter(f => f.match(/_\d{3}\.png$/))
    .sort()
    .map(f => path.join(dirPath, f));

  if (files.length === 0) {
    throw new Error(`No numbered PNG files found in ${dirPath}`);
  }

  const outputPath = path.join(dirPath, 'combined.png');
  return stitchImages(files, outputPath, options);
}
