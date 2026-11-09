"""FastAPI Router for Excel A4 Print & Table Normalizer Module (/api/v1/excel/*)."""

import base64
import io
import uuid
from typing import Any, Optional
import openpyxl
from fastapi import APIRouter, File, Form, Request, UploadFile
from pydantic import BaseModel, Field

from app.core.config import now_iso_vn
from app.core.exceptions import BusinessValidationException
from app.core.response import api_success
from app.core.security import compute_sha256_hex, validate_xlsx_binary_safety
from app.modules.excel_norm.engine import normalize_workbook_bytes
from app.modules.excel_norm.grid_serializer import (
    build_workbook_bytes_from_grid_data,
    extract_sheet_grid_data,
)
from app.modules.excel_norm.preview_html import (
    parse_tsv_text_to_workbook_bytes,
    render_excel_a4_preview_html,
    render_raw_sheet_preview_html,
)
from app.modules.excel_norm.samples import (
    build_sample_workbook_bytes,
    get_excel_samples_list,
)

excel_router = APIRouter(prefix="/excel", tags=["Excel Print Normalization Engine"])

VALID_ORIENTATIONS = {"AUTO", "PORTRAIT", "LANDSCAPE"}


class GenerateExcelSamplePayload(BaseModel):
    sample_code: str = Field(..., min_length=2, max_length=60)
    orientation_mode: str = Field(default="AUTO")
    active_sheet: Optional[str] = Field(default=None)


class NormalizeTsvPayload(BaseModel):
    raw_tsv: str = Field(..., min_length=3, max_length=250000)
    sheet_title: str = Field(default="Bang_In_A4", max_length=31)
    orientation_mode: str = Field(default="AUTO")


class NormalizeBase64Payload(BaseModel):
    xlsx_base64: str = Field(..., min_length=20)
    orientation_mode: str = Field(default="AUTO")
    active_sheet: Optional[str] = Field(default=None)
    filename: str = Field(default="Bang_Chuan_Hoa_A4.xlsx")


class NormalizeGridPayload(BaseModel):
    grid_data: dict[str, Any]
    orientation_mode: str = Field(default="AUTO")
    active_sheet: str = Field(default="Bang_In_A4", max_length=31)
    filename: str = Field(default="Bang_Chuan_Hoa_A4.xlsx")
    base_xlsx_base64: Optional[str] = Field(default=None)


def _validate_orientation(mode: str) -> str:
    clean = (mode or "AUTO").strip().upper()
    if clean not in VALID_ORIENTATIONS:
        raise BusinessValidationException.single_field(
            field="orientation_mode",
            code="INVALID_ORIENTATION",
            message="Chế độ khổ giấy phải là AUTO, PORTRAIT hoặc LANDSCAPE",
            rejected_value=mode,
            top_message="Chế độ khổ giấy không hợp lệ.",
        )
    return clean


def _strip_internal_sheet_keys(meta: dict[str, Any]) -> dict[str, Any]:
    return {
        k: v
        for k, v in meta.items()
        if k not in ("col_widths", "row_heights", "h_start", "h_end", "eval_map")
    }


