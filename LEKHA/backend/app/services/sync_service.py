from __future__ import annotations

from datetime import datetime
from typing import Any

import requests
from sqlalchemy.orm import Session

from app.models import SyncEvent


class SyncService:
    @staticmethod
    def enqueue_event(session: Session, entity: str, operation: str, payload: dict[str, Any]) -> None:
        session.add(
            SyncEvent(
                entity=entity,
                operation=operation,
                payload=payload,
                status="pending",
                updated_at=datetime.utcnow(),
            )
        )

    @staticmethod
    def sync_pending(session: Session, remote_url: str | None, timeout: float = 3.0) -> dict:
        pending = session.query(SyncEvent).filter(SyncEvent.status == "pending").order_by(SyncEvent.id.asc()).all()
        if not remote_url:
            return {
                "synced": 0,
                "pending": len(pending),
                "conflicts": 0,
                "message": "REMOTE_SYNC_URL not configured",
            }

        synced = 0
        conflicts = 0

        for event in pending:
            try:
                response = requests.post(
                    remote_url,
                    json={
                        "eventId": event.id,
                        "entity": event.entity,
                        "operation": event.operation,
                        "payload": event.payload,
                        "createdAt": event.created_at.isoformat(),
                    },
                    timeout=timeout,
                )

                if response.status_code == 409:
                    event.status = "conflict"
                    event.conflict_reason = response.text[:500]
                    conflicts += 1
                elif 200 <= response.status_code < 300:
                    event.status = "synced"
                    synced += 1
                else:
                    event.status = "failed"
                    event.conflict_reason = response.text[:500]

            except Exception as exc:  # pragma: no cover - runtime network guard
                event.status = "failed"
                event.conflict_reason = str(exc)[:500]

            event.updated_at = datetime.utcnow()

        return {
            "synced": synced,
            "pending": session.query(SyncEvent).filter(SyncEvent.status == "pending").count(),
            "conflicts": conflicts,
        }
