"""Database Engine and Session Configuration for 3DoHub (PostgreSQL via SQLAlchemy)."""

from typing import Any, Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# Normalize postgres:// to postgresql+psycopg2:// for SQLAlchemy 1.4+ compatibility
_db_url = settings.DATABASE_URL
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql+psycopg2://", 1)

# Connection engine with connection pool & health checks
engine = create_engine(
    _db_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=300,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency that yields an active database session and ensures it closes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Initialize database tables registered on Base.metadata."""
    # Ensure all models are imported so Base.metadata contains the tables
    import app.modules.short_link.models  # noqa: F401
    Base.metadata.create_all(bind=engine)


def ping_database() -> dict[str, Any]:
    """Execute a live lightweight ping query ('SELECT 1') to prevent database sleeping / cold starts."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "CONNECTED", "alive": True}
    except Exception as e:
        return {"status": "DISCONNECTED", "alive": False, "error": str(e)}
