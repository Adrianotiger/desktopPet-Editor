import os
import re
from pathlib import Path
from lxml import etree

SUBMITTED_XML = Path("submission/animations.xml")
PETS_DIR = Path(os.environ["PETS_DIR"])
PET_NAME = os.environ["PET_NAME"].strip()
CURRENT_XML = PETS_DIR / PET_NAME / "animations.xml"

LOG_FILE = Path("logs.txt")
ERROR_FILE = Path("errors.txt")

flog = path.open(LOG_FILE, "a")
ferr = path.open(ERROR_FILE, "a")

def read_header(xml_path: Path, label: str) -> tuple[str, str]:
    if not xml_path.is_file():
        flog.write("❌ Compare failed\n")
        ferr.write(f"❌ animations.xml not found in {xml_path}.\n")
        raise ValueError(f"{label} animations.xml was not found: {xml_path}")

    parser = etree.XMLParser(
        resolve_entities=False,
        no_network=True,
        load_dtd=False,
    )
    root = etree.parse(str(xml_path), parser).getroot()

    header = root.xpath("./*[local-name()='header']")
    if not header:
        ferr.write("❌ animations.xml has no header element.\n")
        raise ValueError(f"{label} animations.xml has no header element")

    def get_value(field: str) -> str:
        nodes = header[0].xpath(f"./*[local-name()='{field}']")
        if not nodes or nodes[0].text is None:
            ferr.write("❌ animations.xml missing node in header.\n")
            raise ValueError(
                f"{label} animations.xml is missing header/{field}"
            )
        value = nodes[0].text.strip()
        if not value:
            ferr.write("❌ animations.xml is missing node in header.\n")
            raise ValueError(
                f"{label} animations.xml has an empty header/{field}"
            )
        return value

    return get_value("author"), get_value("version")


def parse_version(value: str, label: str) -> tuple[int, ...]:
    if not re.fullmatch(r"\d+(?:\.\d+)*", value):
        ferr.write(f"❌ animations version ({value}) is not a numeric dot-separated version.\n")
        raise ValueError(
            f"{label} version '{value}' is not a numeric dot-separated version"
        )
    return tuple(int(part) for part in value.split("."))


try:
    submitted_author, submitted_version = read_header(
        SUBMITTED_XML,
        "Submitted",
    )
    current_author, current_version = read_header(
        CURRENT_XML,
        "Current",
    )

    if submitted_author != current_author:
        flog.write("❌ Author does not matches to the original animation.\n")
        ferr.write(f"❌ (Author '{current_author}' expected, '{submitted_author}' submitted).")
    else:
        flog.write("✅ Author is the same ({current_author}).")

    submitted_parts = parse_version(submitted_version, "Submitted")
    current_parts = parse_version(current_version, "Current")

    if submitted_parts <= current_parts:
        flog.write("❌ Version must be bigger than the original.\n")
        ferr.write(f"❌ version ({current_version}); submitted version is {submitted_version}")
    else:
        flog.write("✅ Version updated {current_version} => {submitted_version}")
      
except (OSError, etree.XMLSyntaxError, ValueError) as exc:
    ferr.write(f"❌ Could not compare pet XML metadata: {exc}")
