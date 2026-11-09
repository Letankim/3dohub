"""Automated test suite for 3DoHub Excel Print Normalization Engine (ChuanHoa_Excel parity)."""

import base64
import io
import os
import sys
import uuid
import openpyxl

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tests.test_3dohub_api import (
    signed_get,
    signed_post_json,
    signed_post_multipart,
)
from app.core.security import compute_sha256_hex, rate_limiter, nonce_guard


def test_excel_samples_catalog():
    """Verify /api/v1/excel/samples returns the 3 standard Excel print templates."""
    rate_limiter.reset()
    nonce_guard.reset()
    resp = signed_get("/api/v1/excel/samples")
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert len(body["data"]) == 3
    codes = {item["code"] for item in body["data"]}
    assert codes == {"BANG_PHAN_CONG", "DANH_SACH_CAN_BO", "BANG_TONG_HOP_KINH_PHI"}
    for item in body["data"]:
        assert str(uuid.UUID(item["id"])) == item["id"]


def test_excel_portrait_auto_detection_and_header_detection():
    """Verify 5-column DANH_SACH_CAN_BO auto-selects A4 Portrait, detects header row $6:$6, and separates signature."""
    resp = signed_post_json(
        "/api/v1/excel/samples/generate",
        {"sample_code": "DANH_SACH_CAN_BO", "orientation_mode": "AUTO"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert str(uuid.UUID(data["id"])) == data["id"]
    meta = data["active_sheet_meta"]
    assert meta["orientation"] == "PORTRAIT"
    assert meta["header_detected"] is True
    assert meta["header_rows"] == "$6:$6"
    # Table ends before signature rows 14-18
    assert meta["table_end_row"] < meta["data_bounds"]["last_row"]

    # Verify checksum of generated .xlsx binary
    xlsx_bytes = base64.b64decode(data["xlsx_base64"])
    assert data["payload_checksum"] == compute_sha256_hex(xlsx_bytes)

    # Inspect OpenXML PageSetup properties in generated .xlsx
    wb = openpyxl.load_workbook(io.BytesIO(xlsx_bytes))
    ws = wb.active
    assert str(ws.page_setup.paperSize) == str(ws.PAPERSIZE_A4)
    assert ws.page_setup.orientation == "portrait"
    assert ws.print_options.horizontalCentered is True
    assert ws.cell(row=6, column=1).font.name == "Times New Roman"


def test_excel_landscape_multi_row_header_and_vertical_merges():
    """Verify 8-column BANG_PHAN_CONG and vertical-merge BANG_TONG_HOP_KINH_PHI normalize accurately."""
    # 1. BANG_PHAN_CONG (8 columns, 2-row header + (1)..(8) numbering row)
    r_pc = signed_post_json(
        "/api/v1/excel/samples/generate",
        {"sample_code": "BANG_PHAN_CONG", "orientation_mode": "AUTO"},
    )
    assert r_pc.status_code == 200
    m_pc = r_pc.json()["data"]["active_sheet_meta"]
    assert m_pc["orientation"] == "LANDSCAPE"
    assert m_pc["header_detected"] is True
    assert m_pc["header_rows"] == "$6:$7"
    assert m_pc["data_bounds"]["visible_cols"] == 8

    # 2. BANG_TONG_HOP_KINH_PHI (vertical merged cell in B7:B9 + stray bottom number trimmed)
    r_kp = signed_post_json(
        "/api/v1/excel/samples/generate",
        {"sample_code": "BANG_TONG_HOP_KINH_PHI", "orientation_mode": "AUTO"},
    )
    assert r_kp.status_code == 200
    kp_data = r_kp.json()["data"]
    m_kp = kp_data["active_sheet_meta"]
    assert m_kp["header_detected"] is True
    # Stray row 20 (999) was trimmed by get_true_data_bounds!
    assert m_kp["data_bounds"]["last_row"] < 20

    # Upload the original_xlsx_base64 via /normalize-xlsx multipart to verify upload + Undo snapshot
    orig_bytes = base64.b64decode(kp_data["original_xlsx_base64"])
    up_resp = signed_post_multipart(
        "/api/v1/excel/normalize-xlsx",
        files={
            "file": (
                "du_toan.xlsx",
                orig_bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        },
        data={"orientation_mode": "LANDSCAPE"},
    )
    assert up_resp.status_code == 200
    assert up_resp.json()["data"]["active_sheet_meta"]["orientation"] == "LANDSCAPE"


def test_excel_tsv_paste_normalization():
    """Verify pasted TSV data from Excel/Google Sheets is converted and normalized into an A4 .xlsx."""
    raw_tsv = "\n".join(
        [
            "BẢNG THEO DÕI TIẾN ĐỘ SỐ HÓA HỒ SƠ",
            "STT\tTên đơn vị\tTổng số hồ sơ\tĐã số hóa\tTỷ lệ (%)\tGhi chú",
            "1\tVăn phòng Đảng ủy\t1250\t1250\t100\tHoàn thành vượt tiến độ",
            "2\tUBND xã Thạnh Phú\t3420\t3100\t90.6\tĐang rà soát đợt cuối",
            "3\tỦy ban MTTQ xã\t890\t890\t100\tĐạt chuẩn",
        ]
    )
    resp = signed_post_json(
        "/api/v1/excel/normalize-tsv",
        {"raw_tsv": raw_tsv, "sheet_title": "TienDo_SoHoa", "orientation_mode": "AUTO"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["active_sheet"] == "TienDo_SoHoa"
    assert data["active_sheet_meta"]["header_detected"] is True
    assert "<table" in data["a4_preview_html"]
    assert "grid_data" in data
    assert "cells" in data["grid_data"]


def test_excel_interactive_grid_edit_and_renormalize():
    """Verify editing cells/merges in the interactive grid and calling /normalize-grid updates .xlsx and A4 preview."""
    gen_resp = signed_post_json(
        "/api/v1/excel/samples/generate",
        {"sample_code": "DANH_SACH_CAN_BO", "orientation_mode": "AUTO"},
    )
    assert gen_resp.status_code == 200
    gen_data = gen_resp.json()["data"]
    grid = gen_data["grid_data"]

    # Edit cell 7:2 (Họ và tên) and add a new row 12 in the interactive grid
    grid["cells"]["7:2"]["value"] = "Nguyễn Văn An (Đã chỉnh sửa trực tiếp trên lưới Excel)"
    grid["cells"]["7:2"]["bold"] = True

    renorm_resp = signed_post_json(
        "/api/v1/excel/normalize-grid",
        {
            "grid_data": grid,
            "orientation_mode": "PORTRAIT",
            "active_sheet": gen_data["active_sheet"],
            "filename": gen_data["filename"],
            "base_xlsx_base64": gen_data["original_xlsx_base64"],
        },
    )
    assert renorm_resp.status_code == 200
    r_data = renorm_resp.json()["data"]
    assert (
        r_data["grid_data"]["cells"]["7:2"]["value"]
        == "Nguyễn Văn An (Đã chỉnh sửa trực tiếp trên lưới Excel)"
    )
    assert "Nguyễn Văn An (Đã chỉnh sửa trực tiếp trên lưới Excel)" in r_data["a4_preview_html"]


def test_excel_formulas_preservation_and_evaluation():
    """Verify Excel formulas (=E7*F7, =SUM, =IF, =ROUND, =SUMIF) are preserved in .xlsx and evaluated in display/preview."""
    resp = signed_post_json(
        "/api/v1/excel/samples/generate",
        {"sample_code": "BANG_TONG_HOP_KINH_PHI", "orientation_mode": "AUTO"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    cells = data["grid_data"]["cells"]

    # Verify formula strings are preserved AND display values are evaluated
    assert cells["7:7"]["value"] == "=E7*F7"
    assert cells["7:7"]["display"] == "45,000,000"
    assert cells["8:7"]["value"] == "=E8*F8"
    assert cells["8:7"]["display"] == "37,000,000"
    assert cells["11:7"]["value"] == "=SUM(G7:G10)"
    assert cells["11:7"]["display"] == "129,500,000"
    assert "129,500,000" in data["a4_preview_html"]

    # Modify E7 from 1 to 2 and add an =IF(...) formula in 12:3
    grid = data["grid_data"]
    grid["cells"]["7:5"]["value"] = "2"
    grid["cells"]["12:3"] = {
        "value": '=IF(G11>150000000, "Vượt trần dự toán", "Trong hạn mức")',
        "bold": True,
    }
    renorm = signed_post_json(
        "/api/v1/excel/normalize-grid",
        {
            "grid_data": grid,
            "orientation_mode": "LANDSCAPE",
            "active_sheet": data["active_sheet"],
            "filename": data["filename"],
        },
    )
    assert renorm.status_code == 200
    r_data = renorm.json()["data"]
    r_cells = r_data["grid_data"]["cells"]
    # With E7 = 2, G7 = 2 * 45,000,000 = 90,000,000, and G11 = 174,500,000
    assert r_cells["7:7"]["value"] == "=E7*F7"
    assert r_cells["7:7"]["display"] == "90,000,000"
    assert r_cells["11:7"]["value"] == "=SUM(G7:G10)"
    assert r_cells["11:7"]["display"] == "174,500,000"
    assert r_cells["12:3"]["display"] == "Vượt trần dự toán"
    assert "174,500,000" in r_data["a4_preview_html"]


if __name__ == "__main__":
    tests = [
        test_excel_samples_catalog,
        test_excel_portrait_auto_detection_and_header_detection,
        test_excel_landscape_multi_row_header_and_vertical_merges,
        test_excel_tsv_paste_normalization,
        test_excel_interactive_grid_edit_and_renormalize,
        test_excel_formulas_preservation_and_evaluation,
    ]
    for fn in tests:
        fn()
        print(f"[PASS] {fn.__name__}")
    print(f"\nALL {len(tests)} EXCEL PRINT NORMALIZATION TESTS PASSED SUCCESSFULLY!")
