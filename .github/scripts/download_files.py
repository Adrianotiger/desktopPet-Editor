import os
import re
import requests

body = os.environ["ISSUE_BODY"]

# Find all URLS on GitHub
urls = re.findall(
    r'https://github\.com/user-attachments/[^\s")>]+',
    body
)

# Temp folder
target_dir = "submission"
os.makedirs(target_dir, exist_ok=True)

for url in urls:
    filename = url.split("/")[-1]
    if "assets" in url:
        filename = "icon.png"

    filepath = os.path.join(target_dir, filename)

    print(f"Downloading {url}")
    response = requests.get(url, allow_redirects=True)
    response.raise_for_status()

    with open(filepath, "wb") as f:
        f.write(response.content)

    print(f"Saved {filepath}")

print("\nDownloaded files:")
for file in os.listdir(target_dir):
    print(f"- {file}")
