"""REST API Router for Short Link Module in 3DoHub."""

from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from app.core.database import get_db
from app.core.response import api_success
from app.core.exceptions import BusinessValidationException
from app.core.security import get_client_ip
from app.modules.short_link.models import ShortLink, LinkClick
from app.modules.short_link.schemas import (
    CreateShortLinkPayload,
    UpdateShortLinkPayload,
)
from app.modules.short_link.service import (
    generate_unique_code,
    parse_iso_datetime,
    serialize_short_link,
)

router = APIRouter(prefix="/links", tags=["Rút Gọn Link"])


def _extract_base_url(request: Request) -> str:
    """Build public base URL from request host."""
    scheme = request.headers.get("x-forwarded-proto") or request.url.scheme
    host = request.headers.get("x-forwarded-host") or request.headers.get("host") or request.url.netloc
    return f"{scheme}://{host}"


@router.post("")
async def create_short_link(
    payload: CreateShortLinkPayload,
    request: Request,
    db: Session = Depends(get_db),
):
    """Create a new shortened link with auto or custom slug."""
    if payload.custom_code:
        existing = db.query(ShortLink.id).filter(ShortLink.code == payload.custom_code).first()
        if existing:
            raise BusinessValidationException.single_field(
                field="custom_code",
                code="CODE_ALREADY_EXISTS",
                message=f"Mã rút gọn '{payload.custom_code}' đã được sử dụng, vui lòng chọn mã khác.",
                rejected_value=payload.custom_code,
            )
        code = payload.custom_code
    else:
        code = generate_unique_code(db)

    exp_dt = parse_iso_datetime(payload.expires_at)
    session_id = request.headers.get("x-client-session-id") or payload.session_id

    link = ShortLink(
        code=code,
        session_id=session_id,
        original_url=payload.original_url,
        title=payload.title or code,
        description=payload.description,
        expires_at=exp_dt,
        tags=payload.tags,
    )
    db.add(link)
    db.commit()
    db.refresh(link)

    base_url = _extract_base_url(request)
    return api_success(
        data=serialize_short_link(link, base_url),
        message=f"Tạo liên kết rút gọn thành công cho mã '{code}'.",
        request=request,
        status_code=201,
    )


@router.get("")
async def list_short_links(
    request: Request,
    session_id: Optional[str] = Query(default=None, max_length=64),
    codes: Optional[str] = Query(default=None, description="Danh sách các mã link cách nhau bởi dấu phẩy"),
    search: Optional[str] = Query(default=None, max_length=100),
    tag: Optional[str] = Query(default=None, max_length=50),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    """List short links filtered strictly by user session or created codes."""
    client_sess = request.headers.get("x-client-session-id") or session_id
    code_list = [c.strip() for c in codes.split(",") if c.strip()] if codes else []

    # SECURITY PRIVACY ISOLATION:
    # Do NOT return links from other users if no session or codes provided!
    if not client_sess and not code_list:
        return api_success(
            data=[],
            message="Chưa có liên kết nào được tạo trên thiết bị này.",
            meta={"total": 0, "limit": limit, "offset": offset},
            request=request,
        )

    filters = []
    if client_sess:
        filters.append(ShortLink.session_id == client_sess)
    if code_list:
        filters.append(ShortLink.code.in_(code_list))

    query = db.query(ShortLink).filter(or_(*filters))
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (ShortLink.code.ilike(term))
            | (ShortLink.title.ilike(term))
            | (ShortLink.original_url.ilike(term))
        )
    if tag and tag.strip():
        query = query.filter(ShortLink.tags.ilike(f"%{tag.strip()}%"))

    total = query.count()
    items = query.order_by(desc(ShortLink.created_at)).offset(offset).limit(limit).all()

    base_url = _extract_base_url(request)
    serialized = [serialize_short_link(item, base_url) for item in items]

    return api_success(
        data=serialized,
        message=f"Lấy danh sách {len(serialized)} liên kết thành công.",
        meta={"total": total, "limit": limit, "offset": offset},
        request=request,
    )


