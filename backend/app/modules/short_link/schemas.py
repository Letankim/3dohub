"""Pydantic Schemas for Short Link Request Validation and Response Contracts."""

import re
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class CreateShortLinkPayload(BaseModel):
    original_url: str = Field(..., min_length=4, max_length=2048, description="URL gốc cần rút gọn")
    custom_code: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=48,
        description="Mã rút gọn tùy chỉnh (3-48 ký tự: chữ cái, số, gạch nối)",
    )
    title: Optional[str] = Field(default=None, max_length=255, description="Tiêu đề gợi nhớ")
    description: Optional[str] = Field(default=None, max_length=1000, description="Mô tả ghi chú")
    expires_at: Optional[str] = Field(default=None, description="Thời điểm hết hạn (ISO-8601)")
    tags: Optional[str] = Field(default=None, max_length=255, description="Thẻ phân loại")
    session_id: Optional[str] = Field(default=None, max_length=64, description="ID phiên thiết bị ẩn danh của người dùng")

    @field_validator("original_url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        clean = v.strip()
        if not (clean.startswith("http://") or clean.startswith("https://")):
            clean = "https://" + clean
        if "." not in clean:
            raise ValueError("Đường dẫn URL không hợp lệ (cần có tên miền và phần mở rộng).")
        return clean

    @field_validator("custom_code")
    @classmethod
    def validate_custom_code(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        clean = v.strip().lower()
        if not re.match(r"^[a-z0-9_-]{3,48}$", clean):
            raise ValueError("Mã rút gọn tùy chỉnh chỉ được chứa chữ cái, số, dấu gạch ngang (-) hoặc gạch dưới (_).")
        # Reserved words check
        if clean in ("api", "docs", "redoc", "openapi", "static", "tien-ich", "admin", "login"):
            raise ValueError(f"Mã '{clean}' là từ khóa hệ thống, vui lòng chọn mã khác.")
        return clean


class UpdateShortLinkPayload(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    is_active: Optional[bool] = Field(default=None)
    expires_at: Optional[str] = Field(default=None)
    tags: Optional[str] = Field(default=None, max_length=255)

