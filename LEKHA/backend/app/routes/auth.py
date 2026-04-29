from __future__ import annotations

from flask import Blueprint, request

from app.services.auth_service import AuthService
from app.utils import atomic_session, success


auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}

    with atomic_session() as session:
        data = AuthService.login(
            session,
            username=str(payload.get("username", "")).strip(),
            password=str(payload.get("password", "")),
        )

    return success(data, message="Login successful")


@auth_bp.post("/register")
def register():
    payload = request.get_json(silent=True) or {}

    with atomic_session() as session:
        data = AuthService.register(
            session,
            username=str(payload.get("username", "")).strip(),
            password=str(payload.get("password", "")),
            confirm=str(payload.get("confirmPassword", "")),
        )

    return success(data, message="Account created successfully", status_code=201)
