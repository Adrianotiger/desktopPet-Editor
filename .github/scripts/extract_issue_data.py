import os
import re

body = os.environ["ISSUE_BODY"]

fields = {
    "petname": "",
    "author": "",
    "description": "",
    "date": date.today().strftime("%Y-%m-%d")
}

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

if pet:
    fields["petname"] = pet.group(1).strip()

if author:
    fields["author"] = author.group(1).strip()

if description:
    fields["description"] = description.group(1).strip()

with open(os.environ["GITHUB_OUTPUT"], "a") as output:
    for key, value in fields.items():
        output.write(f"{key}={value}\n")

print("Pet Name:", fields["petname"])
print("Author:", fields["author"])
print("Date:", fields["date"])
