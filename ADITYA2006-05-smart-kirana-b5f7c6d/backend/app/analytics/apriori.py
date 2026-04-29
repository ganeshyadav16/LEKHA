from __future__ import annotations

from collections import Counter
from itertools import combinations


def _support_count(itemset: frozenset, baskets: list[set[str]]) -> int:
    return sum(1 for basket in baskets if itemset.issubset(basket))


def apriori(
    baskets: list[set[str]],
    min_support: float = 0.1,
    max_length: int = 3,
) -> list[dict]:
    if not baskets:
        return []

    basket_count = len(baskets)
    min_count = max(1, int(min_support * basket_count))
    frequent_sets: list[dict] = []

    item_counter = Counter()
    for basket in baskets:
        item_counter.update(basket)

    current_level = {
        frozenset([item]): count
        for item, count in item_counter.items()
        if count >= min_count
    }

    level = 1
    while current_level and level <= max_length:
        for itemset, count in current_level.items():
            frequent_sets.append(
                {
                    "items": sorted(list(itemset)),
                    "support": round(count / basket_count, 4),
                    "supportCount": count,
                }
            )

        level += 1
        if level > max_length:
            break

        candidates: set[frozenset] = set()
        itemsets = list(current_level.keys())
        for i in range(len(itemsets)):
            for j in range(i + 1, len(itemsets)):
                merged = itemsets[i] | itemsets[j]
                if len(merged) == level:
                    candidates.add(merged)

        next_level: dict[frozenset, int] = {}
        for candidate in candidates:
            count = _support_count(candidate, baskets)
            if count >= min_count:
                next_level[candidate] = count

        current_level = next_level

    frequent_sets.sort(key=lambda x: (len(x["items"]), -x["supportCount"], x["items"]))
    return frequent_sets


def build_rules(frequent_sets: list[dict], min_confidence: float = 0.3) -> list[dict]:
    support_map = {frozenset(fs["items"]): fs["support"] for fs in frequent_sets}
    rules: list[dict] = []

    for itemset, support in support_map.items():
        if len(itemset) < 2:
            continue

        for r in range(1, len(itemset)):
            for antecedent_tuple in combinations(itemset, r):
                antecedent = frozenset(antecedent_tuple)
                consequent = itemset - antecedent
                antecedent_support = support_map.get(antecedent)
                if not antecedent_support:
                    continue

                confidence = support / antecedent_support
                if confidence >= min_confidence:
                    rules.append(
                        {
                            "if": sorted(list(antecedent)),
                            "then": sorted(list(consequent)),
                            "support": round(support, 4),
                            "confidence": round(confidence, 4),
                        }
                    )

    rules.sort(key=lambda x: (-x["confidence"], -x["support"], x["if"]))
    return rules
