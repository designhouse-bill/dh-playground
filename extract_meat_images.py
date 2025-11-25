#!/usr/bin/env python3
"""
Extract individual meat product images from grocery circular grid
Extracts only the meat/tray portion, excluding text and price tags
"""
from PIL import Image
import os
import json

# Configuration
INPUT_IMAGE = "/Users/billklingensmith/Desktop/Screenshot 2025-11-20 at 10.41.23\u202fAM.png"
OUTPUT_DIR = "/Users/billklingensmith/Desktop/superior-stuff/separated-meat-images"
REPORT_FILE = "/Users/billklingensmith/Desktop/superior-stuff/meat-extraction-report.json"

# Grid configuration
GRID_COLS = 4
GRID_ROWS = 3
TOTAL_PRODUCTS = 12

# Product names for reference
PRODUCT_NAMES = [
    "Beef Soup Mix Bone-In",
    "Beef Stew Meat",
    "Beef Tendons or Book Tripe",
    "Beef Clod Steak or Roast",
    "Pork Stew Meat",
    "Pork Feet or Neckbones",
    "Pork Butt Steak or Roast",
    "Pork Adobada",
    "Pork Riblets",
    "Boneless Skinless Chicken Breast",
    "Chicken Taco Meat",
    "Taco Trio Mix Chicken"
]

def extract_meat_images():
    """Extract meat product images from grid layout"""
    print("="*60)
    print("MEAT IMAGE EXTRACTION")
    print("="*60)

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"\nOutput directory: {OUTPUT_DIR}")

    # Load image
    print(f"Loading image: {INPUT_IMAGE}")
    try:
        img = Image.open(INPUT_IMAGE)
    except Exception as e:
        print(f"Error opening with PIL directly: {e}")
        print("Trying with open() first...")
        with open(INPUT_IMAGE, 'rb') as f:
            img = Image.open(f)
            img.load()  # Force load the image data

    width, height = img.size
    print(f"Image dimensions: {width}x{height}")

    # Calculate grid cell dimensions
    cell_width = width // GRID_COLS
    cell_height = height // GRID_ROWS

    print(f"\nGrid layout: {GRID_COLS} columns x {GRID_ROWS} rows")
    print(f"Cell size: {cell_width}x{cell_height}")

    results = []
    product_num = 1

    print(f"\nExtracting {TOTAL_PRODUCTS} meat product images...\n")

    # Iterate through grid
    for row in range(GRID_ROWS):
        for col in range(GRID_COLS):
            # Calculate cell boundaries
            left = col * cell_width
            top = row * cell_height
            right = left + cell_width
            bottom = top + cell_height

            # Crop full cell
            cell = img.crop((left, top, right, bottom))

            # Extract only the meat portion (top 65% of cell, excluding text and price tag)
            meat_height = int(cell_height * 0.65)
            meat_img = cell.crop((0, 0, cell_width, meat_height))

            # Generate filename
            filename = f"product_{product_num:02d}_meat.png"
            filepath = os.path.join(OUTPUT_DIR, filename)

            # Save image
            meat_img.save(filepath)

            # Record result
            result = {
                "product_number": product_num,
                "product_name": PRODUCT_NAMES[product_num - 1],
                "filename": filename,
                "filepath": filepath,
                "dimensions": f"{meat_img.width}x{meat_img.height}",
                "grid_position": f"Row {row + 1}, Col {col + 1}"
            }
            results.append(result)

            print(f"  ✓ Product {product_num:02d}: {PRODUCT_NAMES[product_num - 1][:30]:<30} -> {filename}")

            product_num += 1

    # Generate report
    report = {
        "total_products": TOTAL_PRODUCTS,
        "output_directory": OUTPUT_DIR,
        "source_image": INPUT_IMAGE,
        "grid_layout": f"{GRID_COLS}x{GRID_ROWS}",
        "products": results
    }

    with open(REPORT_FILE, 'w') as f:
        json.dump(report, f, indent=2)

    # Print summary
    print(f"\n{'='*60}")
    print("EXTRACTION SUMMARY")
    print(f"{'='*60}")
    print(f"\n✓ Successfully extracted {TOTAL_PRODUCTS} meat product images")
    print(f"✓ Images saved to: {OUTPUT_DIR}")
    print(f"✓ Report saved to: {REPORT_FILE}")
    print(f"\nFile naming: product_01_meat.png through product_{TOTAL_PRODUCTS:02d}_meat.png")

    return results

if __name__ == "__main__":
    results = extract_meat_images()
    print("\n✓ Extraction complete!")
