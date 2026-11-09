"""REST API Router for the Document Normalization Module (van_ban) in 3DoHub."""

import base64
import time
import uuid
from typing import Optional
from fastapi import APIRouter, Request, UploadFile, File, Form
from app.core.config import now_iso_vn
from app.core.response import api_success
from app.core.exceptions import BusinessValidationException
from app.core.security import validate_docx_binary_safety, compute_sha256_hex
from app.modules.van_ban.profiles import PROFILES_METADATA, VALID_PROFILE_IDS
from app.modules.van_ban.templates_data import (
    get_templates_list,
    find_template_by_tag,
    build_raw_text_from_template,
)
from app.modules.van_ban.normalizer import normalize_document_lines
from app.modules.van_ban.validator import validate_document_logic
from app.modules.van_ban.mso_html import (
    render_a4_preview_html,
    render_mso_clipboard_html,
    render_normalized_plain_text,
)
from app.modules.van_ban.docx_builder import (
    build_docx_bytes,
    extract_lines_from_docx_bytes,
)
from app.modules.van_ban.schemas import (
    NormalizeTextRequest,
    GenerateTemplateRequest,
)

router = APIRouter(prefix="/van-ban", tags=["Chuẩn Hóa Thể Thức Văn Bản"])


def _build_full_normalization_payload(
    raw_lines: list[str], profile_id: str, start_time: float
) -> dict:
    """Run pipeline, validation, HTML/MSO rendering, and .docx generation."""
    norm_doc = normalize_document_lines(raw_lines, force_profile=profile_id)
    warnings = validate_document_logic(norm_doc)
    a4_html = render_a4_preview_html(norm_doc)
    mso_html = render_mso_clipboard_html(norm_doc)
    norm_text = render_normalized_plain_text(norm_doc)
    docx_bytes = build_docx_bytes(norm_doc)
    docx_b64 = base64.b64encode(docx_bytes).decode("ascii")

    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
    doc_id = str(uuid.uuid4())
    prof_meta = norm_doc["profile"]

    return {
        "id": doc_id,
        "detected_profile": norm_doc["detected_profile"],
        "applied_profile": norm_doc["applied_profile"],
        "profile_source": norm_doc["profile_source"],
        "mismatch_warning": norm_doc.get("mismatch_warning", ""),
        "profile_name": prof_meta["name"],
        "profile_short_label": prof_meta["short_label"],
        "legal_basis": prof_meta["legal_basis"],
        "normalized_text": norm_text,
        "a4_preview_html": a4_html,
        "mso_clipboard_html": mso_html,
        "docx_base64": docx_b64,
        "docx_filename": f"VanBan_ChuanHoa_{norm_doc['applied_profile']}.docx",
        "payload_checksum": compute_sha256_hex(norm_text.encode("utf-8")),
        "structure": {
            "header": norm_doc["header"],
            "title_block": norm_doc["title_block"],
            "kinh_gui": norm_doc["kinh_gui"],
            "body_count": len(norm_doc["body_paragraphs"]),
            "body_paragraphs": norm_doc["body_paragraphs"],
            "footer": norm_doc["footer"],
        },
        "extracted_unit": norm_doc["extracted_unit"],
        "warnings": warnings,
        "warnings_count": len(warnings),
        "stats": {
            "lines_processed": len(norm_doc["raw_cleaned_lines"]),
            "body_paragraphs": len(norm_doc["body_paragraphs"]),
            "execution_ms": elapsed_ms,
        },
        "created_at": now_iso_vn(),
        "updated_at": now_iso_vn(),
    }


@router.get("/profiles")
async def list_profiles(request: Request):
    """Return all 5 document standardization profiles and legal bases."""
    ts = now_iso_vn()
    items = [
        {
            "id": str(uuid.uuid5(uuid.NAMESPACE_OID, "3dohub:profile:AUTO")),
            "code": "AUTO",
            "name": "Tự động nhận diện",
            "short_label": "Tự động nhận diện theo Tiêu ngữ / Quốc hiệu",
            "legal_basis": "Tự động phát hiện Khối Đảng, Chính quyền, Công an, Quân đội, MTTQ",
            "template_group": "DANG",
            "status": "ACTIVE",
            "statusLabel": "Khuyên dùng",
            "version": 1,
            "created_at": ts,
            "updated_at": ts,
        }
    ]
    for pid, meta in PROFILES_METADATA.items():
        items.append(
            {
                "id": str(uuid.uuid5(uuid.NAMESPACE_OID, f"3dohub:profile:{pid}")),
                "code": meta["code"],
                "name": meta["name"],
                "short_label": meta["short_label"],
                "legal_basis": meta["legal_basis"],
                "template_group": meta["template_group"],
                "numbers": meta["numbers"],
                "booleans": meta["booleans"],
                "strings": meta["strings"],
                "status": meta["status"],
                "statusLabel": meta["statusLabel"],
                "version": 1,
                "created_at": ts,
                "updated_at": ts,
            }
        )
    return api_success(
        data=items,
        message="Lấy danh sách khối thể thức văn bản thành công",
        meta={"total": len(items)},
        request=request,
    )


