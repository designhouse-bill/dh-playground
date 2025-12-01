#!/usr/bin/env python3
"""
Crop individual products from full-page Superior Grocers circular images
Uses computer vision to detect product boundaries and extract individual items
"""
import cv2
import numpy as np
import pytesseract
from PIL import Image
import os
import json
import re
from pathlib import Path

# Configuration
INPUT_DIR = "/Users/billklingensmith/Desktop/superior-stuff/product-images"
OUTPUT_DIR = "/Users/billklingensmith/Desktop/superior-stuff/individual-products"
REPORT_FILE = "/Users/billklingensmith/Desktop/superior-stuff/product-crop-report.json"

# Detection parameters
MIN_PRODUCT_WIDTH = 80   # Minimum width for a product region
MIN_PRODUCT_HEIGHT = 80  # Minimum height for a product region
MAX_PRODUCT_WIDTH = 600  # Maximum width to avoid full-page detections
MAX_PRODUCT_HEIGHT = 600 # Maximum height to avoid full-page detections

def clean_filename(text):
    """Convert text to safe filename"""
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'\s+', '_', text)
    text = text.lower().strip()[:40]
    return text if text else "product"

def detect_product_regions(image_path):
    """
    Detect individual product regions using contour detection
    Returns list of bounding boxes (x, y, w, h)
    """
    # Read image
    img = cv2.imread(image_path)
    if img is None:
        return []

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Apply multiple detection strategies and combine results
    regions = []

    # Strategy 1: Edge detection + contours
    edges = cv2.Canny(gray, 50, 150)
    kernel = np.ones((5,5), np.uint8)
    dilated = cv2.dilate(edges, kernel, iterations=2)

    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)

        # Filter by size
        if (MIN_PRODUCT_WIDTH <= w <= MAX_PRODUCT_WIDTH and
            MIN_PRODUCT_HEIGHT <= h <= MAX_PRODUCT_HEIGHT):
            regions.append((x, y, w, h))

    # Strategy 2: Adaptive thresholding + contours
    adaptive = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                     cv2.THRESH_BINARY_INV, 11, 2)

    contours2, _ = cv2.findContours(adaptive, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for contour in contours2:
        x, y, w, h = cv2.boundingRect(contour)

        if (MIN_PRODUCT_WIDTH <= w <= MAX_PRODUCT_WIDTH and
            MIN_PRODUCT_HEIGHT <= h <= MAX_PRODUCT_HEIGHT):
            regions.append((x, y, w, h))

    # Remove duplicate/overlapping regions
    regions = remove_overlapping_regions(regions)

    # Sort regions top-to-bottom, left-to-right
    regions = sorted(regions, key=lambda r: (r[1], r[0]))

    return regions

def remove_overlapping_regions(regions, overlap_threshold=0.5):
    """Remove overlapping bounding boxes, keeping the larger ones"""
    if not regions:
        return []

    # Convert to numpy array for easier manipulation
    regions = sorted(regions, key=lambda r: r[2] * r[3], reverse=True)

    keep = []
    for region in regions:
        x1, y1, w1, h1 = region

        # Check if this region overlaps significantly with any kept region
        overlaps = False
        for kept_region in keep:
            x2, y2, w2, h2 = kept_region

            # Calculate intersection
            x_left = max(x1, x2)
            y_top = max(y1, y2)
            x_right = min(x1 + w1, x2 + w2)
            y_bottom = min(y1 + h1, y2 + h2)

            if x_right > x_left and y_bottom > y_top:
                intersection_area = (x_right - x_left) * (y_bottom - y_top)
                region_area = w1 * h1
                overlap_ratio = intersection_area / region_area

                if overlap_ratio > overlap_threshold:
                    overlaps = True
                    break

        if not overlaps:
            keep.append(region)

    return keep

def extract_text_from_region(image, x, y, w, h):
    """Extract text from a specific region using OCR"""
    try:
        # Crop region with small padding
        padding = 5
        x1 = max(0, x - padding)
        y1 = max(0, y - padding)
        x2 = min(image.shape[1], x + w + padding)
        y2 = min(image.shape[0], y + h + padding)

        cropped = image[y1:y2, x1:x2]

        # Convert to PIL Image
        pil_img = Image.fromarray(cv2.cvtColor(cropped, cv2.COLOR_BGR2RGB))

        # Run OCR
        text = pytesseract.image_to_string(pil_img)

        # Extract first meaningful line
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        for line in lines:
            # Skip price-only lines
            if len(line) > 3 and not re.match(r'^\$?\d+\.?\d*$', line):
                return line

        return lines[0] if lines else "product"
    except Exception as e:
        return "product"

def crop_products_from_image(image_path):
    """Crop all detected products from a full-page image"""
    page_name = Path(image_path).stem
    results = []

    print(f"\n{'='*60}")
    print(f"Processing: {page_name}")
    print(f"{'='*60}")

    # Detect product regions
    print("Detecting product regions...")
    regions = detect_product_regions(image_path)
    print(f"Found {len(regions)} potential product regions")

    if not regions:
        print("  No product regions detected")
        return []

    # Load original image
    img = cv2.imread(image_path)

    # Crop each region
    for idx, (x, y, w, h) in enumerate(regions, 1):
        try:
            # Extract text from region
            product_text = extract_text_from_region(img, x, y, w, h)
            clean_name = clean_filename(product_text)

            # Crop with small padding
            padding = 10
            x1 = max(0, x - padding)
            y1 = max(0, y - padding)
            x2 = min(img.shape[1], x + w + padding)
            y2 = min(img.shape[0], y + h + padding)

            cropped = img[y1:y2, x1:x2]

            # Generate filename
            filename = f"{page_name}_product{idx:03d}_{clean_name}.jpg"
            filepath = os.path.join(OUTPUT_DIR, filename)

            # Save cropped image
            cv2.imwrite(filepath, cropped)

            result = {
                "filename": filename,
                "source_image": page_name,
                "product_number": idx,
                "dimensions": f"{w}x{h}",
                "position": f"({x},{y})",
                "detected_text": product_text[:50],
                "filepath": filepath
            }
            results.append(result)

            print(f"  Product {idx}: {w}x{h} at ({x},{y}) - '{product_text[:30]}'")

        except Exception as e:
            print(f"  Error cropping product {idx}: {e}")
            continue

    print(f"✓ Cropped {len(results)} products from {page_name}")
    return results

def generate_report(all_results):
    """Generate detailed cropping report"""
    report = {
        "total_products": len(all_results),
        "by_page": {},
        "products": all_results
    }

    for result in all_results:
        page = result["source_image"]
        if page not in report["by_page"]:
            report["by_page"][page] = 0
        report["by_page"][page] += 1

    return report

def main():
    """Main execution"""
    print("="*60)
    print("INDIVIDUAL PRODUCT CROPPING")
    print("="*60)

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"\nOutput directory: {OUTPUT_DIR}")

    # Process all full-page images
    all_results = []
    image_files = sorted(Path(INPUT_DIR).glob("*.jpeg")) + sorted(Path(INPUT_DIR).glob("*.jpg"))

    if not image_files:
        print("\n✗ No images found in input directory")
        return

    print(f"\nFound {len(image_files)} full-page images to process\n")

    for image_path in image_files:
        results = crop_products_from_image(str(image_path))
        all_results.extend(results)

    # Generate report
    if all_results:
        report = generate_report(all_results)

        # Save report
        with open(REPORT_FILE, 'w') as f:
            json.dump(report, f, indent=2)

        # Print summary
        print(f"\n{'='*60}")
        print("CROPPING SUMMARY")
        print(f"{'='*60}")
        print(f"\nTotal individual products extracted: {report['total_products']}")
        print(f"\nBy Page:")
        for page, count in report['by_page'].items():
            print(f"  {page}: {count} products")
        print(f"\nReport saved to: {REPORT_FILE}")
        print(f"\n✓ Product cropping complete!")
    else:
        print("\n✗ No products extracted")

if __name__ == "__main__":
    main()
