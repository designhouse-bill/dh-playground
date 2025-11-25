#!/usr/bin/env python3
"""
Add Essential Everyday products from screenshot to existing Superior CSV
"""
import csv
from pathlib import Path

# Input/Output
INPUT_CSV = "/Users/billklingensmith/Desktop/superior-stuff/superior-spreadsheet-circular-extract.csv"
OUTPUT_CSV = "/Users/billklingensmith/Desktop/superior-stuff/superior-spreadsheet-circular-extract.csv"

# Read existing CSV to find last ID
def get_last_id():
    with open(INPUT_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        last_id = 1000
        for row in reader:
            if row['id']:
                last_id = max(last_id, int(row['id']))
        return last_id

# Essential Everyday products from screenshot
# Format: (type, title, price, units, description, dates_ref, length, height, quantity)
ESSENTIAL_EVERYDAY_PRODUCTS = [
    ('C', 'Essential Everyday', '', '', '', '', '', '', ''),
    ('P', 'Essential Everyday Macaroni & Cheese Dinner', '1.29', '', '7.25 oz.', '', '3', '2', ''),
    ('P', 'Essential Everyday Spaghetti or Pasta', '1.99', 'lb.', '1 lb.', '', '3', '2', ''),
    ('P', 'Essential Everyday Cat Food', '1.99', '', 'Selected Varieties, 22 oz.', '', '3', '2', ''),
    ('P', 'Essential Everyday Flour', '2.39', '', 'All Purpose or Self Rising, 5 lb.', '', '3', '2', ''),
    ('P', 'Essential Everyday Ketchup', '2.39', '', '38 oz.', '', '3', '2', '3 for $5'),
    ('P', 'Essential Everyday Mayonnaise, Ranch or Sandwich Spread', '2.49', '', 'Selected Varieties, 30 oz.', '', '3', '2', ''),
    ('P', 'Essential Everyday Cream Cheese', '2.49', 'EA.', '8 oz.', '', '3', '2', ''),
    ('P', 'Essential Everyday Fruit Cocktail or Peaches', '2.79', '', 'Selected Varieties, 29 oz.', '', '3', '2', ''),
    ('P', 'Essential Everyday Water', '3.99', '', '35 Pack, 16.9 oz.', '', '3', '2', ''),
    ('P', 'Essential Everyday Juice', '4.49', '', '64 oz.', '', '3', '2', ''),
    ('P', 'Essential Everyday Pasta', '4.00', '', 'Selected Varieties, 12-16 oz.', '', '3', '2', '4 for $5'),
]

DATES = "Offer valid from Nov. 12 - Nov. 18, 2024."
CATEGORY = "Essential Everyday"

def generate_csv():
    # Read all existing rows
    existing_rows = []
    with open(INPUT_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            existing_rows.append(row)

    # Get starting ID
    current_id = get_last_id() + 1

    # Prepare new rows
    new_rows = []

    for item in ESSENTIAL_EVERYDAY_PRODUCTS:
        item_type, title, price, units, description, dates_ref, length, height, quantity = item

        if item_type == 'C':
            # Category header
            row = {
                'id': current_id,
                'parent_Id': '',
                'length_not_required': length,
                'height_not_required': height,
                'media_size_not_required': 'full',
                'card_style_not_required': '',
                'PDF': '',
                'icons': '',
                'Image (UPC/Key Word/File Name)': '',
                'upc': '',
                'Title (if different from UPC standard)': title,
                'description only': '',
                'dates': '',
                'Description (not required)': '',
                'Quantity (not required)': '',
                'Price': '',
                'Units (not required)': '',
                'coupon_amount_off': '',
                'coupon_quantity': '',
                'coupon_limit': '',
                'Link (not required)': '',
                'Category (not required)': title,
                'End Date': '',
                'Video URL': '',
                'source_file_name': ''
            }
        else:
            # Product
            full_description = f"{description} | {DATES}" if description else DATES

            row = {
                'id': current_id,
                'parent_Id': '',
                'length_not_required': length,
                'height_not_required': height,
                'media_size_not_required': 'full',
                'card_style_not_required': 'default',
                'PDF': '',
                'icons': '',
                'Image (UPC/Key Word/File Name)': '',
                'upc': '',
                'Title (if different from UPC standard)': title,
                'description only': description,
                'dates': DATES,
                'Description (not required)': full_description,
                'Quantity (not required)': quantity,
                'Price': price,
                'Units (not required)': units,
                'coupon_amount_off': '',
                'coupon_quantity': '',
                'coupon_limit': '',
                'Link (not required)': '',
                'Category (not required)': CATEGORY,
                'End Date': '',
                'Video URL': '',
                'source_file_name': ''
            }

        new_rows.append(row)
        current_id += 1

    # Write combined CSV
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(existing_rows)
        writer.writerows(new_rows)

    print(f"✓ Added {len(new_rows)} Essential Everyday items to CSV")
    print(f"  - 1 category header")
    print(f"  - {len(new_rows) - 1} products")
    print(f"  - New ID range: {get_last_id() + 1} to {current_id - 1}")
    print(f"  - Total rows now: {len(existing_rows) + len(new_rows)}")
    print(f"\n✓ Updated CSV: {OUTPUT_CSV}")

if __name__ == "__main__":
    generate_csv()
