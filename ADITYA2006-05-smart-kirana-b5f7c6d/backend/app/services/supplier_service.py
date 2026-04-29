from __future__ import annotations

from datetime import datetime
from typing import List

from sqlalchemy.orm import Session

from app.models import Supplier
from app.utils import APIError


class SupplierService:
    @staticmethod
    def list_suppliers(session: Session) -> List[dict]:
        suppliers = session.query(Supplier).order_by(Supplier.name.asc()).all()
        return [
            {
                "id": s.id,
                "name": s.name,
                "contactName": s.contact_name,
                "phone": s.phone,
                "email": s.email,
                "address": s.address,
                "isActive": bool(s.is_active),
                "createdAt": s.created_at.isoformat() if s.created_at else None,
                "updatedAt": s.updated_at.isoformat() if s.updated_at else None,
            }
            for s in suppliers
        ]

    @staticmethod
    def add_supplier(
        session: Session,
        *,
        name: str,
        contact_name: str | None = None,
        phone: str | None = None,
        email: str | None = None,
        address: str | None = None,
    ) -> dict:
        if not name or not str(name).strip():
            raise APIError("supplier name is required", status_code=400)

        existing = session.query(Supplier).filter(Supplier.name == name.strip()).first()
        if existing:
            raise APIError("Supplier already exists", status_code=409)

        sup = Supplier(
            name=name.strip(),
            contact_name=contact_name,
            phone=phone,
            email=email,
            address=address,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(sup)
        session.flush()
        return {
            "id": sup.id,
            "name": sup.name,
            "contactName": sup.contact_name,
            "phone": sup.phone,
            "email": sup.email,
            "address": sup.address,
            "isActive": bool(sup.is_active),
            "createdAt": sup.created_at.isoformat() if sup.created_at else None,
            "updatedAt": sup.updated_at.isoformat() if sup.updated_at else None,
        }

    @staticmethod
    def update_supplier(
        session: Session,
        *,
        supplier_id: int | None = None,
        name: str | None = None,
        contact_name: str | None = None,
        phone: str | None = None,
        email: str | None = None,
        address: str | None = None,
        is_active: bool | None = None,
    ) -> dict:
        if supplier_id is None:
            raise APIError("supplier id required", status_code=400)

        sup = session.get(Supplier, int(supplier_id))
        if not sup:
            raise APIError("Supplier not found", status_code=404)

        if name is not None:
            sup.name = name.strip()
        if contact_name is not None:
            sup.contact_name = contact_name
        if phone is not None:
            sup.phone = phone
        if email is not None:
            sup.email = email
        if address is not None:
            sup.address = address
        if is_active is not None:
            sup.is_active = bool(is_active)

        sup.updated_at = datetime.utcnow()
        session.flush()

        return {
            "id": sup.id,
            "name": sup.name,
            "contactName": sup.contact_name,
            "phone": sup.phone,
            "email": sup.email,
            "address": sup.address,
            "isActive": bool(sup.is_active),
            "createdAt": sup.created_at.isoformat() if sup.created_at else None,
            "updatedAt": sup.updated_at.isoformat() if sup.updated_at else None,
        }

    @staticmethod
    def delete_supplier(session: Session, *, supplier_id: int) -> dict:
        sup = session.get(Supplier, int(supplier_id))
        if not sup:
            raise APIError("Supplier not found", status_code=404)

        # Soft delete
        sup.is_active = False
        sup.updated_at = datetime.utcnow()
        session.flush()
        return {"id": sup.id, "deleted": True}