def _build_excel_response_data(
    raw_xlsx_bytes: bytes,
    orientation_mode: str,
    active_sheet_name: str,
    filename: str,
) -> dict[str, Any]:
    norm_bytes, sheets_meta, active_meta = normalize_workbook_bytes(
        raw_xlsx_bytes,
        orientation_mode=orientation_mode,
        active_sheet_name=active_sheet_name,
    )
    if not sheets_meta:
        raise BusinessValidationException.single_field(
            field="file",
            code="EMPTY_WORKBOOK",
            message="Không tìm thấy vùng dữ liệu hợp lệ để chuẩn hóa trang in",
            rejected_value=filename,
            top_message="Tệp Excel không có dữ liệu trên bất kỳ trang tính (Sheet) nào.",
        )

    a4_preview_html, mso_clipboard_html = render_excel_a4_preview_html(norm_bytes, active_meta)
    original_preview_html = render_raw_sheet_preview_html(raw_xlsx_bytes, active_meta)

    wb_norm = openpyxl.load_workbook(io.BytesIO(norm_bytes), data_only=False)
    s_name = active_meta.get("sheet_name", wb_norm.sheetnames[0])
    ws_norm = wb_norm[s_name] if s_name in wb_norm.sheetnames else wb_norm.active
    grid_data = extract_sheet_grid_data(ws_norm, active_meta)

    wb_orig = openpyxl.load_workbook(io.BytesIO(raw_xlsx_bytes), data_only=False)
    ws_orig = wb_orig[s_name] if s_name in wb_orig.sheetnames else wb_orig.active
    orig_meta_for_grid = {**active_meta, "col_widths": {}, "row_heights": {}}
    original_grid_data = extract_sheet_grid_data(ws_orig, orig_meta_for_grid)

    clean_sheets = [_strip_internal_sheet_keys(m) for m in sheets_meta]
    clean_active = _strip_internal_sheet_keys(active_meta)

    ts = now_iso_vn()
    return {
        "id": str(uuid.uuid4()),
        "filename": filename,
        "orientation_mode": orientation_mode,
        "active_sheet": clean_active.get("sheet_name"),
        "active_sheet_meta": clean_active,
        "sheets_meta": clean_sheets,
        "grid_data": grid_data,
        "original_grid_data": original_grid_data,
        "a4_preview_html": a4_preview_html,
        "original_preview_html": original_preview_html,
        "mso_clipboard_html": mso_clipboard_html,
        "xlsx_base64": base64.b64encode(norm_bytes).decode("ascii"),
        "original_xlsx_base64": base64.b64encode(raw_xlsx_bytes).decode("ascii"),
        "payload_checksum": compute_sha256_hex(norm_bytes),
        "original_checksum": compute_sha256_hex(raw_xlsx_bytes),
        "status": "NORMALIZED",
        "statusLabel": f"Đã chuẩn hóa ({clean_active.get('orientation_label', 'A4')})",
        "version": 1,
        "created_at": ts,
        "updated_at": ts,
    }


@excel_router.get("/samples")
async def list_excel_samples(request: Request):
    items = get_excel_samples_list()
    return api_success(
        data=items,
        message=f"Tải danh sách {len(items)} mẫu bảng tính Excel chuẩn thành công.",
        meta={"total": len(items)},
        request=request,
    )


@excel_router.post("/samples/generate")
async def generate_and_normalize_sample(payload: GenerateExcelSamplePayload, request: Request):
    orient = _validate_orientation(payload.orientation_mode)
    raw_bytes = build_sample_workbook_bytes(payload.sample_code)
    if not raw_bytes:
        raise BusinessValidationException.single_field(
            field="sample_code",
            code="SAMPLE_NOT_FOUND",
            message="Không tìm thấy mẫu bảng tính theo mã yêu cầu",
            rejected_value=payload.sample_code,
            top_message="Mã mẫu bảng tính Excel không tồn tại.",
            status_code=404,
        )

    data = _build_excel_response_data(
        raw_xlsx_bytes=raw_bytes,
        orientation_mode=orient,
        active_sheet_name=payload.active_sheet or "",
        filename=f"Mau_{payload.sample_code.upper()}_ChuanA4.xlsx",
    )
    return api_success(
        data=data,
        message=f"Đã khởi tạo và chuẩn hóa mẫu bảng tính '{payload.sample_code}' sang trang in A4 chuẩn.",
        request=request,
    )


