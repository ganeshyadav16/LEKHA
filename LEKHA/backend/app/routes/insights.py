from __future__ import annotations

from flask import Blueprint, request

from app.services.mining_service import MiningService
from app.utils import atomic_session, require_auth, success


insights_bp = Blueprint("insights", __name__)


@insights_bp.get("/insights/recommendations")
@require_auth
def insights_recommendations():
    min_support = float(request.args.get("min_support", 0.1))
    min_confidence = float(request.args.get("min_confidence", 0.35))
    days = int(request.args.get("days", 60))

    with atomic_session() as session:
        data = MiningService.recommendations(
            session,
            min_support=min_support,
            min_confidence=min_confidence,
            days=days,
        )

    return success(data)
