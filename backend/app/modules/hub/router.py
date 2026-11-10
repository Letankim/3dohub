"""Router for 3DoHub Platform Catalog & Health Check."""

from fastapi import APIRouter, Request
from app.core.config import settings, now_iso_vn
from app.core.database import ping_database
from app.core.response import api_success
from app.modules.hub.registry import get_hub_modules_catalog

router = APIRouter(prefix="/hub", tags=["3DoHub Platform Core"])


@router.get("/health")
async def health_check(request: Request):
    """Return 3DoHub health status, version info, and ping database to prevent cold-start hibernation."""
    db_status = ping_database()
    is_healthy = db_status.get("alive", False)

    return api_success(
        data={
            "platform": settings.APP_NAME,
            "code": settings.APP_CODE,
            "version": settings.VERSION,
            "status": "ACTIVE" if is_healthy else "DEGRADED",
            "statusLabel": "Hệ thống hoạt động ổn định" if is_healthy else "Cơ sở dữ liệu đang kết nối lại",
            "database": db_status.get("status", "UNKNOWN"),
            "db_alive": is_healthy,
            "timestamp": now_iso_vn(),
        },
        message="Kiểm tra trạng thái hệ thống 3DoHub và cơ sở dữ liệu thành công",
        request=request,
    )


@router.get("/modules")
async def list_hub_modules(request: Request):
    """Return all registered modules in 3DoHub."""
    items = get_hub_modules_catalog()
    return api_success(
        data=items,
        message="Lấy danh sách phân hệ 3DoHub thành công",
        meta={"total": len(items)},
        request=request,
    )

