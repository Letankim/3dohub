"""Automated test suite for the 165+ extended administrative templates catalog."""

import base64
import json
import os
import sys
import time
import uuid

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.core.security import (
    compute_sha256_hex,
    compute_canonical_hmac,
    rate_limiter,
    nonce_guard,
)

raw_client = TestClient(app)


def make_security_headers(
    method: str, path_only: str, body_bytes: bytes = b""
) -> dict[str, str]:
    ts = str(int(time.time() * 1000))
    nonce = uuid.uuid4().hex[:16]
    payload_hash = compute_sha256_hex(body_bytes)
    sig = compute_canonical_hmac(method, path_only, ts, nonce, payload_hash)
    return {
        "X-3DoHub-Timestamp": ts,
        "X-3DoHub-Nonce": nonce,
        "X-3DoHub-Payload-Hash": payload_hash,
        "X-3DoHub-Signature": sig,
        "X-Forwarded-For": "127.0.0.1",
    }


def test_extended_catalog_listing_and_categories():
    rate_limiter.reset()
    nonce_guard.reset()

    # 1. Default returns 17 core
    headers = make_security_headers("GET", "/api/v1/van-ban/templates")
    r_core = raw_client.get("/api/v1/van-ban/templates", headers=headers)
    assert r_core.status_code == 200
    assert len(r_core.json()["data"]) == 17

    # 2. catalog=all returns all 165 anonymized templates
    headers = make_security_headers("GET", "/api/v1/van-ban/templates")
    r_all = raw_client.get("/api/v1/van-ban/templates?catalog=all", headers=headers)
    assert r_all.status_code == 200
    items = r_all.json()["data"]
    assert len(items) == 165

    # 3. Filter by category THI_DUA returns 13 items
    headers = make_security_headers("GET", "/api/v1/van-ban/templates")
    r_td = raw_client.get("/api/v1/van-ban/templates?category=THI_DUA", headers=headers)
    assert r_td.status_code == 200
    assert len(r_td.json()["data"]) == 13


def test_extended_template_generation_and_injection():
    rate_limiter.reset()
    nonce_guard.reset()

    payload = {
        "template_tag": "THI_DUA|01",
        "profile_id": "CHINH_QUYEN",
        "unit_info": {
            "cap_tren": "ỦY BAN NHÂN DÂN TỈNH MẪU",
            "co_quan": "SỞ NỘI VỤ",
            "viet_tat": "SNV",
            "dia_danh": "Thành phố Mẫu",
            "tham_quyen": "KT. GIÁM ĐỐC",
            "chuc_vu": "PHÓ GIÁM ĐỐC",
            "ho_ten": "Trần Văn Kiểm Thử",
        },
    }
    raw_bytes = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    headers = make_security_headers("POST", "/api/v1/van-ban/templates/generate", raw_bytes)
    headers["Content-Type"] = "application/json"

    resp = raw_client.post("/api/v1/van-ban/templates/generate", content=raw_bytes, headers=headers)
    assert resp.status_code == 200
    data = resp.json()["data"]

    assert "SỞ NỘI VỤ" in data["normalized_text"]
    assert "Thành phố Mẫu" in data["normalized_text"]
    assert "Trần Văn Kiểm Thử" in data["normalized_text"]
    assert len(base64.b64decode(data["docx_base64"])) > 2000


if __name__ == "__main__":
    test_extended_catalog_listing_and_categories()
    print("[PASS] test_extended_catalog_listing_and_categories")
    test_extended_template_generation_and_injection()
    print("[PASS] test_extended_template_generation_and_injection")
    print("\nALL EXTENDED TEMPLATES TESTS PASSED!")
