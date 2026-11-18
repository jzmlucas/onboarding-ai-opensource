from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CustomerIssueOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    onboarding_id: str
    sender_phone: str
    sender_name: str | None
    message_type: str
    original_text: str | None
    transcript: str | None
    processing_status: str
    review_status: str
    title: str | None
    summary: str | None
    assistant_reply: str | None
    reply_status: str
    reply_error: str | None
    category: str | None
    urgency: str | None
    customer_impact: str | None
    missing_information: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    source_references: list[dict] = Field(default_factory=list)
    transcription_provider: str | None
    analysis_provider: str | None
    error_message: str | None
    received_at: datetime
    processed_at: datetime | None


class CustomerIssueStatusUpdate(BaseModel):
    review_status: str = Field(pattern="^(open|in_review|resolved|dismissed)$")


class CustomerConversationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    onboarding_id: str
    contact_phone: str
    memory_summary: str | None
    mode: str
    updated_at: datetime


class CustomerConversationModeUpdate(BaseModel):
    mode: str = Field(pattern="^(ai_active|human_active)$")