@router.get("/templates")
async def list_templates(request: Request, group: Optional[str] = None):
    """Return the 17 standard templates (9 Khối Đảng + 8 Khối Nhà nước)."""
    if group and group.upper() not in ("DANG", "NHA_NUOC"):
        raise BusinessValidationException.single_field(
            field="group",
            code="INVALID_TEMPLATE_GROUP",
            message="Nhóm mẫu văn bản chỉ chấp nhận DANG hoặc NHA_NUOC",
            rejected_value=group,
        )
    items = get_templates_list(group)
    return api_success(
        data=items,
        message="Lấy danh sách mẫu văn bản chuẩn thành công",
        meta={"total": len(items), "group": group or "ALL"},
        request=request,
    )


@router.post("/templates/generate")
async def generate_from_template(
    payload: GenerateTemplateRequest, request: Request
):
    """Generate a complete normalized document from one of the 17 standard templates."""
    t0 = time.perf_counter()
    payload.validate_business_rules()
    tpl = find_template_by_tag(payload.template_tag)
    unit_dict = payload.unit_info.model_dump() if payload.unit_info else {}
    raw_text = build_raw_text_from_template(payload.template_tag, unit_dict)

    effective_profile = payload.profile_id.upper()
    if effective_profile == "AUTO":
        effective_profile = "DANG" if tpl["group"] == "DANG" else "CHINH_QUYEN"

    result = _build_full_normalization_payload(
        raw_text.splitlines(), effective_profile, t0
    )
    result["template_info"] = {
        "tag": tpl["tag"],
        "name": tpl["name"],
        "code": tpl["code"],
        "doc_type": tpl["doc_type"],
    }
    return api_success(
        data=result,
        message=f"Tạo văn bản mẫu '{tpl['name']}' thành công",
        request=request,
    )


@router.post("/normalize")
async def normalize_text_endpoint(
    payload: NormalizeTextRequest, request: Request
):
    """Normalize document text and return A4 preview HTML, MSO clipboard HTML, .docx base64, and logic report."""
    t0 = time.perf_counter()
    payload.validate_business_rules()
    lines = payload.raw_text.splitlines()
    result = _build_full_normalization_payload(
        lines, payload.profile_id.upper(), t0
    )
    return api_success(
        data=result,
        message="Chuẩn hóa thể thức và rà soát logic văn bản thành công",
        request=request,
    )


@router.post("/normalize-docx")
async def normalize_docx_endpoint(
    request: Request,
    file: UploadFile = File(...),
    profile_id: str = Form("AUTO"),
):
    """Upload a .docx file, normalize its structure, and return full preview + normalized .docx."""
    t0 = time.perf_counter()
    pid = (profile_id or "AUTO").strip().upper()
    if pid not in VALID_PROFILE_IDS:
        raise BusinessValidationException.single_field(
            field="profile_id",
            code="INVALID_PROFILE",
            message="Khối đơn vị không hợp lệ",
            rejected_value=profile_id,
        )
    filename = file.filename or ""
    if not filename.lower().endswith(".docx"):
        raise BusinessValidationException.single_field(
            field="file",
            code="INVALID_FILE_EXTENSION",
            message="Chỉ hỗ trợ tệp định dạng Word (.docx)",
            rejected_value=filename,
        )
    file_bytes = await file.read()
    if not file_bytes:
        raise BusinessValidationException.single_field(
            field="file",
            code="EMPTY_FILE",
            message="Tệp .docx tải lên bị rỗng",
            rejected_value=filename,
        )
    is_safe, safe_code, safe_msg = validate_docx_binary_safety(file_bytes)
    if not is_safe:
        raise BusinessValidationException.single_field(
            field="file",
            code=safe_code,
            message=safe_msg,
            rejected_value=filename,
        )
    try:
        lines = extract_lines_from_docx_bytes(file_bytes)
    except Exception as exc:
        raise BusinessValidationException.single_field(
            field="file",
            code="CORRUPTED_DOCX_FILE",
            message="Không thể đọc cấu trúc tệp .docx, vui lòng kiểm tra lại tệp tải lên",
            rejected_value=filename,
        ) from exc

    if not lines:
        raise BusinessValidationException.single_field(
            field="file",
            code="EMPTY_DOCX_CONTENT",
            message="Tệp .docx không chứa nội dung văn bản",
            rejected_value=filename,
        )

    result = _build_full_normalization_payload(lines, pid, t0)
    result["uploaded_filename"] = filename
    return api_success(
        data=result,
        message=f"Chuẩn hóa tệp '{filename}' thành công",
        request=request,
    )


@router.post("/extract-unit")
async def extract_unit_endpoint(
    payload: NormalizeTextRequest, request: Request
):
    """Extract unit configuration (Cấp trên, Cơ quan, Viết tắt, Địa danh, Người ký) from open document text."""
    payload.validate_business_rules()
    norm_doc = normalize_document_lines(
        payload.raw_text.splitlines(), force_profile=payload.profile_id.upper()
    )
    return api_success(
        data={
            "detected_profile": norm_doc["detected_profile"],
            "applied_profile": norm_doc["applied_profile"],
            "unit_info": norm_doc["extracted_unit"],
            "updated_at": now_iso_vn(),
        },
        message="Trích xuất thông tin đơn vị từ văn bản thành công",
        request=request,
    )

