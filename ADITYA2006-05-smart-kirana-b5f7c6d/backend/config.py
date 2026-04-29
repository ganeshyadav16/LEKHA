from __future__ import annotations

import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent


def _as_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def _default_db_url() -> str:
    return f"sqlite:///{(BASE_DIR / 'kirana.db').as_posix()}"


class Settings:
    APP_NAME = "Voice-Based Kirana Shop Assistant"
    ENV = os.getenv("APP_ENV", "development")
    DEBUG = _as_bool(os.getenv("APP_DEBUG"), default=False)

    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
    DATABASE_URL = os.getenv("DATABASE_URL", _default_db_url())
    SQL_ECHO = _as_bool(os.getenv("SQL_ECHO"), default=False)

    AUTH_REQUIRED = _as_bool(os.getenv("AUTH_REQUIRED"), default=False)
    TOKEN_TTL_SECONDS = int(os.getenv("TOKEN_TTL_SECONDS", "86400"))
    DEFAULT_ADMIN_USERNAME = os.getenv("DEFAULT_ADMIN_USERNAME", "admin")
    DEFAULT_ADMIN_PASSWORD = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")

    LOW_STOCK_THRESHOLD = int(os.getenv("LOW_STOCK_THRESHOLD", "10"))

    REMOTE_SYNC_URL = os.getenv("REMOTE_SYNC_URL", "").strip() or None

    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
