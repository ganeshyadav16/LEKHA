from __future__ import annotations

from flask import Blueprint, request

from app.services.inventory_service import InventoryService
from app.services.sync_service import SyncService
from app.utils import atomic_session, require_auth, success


inventory_bp = Blueprint("inventory", __name__)


@inventory_bp.get("/inventory")
@require_auth
def inventory_list():
    threshold = int(request.args.get("low_stock_threshold", 10))
    with atomic_session() as session:
        data = InventoryService.list_inventory(session, threshold=threshold)
    return success(data)


@inventory_bp.post("/inventory/add")
@require_auth
def inventory_add():
    payload = request.get_json(silent=True) or {}
    with atomic_session() as session:
        product = InventoryService.add_product(
            session,
            name=str(payload.get("name", "")).strip(),
            price=float(payload.get("price", 0)),
            stock=float(payload.get("stock", 0)),
        )
        SyncService.enqueue_event(session, "product", "upsert", product)
    return success(product, message="Inventory item added")


@inventory_bp.put("/inventory/update")
@require_auth
def inventory_update():
    payload = request.get_json(silent=True) or {}
    with atomic_session() as session:
        product = InventoryService.update_product(
            session,
            product_id=payload.get("id"),
            name=payload.get("name"),
            price=float(payload["price"]) if payload.get("price") is not None else None,
            stock=float(payload["stock"]) if payload.get("stock") is not None else None,
        )
        SyncService.enqueue_event(session, "product", "update", product)
    return success(product, message="Inventory updated")
