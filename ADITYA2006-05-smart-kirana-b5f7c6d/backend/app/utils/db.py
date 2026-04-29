from __future__ import annotations

from pathlib import Path
from typing import Optional

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, scoped_session, sessionmaker

from app.models import Base


_ENGINE: Optional[Engine] = None
SessionLocal = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, expire_on_commit=False)
)


def _normalize_database_url(database_url: str) -> str:
    if not database_url.startswith("sqlite:///"):
        return database_url

    path_str = database_url.replace("sqlite:///", "", 1)
    db_path = Path(path_str)
    if not db_path.is_absolute():
        db_path = Path.cwd() / db_path
    db_path.parent.mkdir(parents=True, exist_ok=True)
    return f"sqlite:///{db_path.as_posix()}"


def init_db(database_url: str, echo: bool = False) -> Engine:
    global _ENGINE

    normalized_url = _normalize_database_url(database_url)
    connect_args = {"check_same_thread": False} if normalized_url.startswith("sqlite") else {}

    _ENGINE = create_engine(
        normalized_url,
        echo=echo,
        connect_args=connect_args,
        pool_pre_ping=True,
        future=True,
    )
    SessionLocal.configure(bind=_ENGINE)
    Base.metadata.create_all(bind=_ENGINE)
    return _ENGINE


def get_session() -> Session:
    return SessionLocal()


def remove_session() -> None:
    SessionLocal.remove()


def get_engine() -> Engine:
    if _ENGINE is None:
        raise RuntimeError("Database engine is not initialized")
    return _ENGINE
