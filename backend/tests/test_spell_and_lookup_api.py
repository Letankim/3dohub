"""Automated test suite for Backend Spell Check Engine & Legal Doc Lookup APIs."""

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


def make_headers(method: str, path: str, body_bytes: bytes = b"") -> dict[str, str]:
    ts = str(int(time.time() * 1000))
    nonce = uuid.uuid4().hex[:16]
    ph = compute_sha256_hex(body_bytes)
    sig = compute_canonical_hmac(method, path, ts, nonce, ph)
    return {
        "X-3DoHub-Timestamp": ts,
        "X-3DoHub-Nonce": nonce,
        "X-3DoHub-Payload-Hash": ph,
        "X-3DoHub-Signature": sig,
        "X-Forwarded-For": "127.0.0.1",
    }


def test_spell_check_analyze_and_autofix():
    rate_limiter.reset()
    nonce_guard.reset()

    # 0. Clean official Vietnamese document headers must produce ZERO false positives
    clean_text = (
        "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\n"
        "Độc lập - Tự do - Hạnh phúc\n\n"
        "Cộng hòa xã hội chủ nghĩa Việt Nam\n"
        "Đảng Cộng sản Việt Nam\n"
        "ỦY BAN NHÂN DÂN TỈNH MẪU"
    )
    raw_clean = json.dumps({"text": clean_text}, ensure_ascii=False).encode("utf-8")
    h0 = make_headers("POST", "/api/v1/spell-check/analyze", raw_clean)
    h0["Content-Type"] = "application/json"
    r0 = raw_client.post("/api/v1/spell-check/analyze", content=raw_clean, headers=h0)
    assert r0.status_code == 200
    assert r0.json()["data"]["stats"]["total"] == 0, f"Unexpected issues: {r0.json()['data']['issues']}"

    sample = (
        "Cộng hòa xã hội chủ nghĩa Việt Nam\n"
        "Độc lập - Tự do - Hạnh phúc\n"
        "BÁO CÁO\n"
        "Về việc kieemr tra và sát nhập theo Nghị định 30/2020/NĐ-CP.\n"
        "Thực hiện chỉ đạo của đảng cộng sản việt nam , mọi công tác chuẩn đoán ,bàng giao đã được sử lý.\n"
        "Tình hình vô hình chung đạt năng xuất cao và nhân dân đồng tình."
    )
    payload = {"text": sample}
    raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")

    # 1. Analyze
    h1 = make_headers("POST", "/api/v1/spell-check/analyze", raw)
    h1["Content-Type"] = "application/json"
    r1 = raw_client.post("/api/v1/spell-check/analyze", content=raw, headers=h1)
    assert r1.status_code == 200
    d1 = r1.json()["data"]
    assert d1["stats"]["total"] >= 10
    repls = {i["original"].lower(): i["replacement"] for i in d1["issues"]}
    assert repls.get("kieemr") == "kiểm"
    assert repls.get("sát nhập") == "sáp nhập"
    assert repls.get("chuẩn đoán") == "chẩn đoán"
    assert repls.get("bàng giao") == "bàn giao"
    assert repls.get("sử lý") == "xử lý"
    assert repls.get("năng xuất") == "năng suất"
    assert "30/2020/NĐ-CP" not in repls
    assert "cộng hòa xã hội chủ nghĩa việt" not in repls

    # 2. Auto-fix & verify zero issues afterwards
    h2 = make_headers("POST", "/api/v1/spell-check/auto-fix", raw)
    h2["Content-Type"] = "application/json"
    r2 = raw_client.post("/api/v1/spell-check/auto-fix", content=raw, headers=h2)
    assert r2.status_code == 200
    d2 = r2.json()["data"]
    assert "kiểm tra" in d2["fixed_text"]
    assert "sáp nhập" in d2["fixed_text"]
    assert "bàn giao" in d2["fixed_text"]
    assert "30/2020/NĐ-CP" in d2["fixed_text"]
    assert "Đảng Cộng sản Việt Nam" in d2["fixed_text"]
    assert "Cộng hòa xã hội chủ nghĩa Việt Nam" in d2["fixed_text"]
    assert d2["remaining"]["stats"]["total"] == 0


def test_doc_lookup_regulations_endpoint():
    rate_limiter.reset()
    nonce_guard.reset()

    h1 = make_headers("GET", "/api/v1/doc-lookup/regulations")
    r_all = raw_client.get("/api/v1/doc-lookup/regulations", headers=h1)
    assert r_all.status_code == 200
    assert len(r_all.json()["data"]) == 6

    h2 = make_headers("GET", "/api/v1/doc-lookup/regulations")
    r_search = raw_client.get("/api/v1/doc-lookup/regulations?q=khen thuong", headers=h2)
    assert r_search.status_code == 200
    items = r_search.json()["data"]
    assert len(items) == 1
    assert items[0]["documentNumber"] == "152/2025/NĐ-CP"


if __name__ == "__main__":
    test_spell_check_analyze_and_autofix()
    print("[PASS] test_spell_check_analyze_and_autofix")
    test_doc_lookup_regulations_endpoint()
    print("[PASS] test_doc_lookup_regulations_endpoint")
    print("\nALL SPELL CHECK & DOC LOOKUP BACKEND TESTS PASSED!")

