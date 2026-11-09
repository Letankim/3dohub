"""Enterprise Security Engine for 3DoHub:
- Cryptographic Payload Checksum (SHA-256) & Canonical Request Signature (HMAC-SHA256)
- Anti-Replay Timestamp + Nonce Sliding Cache
- Memory-Bounded Per-IP Sliding-Window Rate Limiter
- Anti-Zip-Bomb & Magic-Byte Validator for .DOCX Uploads
"""

import hashlib
import hmac
import io
import threading
import time
import zipfile
from collections import deque
from typing import Optional, Tuple
from starlette.requests import Request
from app.core.config import settings


def get_client_ip(request: Request) -> str:
    """Extract client IP address safely behind reverse proxies or Ngrok."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"


class SlidingWindowRateLimiter:
    """Thread-safe, memory-bounded sliding window rate limiter per client IP and tier."""

    def __init__(self, max_tracked_keys: int = 5000) -> None:
        self._lock = threading.Lock()
        self._buckets: dict[str, deque[float]] = {}
        self._max_tracked_keys = max_tracked_keys

    def check_rate_limit(
        self, client_ip: str, tier: str, max_requests: int, window_sec: int
    ) -> Tuple[bool, int, int, int]:
        """Return (allowed, remaining, retry_after_sec, limit)."""
        now = time.monotonic()
        cutoff = now - window_sec
        bucket_key = f"{tier}:{client_ip}"

        with self._lock:
            # Periodic eviction if map grows large under flood
            if len(self._buckets) > self._max_tracked_keys:
                stale_keys = [
                    k for k, dq in self._buckets.items() if not dq or dq[-1] < cutoff
                ]
                for k in stale_keys:
                    self._buckets.pop(k, None)
                if len(self._buckets) > self._max_tracked_keys:
                    self._buckets.clear()

            dq = self._buckets.get(bucket_key)
            if dq is None:
                dq = deque()
                self._buckets[bucket_key] = dq

            while dq and dq[0] <= cutoff:
                dq.popleft()

            if len(dq) >= max_requests:
                retry_after = max(1, int(window_sec - (now - dq[0])) + 1)
                return False, 0, retry_after, max_requests

            dq.append(now)
            remaining = max(0, max_requests - len(dq))
            return True, remaining, 0, max_requests

    def reset(self) -> None:
        """Clear all rate limit buckets (used in automated test suites)."""
        with self._lock:
            self._buckets.clear()


class NonceReplayGuard:
    """Thread-safe anti-replay guard tracking seen nonces within the clock-skew window."""

    def __init__(self, max_entries: int = 10000) -> None:
        self._lock = threading.Lock()
        self._seen: dict[str, float] = {}
        self._max_entries = max_entries

    def check_and_record(self, nonce: str, ttl_sec: float = 300.0) -> bool:
        """Return True if nonce is fresh, False if replayed."""
        now = time.monotonic()
        with self._lock:
            if len(self._seen) > self._max_entries:
                expired = [k for k, exp in self._seen.items() if exp <= now]
                for k in expired:
                    self._seen.pop(k, None)
                if len(self._seen) > self._max_entries:
                    self._seen.clear()

            exp_time = self._seen.get(nonce)
            if exp_time is not None and exp_time > now:
                return False

            self._seen[nonce] = now + ttl_sec
            return True

    def reset(self) -> None:
        with self._lock:
            self._seen.clear()


rate_limiter = SlidingWindowRateLimiter()
nonce_guard = NonceReplayGuard()


def compute_sha256_hex(data: bytes) -> str:
    """Compute lowercase SHA-256 hex digest of bytes."""
    return hashlib.sha256(data).hexdigest()


def compute_canonical_hmac(
    method: str,
    path: str,
    timestamp_ms: str,
    nonce: str,
    payload_hash: str,
    secret: Optional[str] = None,
) -> str:
    """Compute HMAC-SHA256 signature over canonical request components."""
    signing_key = (secret or settings.HMAC_SIGNING_SECRET).encode("utf-8")
    canonical = f"{method.upper()}|{path}|{timestamp_ms}|{nonce}|{payload_hash}".encode(
        "utf-8"
    )
    return hmac.new(signing_key, canonical, hashlib.sha256).hexdigest()


def verify_request_integrity(
    method: str,
    path: str,
    headers: dict[str, str],
    raw_body: bytes,
    content_type: str,
) -> Tuple[bool, str, str]:
    """Verify request Timestamp, Nonce, Payload SHA-256 Checksum, and HMAC-SHA256 Signature.
    Returns (is_valid, error_code, error_message).
    """
    ts_str = (headers.get("x-3dohub-timestamp") or "").strip()
    nonce = (headers.get("x-3dohub-nonce") or "").strip()
    client_payload_hash = (headers.get("x-3dohub-payload-hash") or "").strip().lower()
    client_signature = (headers.get("x-3dohub-signature") or "").strip().lower()

    if not ts_str or not nonce or not client_payload_hash or not client_signature:
        return (
            False,
            "MISSING_SECURITY_HEADERS",
            "Phiên làm việc chưa được đồng bộ, vui lòng tải lại trang và thử lại.",
        )

    if len(nonce) < 8 or len(nonce) > 64:
        return (
            False,
            "INVALID_NONCE",
            "Phiên làm việc không hợp lệ, vui lòng tải lại trang.",
        )

    try:
        req_ts_ms = int(ts_str)
    except ValueError:
        return (
            False,
            "INVALID_TIMESTAMP",
            "Thời gian phiên làm việc không hợp lệ, vui lòng tải lại trang.",
        )

    now_ms = int(time.time() * 1000)
    if abs(now_ms - req_ts_ms) > settings.MAX_CLOCK_SKEW_MS:
        return (
            False,
            "EXPIRED_REQUEST_TIMESTAMP",
            "Phiên làm việc đã hết hạn, vui lòng tải lại trang và thử lại.",
        )

    # Verify payload SHA-256 checksum for JSON / empty bodies
    is_multipart = "multipart/form-data" in (content_type or "").lower()
    if not is_multipart:
        actual_body_hash = compute_sha256_hex(raw_body)
        if not hmac.compare_digest(actual_body_hash, client_payload_hash):
            return (
                False,
                "PAYLOAD_CHECKSUM_MISMATCH",
                "Dữ liệu gửi lên bị gián đoạn hoặc thay đổi, vui lòng thử lại.",
            )

    # Verify HMAC-SHA256 canonical signature
    expected_sig = compute_canonical_hmac(
        method=method,
        path=path,
        timestamp_ms=ts_str,
        nonce=nonce,
        payload_hash=client_payload_hash,
    )
    if not hmac.compare_digest(expected_sig, client_signature):
        return (
            False,
            "INVALID_REQUEST_SIGNATURE",
            "Không thể xác thực thao tác, vui lòng tải lại trang và thử lại.",
        )

    # Check anti-replay nonce after signature is verified
    if not nonce_guard.check_and_record(
        f"{ts_str}:{nonce}", ttl_sec=settings.MAX_CLOCK_SKEW_MS / 1000.0
    ):
        return (
            False,
            "REPLAY_ATTACK_DETECTED",
            "Thao tác vừa được gửi lặp lại, vui lòng đợi trong giây lát.",
        )

    return True, "OK", ""


def validate_docx_binary_safety(file_bytes: bytes) -> Tuple[bool, str, str]:
    """Inspect .docx binary for ZIP magic header, anti-zip-bomb limits, and required OpenXML structure."""
    if len(file_bytes) > settings.MAX_BODY_SIZE_BYTES:
        return (
            False,
            "FILE_TOO_LARGE",
            "Dung lượng tệp .docx vượt quá giới hạn an toàn cho phép (tối đa 10MB).",
        )

    # ZIP magic bytes check (PK\x03\x04)
    if len(file_bytes) < 4 or file_bytes[:4] != b"PK\x03\x04":
        return (
            False,
            "INVALID_DOCX_SIGNATURE",
            "Tệp tải lên không đúng định dạng gốc OpenXML (.docx).",
        )

    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes), "r") as zf:
            names = zf.namelist()
            if "word/document.xml" not in names:
                return (
                    False,
                    "MISSING_DOCUMENT_XML",
                    "Cấu trúc tệp .docx không hợp lệ (thiếu thành phần nội dung chính).",
                )
            total_uncompressed = sum(info.file_size for info in zf.infolist())
            if total_uncompressed > settings.MAX_DOCX_UNCOMPRESSED_BYTES:
                return (
                    False,
                    "ZIP_BOMB_DETECTED",
                    "Phát hiện tệp nén bất thường vượt ngưỡng an toàn bộ nhớ.",
                )
    except Exception:
        return (
            False,
            "CORRUPTED_DOCX_ARCHIVE",
            "Không thể xác thực cấu trúc an toàn của tệp .docx tải lên.",
        )

    return True, "OK", ""


def validate_xlsx_binary_safety(file_bytes: bytes) -> Tuple[bool, str, str]:
    """Inspect .xlsx binary for ZIP magic header, anti-zip-bomb limits, and required xl/workbook.xml structure."""
    if len(file_bytes) > settings.MAX_BODY_SIZE_BYTES:
        return (
            False,
            "FILE_TOO_LARGE",
            "Dung lượng tệp .xlsx vượt quá giới hạn an toàn cho phép (tối đa 10MB).",
        )

    if len(file_bytes) < 4 or file_bytes[:4] != b"PK\x03\x04":
        return (
            False,
            "INVALID_XLSX_SIGNATURE",
            "Tệp tải lên không đúng định dạng gốc OpenXML (.xlsx).",
        )

    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes), "r") as zf:
            names = zf.namelist()
            if "xl/workbook.xml" not in names:
                return (
                    False,
                    "MISSING_WORKBOOK_XML",
                    "Cấu trúc tệp .xlsx không hợp lệ (thiếu thành phần bảng tính chính).",
                )
            total_uncompressed = sum(info.file_size for info in zf.infolist())
            if total_uncompressed > settings.MAX_DOCX_UNCOMPRESSED_BYTES:
                return (
                    False,
                    "ZIP_BOMB_DETECTED",
                    "Phát hiện tệp nén bất thường vượt ngưỡng an toàn bộ nhớ.",
                )
    except Exception:
        return (
            False,
            "CORRUPTED_XLSX_ARCHIVE",
            "Không thể xác thực cấu trúc an toàn của tệp .xlsx tải lên.",
        )

    return True, "OK", ""


