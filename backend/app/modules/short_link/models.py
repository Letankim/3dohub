"""Database Models for Short Link Module & Analytics."""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class ShortLink(Base):
    """Stores short links, destination targets, and metadata."""

    __tablename__ = "short_links"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(64), unique=True, index=True, nullable=False)
    session_id = Column(String(64), index=True, nullable=True)
    original_url = Column(Text, nullable=False)
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    click_count = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    tags = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    clicks = relationship(
        "LinkClick",
        back_populates="short_link",
        cascade="all, delete-orphan",
        order_by="desc(LinkClick.clicked_at)",
    )


class LinkClick(Base):
    """Tracks click events for analytics and audit."""

    __tablename__ = "link_clicks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    short_link_id = Column(
        String(36),
        ForeignKey("short_links.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    clicked_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(String(512), nullable=True)
    referer = Column(String(512), nullable=True)

    short_link = relationship("ShortLink", back_populates="clicks")


Index("idx_short_links_code_active", ShortLink.code, ShortLink.is_active)
Index("idx_link_clicks_link_time", LinkClick.short_link_id, LinkClick.clicked_at)

