#!/usr/bin/env python3
"""
Prepare meat product images for Photoshop enhancement
- Detects yellow price tags using color detection
- Detects text regions using OCR
- Creates mask files showing areas to fill with Content-Aware Fill
- Expands canvas for better content-aware fill results
"""
import cv2
import numpy as np
import pytesseract
from PIL import Image
import os
import json

# Configuration
INPUT_DIR = "/Users/billklingensmith/Desktop/superior-stuff/separated-meat-images"
OUTPUT_DIR = "/Users/billklingensmith/Desktop/superior-stuff/meat-products-prepared"
REPORT_FILE = "/Users/billklingensmith/Desktop/superior-stuff/preparation-report.json"

# Detection parameters
CANVAS_EXPANSION = 0.15  # Expand canvas by 15% on all sides

def detect_yellow_price_tags(image):
    """
    Detect yellow starburst price tags using HSV color detection
    Returns binary mask of yellow regions
    """
    # Convert to HSV color space
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # Define range for yellow color (starburst tags)
    # Yellow in HSV: Hue 20-40, high Saturation, high Value
    lower_yellow = np.array([15, 100, 100])
    upper_yellow = np.array([35, 255, 255])

    # Create mask for yellow regions
    yellow_mask = cv2.inRange(hsv, lower_yellow, upper_yellow)

    # Dilate to fill small gaps
    kernel = np.ones((10, 10), np.uint8)
    yellow_mask = cv2.dilate(yellow_mask, kernel, iterations=2)

    return yellow_mask

def detect_text_regions(image):
    """
    Detect text regions using OCR bounding boxes
    Returns binary mask of text areas
    """
    # Convert to RGB for pytesseract
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb)

    # Get bounding boxes of text
    text_data = pytesseract.image_to_data(pil_img, output_type=pytesseract.Output.DICT)

    # Create blank mask
    text_mask = np.zeros(image.shape[:2], dtype=np.uint8)

    # Draw rectangles around detected text
    for i in range(len(text_data['text'])):
        conf = int(text_data['conf'][i])
        text = text_data['text'][i].strip()

        # Only use high-confidence detections with actual text
        if conf > 30 and len(text) > 0:
            x = text_data['left'][i]
            y = text_data['top'][i]
            w = text_data['width'][i]
            h = text_data['height'][i]

            # Expand bounding box slightly to ensure full text removal
            padding = 5
            x = max(0, x - padding)
            y = max(0, y - padding)
            w = w + 2 * padding
            h = h + 2 * padding

            cv2.rectangle(text_mask, (x, y), (x + w, y + h), 255, -1)

    return text_mask

def expand_canvas(image, expansion_ratio=0.15):
    """
    Expand canvas around image to provide space for content-aware fill
    """
    h, w = image.shape[:2]

    # Calculate new dimensions
    new_w = int(w * (1 + 2 * expansion_ratio))
    new_h = int(h * (1 + 2 * expansion_ratio))

    # Calculate padding
    pad_w = int(w * expansion_ratio)
    pad_h = int(h * expansion_ratio)

    # Create new canvas with white background
    if len(image.shape) == 3:
        new_canvas = np.ones((new_h, new_w, 3), dtype=np.uint8) * 255
        new_canvas[pad_h:pad_h+h, pad_w:pad_w+w] = image
    else:
        new_canvas = np.zeros((new_h, new_w), dtype=np.uint8)
        new_canvas[pad_h:pad_h+h, pad_w:pad_w+w] = image

    return new_canvas, pad_w, pad_h

