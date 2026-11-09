"""Router for 3DoHub Platform Catalog & Health Check."""

from fastapi import APIRouter, Request
from app.core.config import settings, now_iso_vn
from app.core.response import api_success
from app.modules.hub.registry import get_hub_modules_catalog

router = APIRouter(prefix="/hub", tags=["3DoHub Platform Core"])


@router.get("/health")
async def health_check(request: Request):
    """Return 3DoHub health status and version info."""
    return api_success(
        data={
            "platform": settings.APP_NAME,
            "code": settings.APP_CODE,
            "version": settings.VERSION,
            "status": "ACTIVE",
            "statusLabel": "Hệ thống hoạt động ổn định",
            "timestamp": now_iso_vn(),
        },
        message="Kiểm tra trạng thái hệ thống 3DoHub thành công",
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

