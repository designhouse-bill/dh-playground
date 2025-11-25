import os

target = "/Users/billklingensmith/Desktop/Screenshot 2025-11-20 at 10.41.23 AM.png"
print(f"Checking: {target}")
print(f"Exists: {os.path.exists(target)}")
print(f"Is file: {os.path.isfile(target)}")

# List all files
desktop = "/Users/billklingensmith/Desktop/"
files = os.listdir(desktop)
screenshots = [f for f in files if 'Screenshot' in f and '10.41.23' in f]
print(f"\nMatching files:")
for f in screenshots:
    full_path = os.path.join(desktop, f)
    print(f"  {f}")
    print(f"    Full path: {full_path}")
    print(f"    Exists: {os.path.exists(full_path)}")
    print(f"    Repr: {repr(f)}")
