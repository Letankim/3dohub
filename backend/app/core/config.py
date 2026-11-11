"""Global application & security settings for 3DoHub."""

import os
from datetime import datetime, timezone, timedelta
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend/.env or root .env
_backend_env = Path(__file__).resolve().parent.parent.parent / ".env"
_root_env = Path(__file__).resolve().parent.parent.parent.parent / ".env"
if _backend_env.exists():
    load_dotenv(_backend_env)
elif _root_env.exists():
    load_dotenv(_root_env)
else:
    load_dotenv()

VN_TZ = timezone(timedelta(hours=7))


class Settings:
    APP_NAME: str = "3DoHub Enterprise Platform"
    APP_CODE: str = "3DOHUB"
    VERSION: str = "2026.11.09.3"
    API_PREFIX: str = "/api/v1"
    ALLOWED_ORIGINS: list[str] = ["*"]

    # Database Configuration (PostgreSQL)
    DATABASE_URL: str = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/3dohub",
    )

    # Security & Anti-Tampering Checksum / HMAC Configuration
    HMAC_SIGNING_SECRET: str = os.environ.get(
        "THREEDOHUB_SIGNING_SECRET",
        "3dohub_sec_k9x8v7m2p4q1w5e6r3t0y2u8i9o4p7a1",
    )
    ENFORCE_REQUEST_SIGNATURE: bool = True
    MAX_CLOCK_SKEW_MS: int = 300_000  # 5 minutes anti-replay window
    MAX_BODY_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB max upload size
    MAX_DOCX_UNCOMPRESSED_BYTES: int = 35 * 1024 * 1024  # 35 MB anti-zip-bomb limit

    # Rate Limiting Configuration (Sliding Window per Client IP)
    RATE_LIMIT_WINDOW_SEC: int = 60
    RATE_LIMIT_GENERAL_MAX: int = 120  # 120 req/min for read/metadata endpoints
    RATE_LIMIT_COMPUTE_MAX: int = 35   # 35 req/min for heavy normalization/docx endpoints

    # Backend-only Spell Check Engine API Configuration (Environment-driven)
    GROQ_API_KEY: str = os.environ.get("GROQ_API_KEY", "").strip()
    GROQ_MODELS: list[str] = [
        m.strip()
        for m in os.environ.get(
            "GROQ_MODELS",
            "openai/gpt-oss-120b,qwen/qwen3.8-27b,openai/gpt-oss-20b",
        ).split(",")
        if m.strip()
    ]


settings = Settings()


def now_iso_vn() -> str:
    """Return current ISO-8601 timestamp in +07:00 timezone."""
    return datetime.now(VN_TZ).isoformat(timespec="seconds")
