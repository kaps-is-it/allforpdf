import shutil
import uuid
from pathlib import Path
from typing import Iterable

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


def cleanup_paths(paths: Iterable[Path | str | None]):
    for path in paths:
        if not path:
            continue

        target = Path(path)
        try:
            if target.is_dir():
                shutil.rmtree(target, ignore_errors=True)
            elif target.exists():
                target.unlink()
        except OSError as exc:
            print(f"Unable to remove temporary file {target}: {exc}")
