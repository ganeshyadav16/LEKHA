from __future__ import annotations

from flask import Blueprint, request

from app.services.analytics_service import AnalyticsService
from app.utils import atomic_session, require_auth, success


analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.get("/analytics/summary")
@require_auth
def analytics_summary():
    date_str = request.args.get("date")
    with atomic_session() as session:
        data = AnalyticsService.summary(session, date_str=date_str)
    return success(data)


@analytics_bp.get("/analytics/top-items")
@require_auth
def analytics_top_items():
    days = int(request.args.get("days", 30))
    limit = int(request.args.get("limit", 10))
    with atomic_session() as session:
        data = AnalyticsService.top_items(session, days=days, limit=limit)
    return success(data)


@analytics_bp.get("/analytics/peak-hours")
@require_auth
def analytics_peak_hours():
    days = int(request.args.get("days", 30))
    with atomic_session() as session:
        data = AnalyticsService.peak_hours(session, days=days)
    return success(data)
