from __future__ import annotations

import json
from datetime import datetime
from difflib import SequenceMatcher

from flask import current_app
from sqlalchemy.orm import Session

from app.models import BillingState, LogEntry, PriceMemory, Product, Transaction
from app.services.output_service import OutputService
from app.services.sync_service import SyncService
from app.utils import APIError
from app.utils.normalization import normalize_key


class BillingService:
    MAX_UNDO = 25

    @staticmethod
    def _deepcopy(data):
        return json.loads(json.dumps(data))

    @staticmethod
    def _low_stock_threshold() -> int:
        try:
            return int(current_app.config.get("LOW_STOCK_THRESHOLD", 10))
        except Exception:
            return 10

    @staticmethod
    def _ensure_state(session: Session) -> BillingState:
        state = session.get(BillingState, 1)
        if state:
            if state.items is None:
                state.items = []
            if state.undo_stack is None:
                state.undo_stack = []
            if not state.discount_type:
                state.discount_type = "percent"
            if state.discount_value is None:
                state.discount_value = 0.0
            return state

        state = BillingState(
            id=1,
            items=[],
            undo_stack=[],
            discount_type="percent",
            discount_value=0.0,
            updated_at=datetime.utcnow(),
        )
        session.add(state)
        session.flush()
        return state

    @staticmethod
    def _push_undo(state: BillingState) -> None:
        stack = BillingService._deepcopy(state.undo_stack or [])
        stack.append(
            {
                "items": BillingService._deepcopy(state.items or []),
                "discount_type": state.discount_type,
                "discount_value": float(state.discount_value or 0.0),
            }
        )
        if len(stack) > BillingService.MAX_UNDO:
            stack = stack[-BillingService.MAX_UNDO :]
        state.undo_stack = stack

    @staticmethod
    def _line_total(item: dict) -> float:
        qty = float(item.get("qty", 0) or 0)
        unit_price = float(item.get("unitPrice", 0) or 0)
        subtotal = qty * unit_price

        discount_value = float(item.get("discountValue", 0) or 0)
        discount_type = item.get("discountType", "percent")

        if discount_value > 0:
            if discount_type == "percent":
                subtotal -= subtotal * (discount_value / 100.0)
            else:
                subtotal -= discount_value

        return round(max(0.0, subtotal), 2)

    @staticmethod
    def _compute_totals(items: list[dict], discount_type: str, discount_value: float) -> tuple[float, float]:
        subtotal = round(sum(BillingService._line_total(item) for item in items), 2)
        total = subtotal

        if discount_value > 0:
            if discount_type == "percent":
                total -= subtotal * (discount_value / 100.0)
            else:
                total -= discount_value

        return subtotal, round(max(0.0, total), 2)

    @staticmethod
    def _serialize_bill(state: BillingState) -> dict:
        items = []
        for row in state.items or []:
            item = BillingService._deepcopy(row)
            item["lineTotal"] = BillingService._line_total(item)
            items.append(item)

        subtotal, total = BillingService._compute_totals(
            items,
            state.discount_type or "percent",
            float(state.discount_value or 0.0),
        )

        return {
            "items": items,
            "itemCount": len(items),
            "subtotal": subtotal,
            "discountType": state.discount_type or "percent",
            "discountValue": round(float(state.discount_value or 0.0), 2),
            "total": total,
            "updatedAt": state.updated_at.isoformat() if state.updated_at else datetime.utcnow().isoformat(),
        }

    @staticmethod
    def _find_product_by_name(session: Session, item_name: str) -> Product | None:
        key = normalize_key(item_name)
        if not key:
            return None

        exact = session.query(Product).filter(Product.name_key == key).first()
        if exact:
            return exact

        products = session.query(Product).all()
        best = None
        best_score = 0.0

        for product in products:
            score = SequenceMatcher(None, key, product.name_key).ratio()
            if score > best_score:
                best_score = score
                best = product

        return best if best_score >= 0.68 else None

    @staticmethod
    def _find_item_index(items: list[dict], item_name: str) -> int:
        key = normalize_key(item_name)
        if not key:
            return -1

        for idx, row in enumerate(items):
            row_key = normalize_key(row.get("nameKey") or row.get("name", ""))
            if row_key == key:
                return idx

        best_idx = -1
        best_score = 0.0
        for idx, row in enumerate(items):
            row_key = normalize_key(row.get("nameKey") or row.get("name", ""))
            score = SequenceMatcher(None, key, row_key).ratio()
            if score > best_score:
                best_score = score
                best_idx = idx

        return best_idx if best_score >= 0.65 else -1

    @staticmethod
    def current_bill(session: Session) -> dict:
        state = BillingService._ensure_state(session)
        return BillingService._serialize_bill(state)

    @staticmethod
    def add_item(
        session: Session,
        *,
        item_name: str,
        qty: float = 1,
        price: float | None = None,
    ) -> dict:
        if not item_name or not str(item_name).strip():
            raise APIError("item is required", status_code=400)
        if qty is None or float(qty) <= 0:
            raise APIError("qty must be greater than 0", status_code=400)

        state = BillingService._ensure_state(session)
        product = BillingService._find_product_by_name(session, item_name)

        normalized_item = normalize_key(item_name)
        unit_price: float | None = float(price) if price is not None else None

        if product and unit_price is None:
            unit_price = float(product.price)

        if not product and unit_price is None:
            memory = session.query(PriceMemory).filter(PriceMemory.item_key == normalized_item).first()
            if memory:
                unit_price = float(memory.last_price)

        if unit_price is None:
            return {
                "requiresPrice": True,
                "item": item_name,
                "message": "Price not known for this item. Please provide price.",
                "bill": BillingService._serialize_bill(state),
            }

        if not product:
            existing_memory = session.query(PriceMemory).filter(PriceMemory.item_key == normalized_item).first()
            if existing_memory:
                existing_memory.last_price = float(unit_price)
                existing_memory.updated_at = datetime.utcnow()
            else:
                session.add(
                    PriceMemory(
                        item_key=normalized_item,
                        item_name=item_name.strip(),
                        last_price=float(unit_price),
                        updated_at=datetime.utcnow(),
                    )
                )

        BillingService._push_undo(state)

        items = BillingService._deepcopy(state.items or [])
        target_name = product.name if product else item_name.strip()
        target_key = normalize_key(target_name)
        idx = BillingService._find_item_index(items, target_name)

        if idx >= 0:
            items[idx]["qty"] = round(float(items[idx].get("qty", 0)) + float(qty), 2)
            if price is not None:
                items[idx]["unitPrice"] = float(price)
        else:
            items.append(
                {
                    "productId": product.id if product else None,
                    "name": target_name,
                    "nameKey": target_key,
                    "qty": round(float(qty), 2),
                    "unitPrice": round(float(unit_price), 2),
                    "discountType": "percent",
                    "discountValue": 0.0,
                }
            )

        state.items = items
        state.updated_at = datetime.utcnow()

        session.add(
            LogEntry(
                action="billing_add",
                data={"item": target_name, "qty": qty, "price": float(unit_price)},
            )
        )
        SyncService.enqueue_event(session, "billing", "add", {"item": target_name, "qty": qty})

        payload = BillingService._serialize_bill(state)
        if product:
            current_qty = next((it.get("qty", 0) for it in payload["items"] if it.get("nameKey") == target_key), 0)
            if float(product.stock) < float(current_qty):
                payload.setdefault("alerts", []).append(
                    {
                        "type": "low_stock",
                        "item": product.name,
                        "available": round(float(product.stock), 2),
                    }
                )

        return payload

    @staticmethod
    def remove_item(session: Session, *, item_name: str) -> dict:
        if not item_name or not str(item_name).strip():
            raise APIError("item is required", status_code=400)

        state = BillingService._ensure_state(session)
        items = BillingService._deepcopy(state.items or [])
        idx = BillingService._find_item_index(items, item_name)
        if idx < 0:
            raise APIError("Item not found in current bill", status_code=404)

        BillingService._push_undo(state)
        removed = items.pop(idx)
        state.items = items
        state.updated_at = datetime.utcnow()

        session.add(LogEntry(action="billing_remove", data={"item": removed.get("name")}))
        SyncService.enqueue_event(session, "billing", "remove", {"item": removed.get("name")})

        payload = BillingService._serialize_bill(state)
        payload["removedItem"] = removed.get("name")
        return payload

    @staticmethod
    def undo_last_action(session: Session) -> dict:
        state = BillingService._ensure_state(session)
        stack = BillingService._deepcopy(state.undo_stack or [])
        if not stack:
            raise APIError("Nothing to undo", status_code=400)

        snapshot = stack.pop()
        state.items = snapshot.get("items", [])
        state.discount_type = snapshot.get("discount_type", "percent")
        state.discount_value = float(snapshot.get("discount_value", 0.0))
        state.undo_stack = stack
        state.updated_at = datetime.utcnow()

        session.add(LogEntry(action="billing_undo", data={"remainingUndo": len(stack)}))
        return BillingService._serialize_bill(state)

    @staticmethod
    def apply_discount(
        session: Session,
        *,
        value: float,
        discount_type: str = "percent",
        scope: str = "total",
        item_name: str | None = None,
    ) -> dict:
        if value is None or float(value) < 0:
            raise APIError("discount value must be >= 0", status_code=400)

        discount_type = (discount_type or "percent").lower()
        if discount_type not in {"percent", "flat"}:
            raise APIError("discount_type must be percent or flat", status_code=400)

        scope = (scope or "total").lower()
        if scope not in {"total", "item"}:
            raise APIError("scope must be total or item", status_code=400)

        state = BillingService._ensure_state(session)
        BillingService._push_undo(state)

        if scope == "item":
            if not item_name:
                raise APIError("item is required for item level discount", status_code=400)
            items = BillingService._deepcopy(state.items or [])
            idx = BillingService._find_item_index(items, item_name)
            if idx < 0:
                raise APIError("Item not found in current bill", status_code=404)
            items[idx]["discountType"] = discount_type
            items[idx]["discountValue"] = float(value)
            state.items = items
        else:
            state.discount_type = discount_type
            state.discount_value = float(value)

        state.updated_at = datetime.utcnow()

        session.add(
            LogEntry(
                action="billing_discount",
                data={"scope": scope, "value": float(value), "discountType": discount_type, "item": item_name},
            )
        )
        SyncService.enqueue_event(
            session,
            "billing",
            "discount",
            {"scope": scope, "value": float(value), "discountType": discount_type, "item": item_name},
        )

        return BillingService._serialize_bill(state)

    @staticmethod
    def clear_bill(session: Session) -> dict:
        state = BillingService._ensure_state(session)
        BillingService._push_undo(state)
        state.items = []
        state.discount_type = "percent"
        state.discount_value = 0.0
        state.updated_at = datetime.utcnow()

        session.add(LogEntry(action="billing_clear", data={}))
        SyncService.enqueue_event(session, "billing", "clear", {})
        return BillingService._serialize_bill(state)

    @staticmethod
    def checkout(session: Session) -> dict:
        state = BillingService._ensure_state(session)
        bill = BillingService._serialize_bill(state)

        if not bill["items"]:
            raise APIError("Current bill is empty", status_code=400)

        threshold = BillingService._low_stock_threshold()
        low_stock_alerts = []

        # Validate stock before mutating inventory to ensure atomicity.
        for line in bill["items"]:
            product_id = line.get("productId")
            qty = float(line.get("qty", 0) or 0)
            if not product_id:
                continue

            product = session.get(Product, int(product_id))
            if not product:
                continue

            if float(product.stock) < qty:
                raise APIError(
                    "Insufficient stock",
                    status_code=409,
                    details={"product": product.name, "available": float(product.stock), "requested": qty},
                )

        for line in bill["items"]:
            product_id = line.get("productId")
            qty = float(line.get("qty", 0) or 0)
            if not product_id:
                continue

            product = session.get(Product, int(product_id))
            if not product:
                continue

            product.stock = round(float(product.stock) - qty, 2)
            product.last_updated = datetime.utcnow()
            if float(product.stock) <= threshold:
                low_stock_alerts.append(
                    {
                        "productId": product.id,
                        "name": product.name,
                        "stock": round(float(product.stock), 2),
                    }
                )

        txn = Transaction(
            items=bill["items"],
            subtotal=bill["subtotal"],
            discount_type=bill["discountType"],
            discount_value=bill["discountValue"],
            total=bill["total"],
            timestamp=datetime.utcnow(),
        )
        session.add(txn)
        session.flush()

        txn_payload = {
            "id": txn.id,
            "items": bill["items"],
            "subtotal": bill["subtotal"],
            "discountType": bill["discountType"],
            "discountValue": bill["discountValue"],
            "total": bill["total"],
            "timestamp": txn.timestamp.isoformat(),
        }

        session.add(LogEntry(action="billing_checkout", data={"transactionId": txn.id, "total": txn.total}))
        SyncService.enqueue_event(session, "transaction", "create", txn_payload)

        state.items = []
        state.discount_type = "percent"
        state.discount_value = 0.0
        state.undo_stack = []
        state.updated_at = datetime.utcnow()

        return {
            "transaction": txn_payload,
            "lowStockAlerts": low_stock_alerts,
            "billJson": OutputService.bill_json(txn_payload),
            "whatsappMessage": OutputService.whatsapp_message(txn_payload),
        }
