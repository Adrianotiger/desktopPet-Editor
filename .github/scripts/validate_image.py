import os
import sys
from PIL import Image

IMAGE_FILE = "submission/icon.png"
LOG_FILE = "logs.txt"
ERROR_FILE = "errors.txt"

flog = open(LOG_FILE, "w")
ferr = open(ERROR_FILE, "w")

if not os.path.exists(IMAGE_FILE):
    flog.write("❌ Image error\n")
    ferr.write("❌ Image does not exists\n")
else:
    flog.write("✅ Image found\n")
    try:
        with Image.open(IMAGE_FILE) as img:
            if img.format != "PNG":
                ferr.write("❌ Invalid image format: {img.format}. Expected PNG.\n")
    
            width, height = img.size
    
            if width != 48 or height != 48:
                ferr.write("❌ Invalid image size: {width}x{height}. Expected 48x48.\n");
    
    except Exception as ex:
        flog.write("❌ Image invalid\n")
        ferr.write("❌ Failed to read image: {ex}.\n");

flog.close();
ferr.close();
