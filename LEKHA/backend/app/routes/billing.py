from __future__ import annotations

from flask import Blueprint, request

from app.services.billing_service import BillingService
from app.utils import atomic_session, require_auth, success


billing_bp = Blueprint("billing", __name__)


@billing_bp.post("/billing/add")
@require_auth
def billing_add():
    payload = request.get_json(silent=True) or {}
    with atomic_session() as session:
        data = BillingService.add_item(
            session,
            item_name=str(payload.get("item", "")).strip(),
            qty=float(payload.get("qty", 1) or 1),
            price=float(payload["price"]) if payload.get("price") is not None else None,
        )
    return success(data, message="Item added")


@billing_bp.post("/billing/remove")
@require_auth
def billing_remove():
    payload = request.get_json(silent=True) or {}
    with atomic_session() as session:
        data = BillingService.remove_item(session, item_name=str(payload.get("item", "")).strip())
    return success(data, message="Item removed")


@billing_bp.post("/billing/undo")
@require_auth
def billing_undo():
    with atomic_session() as session:
        data = BillingService.undo_last_action(session)
    return success(data, message="Undo successful")


@billing_bp.post("/billing/discount")
@require_auth
def billing_discount():
    payload = request.get_json(silent=True) or {}
    with atomic_session() as session:
        data = BillingService.apply_discount(
            session,
            value=float(payload.get("value", 0) or 0),
            discount_type=str(payload.get("discountType", "percent")),
            scope=str(payload.get("scope", "total")),
            item_name=payload.get("item"),
        )
    return success(data, message="Discount applied")


@billing_bp.get("/billing/current")
@require_auth
def billing_current():
    with atomic_session() as session:
        data = BillingService.current_bill(session)
    return success(data)


@billing_bp.post("/billing/checkout")
@require_auth
def billing_checkout():
    with atomic_session() as session:
        data = BillingService.checkout(session)
    return success(data, message="Checkout completed")
