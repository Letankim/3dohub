"""REST API Router for the 3DoHub Backend Spell Check & Administrative Style Engine."""

from fastapi import APIRouter, Request
from app.core.response import api_success
from app.modules.spell_check.schemas import SpellCheckRequest
from app.modules.spell_check.engine import analyze_spelling, apply_safe_auto_fixes

router = APIRouter(prefix="/spell-check", tags=["Soát Lỗi Chính Tả & Ngữ Phong"])


@router.post("/analyze")
async def analyze_spelling_endpoint(payload: SpellCheckRequest, request: Request):
    """Analyze Vietnamese administrative text and return spelling, confusable, capitalization, and punctuation issues."""
    payload.validate_business_rules()
    result = analyze_spelling(payload.text)
    return api_success(
        data=result,
        message="Rà soát chính tả và ngữ phong hành chính thành công",
        request=request,
    )


@router.post("/auto-fix")
async def auto_fix_spelling_endpoint(payload: SpellCheckRequest, request: Request):
    """Automatically fix all safe spelling, confusable, capitalization, and punctuation issues."""
    payload.validate_business_rules()
    analysis = analyze_spelling(payload.text)
    fixed_text, fixed_count = apply_safe_auto_fixes(payload.text, analysis["issues"])
    recheck = analyze_spelling(fixed_text)
    return api_success(
        data={
            "fixed_text": fixed_text,
            "fixed_count": fixed_count,
            "remaining": recheck,
        },
        message=f"Đã tự động chuẩn hóa {fixed_count} lỗi an toàn",
        request=request,
    )

