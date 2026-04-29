from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Session

from app.models import Product
from app.utils import APIError
from app.utils.normalization import normalize_key


class InventoryService:
    @staticmethod
    def serialize_product(product: Product, threshold: int = 10) -> dict:
        return {
            "id": product.id,
            "name": product.name,
            "price": round(float(product.price), 2),
            "stock": round(float(product.stock), 2),
            "lastUpdated": product.last_updated.isoformat(),
            "lowStock": float(product.stock) <= threshold,
        }

    @staticmethod
    def list_inventory(session: Session, threshold: int = 10) -> list[dict]:
        products = session.query(Product).order_by(Product.name.asc()).all()
        return [InventoryService.serialize_product(p, threshold=threshold) for p in products]

    @staticmethod
    def add_product(session: Session, name: str, price: float, stock: float = 0) -> dict:
        if not name:
            raise APIError("name is required", status_code=400)
        if price is None or float(price) < 0:
            raise APIError("price must be >= 0", status_code=400)
        if stock is None or float(stock) < 0:
            raise APIError("stock must be >= 0", status_code=400)

        name = name.strip()
        name_key = normalize_key(name)
        if not name_key:
            raise APIError("invalid product name", status_code=400)

        existing = session.query(Product).filter(Product.name_key == name_key).first()
        if existing:
            existing.price = float(price)
            existing.stock = float(existing.stock) + float(stock)
            existing.last_updated = datetime.utcnow()
            session.flush()
            return InventoryService.serialize_product(existing)

        product = Product(
            name=name,
            name_key=name_key,
            price=float(price),
            stock=float(stock),
            last_updated=datetime.utcnow(),
        )
        session.add(product)
        session.flush()
        return InventoryService.serialize_product(product)

    @staticmethod
    def update_product(
        session: Session,
        *,
        product_id: int | None = None,
        name: str | None = None,
        price: float | None = None,
        stock: float | None = None,
    ) -> dict:
        if product_id is None and not name:
            raise APIError("product id or name is required", status_code=400)

        product = None
        if product_id is not None:
            product = session.get(Product, int(product_id))
        if product is None and name:
            product = session.query(Product).filter(Product.name_key == normalize_key(name)).first()

        if not product:
            raise APIError("Product not found", status_code=404)

        if price is not None:
            if float(price) < 0:
                raise APIError("price must be >= 0", status_code=400)
            product.price = float(price)

        if stock is not None:
            if float(stock) < 0:
                raise APIError("stock must be >= 0", status_code=400)
            product.stock = float(stock)

        product.last_updated = datetime.utcnow()
        session.flush()
        return InventoryService.serialize_product(product)
