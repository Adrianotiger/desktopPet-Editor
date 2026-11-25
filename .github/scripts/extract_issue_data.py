import os
import re
from datetime import date

body = os.environ["ISSUE_BODY"]
action = os.environ["ACTION"]
authorName = os.environ["AUTHOR"]
authorId = os.environ["AUTHOR_ID"]

os.makedirs("submission", exist_ok=True)
LOG_FILE = "logs.txt"
ERROR_FILE = "errors.txt"
PETS_DIR = "testpets"

# Clear at every execution
flog = open(LOG_FILE, "w")
ferr = open(ERROR_FILE, "w")

fields = {
    "petname": "",
    "author": "",
    "description": "",
    "date": date.today().strftime("%Y-%m-%d")
}

if action == "NEW":
    pet = re.search(
        r'### Pet Name\s*(.*?)\s*### Author',
        body,
        re.DOTALL
    )
    
    author = re.search(
        r'### Author\s*(.*?)\s*### Description',
        body,
        re.DOTALL
    )
    
    description = re.search(
        r'### Description\s*(.*?)\s*###',
        body,
        re.DOTALL
    )
else:
    pet = re.search(
        r'### Existing Pet Name\s*(.*?)\s*### Author',
        body,
        re.DOTALL
    )
    
    author = re.search(
        r'### Author\s*(.*?)\s*### What changed',
        body,
        re.DOTALL
    )
    
    description = re.search(
        r'### What changed\?\s*(.*?)\s*### Files to Update',
        body,
        re.DOTALL
    )

daten = fields["date"]
flog.write("===================================\n")
flog.write("Workflow for pet submission (v1.0):\n")
flog.write("===================================\n")
flog.write(f"Action:{action} {daten}\n")
flog.write("-----------------------------------\n\n")

if pet:
    fields["petname"] = pet.group(1).strip()
    flog.write("✅ Pet name found\n")
else:
    flog.write("❌ Pet name invalid\n")

if author:
    flog.write("✅ Author name found\n")
    fields["author"] = author.group(1).strip()
else:
    flog.write("❌ Author name invalid\n")

petname = fields["petname"].strip()
author = fields["author"].strip()

if not 2 <= len(petname) <= 16:
    ferr.write("❌ Pet Name must be between 2 and 16 characters.\n")
if not 2 <= len(author) <= 16:
    ferr.write("❌ Author Name must be between 2 and 16 characters.\n")

if not re.fullmatch(r"[A-Za-z0-9_-]+", petname):
    ferr.write("❌ Pet Name may only contain letters, numbers, underscores (_) and hyphens (-).\n")

if description:
    fields["description"] = description.group(1).strip()

with open(os.environ["GITHUB_OUTPUT"], "a") as output:
    for key, value in fields.items():
        output.write(f"{key}={value}\n")

print("Pet Name:", fields["petname"])
print("Author:", fields["author"])
print("Date:", fields["date"])

if os.path.exists(PETS_DIR):
    existing_pets = [
        d for d in os.listdir(PETS_DIR)
        if os.path.isdir(os.path.join(PETS_DIR, d))
    ]

    if action == "NEW":
        if petname in existing_pets:
            ferr.write(f"❌ Pet {petname} is already present in the gallery.\n")
        else:
            flog.write(f"✅ Pet {petname} is a new pet (not present in gallery)\n")
    else:
        if petname in existing_pets:
            flog.write(f"✅ Pet {petname} is present in the gallery\n")
        else:
            ferr.write(f"❌ Pet {petname} was not found in the gallery.\n")
            

flog.close()
ferr.close()