@router.get("/{code}")
async def get_short_link_details(
    code: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """Retrieve details for a specific short link."""
    link = db.query(ShortLink).filter(ShortLink.code == code).first()
    if not link:
        raise BusinessValidationException.single_field(
            field="code",
            code="LINK_NOT_FOUND",
            message=f"Không tìm thấy liên kết rút gọn với mã '{code}'.",
            rejected_value=code,
            status_code=404,
        )
    base_url = _extract_base_url(request)
    return api_success(
        data=serialize_short_link(link, base_url),
        message="Lấy thông tin liên kết thành công.",
        request=request,
    )


@router.get("/{code}/stats")
async def get_short_link_stats(
    code: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """Retrieve detailed click statistics and recent activity."""
    link = db.query(ShortLink).filter(ShortLink.code == code).first()
    if not link:
        raise BusinessValidationException.single_field(
            field="code",
            code="LINK_NOT_FOUND",
            message=f"Không tìm thấy liên kết rút gọn với mã '{code}'.",
            rejected_value=code,
            status_code=404,
        )

    recent_clicks = (
        db.query(LinkClick)
        .filter(LinkClick.short_link_id == link.id)
        .order_by(desc(LinkClick.clicked_at))
        .limit(50)
        .all()
    )

    base_url = _extract_base_url(request)
    return api_success(
        data={
            "link": serialize_short_link(link, base_url),
            "total_clicks": link.click_count,
            "recent_clicks": [
                {
                    "id": c.id,
                    "clicked_at": c.clicked_at.isoformat() if c.clicked_at else None,
                    "referer": (c.referer if c.referer and c.referer != "Direct" else "Trực tiếp"),
                    "user_agent": (c.user_agent[:60] + "...") if c.user_agent and len(c.user_agent) > 60 else c.user_agent,
                }
                for c in recent_clicks
            ],
        },
        message=f"Thống kê lượt truy cập cho liên kết '{code}'.",
        request=request,
    )


@router.put("/{code}")
async def update_short_link(
    code: str,
    payload: UpdateShortLinkPayload,
    request: Request,
    db: Session = Depends(get_db),
):
    """Update title, status, expiration or tags of a short link."""
    link = db.query(ShortLink).filter(ShortLink.code == code).first()
    if not link:
        raise BusinessValidationException.single_field(
            field="code",
            code="LINK_NOT_FOUND",
            message=f"Không tìm thấy liên kết rút gọn với mã '{code}'.",
            rejected_value=code,
            status_code=404,
        )

    if payload.title is not None:
        link.title = payload.title
    if payload.description is not None:
        link.description = payload.description
    if payload.is_active is not None:
        link.is_active = payload.is_active
    if payload.tags is not None:
        link.tags = payload.tags
    if payload.expires_at is not None:
        link.expires_at = parse_iso_datetime(payload.expires_at)

    db.commit()
    db.refresh(link)
    base_url = _extract_base_url(request)
    return api_success(
        data=serialize_short_link(link, base_url),
        message="Cập nhật thông tin liên kết thành công.",
        request=request,
    )


@router.delete("/{code}")
async def delete_short_link(
    code: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """Delete a short link and its click logs."""
    link = db.query(ShortLink).filter(ShortLink.code == code).first()
    if not link:
        raise BusinessValidationException.single_field(
            field="code",
            code="LINK_NOT_FOUND",
            message=f"Không tìm thấy liên kết rút gọn với mã '{code}'.",
            rejected_value=code,
            status_code=404,
        )
    db.delete(link)
    db.commit()
    return api_success(
        data={"deleted_code": code},
        message=f"Đã xóa liên kết rút gọn '{code}'.",
        request=request,
    )


@router.get("/r/{code}")
async def redirect_short_link(
    code: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """Public redirect endpoint: records analytics and performs 302 redirect."""
    link = db.query(ShortLink).filter(ShortLink.code == code).first()
    if not link or not link.is_active:
        return RedirectResponse(url="/tien-ich/rut-gon-link?error=not_found", status_code=302)

    if link.expires_at:
        now_utc = datetime.now(timezone.utc)
        link_exp = link.expires_at if link.expires_at.tzinfo else link.expires_at.replace(tzinfo=timezone.utc)
        if now_utc > link_exp:
            return RedirectResponse(url="/tien-ich/rut-gon-link?error=expired", status_code=302)

    # Record click and increment counter
    link.click_count += 1
    click_log = LinkClick(
        short_link_id=link.id,
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent", "")[:500],
        referer=request.headers.get("referer", "")[:500],
    )
    db.add(click_log)
    db.commit()

    return RedirectResponse(url=link.original_url, status_code=302)

