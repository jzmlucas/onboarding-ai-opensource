from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    onboarding_id: str
    filename: str
    mime_type: str | None
    file_size: int
    status: str
    processing_note: str | None
    error_message: str | None
    created_at: datetime
    processed_at: datetime | None
