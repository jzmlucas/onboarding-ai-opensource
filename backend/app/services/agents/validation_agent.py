from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import Document, Finding, Onboarding


class ValidationAgent:
    name = "validation_agent"

    def run(self, db: Session, onboarding_id: str | None) -> dict:
        if not onboarding_id:
            return {"answer": "Informe o onboarding que deseja validar.", "data": {}}
        onboarding = db.get(Onboarding, onboarding_id)
        if not onboarding:
            return {"answer": "Não encontrei esse processo de onboarding.", "data": {}}

        documents = db.scalars(select(Document).where(Document.onboarding_id == onboarding_id)).all()
        findings = db.scalars(
            select(Finding).where(Finding.onboarding_id == onboarding_id, Finding.status == "open")
        ).all()
        checks = [
            {"item": "Dados básicos da empresa", "status": "ok" if onboarding.company_name else "pending"},
            {"item": "Documento recebido", "status": "ok" if documents else "pending"},
            {
                "item": "Documentos processados",
                "status": "ok" if documents and all(doc.status == "processed" for doc in documents) else "pending",
            },
            {"item": "Pendências identificadas", "status": "attention" if findings else "ok"},
        ]
        pending = sum(1 for check in checks if check["status"] != "ok")
        answer = (
            f"O onboarding de {onboarding.company_name} possui {len(documents)} documento(s) e "
            f"{len(findings)} pendência(s) em aberto. "
            + ("Recomendo resolver os itens pendentes antes de concluir." if pending else "Os itens básicos verificados estão em ordem.")
        )
        return {
            "answer": answer,
            "data": {
                "onboarding_id": onboarding_id,
                "status": onboarding.status,
                "documents_total": len(documents),
                "open_findings": len(findings),
                "checks": checks,
                "findings": [
                    {"id": f.id, "title": f.title, "severity": f.severity, "recommendation": f.recommendation}
                    for f in findings
                ],
            },
        }
