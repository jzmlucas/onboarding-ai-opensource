from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Finding, Onboarding
from app.services.llm import LLMClient


class CommunicationAgent:
    name = "communication_agent"

    def __init__(self, llm: LLMClient):
        self.llm = llm

    def run(self, db: Session, onboarding_id: str | None, instruction: str) -> dict:
        if not onboarding_id:
            return {"answer": "Informe o onboarding para preparar uma comunicação contextualizada.", "data": {}}
        onboarding = db.get(Onboarding, onboarding_id)
        if not onboarding:
            return {"answer": "Não encontrei esse processo de onboarding.", "data": {}}
        findings = db.scalars(
            select(Finding).where(Finding.onboarding_id == onboarding_id, Finding.status == "open")
        ).all()
        pending = "\n".join(
            f"- {f.title}: {f.description}. Ação: {f.recommendation}" for f in findings
        ) or "Nenhuma pendência em aberto foi registrada."
        prompt = f"""
Prepare uma mensagem profissional, clara e cordial para o contato do cliente.
Não invente informações. Não afirme que algo foi concluído se não houver evidência.
Pedido do analista: {instruction}
Empresa: {onboarding.company_name}
Contato: {onboarding.contact_name or 'equipe do cliente'}
Pendências registradas:
{pending}
Retorne somente o texto da mensagem em português do Brasil.
"""
        answer = self.llm.generate(
            prompt,
            system_instruction="Você redige comunicações de Customer Success B2B com clareza e empatia.",
            temperature=0.35,
        )
        return {"answer": answer, "data": {"open_findings": len(findings), "draft_only": True}}