@excel_router.post("/normalize-grid")
async def normalize_excel_from_interactive_grid(payload: NormalizeGridPayload, request: Request):
    orient = _validate_orientation(payload.orientation_mode)
    base_bytes: Optional[bytes] = None
    if payload.base_xlsx_base64:
        try:
            base_bytes = base64.b64decode(payload.base_xlsx_base64)
        except Exception:
            base_bytes = None

    raw_bytes = build_workbook_bytes_from_grid_data(
        grid_data=payload.grid_data,
        sheet_title=payload.active_sheet,
        base_xlsx_bytes=base_bytes,
    )
    data = _build_excel_response_data(
        raw_xlsx_bytes=raw_bytes,
        orientation_mode=orient,
        active_sheet_name=payload.active_sheet,
        filename=payload.filename,
    )
    return api_success(
        data=data,
        message="Đã chuẩn hóa bảng tính đang soạn sang trang in A4 chuẩn.",
        request=request,
    )


@excel_router.post("/normalize-base64")
async def normalize_excel_from_base64(payload: NormalizeBase64Payload, request: Request):
    orient = _validate_orientation(payload.orientation_mode)
    try:
        raw_bytes = base64.b64decode(payload.xlsx_base64)
    except Exception:
        raise BusinessValidationException.single_field(
            field="xlsx_base64",
            code="INVALID_BASE64",
            message="Không thể giải mã nội dung Base64 của bảng tính",
            rejected_value="corrupted_base64",
            top_message="Dữ liệu tệp Excel (Base64) không hợp lệ.",
        )

    ok, err_code, err_msg = validate_xlsx_binary_safety(raw_bytes)
    if not ok:
        raise BusinessValidationException.single_field(
            field="file",
            code=err_code,
            message=err_msg,
            rejected_value=payload.filename,
            top_message=err_msg,
        )
    data = _build_excel_response_data(
        raw_xlsx_bytes=raw_bytes,
        orientation_mode=orient,
        active_sheet_name=payload.active_sheet or "",
        filename=payload.filename,
    )
    return api_success(
        data=data,
        message="Chuẩn hóa trang in Excel A4 thành công.",
        request=request,
    )


@excel_router.post("/normalize-xlsx")
async def normalize_uploaded_xlsx(
    request: Request,
    file: UploadFile = File(...),
    orientation_mode: str = Form("AUTO"),
    active_sheet: str = Form(""),
):
    orient = _validate_orientation(orientation_mode)
    fname = file.filename or "Bang_Tinh.xlsx"
    if not fname.lower().endswith(".xlsx"):
        raise BusinessValidationException.single_field(
            field="file",
            code="UNSUPPORTED_FILE_EXTENSION",
            message="Vui lòng chọn tệp có đuôi .xlsx",
            rejected_value=fname,
            top_message="Chỉ hỗ trợ định dạng tệp bảng tính OpenXML .xlsx.",
        )

    raw_bytes = await file.read()
    ok, err_code, err_msg = validate_xlsx_binary_safety(raw_bytes)
    if not ok:
        raise BusinessValidationException.single_field(
            field="file",
            code=err_code,
            message=err_msg,
            rejected_value=fname,
            top_message=err_msg,
        )
    out_name = fname[:-5] + "_ChuanA4.xlsx"
    data = _build_excel_response_data(
        raw_xlsx_bytes=raw_bytes,
        orientation_mode=orient,
        active_sheet_name=active_sheet,
        filename=out_name,
    )
    return api_success(
        data=data,
        message=f"Đã chuẩn hóa trang in A4 cho tệp '{fname}' thành công.",
        request=request,
    )


@excel_router.post("/normalize-tsv")
async def normalize_pasted_tsv(payload: NormalizeTsvPayload, request: Request):
    orient = _validate_orientation(payload.orientation_mode)
    raw_bytes = parse_tsv_text_to_workbook_bytes(payload.raw_tsv, payload.sheet_title)
    data = _build_excel_response_data(
        raw_xlsx_bytes=raw_bytes,
        orientation_mode=orient,
        active_sheet_name="",
        filename=f"{payload.sheet_title}_ChuanA4.xlsx",
    )
    return api_success(
        data=data,
        message="Đã chuyển đổi dữ liệu bảng dán và chuẩn hóa trang in A4 thành công.",
        request=request,
    )
