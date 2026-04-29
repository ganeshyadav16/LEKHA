from __future__ import annotations

from datetime import datetime


class OutputService:
    @staticmethod
    def bill_json(transaction_payload: dict) -> dict:
        return {
            "transactionId": transaction_payload["id"],
            "timestamp": transaction_payload["timestamp"],
            "items": transaction_payload["items"],
            "subtotal": transaction_payload["subtotal"],
            "discount": {
                "type": transaction_payload.get("discountType", "percent"),
                "value": transaction_payload.get("discountValue", 0),
            },
            "total": transaction_payload["total"],
            "currency": "INR",
        }

    @staticmethod
    def whatsapp_message(transaction_payload: dict) -> str:
        ts = transaction_payload.get("timestamp")
        if ts:
            dt = datetime.fromisoformat(ts)
            pretty_ts = dt.strftime("%d-%m-%Y %I:%M %p")
        else:
            pretty_ts = datetime.now().strftime("%d-%m-%Y %I:%M %p")

        lines = [
            "*Kirana Shop Bill*",
            f"ID: {transaction_payload['id']}",
            f"Date: {pretty_ts}",
            "",
            "Items:",
        ]

        for item in transaction_payload.get("items", []):
            lines.append(
                f"- {item['name']} x {item['qty']} @ Rs.{item['unitPrice']} = Rs.{item['lineTotal']}"
            )

        lines.extend(
            [
                "",
                f"Subtotal: Rs.{transaction_payload.get('subtotal', 0)}",
                f"Discount: {transaction_payload.get('discountValue', 0)} {transaction_payload.get('discountType', 'percent')}",
                f"Total: *Rs.{transaction_payload.get('total', 0)}*",
                "",
                "Thank you for shopping with us.",
            ]
        )

        return "\n".join(lines)
