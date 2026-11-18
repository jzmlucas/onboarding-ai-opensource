import hmac
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.db.models import AgentRun, CustomerConversation, CustomerIssue, Document, DocumentChunk, Finding, Onboarding
from app.schemas.assistant import AssistantRequest, AssistantResponse
from app.schemas.document import DocumentOut
from app.schemas.customer_issue import CustomerConversationOut, CustomerIssueOut, CustomerIssueStatusUpdate
from app.schemas.onboarding import (
    DashboardSummary,
    FindingOut,
    FindingStatusUpdate,
    OnboardingCreate,
    OnboardingOut,
    OnboardingUpdate,
)
from app.services.agents.document_agent import DocumentAgent
from app.services.chunking import chunk_text
from app.services.customer_issue import ingest_evolution_message, process_customer_issue
from app.services.document_parser import extract_text
from app.services.embeddings import embed_documents
from app.services.llm import LLMClient, LLMUnavailableError
from app.services.orchestrator import Orchestrator
from app.services.tabular_validation import validate_tabular_file

router = APIRouter(prefix="/api/v1")
logger = logging.getLogger(__name__)
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".xlsx", ".xlsm", ".csv", ".txt", ".md"}


def onboarding_to_out(db: Session, onboarding: Onboarding) -> OnboardingOut:
    document_count = db.scalar(select(func.count(Document.id)).where(Document.onboarding_id == onboarding.id)) or 0
    open_findings = db.scalar(
        select(func.count(Finding.id)).where(Finding.onboarding_id == onboarding.id, Finding.status == "open")
    ) or 0
    return OnboardingOut.model_validate(onboarding).model_copy(
        update={"document_count": document_count, "open_findings_count": open_findings}
    )


@router.get("/health")
def health():
    return {"status": "ok", "application": "onboardia", "timestamp": datetime.now(timezone.utc).isoformat()}


