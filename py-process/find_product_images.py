#!/usr/bin/env python3
"""
Product Image Finder for Superior Grocers
Scrapes product images from web sources including Syndigo, OneWorldSync, and Google Images
"""

import csv
import os
import re
import time
import shutil
from pathlib import Path
from urllib.parse import quote_plus, urljoin
import requests
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO
import pandas as pd

# Configuration
CSV_PATH = "/Users/billklingensmith/Desktop/superior-stuff/DEMO-superior-spreadsheet-circular-extract.csv"
OUTPUT_DIR = "/Users/billklingensmith/Desktop/superior-stuff/product_images"
REPORT_PATH = "/Users/billklingensmith/Desktop/superior-stuff/image_search_report.txt"
BACKUP_CSV = "/Users/billklingensmith/Desktop/superior-stuff/DEMO-superior-spreadsheet-circular-extract.csv.backup"

# Headers to mimic browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
}

def clean_product_name(name):
    """Clean product name for search queries"""
    if not name:
        return ""

    # Remove text in parentheses (Spanish translations)
    name = re.sub(r'\([^)]*\)', '', name)

    # Remove size indicators like "32 oz", "10 lb. bag", etc.
    name = re.sub(r'\d+(\.\d+)?\s*(oz|lb|liter|ml|count|pack|ct)\.?', '', name, flags=re.IGNORECASE)

    # Remove special offers like "2 for $5", "4 for $5"
    name = re.sub(r'\d+\s*for\s*\$\d+', '', name, flags=re.IGNORECASE)

    # Remove extra whitespace and special characters
    name = re.sub(r'[,/]', ' ', name)
    name = re.sub(r'\s+', ' ', name)

    return name.strip()

def slugify(text):
    """Convert text to filename-safe slug"""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '_', text)
    return text[:50]  # Limit length

def validate_image(image_data):
    """Validate image data meets requirements"""
    try:
        img = Image.open(BytesIO(image_data))

        # Check size
        if img.width < 200 or img.height < 200:
            return False

        # Check format
        if img.format not in ['JPEG', 'PNG']:
            return False

        # Check file size
        if len(image_data) > 5 * 1024 * 1024:  # 5MB
            return False

        return True
    except Exception as e:
        print(f"  Image validation error: {e}")
        return False

