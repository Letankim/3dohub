"""Business Logic and Helper Functions for Short Link Module."""

import secrets
import string
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.modules.short_link.models import ShortLink, LinkClick
from app.core.exceptions import BusinessValidationException

BASE62_ALPHABET = string.ascii_letters + string.digits


def generate_unique_code(db: Session, length: int = 6, max_attempts: int = 10) -> str:
    """Generate a random Base62 short code and verify it does not collide."""
    for _ in range(max_attempts):
        code = "".join(secrets.choice(BASE62_ALPHABET) for _ in range(length))
        exists = db.query(ShortLink.id).filter(ShortLink.code == code).first()
        if not exists:
            return code
    # Fallback to 8 chars if high collision
    return "".join(secrets.choice(BASE62_ALPHABET) for _ in range(8))


def parse_iso_datetime(dt_str: Optional[str]) -> Optional[datetime]:
    """Parse ISO-8601 string to timezone-aware datetime object."""
    if not dt_str or not dt_str.strip():
        return None
    try:
        clean = dt_str.strip().replace("Z", "+00:00")
        return datetime.fromisoformat(clean)
    except Exception:
        raise BusinessValidationException.single_field(
            field="expires_at",
            code="INVALID_DATETIME_FORMAT",
            message="Thời điểm hết hạn không đúng định dạng chuẩn ISO-8601.",
            rejected_value=dt_str,
        )


def serialize_short_link(link: ShortLink, base_url: str = "") -> dict:
    """Format a ShortLink ORM record into API contract dictionary."""
    short_url = f"{base_url.rstrip('/')}/s/{link.code}" if base_url else f"/s/{link.code}"
    is_expired = False
    if link.expires_at:
        now_utc = datetime.now(timezone.utc)
        link_exp = link.expires_at if link.expires_at.tzinfo else link.expires_at.replace(tzinfo=timezone.utc)
        is_expired = now_utc > link_exp

    return {
        "id": link.id,
        "code": link.code,
        "original_url": link.original_url,
        "short_url": short_url,
        "title": link.title or link.code,
        "description": link.description,
        "click_count": link.click_count,
        "is_active": link.is_active and not is_expired,
        "is_expired": is_expired,
        "expires_at": link.expires_at.isoformat() if link.expires_at else None,
        "tags": [t.strip() for t in link.tags.split(",") if t.strip()] if link.tags else [],
        "created_at": link.created_at.isoformat() if link.created_at else None,
        "updated_at": link.updated_at.isoformat() if link.updated_at else None,
    }

