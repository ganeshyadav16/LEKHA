from __future__ import annotations

from pathlib import Path

from app import create_app


def test_suppliers_crud(tmp_path):
    db_path = tmp_path / "test_suppliers.db"
    app = create_app({"TESTING": True, "AUTH_REQUIRED": False, "DATABASE_URL": f"sqlite:///{db_path.as_posix()}"})
    client = app.test_client()

    # add supplier
    resp = client.post("/suppliers/add", json={"name": "ACME Supplies", "contactName": "Ravi", "phone": "9999999999"})
    assert resp.status_code < 400
    body = resp.get_json()
    assert body and body.get("ok") is True
    sup = body["data"]
    assert sup["name"] == "ACME Supplies"

    # list suppliers
    resp = client.get("/suppliers")
    assert resp.status_code < 400
    body = resp.get_json()
    assert isinstance(body.get("data"), list)

    # update supplier
    resp = client.put("/suppliers/update", json={"id": sup["id"], "phone": "8888888888"})
    assert resp.status_code < 400
    body = resp.get_json()
    updated = body["data"]
    assert updated["phone"] == "8888888888"

    # delete (soft)
    resp = client.delete("/suppliers/delete", json={"id": sup["id"]})
    assert resp.status_code < 400
    body = resp.get_json()
    assert body["data"].get("deleted") is True
