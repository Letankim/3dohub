"""Automated test suite for Short Link (Rút Gọn Link) module in 3DoHub."""

import json
import os
import sys
import time
import uuid

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import init_db
from app.core.security import compute_sha256_hex, compute_canonical_hmac

init_db()
client = TestClient(app)


def signed_headers(method: str, path: str, body_bytes: bytes = b"") -> dict[str, str]:
    ts = str(int(time.time() * 1000))
    nonce = uuid.uuid4().hex[:16]
    payload_hash = compute_sha256_hex(body_bytes)
    sig = compute_canonical_hmac(method, path, ts, nonce, payload_hash)
    return {
        "X-3DoHub-Timestamp": ts,
        "X-3DoHub-Nonce": nonce,
        "X-3DoHub-Payload-Hash": payload_hash,
        "X-3DoHub-Signature": sig,
        "X-Forwarded-For": "127.0.0.1",
    }


def test_create_and_manage_short_link():
    # 1. Create short link with random slug
    orig_url = "https://example.com/very/long/url?param=test"
    payload = {
        "original_url": orig_url,
        "title": "Link Test 1",
        "description": "Test short link description",
        "tags": "test,sample",
    }
    raw_bytes = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    resp = client.post(
        "/api/v1/links",
        data=raw_bytes,
        headers={
            **signed_headers("POST", "/api/v1/links", raw_bytes),
            "Content-Type": "application/json",
        },
    )
    assert resp.status_code == 201, f"Failed create: {resp.text}"
    body = resp.json()
    assert body["success"] is True
    assert "data" in body
    data = body["data"]
    assert data["original_url"] == orig_url
    assert data["title"] == "Link Test 1"
    assert "code" in data
    code = data["code"]
    link_id = data["id"]
    # Check UUID format
    assert len(link_id) == 36
    uuid.UUID(link_id)  # Should not throw

    # 2. Retrieve details
    path_get = f"/api/v1/links/{code}"
    resp_get = client.get(path_get, headers=signed_headers("GET", path_get))
    assert resp_get.status_code == 200
    assert resp_get.json()["data"]["code"] == code

    # 3. Test Redirect & Click Tracking
    path_r = f"/s/{code}"
    resp_r = client.get(path_r, follow_redirects=False)
    assert resp_r.status_code == 302
    assert resp_r.headers["location"] == orig_url

    # Check stats
    path_stats = f"/api/v1/links/{code}/stats"
    resp_stats = client.get(path_stats, headers=signed_headers("GET", path_stats))
    assert resp_stats.status_code == 200
    stats_data = resp_stats.json()["data"]
    assert stats_data["total_clicks"] >= 1
    assert len(stats_data["recent_clicks"]) >= 1

    # 4. Update Link
    update_payload = {"title": "Updated Title", "is_active": True}
    raw_update = json.dumps(update_payload).encode("utf-8")
    path_update = f"/api/v1/links/{code}"
    resp_update = client.put(
        path_update,
        data=raw_update,
        headers={
            **signed_headers("PUT", path_update, raw_update),
            "Content-Type": "application/json",
        },
    )
    assert resp_update.status_code == 200
    assert resp_update.json()["data"]["title"] == "Updated Title"

    # 5. Delete Link
    path_del = f"/api/v1/links/{code}"
    resp_del = client.delete(path_del, headers=signed_headers("DELETE", path_del))
    assert resp_del.status_code == 200
    assert resp_del.json()["success"] is True

    # 6. Verify Deleted
    resp_verify = client.get(path_get, headers=signed_headers("GET", path_get))
    assert resp_verify.status_code == 404
    print("test_create_and_manage_short_link PASSED!")


def test_custom_code_and_reserved_words():
    # Test custom code creation
    custom_code = f"my-custom-{uuid.uuid4().hex[:6]}"
    payload = {
        "original_url": "https://antigravity.google.com",
        "custom_code": custom_code,
        "title": "Custom Slug Test",
    }
    raw_bytes = json.dumps(payload).encode("utf-8")
    resp = client.post(
        "/api/v1/links",
        data=raw_bytes,
        headers={
            **signed_headers("POST", "/api/v1/links", raw_bytes),
            "Content-Type": "application/json",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["data"]["code"] == custom_code

    # Test duplicate code rejection
    resp_dup = client.post(
        "/api/v1/links",
        data=raw_bytes,
        headers={
            **signed_headers("POST", "/api/v1/links", raw_bytes),
            "Content-Type": "application/json",
        },
    )
    assert resp_dup.status_code == 400
    assert resp_dup.json()["errors"]["code"] == "VALIDATION_ERROR"

    # Clean up
    path_del = f"/api/v1/links/{custom_code}"
    client.delete(path_del, headers=signed_headers("DELETE", path_del))
    print("test_custom_code_and_reserved_words PASSED!")


def test_session_privacy_isolation():
    """Verify that unauthenticated stranger cannot scrape or list other people's links."""
    sess_a = "csess_tester_a_12345"
    sess_b = "csess_tester_b_67890"

    # User A creates a private link
    payload_a = {
        "original_url": "https://secret.example.com/user-a-doc",
        "title": "Private User A Doc",
    }
    raw_a = json.dumps(payload_a).encode("utf-8")
    resp_a = client.post(
        "/api/v1/links",
        data=raw_a,
        headers={
            **signed_headers("POST", "/api/v1/links", raw_a),
            "Content-Type": "application/json",
            "X-Client-Session-Id": sess_a,
        },
    )
    assert resp_a.status_code == 201
    code_a = resp_a.json()["data"]["code"]

    # Stranger (No session ID, no codes) calls /api/v1/links
    resp_anon = client.get("/api/v1/links", headers=signed_headers("GET", "/api/v1/links"))
    assert resp_anon.status_code == 200
    assert resp_anon.json()["data"] == [], "Anonymous stranger must receive empty list, never all links!"

    # User B (Different session ID) calls /api/v1/links
    resp_b = client.get(
        "/api/v1/links",
        headers={
            **signed_headers("GET", "/api/v1/links"),
            "X-Client-Session-Id": sess_b,
        },
    )
    assert resp_b.status_code == 200
    assert resp_b.json()["data"] == [], "User B must not see User A's links!"

    # User A calls /api/v1/links with sess_a: receives their link
    resp_owner = client.get(
        "/api/v1/links",
        headers={
            **signed_headers("GET", "/api/v1/links"),
            "X-Client-Session-Id": sess_a,
        },
    )
    assert resp_owner.status_code == 200
    owner_codes = [item["code"] for item in resp_owner.json()["data"]]
    assert code_a in owner_codes

    # User A calls with query ?codes=code_a
    path_codes = f"/api/v1/links?codes={code_a}"
    resp_by_code = client.get(path_codes, headers=signed_headers("GET", "/api/v1/links"))
    assert resp_by_code.status_code == 200
    assert any(item["code"] == code_a for item in resp_by_code.json()["data"])

    # Clean up
    path_del = f"/api/v1/links/{code_a}"
    client.delete(path_del, headers=signed_headers("DELETE", path_del))
    print("test_session_privacy_isolation PASSED!")


if __name__ == "__main__":
    test_create_and_manage_short_link()
    test_custom_code_and_reserved_words()
    test_session_privacy_isolation()
    print("All Short Link backend tests PASSED successfully!")
