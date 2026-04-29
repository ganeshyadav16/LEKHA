from __future__ import annotations

from flask import jsonify


def success(data=None, message: str = "ok", status_code: int = 200):
    payload = {"ok": True, "message": message, "data": data}
    return jsonify(payload), status_code


def error(message: str, status_code: int = 400, details=None):
    payload = {"ok": False, "message": message}
    if details is not None:
        payload["details"] = details
    return jsonify(payload), status_code
