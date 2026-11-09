"""Standardized API Response Builder for 3DoHub."""

import uuid
from typing import Any, Optional
from fastapi import Request
from fastapi.responses import JSONResponse


def generate_request_id() -> str:
    """Generate a unique request_id in the format req_<16-hex-chars>."""
    return f"req_{uuid.uuid4().hex[:16]}"


def get_request_id(request: Optional[Request] = None) -> str:
    """Extract request_id from FastAPI Request state or generate a fallback."""
    if request is not None and hasattr(request.state, "request_id"):
        return request.state.request_id
    return generate_request_id()


def api_success(
    data: Any = None,
    message: str = "Thực hiện thành công",
    meta: Optional[dict[str, Any]] = None,
    request: Optional[Request] = None,
    status_code: int = 200,
) -> JSONResponse:
    """Build standard 3DoHub success JSON envelope."""
    payload = {
        "success": True,
        "message": message,
        "data": data,
        "meta": meta,
        "errors": None,
        "request_id": get_request_id(request),
    }
    return JSONResponse(status_code=status_code, content=payload)


def api_error(
    message: str = "Dữ liệu gửi lên không hợp lệ",
    error_code: str = "VALIDATION_ERROR",
    details: Optional[list[dict[str, Any]]] = None,
    meta: Optional[dict[str, Any]] = None,
    request: Optional[Request] = None,
    status_code: int = 400,
) -> JSONResponse:
    """Build standard 3DoHub error JSON envelope with field-level details."""
    payload = {
        "success": False,
        "message": message,
        "data": None,
        "meta": meta,
        "errors": {
            "code": error_code,
            "details": details or [],
        },
        "request_id": get_request_id(request),
    }
    return JSONResponse(status_code=status_code, content=payload)

