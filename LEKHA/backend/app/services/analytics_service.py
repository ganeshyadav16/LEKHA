from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models import Transaction


class AnalyticsService:
    @staticmethod
    def _parse_date(date_str: str | None) -> datetime | None:
        if not date_str:
            return None
        return datetime.strptime(date_str, "%Y-%m-%d")

    @staticmethod
    def summary(session: Session, date_str: str | None = None) -> dict:
        day = AnalyticsService._parse_date(date_str)
        if day:
            start = datetime(day.year, day.month, day.day)
            end = start + timedelta(days=1)
        else:
            now = datetime.utcnow()
            start = datetime(now.year, now.month, now.day)
            end = start + timedelta(days=1)

        txns = (
            session.query(Transaction)
            .filter(Transaction.timestamp >= start, Transaction.timestamp < end)
            .all()
        )

        total_sales = round(sum(float(t.total) for t in txns), 2)
        total_subtotal = round(sum(float(t.subtotal) for t in txns), 2)
        discount_total = round(max(0.0, total_subtotal - total_sales), 2)
        transaction_count = len(txns)

        return {
            "date": start.strftime("%Y-%m-%d"),
            "transactionCount": transaction_count,
            "totalSales": total_sales,
            "avgBillValue": round(total_sales / transaction_count, 2) if transaction_count else 0.0,
            "discountTotal": discount_total,
        }

    @staticmethod
    def top_items(session: Session, days: int = 30, limit: int = 10) -> list[dict]:
        since = datetime.utcnow() - timedelta(days=max(1, days))
        txns = session.query(Transaction).filter(Transaction.timestamp >= since).all()

        totals: dict[str, dict] = defaultdict(lambda: {"qty": 0.0, "revenue": 0.0})
        for txn in txns:
            for item in txn.items or []:
                name = item.get("name", "Unknown")
                qty = float(item.get("qty", 0))
                rev = float(item.get("lineTotal", item.get("subtotal", 0)))
                totals[name]["qty"] += qty
                totals[name]["revenue"] += rev

        ranked = sorted(
            [{"name": k, "qty": round(v["qty"], 2), "revenue": round(v["revenue"], 2)} for k, v in totals.items()],
            key=lambda x: (-x["qty"], -x["revenue"], x["name"]),
        )
        return ranked[: max(1, limit)]

    @staticmethod
    def peak_hours(session: Session, days: int = 30) -> list[dict]:
        since = datetime.utcnow() - timedelta(days=max(1, days))
        txns = session.query(Transaction).filter(Transaction.timestamp >= since).all()

        by_hour: dict[int, dict] = defaultdict(lambda: {"transactions": 0, "sales": 0.0})
        for txn in txns:
            hour = txn.timestamp.hour
            by_hour[hour]["transactions"] += 1
            by_hour[hour]["sales"] += float(txn.total)

        return [
            {
                "hour": hour,
                "transactions": values["transactions"],
                "sales": round(values["sales"], 2),
            }
            for hour, values in sorted(by_hour.items(), key=lambda x: x[0])
        ]
