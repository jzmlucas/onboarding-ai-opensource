"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Bot, Check, FileText, Paperclip, Send, Sparkles, UploadCloud, X } from "lucide-react";
import { apiFetch, formatBytes, formatDate, type DocumentItem, type Finding, type Onboarding } from "@/lib/api";

type AssistantReply = { intent: string; agent: string; answer: string; provider: string | null; sources: { filename: string; chunk_index: number; excerpt: string }[]; data: Record<string, unknown>; run_id: string | null };
type ChatMessage = { role: "assistant" | "user"; text: string; sources?: AssistantReply["sources"]; provider?: string | null };

const statusLabels: Record<string, string> = { in_progress: "Em andamento", waiting_client: "Aguardando cliente", review: "Em revisão", completed: "Concluído", paused: "Pausado" };
const docLabels: Record<string, string> = { queued: "Na fila", processing: "Processando", processed: "Processado", failed: "Falhou" };

function badgeFor(status: string) {
  if (status === "processed" || status === "completed" || status === "resolved") return "badge badge-green";
  if (status === "failed" || status === "high") return "badge badge-red";
  if (status === "processing" || status === "review" || status === "medium") return "badge badge-blue";
  if (status === "queued" || status === "waiting_client") return "badge badge-yellow";
  return "badge badge-gray";
}

