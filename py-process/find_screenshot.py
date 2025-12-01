import os
import glob

desktop = "/Users/billklingensmith/Desktop/"
screenshots = glob.glob(os.path.join(desktop, "*Screenshot*.png"))

for s in screenshots:
    print(s)
