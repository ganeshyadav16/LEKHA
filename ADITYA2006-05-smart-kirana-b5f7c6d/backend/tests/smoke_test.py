from __future__ import annotations

from pathlib import Path

from app import create_app


def expect_ok(response, label: str):
    body = response.get_json()
    assert response.status_code < 400, f"{label} failed with status {response.status_code}: {body}"
    assert body and body.get("ok") is True, f"{label} response not ok: {body}"
    return body["data"]


def run_smoke_test() -> None:
    db_path = Path(__file__).resolve().parent / "smoke_test.db"
    if db_path.exists():
        db_path.unlink()

    app = create_app(
        {
            "TESTING": True,
            "AUTH_REQUIRED": False,
            "DATABASE_URL": f"sqlite:///{db_path.as_posix()}",
        }
    )

    client = app.test_client()

    login = client.post("/login", json={"username": "admin", "password": "admin123"})
    login_data = expect_ok(login, "login")
    assert login_data.get("token"), "token missing"

    inv_add = client.post(
        "/inventory/add",
        json={"name": "Maggi", "price": 14, "stock": 100},
    )
    product = expect_ok(inv_add, "inventory/add")
    assert product["name"] == "Maggi"

    add_bill = client.post("/billing/add", json={"item": "maggi", "qty": 2})
    bill = expect_ok(add_bill, "billing/add")
    assert bill["itemCount"] == 1

    discount = client.post("/billing/discount", json={"value": 10, "discountType": "percent", "scope": "total"})
    discounted_bill = expect_ok(discount, "billing/discount")
    assert discounted_bill["total"] <= discounted_bill["subtotal"]

    current = client.get("/billing/current")
    current_bill = expect_ok(current, "billing/current")
    assert current_bill["itemCount"] == 1

    checkout = client.post("/billing/checkout", json={})
    checkout_data = expect_ok(checkout, "billing/checkout")
    assert checkout_data["transaction"]["total"] >= 0

    voice = client.post("/voice/process", json={"text": "add 1 maggi", "execute": True})
    voice_data = expect_ok(voice, "voice/process")
    assert voice_data["command"]["action"] == "add"

    wake = client.post("/voice/process", json={"text": "lekha", "execute": True})
    wake_data = expect_ok(wake, "voice/process(wake)")
    assert wake_data["command"]["action"] == "activate"
    assert wake_data["execution"] is None

    wake_alias = client.post("/voice/process", json={"text": "hey bhashabill", "execute": True})
    wake_alias_data = expect_ok(wake_alias, "voice/process(wake-alias)")
    assert wake_alias_data["command"]["action"] == "activate"

    summary = client.get("/analytics/summary")
    summary_data = expect_ok(summary, "analytics/summary")
    assert summary_data["transactionCount"] >= 1

    top_items = client.get("/analytics/top-items")
    top_items_data = expect_ok(top_items, "analytics/top-items")
    assert isinstance(top_items_data, list)

    peak_hours = client.get("/analytics/peak-hours")
    peak_hours_data = expect_ok(peak_hours, "analytics/peak-hours")
    assert isinstance(peak_hours_data, list)

    insights = client.get("/insights/recommendations")
    insights_data = expect_ok(insights, "insights/recommendations")
    assert "bundleSuggestions" in insights_data

    print("SMOKE TEST PASSED")


if __name__ == "__main__":
    run_smoke_test()