def process_image(image_path, output_dir):
    """
    Process a single meat product image
    Returns detection statistics
    """
    filename = os.path.basename(image_path)
    base_name = os.path.splitext(filename)[0]

    print(f"\nProcessing: {filename}")

    # Load image
    img = cv2.imread(image_path)
    if img is None:
        print(f"  ✗ Failed to load image")
        return None

    h, w = img.shape[:2]
    print(f"  Original size: {w}x{h}")

    # Detect yellow price tags
    print("  Detecting yellow price tags...")
    yellow_mask = detect_yellow_price_tags(img)
    yellow_pixels = np.sum(yellow_mask > 0)

    # Detect text regions
    print("  Detecting text regions...")
    text_mask = detect_text_regions(img)
    text_pixels = np.sum(text_mask > 0)

    # Combine masks
    combined_mask = cv2.bitwise_or(yellow_mask, text_mask)

    # Expand canvas
    print("  Expanding canvas...")
    expanded_img, pad_w, pad_h = expand_canvas(img, CANVAS_EXPANSION)
    expanded_mask, _, _ = expand_canvas(combined_mask, CANVAS_EXPANSION)

    # Add border mask (mark edges that need filling)
    border_thickness = 2
    cv2.rectangle(expanded_mask, (0, 0), (expanded_mask.shape[1], expanded_mask.shape[0]),
                  255, border_thickness)

    new_h, new_w = expanded_img.shape[:2]
    print(f"  Expanded size: {new_w}x{new_h}")

    # Save expanded image
    output_img_path = os.path.join(output_dir, f"{base_name}_expanded.png")
    cv2.imwrite(output_img_path, expanded_img)

    # Save mask
    output_mask_path = os.path.join(output_dir, f"{base_name}_mask.png")
    cv2.imwrite(output_mask_path, expanded_mask)

    # Save visualization (image with mask overlay)
    vis_img = expanded_img.copy()
    vis_img[expanded_mask > 0] = [0, 0, 255]  # Red overlay on masked areas
    output_vis_path = os.path.join(output_dir, f"{base_name}_preview.png")
    cv2.imwrite(output_vis_path, vis_img)

    print(f"  ✓ Saved: {base_name}_expanded.png")
    print(f"  ✓ Saved: {base_name}_mask.png")
    print(f"  ✓ Saved: {base_name}_preview.png (for review)")

    return {
        "filename": filename,
        "original_size": f"{w}x{h}",
        "expanded_size": f"{new_w}x{new_h}",
        "yellow_pixels_detected": int(yellow_pixels),
        "text_pixels_detected": int(text_pixels),
        "total_mask_pixels": int(np.sum(expanded_mask > 0)),
        "files_created": {
            "image": output_img_path,
            "mask": output_mask_path,
            "preview": output_vis_path
        }
    }

def main():
    """Main execution"""
    print("="*70)
    print("PREPARE MEAT IMAGES FOR PHOTOSHOP ENHANCEMENT")
    print("="*70)

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"\nOutput directory: {OUTPUT_DIR}")

    # Get all meat images
    image_files = sorted([f for f in os.listdir(INPUT_DIR)
                         if f.endswith('_meat.png')])

    if not image_files:
        print("\n✗ No meat images found!")
        return

    print(f"\nFound {len(image_files)} images to process")

    # Process each image
    results = []
    for image_file in image_files:
        image_path = os.path.join(INPUT_DIR, image_file)
        result = process_image(image_path, OUTPUT_DIR)
        if result:
            results.append(result)

    # Save report
    report = {
        "total_images": len(results),
        "expansion_ratio": CANVAS_EXPANSION,
        "output_directory": OUTPUT_DIR,
        "images": results
    }

    with open(REPORT_FILE, 'w') as f:
        json.dump(report, f, indent=2)

    # Print summary
    print(f"\n{'='*70}")
    print("PREPARATION SUMMARY")
    print(f"{'='*70}")
    print(f"\n✓ Processed {len(results)} images successfully")
    print(f"\nFor each image, created 3 files:")
    print(f"  1. *_expanded.png  - Image with expanded canvas")
    print(f"  2. *_mask.png      - Mask showing areas to fill")
    print(f"  3. *_preview.png   - Preview with red overlay (for review)")
    print(f"\nReport saved to: {REPORT_FILE}")
    print(f"\n✓ Images ready for Photoshop processing!")
    print(f"\nNext step: Run the Photoshop script (enhance_meat_products.jsx)")

if __name__ == "__main__":
    main()
