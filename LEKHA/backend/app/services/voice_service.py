from __future__ import annotations

from sqlalchemy.orm import Session

from app.services.billing_service import BillingService
from app.voice import CommandParser


class VoiceService:
    @staticmethod
    def process(
        session: Session,
        *,
        text: str | None = None,
        execute: bool = True,
    ) -> dict:
        transcript = (text or "").strip()

        transcription_meta = {
            "mode": "browser-speech",
            "audioAccepted": False,
        }

        if not transcript:
            return {
                "transcript": "",
                "command": {"action": "unknown", "confidence": 0.0},
                "execution": None,
                "transcription": transcription_meta,
            }

        command = CommandParser.parse(transcript)
        execution = None

        if execute:
            action = command.get("action")
            if action == "add":
                execution = BillingService.add_item(
                    session,
                    item_name=command.get("item", ""),
                    qty=float(command.get("qty", 1) or 1),
                    price=None,
                )
            elif action == "remove":
                execution = BillingService.remove_item(session, item_name=command.get("item", ""))
            elif action == "undo":
                execution = BillingService.undo_last_action(session)
            elif action == "discount":
                execution = BillingService.apply_discount(
                    session,
                    value=float(command.get("value", 0) or 0),
                    discount_type=command.get("discountType", "percent"),
                    scope=command.get("scope", "total"),
                    item_name=command.get("item"),
                )
            elif action in {"checkout", "bill"}:
                execution = BillingService.checkout(session)
            elif action == "clear":
                execution = BillingService.clear_bill(session)

        return {
            "transcript": transcript,
            "command": command,
            "execution": execution,
            "transcription": transcription_meta,
        }