export function OnboardingWorkspace({ onboardingId, view = "all" }: { onboardingId: string; view?: "all" | "copilot" | "knowledge" }) {
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [assistantError, setAssistantError] = useState("");
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", text: "Olá! Sou o copiloto do OnboardIA. Posso consultar procedimentos, validar este onboarding, analisar documentos ou preparar uma comunicação para o cliente." }]);
  const uploadInFlight = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const [company, docs, issues] = await Promise.all([
      apiFetch<Onboarding>(`/onboardings/${onboardingId}`),
      apiFetch<DocumentItem[]>(`/documents?onboarding_id=${onboardingId}`),
      apiFetch<Finding[]>(`/findings?onboarding_id=${onboardingId}`),
    ]);
    setOnboarding(company); setDocuments(docs); setFindings(issues);
  }, [onboardingId]);

  useEffect(() => {
    let active = true;
    refresh().catch((err) => { if (active) setUploadError(err.message); }).finally(() => { if (active) setLoading(false); });
    const timer = window.setInterval(() => { refresh().catch(() => undefined); }, 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [refresh]);

  useEffect(() => { messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  async function uploadFile(file?: File) {
    if (!file || uploadInFlight.current) return;
    uploadInFlight.current = true;
    setUploadError(""); setUploading(true);
    try {
      const form = new FormData(); form.append("file", file); form.append("onboarding_id", onboardingId);
      const response = await fetch("/api/documents/upload", { method: "POST", body: form });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.detail ?? "Não foi possível enviar o arquivo.");
      await refresh();
    } catch (err) { setUploadError(err instanceof Error ? err.message : "Falha no upload."); }
    finally { uploadInFlight.current = false; setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    const text = question.trim(); if (!text || sending) return;
    setQuestion(""); setAssistantError(""); setMessages((current) => [...current, { role: "user", text }]); setSending(true);
    try {
      const result = await apiFetch<AssistantReply>("/assistant/execute", { method: "POST", body: JSON.stringify({ message: text, onboarding_id: onboardingId }) });
      setMessages((current) => [...current, { role: "assistant", text: result.answer, sources: result.sources, provider: result.provider }]);
      await refresh();
    } catch (err) { setAssistantError(err instanceof Error ? err.message : "O copiloto não conseguiu responder."); }
    finally { setSending(false); }
  }

  async function resolveFinding(id: string) {
    try { await apiFetch(`/findings/${id}`, { method: "PATCH", body: JSON.stringify({ status: "resolved" }) }); await refresh(); }
    catch (err) { setUploadError(err instanceof Error ? err.message : "Não foi possível atualizar a pendência."); }
  }

  if (loading) return <div className={view === "all" ? "page-content" : "workspace-content"}><div className="loading" role="status">Carregando processo...</div></div>;
  if (!onboarding) return <div className={view === "all" ? "page-content" : "workspace-content"}><div className="alert alert-error">Não foi possível localizar este onboarding. {uploadError}</div><Link href="/onboardings" className="btn btn-secondary"><ArrowLeft size={14} /> Voltar</Link></div>;

  const openFindings = findings.filter((item) => item.status === "open");
  const processedDocs = documents.filter((item) => item.status === "processed").length;

  return (
    <div className={view === "all" ? "page-content" : "workspace-content"}>
      {view === "all" && <div className="page-heading">
        <div><h1 className="page-title">{onboarding.company_name}</h1><p className="page-description">{onboarding.contact_name || "Contato não informado"}{onboarding.contact_email ? ` · ${onboarding.contact_email}` : ""} · Criado em {formatDate(onboarding.created_at)}</p><div style={{ marginTop: 10 }}><span className={badgeFor(onboarding.status)}>{statusLabels[onboarding.status] ?? onboarding.status}</span></div></div>
        <Link href="/onboardings" className="btn btn-secondary"><ArrowLeft size={14} /> Todos os onboardings</Link>
      </div>
      }
      {uploadError && <div className="alert alert-error">{uploadError}</div>}
      {view !== "copilot" && <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
        <div className="card stat-card"><div className="stat-top"><span>Documentos recebidos</span><span className="stat-icon"><FileText size={16} /></span></div><div className="stat-value">{documents.length}</div><div className="stat-note">{processedDocs} processado(s) e indexado(s)</div></div>
        <div className="card stat-card"><div className="stat-top"><span>Pendências abertas</span><span className="stat-icon"><X size={16} /></span></div><div className="stat-value">{openFindings.length}</div><div className="stat-note">Itens que precisam de revisão</div></div>
        <div className="card stat-card"><div className="stat-top"><span>Base de conhecimento</span><span className="stat-icon"><Sparkles size={16} /></span></div><div className="stat-value">{documents.reduce((sum, doc) => sum + (doc.status === "processed" ? 1 : 0), 0)}</div><div className="stat-note">Documentos disponíveis para RAG</div></div>
      </div>

      }
      <section className={view === "all" ? "detail-grid" : "workspace-grid"}>
        {view !== "copilot" && <div>
          <div className="card panel">
            <div className="panel-heading"><div><h3>Documentos do cliente</h3><span>PDF, DOCX, XLSX, CSV, TXT e Markdown · até 25 MB</span></div><button className="btn btn-secondary" onClick={() => fileRef.current?.click()} disabled={uploading}><Paperclip size={14} /> Adicionar arquivo</button></div>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.xlsx,.xlsm,.csv,.txt,.md" hidden onChange={(event) => uploadFile(event.target.files?.[0])} />
            <div className="upload-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); uploadFile(event.dataTransfer.files?.[0]); }}>
              <UploadCloud size={24} color="#5746e8" style={{ margin: "0 auto" }} /><p>{uploading ? "Enviando e adicionando à fila..." : "Arraste um documento para cá ou selecione um arquivo"}</p><button type="button" className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? "Enviando..." : "Selecionar documento"}</button>
            </div>
            <div style={{ marginTop: 15 }}>
              {documents.length ? documents.map((doc) => <div className="file-row" key={doc.id}><div className="file-icon"><FileText size={16} /></div><div className="file-info"><div className="file-name">{doc.filename}</div><div className="file-meta">{formatBytes(doc.file_size)} · {formatDate(doc.created_at)}</div>{doc.processing_note && <details className="document-note"><summary>Ver análise</summary><p>{doc.processing_note}</p></details>}{doc.error_message && <details className="document-note error-text"><summary>Ver erro de processamento</summary><p>{doc.error_message}</p></details>}</div><span className={badgeFor(doc.status)}>{docLabels[doc.status] ?? doc.status}</span></div>) : <div className="empty-state"><strong>Nenhum documento enviado</strong>Adicione os arquivos que serão analisados e indexados para consulta.</div>}
            </div>
          </div>

          {view === "all" && <div className="card panel" style={{ marginTop: 16 }}>
            <div className="panel-heading"><div><h3>Pendências identificadas</h3><span>Recomendações geradas a partir dos documentos</span></div><span>{openFindings.length} em aberto</span></div>
            {findings.length ? findings.map((finding) => <div className="finding" key={finding.id}><div className="finding-top"><div className="finding-title">{finding.title}</div><span className={badgeFor(finding.severity)}>{finding.severity === "high" ? "Alta" : finding.severity === "low" ? "Baixa" : "Média"}</span></div><p>{finding.description}</p><div className="finding-action"><strong>Próxima ação: </strong>{finding.recommendation}</div>{finding.source_excerpt && <div className="file-meta" style={{ marginTop: 8 }}>Trecho: “{finding.source_excerpt}”</div>}{finding.status === "open" && <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}><button className="btn btn-secondary" style={{ padding: "7px 10px", fontSize: 10 }} onClick={() => resolveFinding(finding.id)}><Check size={12} /> Marcar como resolvida</button></div>}</div>) : <div className="empty-state"><strong>Nenhuma pendência registrada</strong>Quando os documentos forem processados, os pontos de atenção aparecerão aqui.</div>}
          </div>
        }</div>}

        {view !== "knowledge" && <div className="card panel chat-box">
          <div className="panel-heading"><div style={{ display: "flex", alignItems: "center", gap: 9 }}><div className="quick-icon" style={{ width: 32, height: 32, margin: 0 }}><Bot size={17} /></div><div><h3>Copiloto OnboardIA</h3><span>Orquestrador multiagente · RAG</span></div></div><span className="badge badge-blue">IA assistiva</span></div>
          <div className="chat-messages" role="log" aria-live="polite" aria-label="Conversa com o copiloto" ref={messagesRef}>
            {messages.map((message, index) => <div key={index} className={`chat-message ${message.role}`}>{message.text}{message.sources?.length ? <div className="chat-source"><strong>Fontes consultadas</strong>{message.sources.map((source, sourceIndex) => <div key={sourceIndex}>• {source.filename} — trecho {source.chunk_index + 1}</div>)}</div> : null}{message.provider && <div className="chat-source">Modelo: {message.provider === "gemini" ? "Gemini" : "Ollama"}</div>}</div>)}
            {sending && <div className="chat-message assistant">Analisando solicitação e selecionando o agente adequado...</div>}
          </div>
          {assistantError && <div role="alert" className="error-text" style={{ marginBottom: 8 }}>{assistantError}</div>}
          <form className="chat-form" onSubmit={sendMessage}><input aria-label="Mensagem para o copiloto" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ex.: Valide este onboarding..." /><button className="btn btn-primary" type="submit" disabled={sending || !question.trim()} aria-label="Enviar"><Send size={14} /></button></form>
          <div className="field-hint" style={{ marginTop: 9 }}>Experimente: “Quais são as pendências?”, “Como funciona a política?” ou “Prepare um e-mail ao cliente”.</div>
        </div>}
      </section>
    </div>
  );
}
