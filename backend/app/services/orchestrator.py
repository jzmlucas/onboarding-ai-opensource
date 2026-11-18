import time

from sqlalchemy.orm import Session

from app.db.models import AgentRun
from app.services.agents.communication_agent import CommunicationAgent
from app.services.agents.document_agent import DocumentAgent
from app.services.agents.rag_agent import RagAgent
from app.services.agents.validation_agent import ValidationAgent
from app.services.llm import LLMClient


class Orchestrator:
    """Classifies the request and delegates work to the appropriate specialist agent."""

    def __init__(self, llm: LLMClient):
        self.llm = llm
        self.document_agent = DocumentAgent(llm)
        self.validation_agent = ValidationAgent()
        self.rag_agent = RagAgent(llm)
        self.communication_agent = CommunicationAgent(llm)

    def classify(self, message: str) -> str:
        prompt = f"""
Classifique a solicitação em exatamente uma intenção:
- ask_knowledge: pergunta sobre manuais, regras, procedimentos ou documentos.
- validate_onboarding: verificar status, pendências ou completude de um onboarding.
- draft_communication: redigir mensagem, e-mail ou solicitação ao cliente.
- analyze_document: analisar um documento específico.
- unknown: qualquer outra solicitação.

Retorne somente JSON: {{"intent":"uma_das_opcoes"}}
Solicitação: {message}
"""
        try:
            result = self.llm.generate_json(
                prompt,
                system_instruction="Você é o roteador de um sistema multiagente. Escolha a intenção mais adequada.",
                temperature=0,
            )
            intent = result.get("intent")
            allowed = {"ask_knowledge", "validate_onboarding", "draft_communication", "analyze_document", "unknown"}
            if intent in allowed:
                return intent
        except Exception:
            pass

        normalized = message.casefold()
        if any(term in normalized for term in ["e-mail", "email", "mensagem", "comunicação", "solicitar ao cliente"]):
            return "draft_communication"
        if any(term in normalized for term in ["validar", "pendência", "pendencias", "status", "completo", "completude"]):
            return "validate_onboarding"
        if any(term in normalized for term in ["documento", "arquivo", "pdf", "planilha", "analisar cadastro"]):
            return "analyze_document"
        if any(term in normalized for term in ["como", "qual", "onde", "procedimento", "política", "politica", "manual"]):
            return "ask_knowledge"
        return "unknown"

    def execute(self, db: Session, message: str, onboarding_id: str | None, document_id: str | None) -> dict:
        started = time.perf_counter()
        intent = self.classify(message)
        # Do not label deterministic agent responses with the model used only for routing.
        self.llm.provider_used = None
        sources: list[dict] = []
        data: dict = {}
        agent_name = "orchestrator"

        if intent == "ask_knowledge":
            agent_name = self.rag_agent.name
            result = self.rag_agent.run(db, message, onboarding_id)
            answer, sources, data = result["answer"], result.get("sources", []), result.get("data", {})
        elif intent == "validate_onboarding":
            agent_name = self.validation_agent.name
            result = self.validation_agent.run(db, onboarding_id)
            answer, data = result["answer"], result.get("data", {})
        elif intent == "draft_communication":
            agent_name = self.communication_agent.name
            result = self.communication_agent.run(db, onboarding_id, message)
            answer, data = result["answer"], result.get("data", {})
        elif intent == "analyze_document":
            agent_name = self.document_agent.name
            from app.db.models import Document
            document = db.get(Document, document_id) if document_id else None
            if not document and onboarding_id:
                from sqlalchemy import select
                document = db.scalar(
                    select(Document).where(Document.onboarding_id == onboarding_id, Document.status == "processed").order_by(Document.created_at.desc())
                )
            if not document:
                answer = "Não encontrei um documento processado para analisar. Envie um arquivo primeiro."
            else:
                result = self.document_agent.analyze(db, document)
                db.commit()
                answer = f"Análise do documento {document.filename} concluída. Foram identificadas {len(result.get('findings', []))} nova(s) pendência(s)."
                data = {"summary": result.get("summary"), "findings_count": len(result.get("findings", [])), "note": result.get("note")}
        else:
            answer = (
                "Posso ajudar a consultar procedimentos, validar um onboarding, analisar um documento "
                "ou preparar uma comunicação para o cliente. Informe também o processo quando necessário."
            )

        duration_ms = int((time.perf_counter() - started) * 1000)
        run = AgentRun(
            onboarding_id=onboarding_id,
            user_message=message,
            intent=intent,
            agent_name=agent_name,
            provider=self.llm.provider_used,
            result_json={"answer": answer, "data": data, "sources": sources},
            duration_ms=duration_ms,
        )
        db.add(run)
        db.commit()
        return {
            "intent": intent,
            "agent": agent_name,
            "answer": answer,
            "provider": self.llm.provider_used,
            "sources": sources,
            "data": data,
            "run_id": run.id,
        }
