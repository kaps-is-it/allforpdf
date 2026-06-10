import shutil
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.core.config import TEMP_DIR


def ensure_temp_dir():
    TEMP_DIR.mkdir(parents=True, exist_ok=True)


def make_temp_path(extension):
    ensure_temp_dir()
    normalized = extension if extension.startswith(".") else f".{extension}"
    return TEMP_DIR / f"{uuid.uuid4()}{normalized}"


def save_upload(file: UploadFile, destination: Path):
    ensure_temp_dir()
    with open(destination, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return destination

