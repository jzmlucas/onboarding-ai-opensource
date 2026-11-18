from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class OnboardingCreate(BaseModel):
    company_name: str = Field(min_length=2, max_length=200)
    tax_id: str | None = Field(default=None, max_length=32)
    contact_name: str | None = Field(default=None, max_length=160)
    contact_email: str | None = None
    description: str | None = Field(default=None, max_length=2000)


class OnboardingUpdate(BaseModel):
    company_name: str | None = Field(default=None, min_length=2, max_length=200)
    tax_id: str | None = Field(default=None, max_length=32)
    contact_name: str | None = Field(default=None, max_length=160)
    contact_email: str | None = None
    description: str | None = Field(default=None, max_length=2000)
    status: str | None = Field(default=None, pattern="^(in_progress|waiting_client|review|completed|paused)$")


class OnboardingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_name: str
    tax_id: str | None
    contact_name: str | None
    contact_email: str | None
    description: str | None
    status: str
    created_at: datetime
    updated_at: datetime
    document_count: int = 0
    open_findings_count: int = 0


class FindingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    onboarding_id: str
    document_id: str | None
    severity: str
    category: str
    title: str
    description: str
    recommendation: str
    source_excerpt: str | None
    status: str
    created_at: datetime


class FindingStatusUpdate(BaseModel):
    status: str = Field(pattern="^(open|resolved|dismissed)$")


class DashboardSummary(BaseModel):
    total_onboardings: int
    active_onboardings: int
    completed_onboardings: int
    pending_findings: int
    documents_processing: int
    recent_onboardings: list[OnboardingOut]
