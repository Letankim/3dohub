"""FastAPI Entrypoint for 3DoHub Enterprise Platform."""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import init_db, get_db
from app.core.middleware import RequestContextMiddleware
from app.core.exceptions import register_exception_handlers
from app.modules.hub.router import router as hub_router
from app.modules.van_ban.router import router as van_ban_router
from app.modules.excel_norm.router import excel_router
from app.modules.short_link.router import router as short_link_router, redirect_short_link


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager: initialize database tables safely on application boot."""
    try:
        init_db()
    except Exception as e:
        print(f"[WARN] Database initialization notice: {e}")
    yield


def create_app() -> FastAPI:
    """Create and configure the 3DoHub FastAPI application."""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.VERSION,
        description="Hệ thống Module Hub Chuẩn Doanh Nghiệp — 3DoHub API",
        lifespan=lifespan,
    )

    app.add_middleware(RequestContextMiddleware)
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=[
            "X-Request-ID",
            "X-Response-Time-Ms",
            "X-Payload-Checksum",
            "X-RateLimit-Limit",
            "X-RateLimit-Remaining",
        ],
    )

    register_exception_handlers(app)

    # API Module Routers
    app.include_router(hub_router, prefix=settings.API_PREFIX)
    app.include_router(van_ban_router, prefix=settings.API_PREFIX)
    app.include_router(excel_router, prefix=settings.API_PREFIX)
    app.include_router(short_link_router, prefix=settings.API_PREFIX)

    # Public Root Short Link Redirect: /s/{code}
    @app.get("/s/{code}", include_in_schema=False)
    async def public_short_redirect(code: str, request: Request, db: Session = Depends(get_db)):
        return await redirect_short_link(code=code, request=request, db=db)

    # Public Root & API Health Checks (Exempted from checksum/signature, pings database)
    @app.get("/health", tags=["Health"])
    @app.get(f"{settings.API_PREFIX}/health", tags=["Health"])
    async def global_health_check(request: Request):
        from app.modules.hub.router import health_check
        return await health_check(request=request)

    return app


app = create_app()
