from __future__ import annotations

from functools import wraps

from flask import current_app, g, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from app.utils.errors import APIError


def _serializer() -> URLSafeTimedSerializer:
    key = current_app.config["SECRET_KEY"]
    return URLSafeTimedSerializer(key, salt="kirana-auth")


def issue_token(user_id: int, username: str) -> str:
    return _serializer().dumps({"user_id": user_id, "username": username})


def decode_token(token: str):
    try:
        return _serializer().loads(token, max_age=current_app.config["TOKEN_TTL_SECONDS"])
    except SignatureExpired as exc:
        raise APIError("Token expired", status_code=401) from exc
    except BadSignature as exc:
        raise APIError("Invalid token", status_code=401) from exc


def _extract_bearer_token() -> str:
    header = request.headers.get("Authorization", "").strip()
    if not header.lower().startswith("bearer "):
        raise APIError("Missing bearer token", status_code=401)
    token = header.split(" ", 1)[1].strip()
    if not token:
        raise APIError("Missing bearer token", status_code=401)
    return token


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not current_app.config.get("AUTH_REQUIRED", False):
            return fn(*args, **kwargs)

        token = _extract_bearer_token()
        payload = decode_token(token)
        g.auth_user = payload
        return fn(*args, **kwargs)

    return wrapper
