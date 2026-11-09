"""Global Exception Classes and FastAPI Exception Handlers for 3DoHub."""

from typing import Any, Optional
from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from app.core.response import api_error


class BusinessValidationException(Exception):
    """Domain validation exception carrying field-level error details."""

    def __init__(
        self,
        message: str = "Dữ liệu gửi lên không hợp lệ",
        error_code: str = "VALIDATION_ERROR",
        details: Optional[list[dict[str, Any]]] = None,
        status_code: int = 400,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.details = details or []
        self.status_code = status_code

    @classmethod
    def single_field(
        cls,
        field: str,
        code: str,
        message: str,
        rejected_value: Any = None,
        top_message: str = "Dữ liệu gửi lên không hợp lệ",
        status_code: int = 400,
    ) -> "BusinessValidationException":
        return cls(
            message=top_message,
            error_code="VALIDATION_ERROR",
            details=[
                {
                    "field": field,
                    "code": code,
                    "message": message,
                    "rejected_value": rejected_value,
                }
            ],
            status_code=status_code,
        )


def _map_pydantic_error_code(err_type: str, field_name: str) -> str:
    """Map Pydantic v2 error type to a clean uppercase domain code."""
    upper_field = field_name.upper().split(".")[-1]
    if "missing" in err_type:
        return f"REQUIRED_{upper_field}"
    if "string_too_short" in err_type:
        return f"MIN_LENGTH_{upper_field}"
    if "string_too_long" in err_type:
        return f"MAX_LENGTH_{upper_field}"
    if "enum" in err_type or "literal" in err_type:
        return f"INVALID_{upper_field}"
    return f"INVALID_{upper_field}"


def register_exception_handlers(app: FastAPI) -> None:
    """Register all global exception handlers on the FastAPI app instance."""

    @app.exception_handler(BusinessValidationException)
    async def handle_business_validation(
        request: Request, exc: BusinessValidationException
    ):
        return api_error(
            message=exc.message,
            error_code=exc.error_code,
            details=exc.details,
            request=request,
            status_code=exc.status_code,
        )

    @app.exception_handler(RequestValidationError)
    async def handle_pydantic_validation(
        request: Request, exc: RequestValidationError
    ):
        details: list[dict[str, Any]] = []
        for err in exc.errors():
            loc_parts = [str(x) for x in err.get("loc", []) if x not in ("body", "query", "path")]
            field_name = ".".join(loc_parts) if loc_parts else "payload"
            err_type = str(err.get("type", "validation_error"))
            ctx = err.get("ctx") or {}
            custom_code = ctx.get("code") or _map_pydantic_error_code(err_type, field_name)
            raw_msg = str(err.get("msg", "Giá trị không hợp lệ"))
            if raw_msg.startswith("Value error, "):
                raw_msg = raw_msg[len("Value error, "):]
            details.append(
                {
                    "field": field_name,
                    "code": custom_code,
                    "message": raw_msg,
                    "rejected_value": err.get("input"),
                }
            )
        return api_error(
            message="Dữ liệu gửi lên không hợp lệ",
            error_code="VALIDATION_ERROR",
            details=details,
            request=request,
            status_code=422,
        )

    @app.exception_handler(HTTPException)
    async def handle_http_exception(request: Request, exc: HTTPException):
        code_map = {
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "RESOURCE_NOT_FOUND",
            405: "METHOD_NOT_ALLOWED",
            429: "RATE_LIMIT_EXCEEDED",
        }
        err_code = code_map.get(exc.status_code, "HTTP_ERROR")
        return api_error(
            message=str(exc.detail),
            error_code=err_code,
            details=[],
            request=request,
            status_code=exc.status_code,
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_exception(request: Request, exc: Exception):
        return api_error(
            message="Hệ thống đang xử lý hoặc tạm thời gián đoạn, vui lòng thử lại sau",
            error_code="INTERNAL_SERVER_ERROR",
            details=[
                {
                    "field": "system",
                    "code": "SERVICE_TEMPORARILY_UNAVAILABLE",
                    "message": "Đã xảy ra lỗi trong quá trình xử lý yêu cầu, vui lòng thử lại sau.",
                    "rejected_value": None,
                }
            ],
            request=request,
            status_code=500,
        )

