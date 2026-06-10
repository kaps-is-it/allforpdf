import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
TEMP_DIR = Path(os.getenv("CONVERTI_TEMP_DIR", BASE_DIR / "temp_conversions"))
FRONTEND_DIST_DIR = Path(os.getenv("CONVERTI_FRONTEND_DIST", BASE_DIR.parent / "frontend" / "dist"))


def get_cors_origins():
    raw_origins = os.getenv("CONVERTI_CORS_ORIGINS", "")
    if raw_origins.strip():
        return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

    environment = os.getenv("CONVERTI_ENV", "development").lower()
    if environment == "production":
        return []

    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

