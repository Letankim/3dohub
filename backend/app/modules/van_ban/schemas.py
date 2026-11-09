"""Pydantic schemas and field validators for the van_ban module."""

from typing import Optional
from pydantic import BaseModel, Field
from app.core.exceptions import BusinessValidationException
from app.modules.van_ban.profiles import VALID_PROFILE_IDS
from app.modules.van_ban.templates_data import find_template_by_tag


class UnitConfigInput(BaseModel):
    cap_tren: str = Field(default="", max_length=255)
    co_quan: str = Field(default="", max_length=255)
    viet_tat: str = Field(default="", max_length=50)
    dia_danh: str = Field(default="", max_length=100)
    tham_quyen: str = Field(default="", max_length=255)
    chuc_vu: str = Field(default="", max_length=255)
    ho_ten: str = Field(default="", max_length=255)


class NormalizeTextRequest(BaseModel):
    raw_text: str = Field(default="")
    profile_id: str = Field(default="AUTO")

    def validate_business_rules(self) -> None:
        details = []
        pid = (self.profile_id or "").strip().upper()
        if pid not in VALID_PROFILE_IDS:
            details.append(
                {
                    "field": "profile_id",
                    "code": "INVALID_PROFILE",
                    "message": (
                        "Khối đơn vị không hợp lệ (chỉ chấp nhận: "
                        + ", ".join(VALID_PROFILE_IDS)
                        + ")"
                    ),
                    "rejected_value": self.profile_id,
                }
            )
        if not (self.raw_text or "").strip():
            details.append(
                {
                    "field": "raw_text",
                    "code": "EMPTY_CONTENT",
                    "message": "Nội dung văn bản cần chuẩn hóa không được để trống",
                    "rejected_value": self.raw_text,
                }
            )
        if details:
            raise BusinessValidationException(
                message="Dữ liệu gửi lên không hợp lệ",
                error_code="VALIDATION_ERROR",
                details=details,
                status_code=400,
            )


class GenerateTemplateRequest(BaseModel):
    template_tag: str = Field(default="DANG|1")
    profile_id: str = Field(default="AUTO")
    unit_info: Optional[UnitConfigInput] = None

    def validate_business_rules(self) -> None:
        details = []
        tpl = find_template_by_tag(self.template_tag)
        if not tpl:
            details.append(
                {
                    "field": "template_tag",
                    "code": "INVALID_TEMPLATE_TAG",
                    "message": "Mã mẫu văn bản không tồn tại (ví dụ hợp lệ: DANG|1..9, NHA_NUOC|1..8)",
                    "rejected_value": self.template_tag,
                }
            )
        pid = (self.profile_id or "AUTO").strip().upper()
        if pid not in VALID_PROFILE_IDS:
            details.append(
                {
                    "field": "profile_id",
                    "code": "INVALID_PROFILE",
                    "message": "Khối đơn vị không hợp lệ",
                    "rejected_value": self.profile_id,
                }
            )
        if details:
            raise BusinessValidationException(
                message="Dữ liệu gửi lên không hợp lệ",
                error_code="VALIDATION_ERROR",
                details=details,
                status_code=400,
            )

