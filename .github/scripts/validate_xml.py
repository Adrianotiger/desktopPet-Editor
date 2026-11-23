import os
import sys

XML_FILE = "submission/animations.xml"
LOG_FILE = "logs.txt"
ERROR_FILE = "errors.txt"

flog = open(LOG_FILE, "w")
ferr = open(ERROR_FILE, "w")

# File must exist and be named exactly README.md
if not os.path.exists(XML_FILE):
    flog.write("❌ animations.xml not found.\n")
    ferr.write("❌ animations.xml not found.\n")
else:
    flog.write("✅ animations.xml found.\n")
    try:
        with open(XML_FILE, "r", encoding="utf-8") as f:
            content = f.read()
    
        character_count = len(content.strip())
    
        if character_count < 100:
            ferr.write("❌ animations.xmlcontains only {character_count} characters. At least 100 characters are required.")
    
    except Exception as ex:
        ferr.write("❌ Failed to read animations.xml: {ex}")
        flog.write("❌ animations.xml has errors.\n")

flog.close()
ferr.close()
