import json
import os
from urllib.request import Request, urlopen

owner_repo = os.environ["GITHUB_REPOSITORY"]
issue_number = os.environ["ISSUE_NUMBER"]
pet_name = os.environ.get("PET_NAME") or "Unknown"
author = os.environ.get("AUTHOR") or "Unknown"
date = os.environ.get("DATE") or "Unknown"
logs = os.environ.get("LOGS", "")
errors = os.environ.get("ERRORS", "")
success = os.environ.get("SUCCESS") == "true"

status = "✅ Validation successful" if success else "❌ Validation failed"

body = f"""{status}

Pet Name: **{pet_name}**
Author: **{author}**
Dagte: **{date}**

## Logs  

```text
{logs}
```

"""

if not success:
    body += f"""
    
    ## Errors  
    
    ```text
    {errors}
    ```
    
    """

url = f"https://api.github.com/repos/{owner_repo}/issues/{issue_number}/comments"
request = Request(
    url,
    data=json.dumps({"body": body}).encode("utf-8"),
    headers={
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {os.environ['GITHUB_TOKEN']}",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "desktopPet-Editor-validation",
    },
    method="POST",
)

with urlopen(request) as response:
    if response.status != 201:
        raise RuntimeError(f"GitHub API returned HTTP {response.status}")