@router.get("/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    total = db.scalar(select(func.count(Onboarding.id))) or 0
    active = db.scalar(select(func.count(Onboarding.id)).where(Onboarding.status.in_(["in_progress", "waiting_client", "review"]))) or 0
    completed = db.scalar(select(func.count(Onboarding.id)).where(Onboarding.status == "completed")) or 0
    pending = db.scalar(select(func.count(Finding.id)).where(Finding.status == "open")) or 0
    processing = db.scalar(select(func.count(Document.id)).where(Document.status.in_(["queued", "processing"]))) or 0
    recent = db.scalars(select(Onboarding).order_by(Onboarding.created_at.desc()).limit(6)).all()
    return DashboardSummary(
        total_onboardings=total,
        active_onboardings=active,
        completed_onboardings=completed,
        pending_findings=pending,
        documents_processing=processing,
        recent_onboardings=[onboarding_to_out(db, item) for item in recent],
    )


@router.get("/onboardings", response_model=list[OnboardingOut])
def list_onboardings(db: Session = Depends(get_db)):
    rows = db.scalars(select(Onboarding).order_by(Onboarding.created_at.desc()).limit(100)).all()
    return [onboarding_to_out(db, item) for item in rows]


@router.post("/onboardings", response_model=OnboardingOut, status_code=status.HTTP_201_CREATED)
def create_onboarding(payload: OnboardingCreate, db: Session = Depends(get_db)):
    onboarding = Onboarding(**payload.model_dump())
    db.add(onboarding)
    db.commit()
    db.refresh(onboarding)
    return onboarding_to_out(db, onboarding)


@router.get("/onboardings/{onboarding_id}", response_model=OnboardingOut)
def get_onboarding(onboarding_id: str, db: Session = Depends(get_db)):
    onboarding = db.get(Onboarding, onboarding_id)
    if not onboarding:
        raise HTTPException(status_code=404, detail="Onboarding não encontrado.")
    return onboarding_to_out(db, onboarding)


@router.patch("/onboardings/{onboarding_id}", response_model=OnboardingOut)
def update_onboarding(onboarding_id: str, payload: OnboardingUpdate, db: Session = Depends(get_db)):
    onboarding = db.get(Onboarding, onboarding_id)
    if not onboarding:
        raise HTTPException(status_code=404, detail="Onboarding não encontrado.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(onboarding, key, value)
    db.commit()
    db.refresh(onboarding)
    return onboarding_to_out(db, onboarding)


@router.post("/documents", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    onboarding_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    onboarding = db.get(Onboarding, onboarding_id)
    if not onboarding:
        raise HTTPException(status_code=404, detail="Onboarding não encontrado.")
    original_name = Path(file.filename or "documento").name
    extension = Path(original_name).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=415, detail=f"Formato não suportado. Permitidos: {', '.join(sorted(ALLOWED_EXTENSIONS))}")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="O arquivo está vazio.")
    if len(content) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Arquivo excede o limite de {settings.max_upload_mb} MB.")

    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid.uuid4()}{extension}"
    file_path = settings.upload_dir / stored_name
    file_path.write_bytes(content)
    document = Document(
        onboarding_id=onboarding_id,
        filename=original_name,
        file_path=str(file_path),
        mime_type=file.content_type,
        file_size=len(content),
        status="queued",
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.get("/documents", response_model=list[DocumentOut])
def list_documents(onboarding_id: str, db: Session = Depends(get_db)):
    return db.scalars(
        select(Document).where(Document.onboarding_id == onboarding_id).order_by(Document.created_at.desc())
    ).all()


@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: str, db: Session = Depends(get_db)):
    document = db.get(Document, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Documento não encontrado.")

    file_path = Path(document.file_path)
    upload_root = settings.upload_dir.resolve()
    try:
        file_path.resolve().relative_to(upload_root)
    except ValueError:
        file_path = None

    db.delete(document)
    db.commit()

    if file_path:
        try:
            file_path.unlink(missing_ok=True)
        except OSError:
            # The DB record and indexed content are already removed. An orphaned
            # upload can be cleaned up later without blocking the user action.
            pass
    return None


@router.get("/findings", response_model=list[FindingOut])
def list_findings(onboarding_id: str, db: Session = Depends(get_db)):
    return db.scalars(
        select(Finding).where(Finding.onboarding_id == onboarding_id).order_by(Finding.created_at.desc())
    ).all()


@router.patch("/findings/{finding_id}", response_model=FindingOut)
def update_finding(finding_id: str, payload: FindingStatusUpdate, db: Session = Depends(get_db)):
    finding = db.get(Finding, finding_id)
    if not finding:
        raise HTTPException(status_code=404, detail="Pendência não encontrada.")
    finding.status = payload.status
    db.commit()
    db.refresh(finding)
    return finding


@router.get("/customer-issues", response_model=list[CustomerIssueOut])
def list_customer_issues(onboarding_id: str, db: Session = Depends(get_db)):
    if not db.get(Onboarding, onboarding_id):
        raise HTTPException(status_code=404, detail="Onboarding não encontrado.")
    return db.scalars(
        select(CustomerIssue)
        .where(CustomerIssue.onboarding_id == onboarding_id)
        .order_by(CustomerIssue.received_at.desc())
        .limit(100)
    ).all()


@router.get("/customer-conversations", response_model=list[CustomerConversationOut])
def list_customer_conversations(onboarding_id: str, db: Session = Depends(get_db)):
    if not db.get(Onboarding, onboarding_id):
        raise HTTPException(status_code=404, detail="Onboarding não encontrado.")
    return db.scalars(
        select(CustomerConversation)
        .where(CustomerConversation.onboarding_id == onboarding_id)
        .order_by(CustomerConversation.updated_at.desc())
        .limit(20)
    ).all()


@router.patch("/customer-issues/{issue_id}", response_model=CustomerIssueOut)
def update_customer_issue(issue_id: str, payload: CustomerIssueStatusUpdate, db: Session = Depends(get_db)):
    issue = db.get(CustomerIssue, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Relato do cliente não encontrado.")
    if issue.processing_status != "processed":
        raise HTTPException(status_code=409, detail="O relato ainda não está pronto para revisão.")
    issue.review_status = payload.review_status
    db.commit()
    db.refresh(issue)
    return issue


@router.post("/customer-issues/{issue_id}/retry", response_model=CustomerIssueOut)
def retry_customer_issue(issue_id: str, db: Session = Depends(get_db)):
    issue = db.get(CustomerIssue, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Relato do cliente não encontrado.")
    if issue.processing_status in {"failed", "queued"}:
        issue.processing_status = "queued"
        issue.error_message = None
    elif issue.reply_status == "failed":
        issue.reply_status = "pending"
        issue.reply_error = None
    else:
        raise HTTPException(status_code=409, detail="Só é possível reenfileirar relatos com falha ou ainda na fila.")
    db.commit()
    db.refresh(issue)
    return issue


@router.post("/internal/evolution/webhook")
def receive_evolution_webhook(
    payload: dict,
    x_internal_api_key: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    if not x_internal_api_key or not hmac.compare_digest(x_internal_api_key, settings.internal_api_key):
        raise HTTPException(status_code=401, detail="Credencial interna inválida.")
    result = ingest_evolution_message(db, payload)
    event = str(payload.get("event", "unknown"))[:80]
    instance = str(payload.get("instance", "unknown"))[:80]
    if result.get("accepted"):
        logger.info(
            "Evolution webhook accepted event=%s instance=%s duplicate=%s issue_id=%s",
            event, instance, result.get("duplicate", False), result.get("customer_issue_id", ""),
        )
    else:
        logger.warning(
            "Evolution webhook ignored event=%s instance=%s reason=%s",
            event, instance, result.get("reason", "unknown"),
        )
    return result


@router.post("/internal/customer-issues/{issue_id}/process")
def process_customer_issue_endpoint(
    issue_id: str,
    x_internal_api_key: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    if not x_internal_api_key or not hmac.compare_digest(x_internal_api_key, settings.internal_api_key):
        raise HTTPException(status_code=401, detail="Credencial interna inválida.")
    issue = db.get(CustomerIssue, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Relato do cliente não encontrado.")
    try:
        return process_customer_issue(db, issue, LLMClient())
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Falha ao analisar a mensagem recebida. Consulte o status e os logs da API.") from exc


@router.post("/assistant/execute", response_model=AssistantResponse)
def execute_assistant(payload: AssistantRequest, db: Session = Depends(get_db)):
    if payload.onboarding_id and not db.get(Onboarding, payload.onboarding_id):
        raise HTTPException(status_code=404, detail="Onboarding não encontrado.")
    try:
        return Orchestrator(LLMClient()).execute(
            db,
            payload.message,
            payload.onboarding_id,
            payload.document_id,
        )
    except LLMUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/assistant/history")
def assistant_history(onboarding_id: str, limit: int = 30, db: Session = Depends(get_db)):
    if not db.get(Onboarding, onboarding_id):
        raise HTTPException(status_code=404, detail="Onboarding não encontrado.")
    limit = max(1, min(limit, 100))
    rows = db.scalars(
        select(AgentRun)
        .where(AgentRun.onboarding_id == onboarding_id)
        .order_by(AgentRun.created_at.desc())
        .limit(limit)
    ).all()
    return [
        {
            "id": run.id,
            "message": run.user_message,
            "answer": run.result_json.get("answer", ""),
            "sources": run.result_json.get("sources", []),
            "provider": run.provider,
            "created_at": run.created_at,
        }
        for run in reversed(rows)
    ]


@router.post("/internal/documents/{document_id}/process")
def process_document(
    document_id: str,
    x_internal_api_key: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    if not x_internal_api_key or not hmac.compare_digest(x_internal_api_key, settings.internal_api_key):
        raise HTTPException(status_code=401, detail="Credencial interna inválida.")
    document = db.get(Document, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Documento não encontrado.")

    document.status = "processing"
    document.error_message = None
    db.commit()
    try:
        extracted = extract_text(document.file_path)
        if not extracted.strip():
            raise ValueError("Não foi possível extrair texto do arquivo.")
        document.extracted_text = extracted[:1_000_000]
        chunks = chunk_text(document.extracted_text)
        db.query(DocumentChunk).filter(DocumentChunk.document_id == document.id).delete(synchronize_session=False)
        db.query(Finding).filter(Finding.document_id == document.id).delete(synchronize_session=False)
        for item in validate_tabular_file(document.file_path):
            db.add(Finding(onboarding_id=document.onboarding_id, document_id=document.id, **item))
        vectors = embed_documents([str(chunk["content"]) for chunk in chunks])
        for index, (chunk, vector) in enumerate(zip(chunks, vectors, strict=True)):
            db.add(
                DocumentChunk(
                    document_id=document.id,
                    onboarding_id=document.onboarding_id,
                    chunk_index=index,
                    content=str(chunk["content"]),
                    token_count=int(chunk["token_count"]),
                    embedding=vector,
                    metadata_json={"filename": document.filename},
                )
            )
        db.flush()
        analysis = DocumentAgent(LLMClient()).analyze(db, document)
        document.status = "processed"
        document.processing_note = analysis.get("note") or analysis.get("summary") or f"Documento indexado em {len(chunks)} chunks."
        document.processed_at = datetime.now(timezone.utc)
        db.commit()
        return {
            "document_id": document.id,
            "status": document.status,
            "chunks_created": len(chunks),
            "findings_created": len(analysis.get("findings", [])),
            "note": document.processing_note,
        }
    except Exception as exc:
        db.rollback()
        document = db.get(Document, document_id)
        if document:
            document.status = "failed"
            document.error_message = f"{exc.__class__.__name__}: {str(exc)[:700]}"
            db.commit()
        raise HTTPException(status_code=500, detail="Falha ao processar documento. Verifique o status e os logs da API.") from exc