def download_image(url, output_path):
    """Download and save image from URL"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()

        if validate_image(response.content):
            with open(output_path, 'wb') as f:
                f.write(response.content)
            return True
        else:
            print(f"  Image validation failed for {url}")
            return False
    except Exception as e:
        print(f"  Download error: {e}")
        return False

def search_google_images(query, max_results=3):
    """Search Google Images and return image URLs"""
    print(f"  Searching Google Images for: {query}")

    try:
        search_url = f"https://www.google.com/search?q={quote_plus(query)}&tbm=isch"
        response = requests.get(search_url, headers=HEADERS, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract image URLs from various possible locations
        image_urls = []

        # Method 1: Look for img tags
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src')
            if src and src.startswith('http') and 'gstatic' not in src:
                image_urls.append(src)
                if len(image_urls) >= max_results:
                    break

        # Method 2: Look in script tags for image data
        if len(image_urls) < max_results:
            scripts = soup.find_all('script')
            for script in scripts:
                if script.string and 'https://' in str(script.string):
                    # Extract URLs from JavaScript
                    urls = re.findall(r'https://[^"\'\\]+\.(?:jpg|jpeg|png|webp)', str(script.string))
                    for url in urls:
                        if 'gstatic' not in url and url not in image_urls:
                            image_urls.append(url)
                            if len(image_urls) >= max_results:
                                break
                if len(image_urls) >= max_results:
                    break

        return image_urls[:max_results]

    except Exception as e:
        print(f"  Google Images search error: {e}")
        return []

def search_syndigo(query):
    """Attempt to search Syndigo (placeholder - would need actual API)"""
    # Note: Syndigo typically requires authentication/API access
    # This is a placeholder that searches their public site
    print(f"  Searching Syndigo for: {query}")

    try:
        # Try a general product search
        search_url = f"https://www.google.com/search?q=site:syndigo.com+{quote_plus(query)}+product"
        response = requests.get(search_url, headers=HEADERS, timeout=10)

        # In a real implementation, would parse Syndigo results
        # For now, return empty to fall through to other methods
        return []
    except Exception as e:
        print(f"  Syndigo search error: {e}")
        return []

def search_oneworldsync(query):
    """Attempt to search OneWorldSync (placeholder - would need actual API)"""
    # Note: OneWorldSync typically requires authentication/API access
    print(f"  Searching OneWorldSync for: {query}")

    try:
        # Try a general product search
        search_url = f"https://www.google.com/search?q=site:1worldsync.com+{quote_plus(query)}+product"
        response = requests.get(search_url, headers=HEADERS, timeout=10)

        # In a real implementation, would parse OneWorldSync results
        # For now, return empty to fall through to other methods
        return []
    except Exception as e:
        print(f"  OneWorldSync search error: {e}")
        return []

def find_product_image(product_id, product_name, output_dir):
    """Find and download product image using multiple sources"""

    cleaned_name = clean_product_name(product_name)
    if not cleaned_name:
        print(f"✗ {product_id}: Empty product name after cleaning")
        return None

    print(f"\n🔍 {product_id}: {product_name}")
    print(f"  Cleaned query: {cleaned_name}")

    # Create filename
    slug = slugify(cleaned_name)
    filename = f"{product_id}_{slug}.jpg"
    output_path = os.path.join(output_dir, filename)

    # Try different search methods
    image_urls = []

    # 1. Try Syndigo
    syndigo_urls = search_syndigo(cleaned_name)
    image_urls.extend(syndigo_urls)
    time.sleep(1)

    # 2. Try OneWorldSync
    if not image_urls:
        ows_urls = search_oneworldsync(cleaned_name)
        image_urls.extend(ows_urls)
        time.sleep(1)

    # 3. Try Google Images with product-specific query
    if not image_urls:
        google_query = f"{cleaned_name} product package"
        image_urls = search_google_images(google_query, max_results=3)
        time.sleep(2)

    # Try to download images
    for i, url in enumerate(image_urls):
        print(f"  Attempting download {i+1}/{len(image_urls)}: {url[:60]}...")
        if download_image(url, output_path):
            print(f"✓ Successfully downloaded image for {product_id}")
            return f"product_images/{filename}"
        time.sleep(1)

    print(f"✗ Failed to find valid image for {product_id}")
    return None

def read_csv(csv_path):
    """Read CSV and return products"""
    products = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = list(reader)

        for i, row in enumerate(rows):
            if i < 2:  # Skip header rows
                continue

            if len(row) > 10:
                product_id = row[0]
                title = row[10]  # Column K

                # Skip section headers (rows without prices)
                if not row[15]:  # No price
                    continue

                products.append({
                    'row_index': i,
                    'id': product_id,
                    'title': title,
                    'row': row
                })

    return products, rows

def update_csv(csv_path, rows, updates):
    """Update CSV with image paths"""
    for row_index, image_path in updates.items():
        if len(rows[row_index]) > 8:
            rows[row_index][8] = image_path  # Column I

    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(rows)

def generate_report(products, successful, failed, report_path):
    """Generate search report"""
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("=== Product Image Search Report ===\n")
        f.write(f"Date: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Total Products: {len(products)}\n")
        f.write(f"Successfully Found: {len(successful)}\n")
        f.write(f"Failed: {len(failed)}\n\n")

        f.write("SUCCESSFUL:\n")
        for product_id, title, image_path in successful:
            f.write(f"✓ {product_id}: {title} → {image_path}\n")

        f.write("\n\nFAILED:\n")
        for product_id, title in failed:
            f.write(f"✗ {product_id}: {title}\n")

def main():
    print("=== Product Image Finder ===\n")

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Output directory: {OUTPUT_DIR}\n")

    # Backup CSV
    if os.path.exists(CSV_PATH):
        shutil.copy2(CSV_PATH, BACKUP_CSV)
        print(f"Created backup: {BACKUP_CSV}\n")

    # Read CSV
    print("Reading CSV...")
    products, rows = read_csv(CSV_PATH)
    print(f"Found {len(products)} products to process\n")

    # Process each product
    successful = []
    failed = []
    updates = {}

    for product in products:
        image_path = find_product_image(
            product['id'],
            product['title'],
            OUTPUT_DIR
        )

        if image_path:
            successful.append((product['id'], product['title'], image_path))
            updates[product['row_index']] = image_path
        else:
            failed.append((product['id'], product['title']))

        # Be respectful with requests
        time.sleep(2)

    # Update CSV
    print("\n\nUpdating CSV...")
    update_csv(CSV_PATH, rows, updates)
    print(f"CSV updated: {CSV_PATH}")

    # Generate report
    print("Generating report...")
    generate_report(products, successful, failed, REPORT_PATH)
    print(f"Report saved: {REPORT_PATH}")

    # Print summary
    print("\n=== Summary ===")
    print(f"Total: {len(products)}")
    print(f"✓ Success: {len(successful)}")
    print(f"✗ Failed: {len(failed)}")
    print(f"\nImages saved to: {OUTPUT_DIR}")
    print(f"Report: {REPORT_PATH}")
    print(f"CSV backup: {BACKUP_CSV}")

if __name__ == "__main__":
    main()
