from __future__ import annotations

from flask import Blueprint, request

from app.services.supplier_service import SupplierService
from app.services.sync_service import SyncService
from app.utils import atomic_session, require_auth, success


suppliers_bp = Blueprint("suppliers", __name__)


@suppliers_bp.get("/suppliers")
@require_auth
def suppliers_list():
    with atomic_session() as session:
        data = SupplierService.list_suppliers(session)
    return success(data)


@suppliers_bp.post("/suppliers/add")
@require_auth
def suppliers_add():
    payload = request.get_json(silent=True) or {}
    with atomic_session() as session:
        supplier = SupplierService.add_supplier(
            session,
            name=str(payload.get("name", "")).strip(),
            contact_name=payload.get("contactName"),
            phone=payload.get("phone"),
            email=payload.get("email"),
            address=payload.get("address"),
        )
        SyncService.enqueue_event(session, "supplier", "create", supplier)
    return success(supplier, message="Supplier added")


@suppliers_bp.put("/suppliers/update")
@require_auth
def suppliers_update():
    payload = request.get_json(silent=True) or {}
    with atomic_session() as session:
        supplier = SupplierService.update_supplier(
            session,
            supplier_id=payload.get("id"),
            name=payload.get("name"),
            contact_name=payload.get("contactName"),
            phone=payload.get("phone"),
            email=payload.get("email"),
            address=payload.get("address"),
            is_active=payload.get("isActive"),
        )
        SyncService.enqueue_event(session, "supplier", "update", supplier)
    return success(supplier, message="Supplier updated")


@suppliers_bp.delete("/suppliers/delete")
@require_auth
def suppliers_delete():
    payload = request.get_json(silent=True) or {}
    with atomic_session() as session:
        result = SupplierService.delete_supplier(session, supplier_id=payload.get("id"))
        SyncService.enqueue_event(session, "supplier", "delete", result)
    return success(result, message="Supplier removed")
