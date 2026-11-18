from sqlalchemy.orm import Session

from app.db.models import Document, Finding
from app.services.llm import LLMClient, LLMUnavailableError


class DocumentAgent:
    name = "document_agent"

    def __init__(self, llm: LLMClient):
        self.llm = llm

    def analyze(self, db: Session, document: Document) -> dict:
        if not document.extracted_text:
            return {"findings": [], "note": "O documento não contém texto extraível."}

        prompt = f"""
Analise o documento abaixo como apoio a um analista de onboarding B2B.
Identifique somente problemas sustentados pelo texto: dados ausentes, inconsistências,
ambiguidade operacional, limites não definidos, campos potencialmente duplicados ou
informações que exigem confirmação humana. Não invente dados nem trate hipótese como fato.

Retorne APENAS JSON válido neste formato:
{{
  "summary": "resumo curto",
  "findings": [
    {{
      "severity": "low|medium|high",
      "category": "cadastro|funcionarios|centros_de_custo|politica|aprovacao|consistencia|outro",
      "title": "título objetivo",
      "description": "o que foi observado e por que merece atenção",
      "recommendation": "próxima ação recomendada",
      "source_excerpt": "trecho literal curto do documento"
    }}
  ]
}}
Se não houver problemas identificáveis, retorne findings como lista vazia.

ARQUIVO: {document.filename}
CONTEÚDO:
{document.extracted_text[:26000]}
"""
        try:
            result = self.llm.generate_json(
                prompt,
                system_instruction="Você é um analista cuidadoso de onboarding. Não invente fatos. Responda em português do Brasil.",
            )
            findings = result.get("findings", [])
            created = []
            for item in findings[:30]:
                if not isinstance(item, dict) or not item.get("title"):
                    continue
                finding = Finding(
                    onboarding_id=document.onboarding_id,
                    document_id=document.id,
                    severity=item.get("severity", "medium") if item.get("severity") in {"low", "medium", "high"} else "medium",
                    category=str(item.get("category", "outro"))[:80],
                    title=str(item["title"])[:220],
                    description=str(item.get("description", "")),
                    recommendation=str(item.get("recommendation", "Validar com o cliente.")),
                    source_excerpt=str(item.get("source_excerpt", ""))[:2000] or None,
                )
                db.add(finding)
                created.append(finding)
            db.flush()
            return {"summary": result.get("summary", "Análise concluída."), "findings": created}
        except LLMUnavailableError as exc:
            return {"findings": [], "note": f"Extração e indexação concluídas; análise generativa indisponível: {exc}"}
        except Exception as exc:
            return {"findings": [], "note": f"Documento indexado, mas a análise automática falhou: {exc.__class__.__name__}"}
