#!/usr/bin/env python3
"""
Interactive script to rename product images based on visual identification
Brand_ProductName_OriginalFilename.ext
"""
import os
import shutil
from pathlib import Path

# Directory containing the images
IMAGE_DIR = "/Users/billklingensmith/Desktop/superior-stuff/product_images"

# Mapping of original filename to new name
# Format: "original_name": "Brand_ProductName"
RENAME_MAP = {
    "large_00551934-83ec-411a-b9fb-09eae2f058e4.png": "Maruchan_RamenNoodleSoupChicken",
    "large_016950c4-2ca7-4610-a7b0-5a4ece2589ba.png": "EssentialEveryday_TomatoKetchup",
    "large_0816ecf0-cd3f-4c08-9ec4-a4a81976cfda.png": "EssentialEveryday_Spaghetti",
    "large_0e9eedf1-9507-463c-a4c3-c247a5d3e4d4.png": "EssentialEveryday_WhippedCreamCheese",
    "large_11796700-80f0-4580-8f3d-3f3dcdd3829c.png": "EssentialEveryday_MacaroniAndCheese",
    "large_119df319-7472-433f-8001-93612874801e.png": "EssentialEveryday_100PercentAppleJuice",
    "large_14b5d5ca-9195-4a59-8e33-5fd1c78a2039.jpg": "FreshChicken_Drumsticks",
    "large_160df7cd-11c7-4297-8882-1dcf54dc64be.jpg": "DietCoke_2Liter",
    "large_16baeba6-ec4f-4612-8342-a82649734555.png": "Maruchan_RamenNoodleSoupLimeChiliShrimp",
    "large_19c3da74-3ac6-4608-8b33-b6883960935b.png": "Tide_SimplyAllInOneDaybreakFresh89Loads",
    "large_2b855144-e47e-468b-8c83-e318376f5f2c.jpg": "CocaCola_ZeroSugar2Liter",
    "large_2cb5d1a6-f7b1-4196-a285-cd34c71bfd80.jpg": "Guerrero_SonoraStyleSoftTacos20ct",
    "large_354ad146-6d1b-47f9-85d9-49016a0000df.png": "EssentialEveryday_PeachSlices",
    "large_398aeebe-7abd-471c-894a-c2e5e9b5d099.png": "Tide_SimplyFreeSensitive89Loads",
    "large_41d8e3f6-f23b-44d2-bd9c-48b75befa44d.jpg": "Superior_CornTortillas80ct",
    "large_433aa566-299d-4842-99ee-31d5fd83055d.png": "EssentialEveryday_Mayonnaise",
    "large_43dd9fba-2992-4e49-aa4b-6c3b5e32a673.jpg": "CocaCola_Cherry2Liter",
    "large_5ed5531b-9db3-4ac0-84dc-c6806e0f43ef.jpg": "Guerrero_CornTortillas80ct",
    "large_611f658d-b166-4e7f-a9ab-d67ce63db9ba.png": "BarS_NaturallyHardwoodSmokedBacon12oz",
    "large_63594c46-8d15-4ca5-bcde-45a389d7e89c.png": "EssentialEveryday_AllPurposeFlour5lb",
    "large_635ca600-168b-42f1-906e-3149509a8ba0.jpg": "Nescafe_Clasico150Cups",
    "large_66a21ff4-7055-4178-a532-19ab3b6374cf.jpg": "CocaCola_Original2Liter",
    "large_6d19a231-3084-439a-815e-be0288373a03.png": "LosAltos_QuesoFrescoDelRancho",
    "large_7431ae5d-60a7-4998-9cc1-73545f11ada3.png": "123_VegetableOil",
    "large_7d0ccc22-12d8-4c8d-9c19-5571fe92f03e.jpg": "RussetPotatoes",
    "large_84c9d52a-11de-4fbe-9b68-eece1c1ad5ed.png": "Maruchan_RamenNoodleSoupBeef",
    "large_8d86f790-9af8-4a1d-bfcd-5e89c20009c1.png": "EssentialEveryday_Linguine",
    "large_968d6035-805a-4f07-8e81-9bcf20a73713.jpg": "FreshBeef_Steak",
    "large_96d2168a-620c-4af2-bfd9-a3bddcda7b6b.jpg": "CoorsLight_12Pack12oz",
    "large_96f3c653-6a40-4fe7-8c04-3ce1339e3e7e.png": "Tide_SimplyAllInOneRefreshingBreeze89Loads",
    "large_9a33d2c5-1a8e-4ebd-8c46-64f75646cd46.jpg": "LosAltos_QuesoFresco10oz",
    "large_9b05c8f4-7e57-43a9-a93d-833cde62020d.jpg": "LosAltos_QuesoFresco1lb",
    "large_a545c59c-d986-4189-b3c9-c6f6a9958f6f.jpeg": "EssentialEveryday_AngelHairPasta",
    "large_a545c59c-d986-4189-b3c9-c6f6a9958f6f.png": "EssentialEveryday_AngelHairPasta",
    "large_a5ba6be8-00b8-4ca3-ae13-61d7d7568f09.jpg": "BudLight_12Pack12oz",
    "large_b3e6ae0b-8155-4597-adec-199005c09c19.png": "EssentialEveryday_FruitCocktail",
    "large_b8d11164-50d3-4caa-ad7a-8667c6b936e9.jpg": "MillerLite_12Pack12oz",
    "large_b8deed89-4d73-4bc1-9426-20642c0404a8.png": "Anthonys_PennePasta",
    "large_cf0d165c-37cc-4e3b-8099-633ead9e5e60.jpg": "Nestle_CarnationEvaporatedMilk",
    "large_d2a762a5-db17-4d8e-9115-b3137bce03fe.jpg": "LosAltos_QuesoRequeson16oz",
    "large_d5adc55e-1f2d-48c3-81e3-b5f5ca6933e3.png": "Tide_SimplyOxiStain74Loads",
    "large_eb292413-3f55-4d0d-b32a-cb98dfa5a23d.jpg": "Sprite_LemonLime2Liter",
    "large_ed03fbed-7cc0-48b1-a3e8-decaa6513178.png": "LargeMango",
    "large_fe35393a-1c30-47db-bec1-e948103cd864.jpg": "Niagara_DrinkingWater24Pack",
    "large_ffc0885e-b219-48a4-8fc7-e8a050dee9b7.jpg": "EssentialEveryday_ThinSpaghetti",
}

