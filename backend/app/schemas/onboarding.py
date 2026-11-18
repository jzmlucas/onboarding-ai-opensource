from datetime import datetime

import re

from pydantic import BaseModel, ConfigDict, Field, field_validator


class OnboardingCreate(BaseModel):
    company_name: str = Field(min_length=2, max_length=200)
    tax_id: str | None = Field(default=None, max_length=32)
    contact_name: str | None = Field(default=None, max_length=160)
    contact_email: str | None = None
    contact_whatsapp: str | None = Field(default=None, max_length=32)
    description: str | None = Field(default=None, max_length=2000)

    @field_validator("contact_whatsapp")
    @classmethod
    def normalize_whatsapp(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None
        digits = re.sub(r"\D", "", value)
        if not 8 <= len(digits) <= 15 or digits.startswith("0"):
            raise ValueError("Informe um WhatsApp válido com código do país, por exemplo +5511999999999.")
        return digits


class OnboardingUpdate(BaseModel):
    company_name: str | None = Field(default=None, min_length=2, max_length=200)
    tax_id: str | None = Field(default=None, max_length=32)
    contact_name: str | None = Field(default=None, max_length=160)
    contact_email: str | None = None
    contact_whatsapp: str | None = Field(default=None, max_length=32)
    whatsapp_mode: str | None = Field(default=None, pattern="^(ai_active|human_active)$")
    description: str | None = Field(default=None, max_length=2000)
    status: str | None = Field(default=None, pattern="^(in_progress|waiting_client|review|completed|paused)$")

    @field_validator("contact_whatsapp")
    @classmethod
    def normalize_whatsapp(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None
        digits = re.sub(r"\D", "", value)
        if not 8 <= len(digits) <= 15 or digits.startswith("0"):
            raise ValueError("Informe um WhatsApp válido com código do país, por exemplo +5511999999999.")
        return digits


class OnboardingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_name: str
    tax_id: str | None
    contact_name: str | None
    contact_email: str | None
    contact_whatsapp: str | None
    whatsapp_mode: str
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
