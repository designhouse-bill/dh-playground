#!/usr/bin/env python3
import subprocess
import sys

def check_tesseract():
    """Check if tesseract is already installed"""
    try:
        result = subprocess.run(['which', 'tesseract'],
                              capture_output=True,
                              text=True)
        if result.returncode == 0:
            print(f"✓ Tesseract already installed at: {result.stdout.strip()}")
            return True
        return False
    except Exception as e:
        print(f"Error checking tesseract: {e}")
        return False

def install_tesseract():
    """Install tesseract via homebrew"""
    print("Installing tesseract OCR engine via homebrew...")
    try:
        result = subprocess.run(['brew', 'install', 'tesseract'],
                              capture_output=True,
                              text=True,
                              timeout=300)

        if result.returncode == 0:
            print("✓ Tesseract installed successfully")
            print(result.stdout)
            return True
        else:
            print(f"✗ Installation failed with return code {result.returncode}")
            print(f"STDOUT: {result.stdout}")
            print(f"STDERR: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print("✗ Installation timed out after 5 minutes")
        return False
    except Exception as e:
        print(f"✗ Error during installation: {e}")
        return False

def install_python_packages():
    """Install required Python packages"""
    packages = ['PyMuPDF', 'pytesseract', 'Pillow']
    print(f"\nInstalling Python packages: {', '.join(packages)}...")

    try:
        result = subprocess.run([sys.executable, '-m', 'pip', 'install'] + packages,
                              capture_output=True,
                              text=True,
                              timeout=180)

        if result.returncode == 0:
            print("✓ Python packages installed successfully")
            return True
        else:
            print(f"✗ Package installation failed")
            print(f"STDERR: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ Error installing packages: {e}")
        return False

if __name__ == "__main__":
    print("=== OCR Dependencies Installation ===\n")

    # Check if tesseract is already installed
    if not check_tesseract():
        # Install tesseract
        if not install_tesseract():
            print("\n✗ Failed to install tesseract. Please install manually:")
            print("  brew install tesseract")
            sys.exit(1)

    # Install Python packages
    if not install_python_packages():
        print("\n✗ Failed to install Python packages")
        sys.exit(1)

    print("\n✓ All dependencies installed successfully!")
    print("Ready to proceed with image extraction.")
