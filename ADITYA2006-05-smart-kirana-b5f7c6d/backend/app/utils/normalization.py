from __future__ import annotations

import re


def normalize_key(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", str(text or "").strip().lower())
    cleaned = re.sub(r"[^\w\s]+", "", cleaned)
    return cleaned.strip()
