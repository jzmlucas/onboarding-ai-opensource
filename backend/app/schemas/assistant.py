from pydantic import BaseModel, Field


class AssistantRequest(BaseModel):
    message: str = Field(min_length=2, max_length=5000)
    onboarding_id: str | None = None
    document_id: str | None = None


class SourceReference(BaseModel):
    document_id: str
    filename: str
    chunk_index: int
    excerpt: str
    distance: float | None = None


class AssistantResponse(BaseModel):
    intent: str
    agent: str
    answer: str
    provider: str | None = None
    sources: list[SourceReference] = Field(default_factory=list)
    data: dict = Field(default_factory=dict)
    run_id: str | None = None
