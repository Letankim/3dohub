"""Enterprise Security, Rate-Limiting, Checksum Verification & Request ID Middleware for 3DoHub."""

import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.core.config import settings
from app.core.response import api_error, generate_request_id
from app.core.security import (
    get_client_ip,
    rate_limiter,
    verify_request_integrity,
)


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Attach request_id, enforce Per-IP Rate Limiting, verify SHA-256 Checksum & HMAC Signature,
    and inject enterprise security headers on every HTTP response.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        req_id = request.headers.get("X-Request-ID") or generate_request_id()
        request.state.request_id = req_id
        request.state.start_time = time.perf_counter()

        path = request.url.path
        method = request.method.upper()

        # Skip CORS preflight OPTIONS
        if method == "OPTIONS":
            return await call_next(request)

        # Apply security & rate-limit protections on all /api/v1/* endpoints
        if path.startswith(settings.API_PREFIX):
            # 1. Check Content-Length body size limit
            content_len_str = request.headers.get("content-length")
            if content_len_str and content_len_str.isdigit():
                if int(content_len_str) > settings.MAX_BODY_SIZE_BYTES:
                    return api_error(
                        message="Dung lượng dữ liệu gửi lên vượt quá giới hạn an toàn",
                        error_code="PAYLOAD_TOO_LARGE",
                        details=[
                            {
                                "field": "payload",
                                "code": "MAX_SIZE_EXCEEDED",
                                "message": "Dữ liệu tải lên vượt quá ngưỡng tối đa cho phép (10MB).",
                                "rejected_value": int(content_len_str),
                            }
                        ],
                        request=request,
                        status_code=413,
                    )

            # 2. Enforce Sliding-Window Rate Limiting per Client IP
            client_ip = get_client_ip(request)
            is_compute = method in ("POST", "PUT", "DELETE")
            tier = "COMPUTE" if is_compute else "GENERAL"
            max_reqs = (
                settings.RATE_LIMIT_COMPUTE_MAX
                if is_compute
                else settings.RATE_LIMIT_GENERAL_MAX
            )
            allowed, remaining, retry_after, limit = rate_limiter.check_rate_limit(
                client_ip=client_ip,
                tier=tier,
                max_requests=max_reqs,
                window_sec=settings.RATE_LIMIT_WINDOW_SEC,
            )
            if not allowed:
                err_resp = api_error(
                    message="Tần suất gửi yêu cầu quá nhanh, vui lòng thử lại sau ít giây",
                    error_code="RATE_LIMIT_EXCEEDED",
                    details=[
                        {
                            "field": "rate_limit",
                            "code": "TOO_MANY_REQUESTS",
                            "message": f"Hệ thống giới hạn tối đa {limit} yêu cầu/{settings.RATE_LIMIT_WINDOW_SEC}s để bảo vệ an toàn dịch vụ. Vui lòng thử lại sau {retry_after} giây.",
                            "rejected_value": client_ip,
                        }
                    ],
                    request=request,
                    status_code=429,
                )
                err_resp.headers["Retry-After"] = str(retry_after)
                err_resp.headers["X-RateLimit-Limit"] = str(limit)
                err_resp.headers["X-RateLimit-Remaining"] = "0"
                return err_resp

            # 3. Verify Cryptographic Checksum (SHA-256) & Canonical Signature (HMAC-SHA256)
            if settings.ENFORCE_REQUEST_SIGNATURE:
                content_type = request.headers.get("content-type") or ""
                is_multipart = "multipart/form-data" in content_type.lower()
                raw_body = b"" if is_multipart else await request.body()

                headers_lower = {k.lower(): v for k, v in request.headers.items()}
                is_valid, sec_code, sec_msg = verify_request_integrity(
                    method=method,
                    path=path,
                    headers=headers_lower,
                    raw_body=raw_body,
                    content_type=content_type,
                )
                if not is_valid:
                    return api_error(
                        message="Yêu cầu không hợp lệ hoặc không vượt qua kiểm định bảo mật",
                        error_code="SECURITY_VALIDATION_ERROR",
                        details=[
                            {
                                "field": "security_signature",
                                "code": sec_code,
                                "message": sec_msg,
                                "rejected_value": None,
                            }
                        ],
                        request=request,
                        status_code=403,
                    )
        else:
            remaining = settings.RATE_LIMIT_GENERAL_MAX
            limit = settings.RATE_LIMIT_GENERAL_MAX

        response: Response = await call_next(request)
        elapsed_ms = round((time.perf_counter() - request.state.start_time) * 1000, 2)

        # Standard & Security Response Headers
        response.headers["X-Request-ID"] = req_id
        response.headers["X-Response-Time-Ms"] = str(elapsed_ms)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response
