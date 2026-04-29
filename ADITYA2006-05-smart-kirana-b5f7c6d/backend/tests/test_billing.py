from __future__ import annotations

from pathlib import Path

from app import create_app


def test_billing_checkout_updates_stock(tmp_path):
    db_path = tmp_path / "test_billing.db"
    app = create_app({"TESTING": True, "AUTH_REQUIRED": False, "DATABASE_URL": f"sqlite:///{db_path.as_posix()}"})
    client = app.test_client()

    # add product
    resp = client.post('/inventory/add', json={"name": "Maggi", "price": 14, "stock": 10})
    assert resp.status_code < 400
    product = resp.get_json()["data"]
    assert product["name"] == "Maggi"

    # add to bill
    resp = client.post('/billing/add', json={"item": "maggi", "qty": 2})
    assert resp.status_code < 400
    bill = resp.get_json()["data"]
    assert bill["itemCount"] == 1

    # checkout
    resp = client.post('/billing/checkout', json={})
    assert resp.status_code < 400
    data = resp.get_json()["data"]
    assert data.get("transaction")
    # inventory should be decremented
    resp = client.get('/inventory')
    assert resp.status_code < 400
    inv = resp.get_json()["data"]
    maggi = next((p for p in inv if p["name"] == "Maggi"), None)
    assert maggi is not None
    assert maggi["stock"] == 8 or float(maggi["stock"]) == 8.0
