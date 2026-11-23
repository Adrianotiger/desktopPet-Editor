import os
import sys

README_FILE = "submission/README.md"
LOG_FILE = "logs.txt"
ERROR_FILE = "errors.txt"

flog = open(LOG_FILE, "a")
ferr = open(ERROR_FILE, "a")

# File must exist and be named exactly README.md
if not os.path.exists(README_FILE):
    flog.write("❌ README.md not found.\n")
    ferr.write("❌ README.md not found.\n")
else:
    flog.write("✅ README.md found.\n")
    try:
        with open(README_FILE, "r", encoding="utf-8") as f:
            content = f.read()
    
        character_count = len(content.strip())
    
        if character_count < 100:
            ferr.write("❌ README.md contains only {character_count} characters. At least 100 characters are required.")
    
    except Exception as ex:
        ferr.write("❌ Failed to read README.md: {ex}")
        flog.write("❌ README.md has errors.\n")

flog.close()
ferr.close()
