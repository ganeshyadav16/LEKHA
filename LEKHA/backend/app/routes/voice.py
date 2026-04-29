from __future__ import annotations

from flask import Blueprint, request

from app.services.voice_service import VoiceService
from app.utils import APIError, atomic_session, require_auth, success


voice_bp = Blueprint("voice", __name__)


def _as_bool(value, default: bool = True) -> bool:
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


@voice_bp.get("/api/health")
def voice_health():
    return {
        "ok": True,
        "mode": "browser-speech",
        "audioTranscription": False,
    }


@voice_bp.post("/api/transcribe")
def voice_transcribe_compat():
    raise APIError("/api/transcribe is disabled; browser speech recognition is now used", status_code=410)


@voice_bp.post("/voice/process")
@require_auth
def voice_process():
    payload = request.get_json(silent=True) or {}
    text = payload.get("text")
    execute = _as_bool(payload.get("execute"), default=True)

    with atomic_session() as session:
        result = VoiceService.process(
            session,
            text=text,
            execute=execute,
        )

    return success(result)
