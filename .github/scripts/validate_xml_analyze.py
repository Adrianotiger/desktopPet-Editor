import base64
import binascii
import io
import math
import urllib.request
from pathlib import Path

from lxml import etree
from mutagen.mp3 import MP3
from PIL import Image

XML_FILE = Path("submission/animations.xml")
XSD_URL = "https://adrianotiger.github.io/desktopPet/Resources/animations.xsd"
LOG_FILE = Path("logs.txt")
ERROR_FILE = Path("errors.txt")

EXPECTED_NAMESPACE = "https://esheep.petrucci.ch/"

def report(path: Path, message: str) -> None:
    with path.open("a", encoding="utf-8") as output:
        output.write(message + "\n")

def log(message: str) -> None:
    report(LOG_FILE, message)

def error(message: str) -> None:
    report(ERROR_FILE, message)

def tag(namespace: str, name: str) -> str:
    return f"{{{namespace}}}{name}" if namespace else name

def decode_base64(node, description: str) -> bytes:
    if node is None or node.text is None:
        raise ValueError(f"{description} is missing or empty")

    # XML formatting whitespace is allowed inside base64 content.
    encoded = "".join(node.text.split())
    if not encoded:
        raise ValueError(f"{description} is empty")

    try:
        return base64.b64decode(encoded, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise ValueError(f"{description} is not valid base64: {exc}") from exc


def validate_icon(data: bytes) -> None:
    with Image.open(io.BytesIO(data)) as image:
        if image.format != "ICO":
            raise ValueError(f"expected ICO format, got {image.format}")

        # Decode the required icon entry, not just its directory metadata.
        image.ico.getimage((48, 48)).load()


def validate_png(data: bytes) -> None:
    with Image.open(io.BytesIO(data)) as image:
        if image.format != "PNG":
            raise ValueError(f"expected PNG format, got {image.format}")
        image.verify()


def validate_mp3(data: bytes) -> None:
    audio = MP3(io.BytesIO(data))
    if not math.isfinite(audio.info.length) or audio.info.length <= 0:
        raise ValueError("MP3 has no valid audio duration")


def main() -> None:
    if not XML_FILE.is_file():
        error("❌ submission/animations.xml not found.")
        return

    log("✅ animations.xml found.")

    parser = etree.XMLParser(
        resolve_entities=False,
        no_network=True,
        load_dtd=False,
        huge_tree=False,
    )

    try:
        root = etree.parse(str(XML_FILE), parser).getroot()
    except (OSError, etree.XMLSyntaxError) as exc:
        error(f"❌ Could not parse animations.xml: {exc}")
        return

    namespace = etree.QName(root).namespace or ""
    if namespace != EXPECTED_NAMESPACE:
        error(
            "❌ Unexpected XML namespace: "
            f"{namespace or '(none)'}. Expected {EXPECTED_NAMESPACE}."
        )

    # Validate against the published XSD.
    try:
        with urllib.request.urlopen(XSD_URL, timeout=30) as response:
            xsd_bytes = response.read()

        xsd_root = etree.fromstring(xsd_bytes, parser)
        schema = etree.XMLSchema(xsd_root)

        if schema.validate(root.getroottree()):
            log("✅ animations.xml matches the animations.xsd schema.")
        else:
            log("❌ animations.xml does not match the animations.xsd schema.")
            for issue in schema.error_log:
                error(f"❌ XSD line {issue.line}: {issue.message}")
    except Exception as exc:
        error(f"❌ Could not validate animations.xml against the XSD: {exc}")

    # Check the embedded icon.
    header = root.find(tag(namespace, "header"))
    icon = header.find(tag(namespace, "icon")) if header is not None else None
    try:
        validate_icon(decode_base64(icon, "Header icon"))
        log("✅ Header icon is valid base64 containing an ICO.")
    except (ValueError, OSError) as exc:
        error(f"❌ Header icon is invalid: {exc}")

    # Check the embedded sprite-sheet PNG.
    image_node = root.find(tag(namespace, "image"))
    png = image_node.find(tag(namespace, "png")) if image_node is not None else None
    try:
        validate_png(decode_base64(png, "Sprite-sheet PNG"))
        log("✅ Sprite-sheet image is valid base64 containing a PNG.")
    except (ValueError, OSError) as exc:
        error(f"❌ Sprite-sheet PNG is invalid: {exc}")

    # Require at least one spawn.
    spawns = root.find(tag(namespace, "spawns"))
    spawn_nodes = (
        spawns.findall(tag(namespace, "spawn")) if spawns is not None else []
    )
    if spawn_nodes:
        log(f"✅ Found {len(spawn_nodes)} spawn node(s).")
    else:
        error("❌ animations->spawns must contain at least one spawn node.")

    # Count animations.
    animations = root.find(tag(namespace, "animations"))
    animation_nodes = (
        animations.findall(tag(namespace, "animation"))
        if animations is not None
        else []
    )
    log(f"ℹ️ Found {len(animation_nodes)} animation node(s).")

    # Validate every sound's base64 data and MP3 content.
    sounds = root.find(tag(namespace, "sounds"))
    sound_nodes = sounds.findall(tag(namespace, "sound")) if sounds is not None else []
    log(f"ℹ️ Found {len(sound_nodes)} sound node(s).")

    for index, sound in enumerate(sound_nodes, start=1):
        sound_data_node = sound.find(tag(namespace, "base64"))
        try:
            validate_mp3(decode_base64(sound_data_node, f"Sound {index}"))
            log(f"✅ Sound {index} is valid base64 containing MP3 audio.")
        except (ValueError, OSError) as exc:
            error(f"❌ Sound {index} is invalid: {exc}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        error(f"❌ Unexpected XML validation error: {exc}")