def rename_files(dry_run=True):
    """Rename files according to the map"""
    image_dir = Path(IMAGE_DIR)

    if not image_dir.exists():
        print(f"Error: Directory {IMAGE_DIR} does not exist")
        return

    renamed_count = 0

    for old_filename, new_base_name in RENAME_MAP.items():
        old_path = image_dir / old_filename

        if not old_path.exists():
            print(f"Warning: {old_filename} not found, skipping")
            continue

        # Get file extension
        ext = old_path.suffix

        # Create new filename: Brand_ProductName_OriginalFilename.ext
        new_filename = f"{new_base_name}_{old_filename}"
        new_path = image_dir / new_filename

        if dry_run:
            print(f"Would rename:\n  {old_filename}\n  -> {new_filename}\n")
        else:
            shutil.move(str(old_path), str(new_path))
            print(f"Renamed:\n  {old_filename}\n  -> {new_filename}\n")
            renamed_count += 1

    if dry_run:
        print(f"\n=== DRY RUN COMPLETE ===")
        print(f"Would rename {len(RENAME_MAP)} files")
        print("Run with dry_run=False to actually rename files")
    else:
        print(f"\n=== COMPLETE ===")
        print(f"Successfully renamed {renamed_count} files")

if __name__ == "__main__":
    # Actually rename the files
    print("=== ACTUAL RENAME ===\n")
    rename_files(dry_run=False)
