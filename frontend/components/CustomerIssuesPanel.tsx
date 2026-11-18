"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, formatDate, type CustomerConversation, type CustomerIssue } from "@/lib/api";

const processingLabels: Record<string, string> = { queued: "Na fila", processing: "Analisando", processed: "Análise pronta", failed: "Falha na análise" };
const reviewLabels: Record<string, string> = { open: "A revisar", in_review: "Em análise humana", resolved: "Resolvido", dismissed: "Descartado" };
const urgencyLabels: Record<string, string> = { low: "Baixa", medium: "Média", high: "Alta", critical: "Crítica" };
const replyLabels: Record<string, string> = { pending: "Preparando resposta", sending: "Enviando pelo WhatsApp", sent: "Resposta enviada", failed: "Falha ao enviar resposta", paused: "Atendimento pausado para equipe" };

export function CustomerIssuesPanel({ onboardingId }: { onboardingId: string }) {
  const [items, setItems] = useState<CustomerIssue[]>([]);
  const [conversations, setConversations] = useState<CustomerConversation[]>([]);
  const [error, setError] = useState("");
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [modeUpdatingId, setModeUpdatingId] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    try {
      const [issues, memories] = await Promise.all([
        apiFetch<CustomerIssue[]>(`/customer-issues?onboarding_id=${encodeURIComponent(onboardingId)}`),
        apiFetch<CustomerConversation[]>(`/customer-conversations?onboarding_id=${encodeURIComponent(onboardingId)}`),
      ]);
      setItems(issues);
      setConversations(memories);
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível carregar os relatos."); }
  }, [onboardingId]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => { void refresh(); }, 5000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function updateStatus(issue: CustomerIssue, review_status: string) {
    try {
      await apiFetch(`/customer-issues/${issue.id}`, { method: "PATCH", body: JSON.stringify({ review_status }) });
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível atualizar o relato."); }
  }

  async function retry(issue: CustomerIssue) {
    setRetryingId(issue.id); setError("");
    try {
      const response = await fetch(`/api/customer-issues/${encodeURIComponent(issue.id)}/retry`, { method: "POST" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.detail ?? "Não foi possível reenfileirar o relato.");
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível reenfileirar o relato."); }
    finally { setRetryingId(null); }
  }

  async function toggleHumanMode(conversation: CustomerConversation) {
    setModeUpdatingId(conversation.id); setError("");
    try {
      const updated = await apiFetch<CustomerConversation>(`/customer-conversations/${encodeURIComponent(conversation.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ mode: conversation.mode === "human_active" ? "ai_active" : "human_active" }),
      });
      setConversations((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível alterar o responsável pelo atendimento."); }
    finally { setModeUpdatingId(null); }
  }

  return <section className="card panel customer-issues-panel">
    <div className="panel-heading"><div><h3>Atendimento pelo WhatsApp</h3><span>A IA analisa as mensagens e mantém a memória da conversa. O modo de resposta pode ser alternado por conversa.</span></div><span>{items.length} mensagem(ns)</span></div>
    {error && <div className="alert alert-error" role="alert">{error}</div>}
    {!!conversations.length && <div className="issue-conversations">{conversations.map((conversation) => <div className={`issue-conversation ${conversation.mode === "human_active" ? "is-human" : ""}`} key={conversation.id}>
      <div className="issue-conversation-heading"><div><strong>{conversation.mode === "human_active" ? "Atendimento humano ativo" : "Atendimento automático por IA"}</strong><span>{conversation.contact_phone}</span><span className="mode-toggle-label">{conversation.mode === "human_active" ? "Humano" : "IA"}</span></div><button type="button" role="switch" aria-checked={conversation.mode === "human_active"} aria-label={`${conversation.mode === "human_active" ? "Desativar" : "Ativar"} atendimento humano para ${conversation.contact_phone}`} className={`mode-toggle ${conversation.mode === "human_active" ? "is-on" : ""}`} onClick={() => void toggleHumanMode(conversation)} disabled={modeUpdatingId !== null}><span /></button></div>
      {conversation.mode === "human_active" && <div className="alert-warning human-mode-notice" role="status"><strong>Atendimento humano ativado.</strong> As respostas automáticas da IA estão pausadas para este cliente. As mensagens continuam sendo analisadas e registradas no Copiloto.</div>}
      {conversation.memory_summary && <div className="issue-memory"><strong>Memória persistente da conversa</strong><p>{conversation.memory_summary}</p></div>}
    </div>)}</div>}
    {items.length === 0 ? <div className="empty-state"><strong>Nenhum relato recebido</strong>Configure o WhatsApp do cliente e conecte a instância da Evolution para acompanhar mensagens por aqui.</div> : items.map((issue) => (
      <article className="customer-issue" key={issue.id}>
        <div className="customer-issue-heading"><div><h4>{issue.title ?? (issue.message_type === "audio" ? "Mensagem de áudio" : "Mensagem recebida")}</h4><span>{issue.sender_name || issue.sender_phone} · {formatDate(issue.received_at)}</span></div><div className="customer-issue-badges"><span className={`badge ${issue.urgency === "critical" || issue.urgency === "high" ? "badge-red" : issue.urgency === "medium" ? "badge-yellow" : "badge-blue"}`}>{urgencyLabels[issue.urgency ?? ""] ?? processingLabels[issue.processing_status]}</span><span className="badge badge-gray">{reviewLabels[issue.review_status] ?? issue.review_status}</span></div></div>
        {issue.processing_status !== "processed" && <div className={issue.processing_status === "failed" ? "alert alert-error" : "issue-processing"} role={issue.processing_status === "failed" ? "alert" : "status"}>{processingLabels[issue.processing_status] ?? issue.processing_status}{issue.error_message ? `: ${issue.error_message}` : "…"}</div>}
        {(issue.processing_status === "failed" || issue.reply_status === "failed") && <button type="button" className="btn btn-secondary issue-retry" onClick={() => retry(issue)} disabled={retryingId !== null}>{retryingId === issue.id ? "Enfileirando…" : "Tentar novamente"}</button>}
        {issue.summary && <p className="customer-issue-summary">{issue.summary}</p>}
        {issue.assistant_reply && <div className="issue-list issue-ai-reply"><strong>Resposta da IA · {replyLabels[issue.reply_status] ?? issue.reply_status}</strong><p>{issue.assistant_reply}</p>{issue.reply_error && <p className="error-text">{issue.reply_error}</p>}</div>}
        {issue.category && <div className="issue-category">Categoria identificada: <strong>{issue.category}</strong></div>}
        {issue.customer_impact && <div className="issue-impact"><strong>Impacto relatado</strong><p>{issue.customer_impact}</p></div>}
        {(issue.original_text || issue.transcript) && <details className="issue-source-text"><summary>{issue.message_type === "audio" ? "Ver transcrição do áudio" : "Ver mensagem original"}</summary><p>{issue.transcript ?? issue.original_text}</p></details>}
        {!!issue.missing_information.length && <div className="issue-list"><strong>Informações a confirmar</strong><ul>{issue.missing_information.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
        {!!issue.recommendations.length && <div className="issue-list issue-recommendations"><strong>Próximos passos sugeridos</strong><ul>{issue.recommendations.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
        {!!issue.source_references.length && <div className="issue-sources"><strong>Trechos consultados</strong>{issue.source_references.map((source, index) => <div key={`${source.filename}-${source.chunk_index}-${index}`}><b>{source.filename} · trecho {source.chunk_index + 1}</b><p>{source.excerpt}</p></div>)}</div>}
        <div className="issue-footer"><span>{issue.message_type === "audio" ? `Transcrição: ${issue.transcription_provider ?? "—"} · ` : ""}Análise: {issue.analysis_provider ?? "—"} · Triagem preliminar; confirme antes de agir.</span>{issue.processing_status === "processed" && <div>{issue.review_status !== "in_review" && <button type="button" className="btn btn-secondary" onClick={() => updateStatus(issue, "in_review")}>Marcar em análise</button>}{issue.review_status !== "resolved" && <button type="button" className="btn btn-secondary" onClick={() => updateStatus(issue, "resolved")}>Marcar resolvido</button>}{issue.review_status !== "dismissed" && <button type="button" className="btn btn-secondary" onClick={() => updateStatus(issue, "dismissed")}>Descartar</button>}</div>}</div>
      </article>
    ))}
  </section>;
}
