import os
import uuid
from pathlib import Path

LOG_FILE = Path("logs.txt")
ERROR_FILE = Path("errors.txt")

def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""


def write_output(output, name: str, value: str) -> None:
    delimiter = f"GH_OUTPUT_{uuid.uuid4().hex}"
    output.write(f"{name}<<{delimiter}\n")
    output.write(value)
    if not value.endswith("\n"):
        output.write("\n")
    output.write(f"{delimiter}\n")


logs = read_text(LOG_FILE)
errors = read_text(ERROR_FILE)

with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as output:
    write_output(output, "logs", logs)
    write_output(output, "errors", errors)
    output.write(f"success={'false' if errors else 'true'}\n")
