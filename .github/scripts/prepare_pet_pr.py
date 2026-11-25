import json
import os
import re
import shutil
from pathlib import Path


pet_name = os.environ["PET_NAME"].strip()
author = os.environ["PET_AUTHOR"].strip()
pet_date = os.environ["PET_DATE"].strip()

if not re.fullmatch(r"[A-Za-z0-9_-]{2,16}", pet_name):
    raise SystemExit("Invalid pet name")

submission = Path("submission")
destination = Path("testpets") / pet_name
manifest_path = Path("testpets/pets.json")

if not submission.is_dir() or not any(submission.iterdir()):
    raise SystemExit("No submitted files found")

if destination.exists():
    raise SystemExit("Pet folder already exists")

manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
pets = manifest.setdefault("pets", [])

if any(pet.get("folder") == pet_name for pet in pets):
    raise SystemExit("Pet is already listed")

shutil.copytree(submission, destination)

pets.append({
    "folder": pet_name,
    "author": author,
    "lastupdate": pet_date,
})

manifest_path.write_text(
    json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
    encoding="utf-8",
)
