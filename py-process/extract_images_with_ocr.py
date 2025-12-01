#!/usr/bin/env python3
"""
Image extraction script with OCR-based automatic naming
Extracts product images from Superior Grocers PDF circulars
"""
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import os
import re
import json
from pathlib import Path

# Configuration
PDF_FILES = [
    "/Users/billklingensmith/Desktop/superior-stuff/Weekly Specials - Superior Grocers-11-12-2025.pdf.pdf",
    "/Users/billklingensmith/Desktop/superior-stuff/Weekly Specials - Superior Grocers-11-19-2025.pdf"
]
OUTPUT_DIR = "/Users/billklingensmith/Desktop/superior-stuff/product-images"
REPORT_FILE = "/Users/billklingensmith/Desktop/superior-stuff/image-extraction-report.json"

# Minimum image dimensions to filter out tiny icons/decorations
MIN_WIDTH = 50
MIN_HEIGHT = 50

def clean_filename(text):
    """Convert OCR text to safe filename"""
    # Remove special characters, keep alphanumeric and spaces
    text = re.sub(r'[^\w\s-]', '', text)
    # Replace spaces with underscores
    text = re.sub(r'\s+', '_', text)
    # Lowercase and truncate
    text = text.lower().strip()[:50]
    return text if text else "unnamed"

def extract_text_from_page(page):
    """Extract all text from a PDF page"""
    try:
        text = page.get_text()
        return text
    except Exception as e:
        return ""

def extract_text_from_image_ocr(image_bytes):
    """Use OCR to extract text from image"""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        return ""

def find_best_product_name(page_text, image_text):
    """
    Find the most likely product name from page and image text
    Returns (name, confidence_level)
    """
    # Strategy 1: If OCR found clear text in the image itself
    if image_text:
        lines = [l.strip() for l in image_text.split('\n') if l.strip()]
        if lines:
            # Try to find product name (usually first substantial line)
            for line in lines:
                if len(line) > 3 and not line.replace('.', '').replace('$', '').isdigit():
                    return (line, "HIGH")

    # Strategy 2: Extract from page text (fallback)
    if page_text:
        lines = [l.strip() for l in page_text.split('\n') if l.strip()]
        # Look for product-like phrases (not prices, not dates)
        for line in lines[:20]:  # Check first 20 lines
            if (len(line) > 5 and
                not re.match(r'^\$?\d+\.?\d*$', line) and
                not re.search(r'\d{1,2}/\d{1,2}', line)):
                return (line, "MEDIUM")

    return ("product", "LOW")

def extract_images_from_pdf(pdf_path):
    """Extract all images from PDF with OCR-based naming"""
    pdf_name = Path(pdf_path).stem
    results = []

    print(f"\n{'='*60}")
    print(f"Processing: {pdf_name}")
    print(f"{'='*60}")

    try:
        doc = fitz.open(pdf_path)
        image_count = 0

        for page_num in range(len(doc)):
            page = doc[page_num]
            page_text = extract_text_from_page(page)

            print(f"\nPage {page_num + 1}/{len(doc)}:")

            # Get images from page
            image_list = page.get_images(full=True)

            if not image_list:
                print(f"  No images found")
                continue

            print(f"  Found {len(image_list)} images")

            for img_index, img in enumerate(image_list):
                try:
                    xref = img[0]
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]
                    width = base_image["width"]
                    height = base_image["height"]

                    # Filter out small images (likely icons/decorations)
                    if width < MIN_WIDTH or height < MIN_HEIGHT:
                        print(f"    Image {img_index + 1}: Skipped (too small: {width}x{height})")
                        continue

                    # Run OCR on the image
                    print(f"    Image {img_index + 1}: {width}x{height} - Running OCR...")
                    image_text = extract_text_from_image_ocr(image_bytes)

                    # Find best product name
                    product_name, confidence = find_best_product_name(page_text, image_text)
                    clean_name = clean_filename(product_name)

                    # Generate filename
                    image_count += 1
                    filename = f"{pdf_name}_page{page_num + 1}_img{image_count}_{clean_name}.{image_ext}"
                    filepath = os.path.join(OUTPUT_DIR, filename)

                    # Save image
                    with open(filepath, "wb") as f:
                        f.write(image_bytes)

                    # Record results
                    result = {
                        "filename": filename,
                        "source_pdf": pdf_name,
                        "page": page_num + 1,
                        "image_index": img_index + 1,
                        "dimensions": f"{width}x{height}",
                        "detected_text": image_text[:100] if image_text else "(none)",
                        "product_name": product_name,
                        "confidence": confidence,
                        "filepath": filepath
                    }
                    results.append(result)

                    print(f"      ✓ Saved as: {filename}")
                    print(f"      Product: '{product_name}' (confidence: {confidence})")

                except Exception as e:
                    print(f"    Error extracting image {img_index + 1}: {e}")
                    continue

        doc.close()
        print(f"\n✓ Extracted {image_count} images from {pdf_name}")
        return results

    except Exception as e:
        print(f"✗ Error processing {pdf_path}: {e}")
        return []

def generate_report(all_results):
    """Generate detailed extraction report"""
    report = {
        "total_images": len(all_results),
        "by_pdf": {},
        "by_confidence": {"HIGH": 0, "MEDIUM": 0, "LOW": 0},
        "images": all_results
    }

    for result in all_results:
        # Count by PDF
        pdf_name = result["source_pdf"]
        if pdf_name not in report["by_pdf"]:
            report["by_pdf"][pdf_name] = 0
        report["by_pdf"][pdf_name] += 1

        # Count by confidence
        confidence = result["confidence"]
        report["by_confidence"][confidence] += 1

    return report

def main():
    """Main execution"""
    print("="*60)
    print("IMAGE EXTRACTION WITH OCR AUTO-NAMING")
    print("="*60)

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"\nOutput directory: {OUTPUT_DIR}")

    # Extract images from all PDFs
    all_results = []
    for pdf_path in PDF_FILES:
        if os.path.exists(pdf_path):
            results = extract_images_from_pdf(pdf_path)
            all_results.extend(results)
        else:
            print(f"\n✗ PDF not found: {pdf_path}")

    # Generate report
    if all_results:
        report = generate_report(all_results)

        # Save report
        with open(REPORT_FILE, 'w') as f:
            json.dump(report, f, indent=2)

        # Print summary
        print(f"\n{'='*60}")
        print("EXTRACTION SUMMARY")
        print(f"{'='*60}")
        print(f"\nTotal images extracted: {report['total_images']}")
        print(f"\nBy PDF:")
        for pdf_name, count in report['by_pdf'].items():
            print(f"  {pdf_name}: {count} images")
        print(f"\nBy Confidence Level:")
        print(f"  HIGH:   {report['by_confidence']['HIGH']} (OCR text from image)")
        print(f"  MEDIUM: {report['by_confidence']['MEDIUM']} (text from page)")
        print(f"  LOW:    {report['by_confidence']['LOW']} (fallback naming)")
        print(f"\nReport saved to: {REPORT_FILE}")
        print(f"\n✓ Image extraction complete!")
    else:
        print("\n✗ No images extracted")

if __name__ == "__main__":
    main()
