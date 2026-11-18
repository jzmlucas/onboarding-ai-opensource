from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import Document, DocumentChunk
from app.services.embeddings import embed_query
from app.services.llm import LLMClient


class RagAgent:
    name = "rag_agent"

    def __init__(self, llm: LLMClient):
        self.llm = llm

    def run(self, db: Session, question: str, onboarding_id: str | None) -> dict:
        query_vector = embed_query(question)
        distance = DocumentChunk.embedding.cosine_distance(query_vector).label("distance")
        statement = (
            select(DocumentChunk, Document.filename, distance)
            .join(Document, Document.id == DocumentChunk.document_id)
            .order_by(distance)
            .limit(settings.retrieval_top_k)
        )
        if onboarding_id:
            statement = statement.where(DocumentChunk.onboarding_id == onboarding_id)
        rows = db.execute(statement).all()
        if not rows:
            return {
                "answer": "Ainda não encontrei documentos indexados para responder. Envie e aguarde o processamento dos arquivos.",
                "sources": [],
                "data": {"retrieved_chunks": 0},
            }

        context_parts = []
        sources = []
        for chunk, filename, dist in rows:
            context_parts.append(f"[Fonte: {filename} | trecho {chunk.chunk_index}]\n{chunk.content}")
            sources.append(
                {
                    "document_id": chunk.document_id,
                    "filename": filename,
                    "chunk_index": chunk.chunk_index,
                    "excerpt": chunk.content[:420],
                    "distance": float(dist) if dist is not None else None,
                }
            )
        prompt = f"""
Responda à pergunta do analista usando exclusivamente o CONTEXTO recuperado.
Se o contexto não contiver a resposta, diga claramente que não encontrou essa informação.
Não invente políticas, prazos, valores ou procedimentos. Cite os nomes dos arquivos usados.

CONTEXTO:
{chr(10).join(context_parts)}

PERGUNTA:
{question}
"""
        answer = self.llm.generate(
            prompt,
            system_instruction="Você é um assistente de operações de onboarding. Seja objetivo, preciso e cite as fontes.",
        )
        return {"answer": answer, "sources": sources, "data": {"retrieved_chunks": len(rows)}}
