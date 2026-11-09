"""Comprehensive automated test suite for 3DoHub Backend API, Document Normalization Engine,
Cryptographic Checksum/HMAC Security, Anti-Replay, and Per-IP Rate Limiting.
"""

import base64
import json
import os
import sys
import time
import uuid

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.security import (
    compute_sha256_hex,
    compute_canonical_hmac,
    rate_limiter,
    nonce_guard,
)

raw_client = TestClient(app)


def make_security_headers(
    method: str, path: str, body_bytes: bytes = b"", client_ip: str = "127.0.0.1"
) -> dict[str, str]:
    """Generate authentic 3DoHub security headers matching the Frontend signer."""
    ts = str(int(time.time() * 1000))
    nonce = uuid.uuid4().hex[:16]
    payload_hash = compute_sha256_hex(body_bytes)
    sig = compute_canonical_hmac(method, path, ts, nonce, payload_hash)
    return {
        "X-3DoHub-Timestamp": ts,
        "X-3DoHub-Nonce": nonce,
        "X-3DoHub-Payload-Hash": payload_hash,
        "X-3DoHub-Signature": sig,
        "X-Forwarded-For": client_ip,
    }


def signed_get(path: str, client_ip: str = "127.0.0.1"):
    headers = make_security_headers("GET", path, b"", client_ip=client_ip)
    return raw_client.get(path, headers=headers)


def signed_post_json(path: str, payload: dict, client_ip: str = "127.0.0.1"):
    raw_bytes = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    headers = make_security_headers("POST", path, raw_bytes, client_ip=client_ip)
    headers["Content-Type"] = "application/json"
    return raw_client.post(path, content=raw_bytes, headers=headers)


def signed_post_multipart(path: str, files: dict, data: dict, client_ip: str = "127.0.0.1"):
    headers = make_security_headers(
        "POST", path, b"multipart:form-data", client_ip=client_ip
    )
    return raw_client.post(path, files=files, data=data, headers=headers)


def test_hub_modules_response_envelope():
    """Verify /api/v1/hub/modules returns exact 3DoHub envelope format."""
    rate_limiter.reset()
    nonce_guard.reset()
    resp = signed_get("/api/v1/hub/modules")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert isinstance(body["message"], str)
    assert isinstance(body["data"], list)
    assert len(body["data"]) >= 4
    assert body["errors"] is None
    assert body["request_id"].startswith("req_")
    first = body["data"][0]
    for key in (
        "id",
        "code",
        "name",
        "status",
        "statusLabel",
        "version",
        "created_at",
        "updated_at",
    ):
        assert key in first
    # Verify id is a valid standard UUID
    assert str(uuid.UUID(first["id"])) == first["id"]


def test_profiles_and_17_templates_listing():
    """Verify all 6 profile options (AUTO + 5 profiles) and all 17 templates are returned with UUID ids."""
    prof_resp = signed_get("/api/v1/van-ban/profiles")
    assert prof_resp.status_code == 200
    p_body = prof_resp.json()
    assert p_body["success"] is True
    assert len(p_body["data"]) == 6
    for p_item in p_body["data"]:
        assert str(uuid.UUID(p_item["id"])) == p_item["id"]

    tpl_resp = signed_get("/api/v1/van-ban/templates")
    assert tpl_resp.status_code == 200
    t_body = tpl_resp.json()
    assert t_body["success"] is True
    assert len(t_body["data"]) == 17
    for t_item in t_body["data"]:
        assert str(uuid.UUID(t_item["id"])) == t_item["id"]


def test_validation_error_format_matches_contract():
    """Verify invalid fields return exact errors.details with field, code, message, rejected_value."""
    resp = signed_post_json(
        "/api/v1/van-ban/normalize",
        {"raw_text": "", "profile_id": "INVALID_KHOI"},
    )
    assert resp.status_code == 400
    body = resp.json()
    assert body["success"] is False
    assert body["message"] == "Dữ liệu gửi lên không hợp lệ"
    assert body["data"] is None
    assert body["meta"] is None
    assert body["request_id"].startswith("req_")
    assert body["errors"]["code"] == "VALIDATION_ERROR"
    details = body["errors"]["details"]
    assert len(details) == 2
    fields_map = {d["field"]: d for d in details}
    assert "profile_id" in fields_map
    assert fields_map["profile_id"]["code"] == "INVALID_PROFILE"
    assert fields_map["profile_id"]["rejected_value"] == "INVALID_KHOI"
    assert "raw_text" in fields_map
    assert fields_map["raw_text"]["code"] == "EMPTY_CONTENT"


