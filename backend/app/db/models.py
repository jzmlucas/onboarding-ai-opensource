import uuid
from datetime import datetime, timezone

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from app.core.config import settings


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def new_id() -> str:
    return str(uuid.uuid4())


class Base(DeclarativeBase):
    pass


class Onboarding(Base):
    __tablename__ = "onboardings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    company_name: Mapped[str] = mapped_column(String(200), nullable=False)
    tax_id: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    contact_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    contact_whatsapp: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    whatsapp_mode: Mapped[str] = mapped_column(String(24), default="ai_active", nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="in_progress", nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    documents: Mapped[list["Document"]] = relationship(back_populates="onboarding", cascade="all, delete-orphan")
    findings: Mapped[list["Finding"]] = relationship(back_populates="onboarding", cascade="all, delete-orphan")
    customer_issues: Mapped[list["CustomerIssue"]] = relationship(back_populates="onboarding", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    onboarding_id: Mapped[str] = mapped_column(ForeignKey("onboardings.id", ondelete="CASCADE"), index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    mime_type: Mapped[str | None] = mapped_column(String(160), nullable=True)
    file_size: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(24), default="queued", index=True)
    extracted_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    processing_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    onboarding: Mapped[Onboarding] = relationship(back_populates="documents")
    chunks: Mapped[list["DocumentChunk"]] = relationship(back_populates="document", cascade="all, delete-orphan")
    findings: Mapped[list["Finding"]] = relationship(back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    __table_args__ = (UniqueConstraint("document_id", "chunk_index", name="uq_document_chunk_index"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"), index=True)
    onboarding_id: Mapped[str] = mapped_column(ForeignKey("onboardings.id", ondelete="CASCADE"), index=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    embedding: Mapped[list[float]] = mapped_column(Vector(settings.embedding_dimension), nullable=False)
    metadata_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    document: Mapped[Document] = relationship(back_populates="chunks")


class Finding(Base):
    __tablename__ = "findings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    onboarding_id: Mapped[str] = mapped_column(ForeignKey("onboardings.id", ondelete="CASCADE"), index=True)
    document_id: Mapped[str | None] = mapped_column(ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    category: Mapped[str] = mapped_column(String(80), default="general")
    title: Mapped[str] = mapped_column(String(220), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    source_excerpt: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="open", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    onboarding: Mapped[Onboarding] = relationship(back_populates="findings")
    document: Mapped[Document | None] = relationship(back_populates="findings")


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    onboarding_id: Mapped[str | None] = mapped_column(ForeignKey("onboardings.id", ondelete="SET NULL"), nullable=True, index=True)
    user_message: Mapped[str] = mapped_column(Text, nullable=False)
    intent: Mapped[str] = mapped_column(String(80), nullable=False)
    agent_name: Mapped[str] = mapped_column(String(100), nullable=False)
    provider: Mapped[str | None] = mapped_column(String(40), nullable=True)
    result_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class CustomerConversation(Base):
    """Persistent per-onboarding WhatsApp memory and automation mode."""

    __tablename__ = "customer_conversations"
    __table_args__ = (UniqueConstraint("onboarding_id", "contact_phone", name="uq_customer_conversation_contact"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    onboarding_id: Mapped[str] = mapped_column(ForeignKey("onboardings.id", ondelete="CASCADE"), index=True)
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    memory_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    mode: Mapped[str] = mapped_column(String(24), default="ai_active", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class CustomerIssue(Base):
    """An inbound WhatsApp message analyzed for an onboarding analyst."""

    __tablename__ = "customer_issues"
    __table_args__ = (UniqueConstraint("source_message_id", name="uq_customer_issue_source_message"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    onboarding_id: Mapped[str] = mapped_column(ForeignKey("onboardings.id", ondelete="CASCADE"), index=True)
    conversation_id: Mapped[str | None] = mapped_column(ForeignKey("customer_conversations.id", ondelete="SET NULL"), nullable=True, index=True)
    source_message_id: Mapped[str] = mapped_column(String(180), nullable=False)
    sender_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    sender_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    message_type: Mapped[str] = mapped_column(String(24), nullable=False)
    original_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    processing_status: Mapped[str] = mapped_column(String(24), default="queued", nullable=False, index=True)
    review_status: Mapped[str] = mapped_column(String(24), default="open", nullable=False, index=True)
    title: Mapped[str | None] = mapped_column(String(220), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    assistant_reply: Mapped[str | None] = mapped_column(Text, nullable=True)
    reply_status: Mapped[str] = mapped_column(String(24), default="pending", nullable=False)
    reply_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str | None] = mapped_column(String(80), nullable=True)
    urgency: Mapped[str | None] = mapped_column(String(20), nullable=True)
    customer_impact: Mapped[str | None] = mapped_column(Text, nullable=True)
    missing_information: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    recommendations: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    source_references: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    transcription_provider: Mapped[str | None] = mapped_column(String(40), nullable=True)
    analysis_provider: Mapped[str | None] = mapped_column(String(40), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    message_payload: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    onboarding: Mapped[Onboarding] = relationship(back_populates="customer_issues")
