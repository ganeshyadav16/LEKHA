from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.analytics import apriori, build_rules
from app.models import Product, Transaction
from app.services.analytics_service import AnalyticsService


class MiningService:
    @staticmethod
    def _get_baskets(session: Session, days: int = 60) -> list[set[str]]:
        since = datetime.utcnow() - timedelta(days=max(1, days))
        txns = session.query(Transaction).filter(Transaction.timestamp >= since).all()
        baskets: list[set[str]] = []
        for txn in txns:
            basket = {str(item.get("name", "")).strip() for item in (txn.items or []) if item.get("name")}
            if basket:
                baskets.append(basket)
        return baskets

    @staticmethod
    def _restock_recommendations(session: Session, days: int = 30) -> list[dict]:
        top_items = AnalyticsService.top_items(session, days=days, limit=100)
        velocity_map = {item["name"]: item["qty"] / max(1, days) for item in top_items}

        products = session.query(Product).all()
        recs = []

        for product in products:
            velocity = velocity_map.get(product.name, 0.0)
            if velocity <= 0:
                continue
            days_left = float(product.stock) / velocity if velocity else 999
            if days_left <= 7:
                recs.append(
                    {
                        "productId": product.id,
                        "name": product.name,
                        "stock": round(float(product.stock), 2),
                        "dailyVelocity": round(velocity, 2),
                        "daysLeft": round(days_left, 2),
                        "urgency": "critical" if days_left <= 3 else "high" if days_left <= 5 else "medium",
                    }
                )

        recs.sort(key=lambda x: x["daysLeft"])
        return recs

    @staticmethod
    def recommendations(
        session: Session,
        min_support: float = 0.1,
        min_confidence: float = 0.35,
        days: int = 60,
    ) -> dict:
        baskets = MiningService._get_baskets(session, days=days)
        frequent_sets = apriori(baskets, min_support=min_support, max_length=3)
        rules = build_rules(frequent_sets, min_confidence=min_confidence)

        bundles = []
        for rule in rules[:15]:
            bundles.append(
                {
                    "buy": rule["if"],
                    "suggest": rule["then"],
                    "confidence": rule["confidence"],
                    "support": rule["support"],
                }
            )

        return {
            "transactionsAnalyzed": len(baskets),
            "frequentItemsets": frequent_sets,
            "associationRules": rules,
            "bundleSuggestions": bundles,
            "restockSuggestions": MiningService._restock_recommendations(session, days=min(30, days)),
        }
