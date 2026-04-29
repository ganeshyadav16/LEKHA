from __future__ import annotations

from contextlib import contextmanager

from app.utils.db import get_session, remove_session


@contextmanager
def atomic_session():
    session = get_session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
        remove_session()
