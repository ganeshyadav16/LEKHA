from __future__ import annotations

import re
from typing import Any

from app.utils.normalization import normalize_key


NUMBER_WORDS = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
    "ek": 1,
    "do": 2,
    "teen": 3,
    "char": 4,
    "paanch": 5,
    "oka": 1,
    "okati": 1,
    "rendu": 2,
    "moodu": 3,
    "nalugu": 4,
    "aidu": 5,
    "aaru": 6,
    "edu": 7,
    "enimidi": 8,
    "tommidi": 9,
    "padi": 10,
}

FILLER_WORDS = {
    "bro",
    "ra",
    "please",
    "anna",
    "bhai",
    "bhayya",
    "sir",
    "madam",
}

ITEM_ALIASES = {
    "maggies": "maggi",
    "maggie": "maggi",
    "maggy": "maggi",
    "coca cola": "coke",
    "cocacola": "coke",
    "cola": "coke",
}


class CommandParser:
    ADD_WORDS = {
        "add",
        "include",
        "put",
        "insert",
        "add chey",
        "vesuko",
        "petti",
        "daalo",
        "చేర్చు",
        "వేయి",
        "పెట్టు",
        "जोड़ो",
        "डालो",
    }
    REMOVE_WORDS = {"remove", "delete", "cancel", "teesi", "తీసెయ్యి", "हटाओ", "निकालो", "hatao"}
    UNDO_WORDS = {"undo", "reverse", "వెనక్కి", "वापस"}
    ACTIVATE_WORDS = {"lekha", "hey bhashabill", "hey bhasha bill", "bhashabill", "bhasha bill"}
    DISCOUNT_WORDS = {"discount", "off", "apply", "apply discount", "తగ్గించు", "छूट"}
    CHECKOUT_WORDS = {"checkout", "generate bill", "create bill", "final bill", "complete bill", "bill", "final", "బిల్లు", "बिल"}
    CLEAR_WORDS = {"clear", "reset", "empty", "new bill", "క్లియర్", "ఖాళీ", "रीसेट"}

    @staticmethod
    def _contains_any(normalized: str, keywords: set[str]) -> bool:
        tokens = set(normalized.split())
        for keyword in keywords:
            key = normalize_key(keyword)
            if not key:
                continue
            if " " in key:
                if key in normalized:
                    return True
            elif key in tokens:
                return True
        return False

    @staticmethod
    def _parse_number(text: str) -> float | None:
        digit = re.search(r"\d+(?:\.\d+)?", text)
        if digit:
            return float(digit.group(0))
        for token in text.split():
            if token in NUMBER_WORDS:
                return float(NUMBER_WORDS[token])
        return None

    @staticmethod
    def _strip_keywords(normalized: str, keywords: set[str]) -> str:
        output = normalized
        for key in sorted(keywords, key=len, reverse=True):
            safe_key = normalize_key(key)
            if not safe_key:
                continue
            if " " in safe_key:
                output = output.replace(safe_key, " ")
            else:
                output = re.sub(rf"\b{re.escape(safe_key)}\b", " ", output)
        output = re.sub(r"\d+(?:\.\d+)?", " ", output)
        output = re.sub(r"\s+", " ", output).strip()
        return output

    @staticmethod
    def _strip_fillers(normalized: str) -> str:
        output = normalized
        for filler in sorted(FILLER_WORDS, key=len, reverse=True):
            safe = normalize_key(filler)
            if not safe:
                continue
            output = re.sub(rf"\b{re.escape(safe)}\b", " ", output)
        return re.sub(r"\s+", " ", output).strip()

    @staticmethod
    def _apply_item_aliases(item: str) -> str:
        output = normalize_key(item)
        if not output:
            return ""

        for alias, target in sorted(ITEM_ALIASES.items(), key=lambda pair: len(pair[0]), reverse=True):
            safe_alias = normalize_key(alias)
            if not safe_alias:
                continue
            if " " in safe_alias:
                output = output.replace(safe_alias, target)
            else:
                output = re.sub(rf"\b{re.escape(safe_alias)}\b", target, output)

        output = re.sub(r"\s+", " ", output).strip()
        return output

    @staticmethod
    def parse(text: str) -> dict[str, Any]:
        normalized = normalize_key(text)
        normalized = CommandParser._strip_fillers(normalized)
        if not normalized:
            return {"action": "unknown", "confidence": 0.0, "raw": text}

        if CommandParser._contains_any(normalized, CommandParser.ACTIVATE_WORDS):
            return {"action": "activate", "confidence": 0.98, "raw": text}

        if CommandParser._contains_any(normalized, CommandParser.UNDO_WORDS):
            return {"action": "undo", "confidence": 0.95, "raw": text}

        if CommandParser._contains_any(normalized, CommandParser.CLEAR_WORDS):
            return {"action": "clear", "confidence": 0.9, "raw": text}

        if CommandParser._contains_any(normalized, CommandParser.CHECKOUT_WORDS):
            return {"action": "checkout", "confidence": 0.9, "raw": text}

        if CommandParser._contains_any(normalized, CommandParser.DISCOUNT_WORDS):
            value = CommandParser._parse_number(normalized)
            is_flat = any(token in normalized for token in ["rs", "rupee", "rupees", "రూపాయలు", "रुपये"])
            return {
                "action": "discount",
                "value": value or 0.0,
                "discountType": "flat" if is_flat else "percent",
                "scope": "total",
                "raw": text,
                "confidence": 0.85,
            }

        if CommandParser._contains_any(normalized, CommandParser.REMOVE_WORDS):
            item = CommandParser._strip_keywords(normalized, CommandParser.REMOVE_WORDS)
            item = CommandParser._apply_item_aliases(item)
            return {
                "action": "remove",
                "item": item,
                "confidence": 0.9 if item else 0.65,
                "raw": text,
            }

        qty = CommandParser._parse_number(normalized)
        if CommandParser._contains_any(normalized, CommandParser.ADD_WORDS) or qty is not None:
            item = CommandParser._strip_keywords(normalized, CommandParser.ADD_WORDS)
            if qty is not None:
                item = re.sub(r"\b\d+(?:\.\d+)?\b", "", item).strip()
            item = CommandParser._apply_item_aliases(item)
            if not item:
                return {"action": "unknown", "confidence": 0.3, "raw": text}
            return {
                "action": "add",
                "item": item,
                "qty": qty or 1,
                "confidence": 0.9,
                "raw": text,
            }

        return {"action": "unknown", "confidence": 0.2, "raw": text}