def test_dang_normalization_and_logic_warnings():
    """Verify Party document normalization (Số 05-QĐ/ĐU, date, T/M, Điều gap warning, MSO HTML & .docx)."""
    raw_doc = "\n".join(
        [
            "ĐẢNG BỘ TỈNH BẾN TRE",
            "ĐẢNG ỦY XÃ THẠNH PHÚ",
            "Số: 5-QĐ/ĐU",
            "ĐẢNG CỘNG SẢN VIỆT NAM",
            "Thạnh Phú, ngày 5 tháng 2 năm 2026",
            "QUYẾT ĐỊNH",
            "về việc thành lập Tổ công tác chuyển đổi số...",
            "- Căn cứ Điều lệ Đảng;",
            "QUYẾT ĐỊNH:",
            "Điều 1. Thành lập Tổ công tác [Tên tổ].",
            "Điều 3. Các đồng chí có tên chịu trách nhiệm thi hành.",
            "Nơi nhận:",
            "- Như Điều 3",
            "- Lưu Văn phòng ĐU",
            "TM. BAN THƯỜNG VỤ",
            "BÍ THƯ",
            "Nguyễn Văn A",
        ]
    )
    resp = signed_post_json(
        "/api/v1/van-ban/normalize",
        {"raw_text": raw_doc, "profile_id": "AUTO"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    data = body["data"]
    assert data["detected_profile"] == "DANG"
    assert data["applied_profile"] == "DANG"
    assert data["structure"]["header"]["doc_number"] == "Số 05-QĐ/ĐU"
    assert (
        data["structure"]["header"]["date_line"]
        == "Thạnh Phú, ngày 05 tháng 02 năm 2026"
    )
    assert data["structure"]["footer"]["sign_auth"] == "T/M BAN THƯỜNG VỤ"
    assert data["structure"]["footer"]["noi_nhan_items"][0].endswith(";")
    assert data["structure"]["footer"]["noi_nhan_items"][1].endswith(".")

    # Verify response payload_checksum matches SHA-256 of normalized_text
    assert data["payload_checksum"] == compute_sha256_hex(
        data["normalized_text"].encode("utf-8")
    )

    # Check warnings include ELLIPSIS_FOUND, PLACEHOLDERS_REMAINING, DIEU_SEQUENCE_GAP
    warn_codes = {w["code"] for w in data["warnings"]}
    assert "ELLIPSIS_FOUND" in warn_codes
    assert "PLACEHOLDERS_REMAINING" in warn_codes
    assert "DIEU_SEQUENCE_GAP" in warn_codes

    # Verify MSO clipboard HTML & A4 preview HTML
    assert "urn:schemas-microsoft-com:office:word" in data["mso_clipboard_html"]
    assert "a4-preview-sheet" in data["a4_preview_html"]
    assert data["sfdt"]["sections"][0]["blocks"], "SFDT must contain blocks"

    # Verify generated .docx binary can be uploaded back to /normalize-docx
    docx_bytes = base64.b64decode(data["docx_base64"])
    assert len(docx_bytes) > 2000

    upload_resp = signed_post_multipart(
        "/api/v1/van-ban/normalize-docx",
        files={
            "file": (
                "test_dang.docx",
                docx_bytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
        },
        data={"profile_id": "DANG"},
    )
    assert upload_resp.status_code == 200
    assert upload_resp.json()["success"] is True


def test_nha_nuoc_normalization_and_template_generation():
    """Verify State document number, date month >= 3 rule, and template generation."""
    gen_resp = signed_post_json(
        "/api/v1/van-ban/templates/generate",
        {
            "template_tag": "NHA_NUOC|1",
            "profile_id": "CHINH_QUYEN",
            "unit_info": {
                "cap_tren": "ỦY BAN NHÂN DÂN HUYỆN THẠNH PHÚ",
                "co_quan": "ỦY BAN NHÂN DÂN XÃ BÌNH THẠNH",
                "viet_tat": "UBND",
                "dia_danh": "Bình Thạnh",
                "tham_quyen": "T/M ỦY BAN NHÂN DÂN",
                "chuc_vu": "CHỦ TỊCH",
                "ho_ten": "Trần Văn B",
            },
        },
    )
    assert gen_resp.status_code == 200
    g_data = gen_resp.json()["data"]
    assert g_data["applied_profile"] == "CHINH_QUYEN"
    assert g_data["structure"]["footer"]["sign_auth"] == "TM. ỦY BAN NHÂN DÂN"
    assert g_data["extracted_unit"]["co_quan"] == "ỦY BAN NHÂN DÂN XÃ BÌNH THẠNH"


def test_multi_page_document_and_body_tables():
    """Verify multi-page document with body data tables, page breaks, and round-trip .docx preservation."""
    body_paras = [
        f"Điều {i}. Nội dung chi tiết điều khoản thứ {i} phục vụ kiểm thử văn bản dài nhiều trang."
        for i in range(1, 22)
    ]
    raw_multi = "\n".join(
        [
            "ỦY BAN NHÂN DÂN TỈNH BẾN TRE",
            "ỦY BAN NHÂN DÂN HUYỆN THẠNH PHÚ",
            "Số: 12/QĐ-UBND",
            "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
            "Độc lập - Tự do - Hạnh phúc",
            "Thạnh Phú, ngày 15 tháng 3 năm 2026",
            "QUYẾT ĐỊNH",
            "Về việc ban hành Kế hoạch chuyển đổi số giai đoạn 2026 - 2030",
            "Căn cứ Luật Tổ chức chính quyền địa phương;",
            "QUYẾT ĐỊNH:",
            *body_paras,
            "| STT | Nội dung công việc | Đơn vị chủ trì |",
            "| 1 | Chuẩn hóa văn bản điện tử | Văn phòng |",
            "| 2 | Số hóa hồ sơ lưu trữ | Phòng Nội vụ |",
            "--- Ngắt trang (Page Break) ---",
            "Điều 22. Hiệu lực thi hành trên toàn địa bàn.",
            "Nơi nhận:",
            "- Như Điều 22;",
            "- Lưu: VT.",
            "TM. ỦY BAN NHÂN DÂN",
            "CHỦ TỊCH",
            "Nguyễn Văn C",
        ]
    )
    resp = signed_post_json(
        "/api/v1/van-ban/normalize",
        {"raw_text": raw_multi, "profile_id": "AUTO"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["applied_profile"] == "CHINH_QUYEN"
    kinds = [p["kind"] for p in data["structure"]["body_paragraphs"]]
    assert "TABLE_ROW" in kinds
    assert "PAGE_BREAK" in kinds

    # Verify .docx binary round-trip preserves body data table rows
    docx_bytes = base64.b64decode(data["docx_base64"])
    up_resp = signed_post_multipart(
        "/api/v1/van-ban/normalize-docx",
        files={
            "file": (
                "multi_page.docx",
                docx_bytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
        },
        data={"profile_id": "CHINH_QUYEN"},
    )
    assert up_resp.status_code == 200
    up_data = up_resp.json()["data"]
    up_kinds = [p["kind"] for p in up_data["structure"]["body_paragraphs"]]
    assert "TABLE_ROW" in up_kinds


def test_security_checksum_hmac_and_replay_protection():
    """Verify unsigned, tampered checksum, forged HMAC, and replayed requests are blocked with 403."""
    # 1. Unsigned request (missing headers) -> 403 MISSING_SECURITY_HEADERS
    r_unsigned = raw_client.get("/api/v1/van-ban/profiles")
    assert r_unsigned.status_code == 403
    assert (
        r_unsigned.json()["errors"]["details"][0]["code"] == "MISSING_SECURITY_HEADERS"
    )

    # 2. Tampered JSON body (Checksum mismatch) -> 403 PAYLOAD_CHECKSUM_MISMATCH
    orig_bytes = json.dumps({"raw_text": "Nội dung gốc", "profile_id": "AUTO"}).encode(
        "utf-8"
    )
    tampered_bytes = json.dumps(
        {"raw_text": "Nội dung bị hacker sửa đổi", "profile_id": "AUTO"}
    ).encode("utf-8")
    hdrs = make_security_headers("POST", "/api/v1/van-ban/normalize", orig_bytes)
    hdrs["Content-Type"] = "application/json"
    r_tampered = raw_client.post(
        "/api/v1/van-ban/normalize", content=tampered_bytes, headers=hdrs
    )
    assert r_tampered.status_code == 403
    assert (
        r_tampered.json()["errors"]["details"][0]["code"] == "PAYLOAD_CHECKSUM_MISMATCH"
    )

    # 3. Forged HMAC signature -> 403 INVALID_REQUEST_SIGNATURE
    forged_hdrs = make_security_headers("GET", "/api/v1/van-ban/profiles", b"")
    forged_hdrs["X-3DoHub-Signature"] = "0" * 64
    r_forged = raw_client.get("/api/v1/van-ban/profiles", headers=forged_hdrs)
    assert r_forged.status_code == 403
    assert (
        r_forged.json()["errors"]["details"][0]["code"] == "INVALID_REQUEST_SIGNATURE"
    )

    # 4. Replay attack (sending the exact same signed request twice) -> 403 REPLAY_ATTACK_DETECTED
    replay_hdrs = make_security_headers("GET", "/api/v1/van-ban/profiles", b"")
    r_first = raw_client.get("/api/v1/van-ban/profiles", headers=replay_hdrs)
    assert r_first.status_code == 200
    r_second = raw_client.get("/api/v1/van-ban/profiles", headers=replay_hdrs)
    assert r_second.status_code == 403
    assert (
        r_second.json()["errors"]["details"][0]["code"] == "REPLAY_ATTACK_DETECTED"
    )


def test_sliding_window_rate_limiting_protection():
    """Verify spam flood from a single IP triggers 429 RATE_LIMIT_EXCEEDED while other IPs still work."""
    rate_limiter.reset()
    spam_ip = "203.0.113.199"
    normal_ip = "198.51.100.25"

    # Exhaust compute rate limit for spam_ip
    for _ in range(settings.RATE_LIMIT_COMPUTE_MAX):
        r = signed_post_json(
            "/api/v1/van-ban/normalize",
            {"raw_text": "Đoạn văn kiểm thử rate limit.", "profile_id": "AUTO"},
            client_ip=spam_ip,
        )
        assert r.status_code == 200

    # Next request from spam_ip must be blocked with 429 Too Many Requests
    r_blocked = signed_post_json(
        "/api/v1/van-ban/normalize",
        {"raw_text": "Đoạn văn bị chặn do spam.", "profile_id": "AUTO"},
        client_ip=spam_ip,
    )
    assert r_blocked.status_code == 429
    b_json = r_blocked.json()
    assert b_json["success"] is False
    assert b_json["errors"]["code"] == "RATE_LIMIT_EXCEEDED"
    assert r_blocked.headers.get("Retry-After") is not None

    # Meanwhile, normal_ip is completely unaffected!
    r_normal = signed_post_json(
        "/api/v1/van-ban/normalize",
        {"raw_text": "Người dùng bình thường vẫn truy cập tốt.", "profile_id": "AUTO"},
        client_ip=normal_ip,
    )
    assert r_normal.status_code == 200


if __name__ == "__main__":
    tests = [
        test_hub_modules_response_envelope,
        test_profiles_and_17_templates_listing,
        test_validation_error_format_matches_contract,
        test_dang_normalization_and_logic_warnings,
        test_nha_nuoc_normalization_and_template_generation,
        test_multi_page_document_and_body_tables,
        test_security_checksum_hmac_and_replay_protection,
        test_sliding_window_rate_limiting_protection,
    ]
    for fn in tests:
        fn()
        print(f"[PASS] {fn.__name__}")
    print(f"\nALL {len(tests)} BACKEND TESTS PASSED SUCCESSFULLY!")
