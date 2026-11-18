"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, AlertCircle, BookOpenCheck, Clock3, FileText, Plus, Users } from "lucide-react";
import { apiFetch, type Onboarding } from "@/lib/api";

type Summary = {
  total_onboardings: number;
  active_onboardings: number;
  completed_onboardings: number;
  pending_findings: number;
  documents_processing: number;
  recent_onboardings: Onboarding[];
};

const statusLabels: Record<string, string> = {
  in_progress: "Em andamento", waiting_client: "Aguardando cliente", review: "Em revisão", completed: "Concluído", paused: "Pausado",
};

function statusClass(status: string) {
  if (status === "completed") return "badge badge-green";
  if (status === "waiting_client") return "badge badge-yellow";
  if (status === "review") return "badge badge-blue";
  return "badge badge-gray";
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Summary>("/dashboard/summary").then(setSummary).catch((err) => setError(err.message));
  }, []);

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          
          <h1 className="page-title">Visão geral</h1>
          <p className="page-description">Acompanhe a implantação dos clientes, identifique pendências e mantenha o onboarding fluindo.</p>
        </div>
        <Link href="/onboardings/new" data-tour="dashboard-create" className="btn btn-primary"><Plus size={15} /> Novo onboarding</Link>
      </div>

      {error && <div className="alert alert-error">Não foi possível carregar os indicadores: {error}. Verifique se a API está em execução.</div>}

      <section className="welcome-banner"><div><h2>Um bom começo faz a diferença.</h2><p>Organize os próximos passos dos seus clientes e conte com o copiloto para transformar documentos em ações.</p><Link href="/copiloto">Conversar com o copiloto <ArrowRight size={16} /></Link></div><BookOpenCheck className="welcome-symbol" size={88} strokeWidth={1} aria-hidden="true" /></section>

      <section className="stat-grid">
        <div className="card stat-card"><div className="stat-top"><span>Onboardings totais</span><span className="stat-icon"><Users size={16} /></span></div><div className="stat-value">{summary?.total_onboardings ?? "—"}</div><div className="stat-note">Empresas cadastradas</div></div>
        <div className="card stat-card"><div className="stat-top"><span>Em andamento</span><span className="stat-icon"><Clock3 size={16} /></span></div><div className="stat-value">{summary?.active_onboardings ?? "—"}</div><div className="stat-note">Processos não concluídos</div></div>
        <div className="card stat-card"><div className="stat-top"><span>Pendências abertas</span><span className="stat-icon"><AlertCircle size={16} /></span></div><div className="stat-value">{summary?.pending_findings ?? "—"}</div><div className="stat-note">Itens que exigem atenção</div></div>
        <div className="card stat-card"><div className="stat-top"><span>Documentos processando</span><span className="stat-icon"><FileText size={16} /></span></div><div className="stat-value">{summary?.documents_processing ?? "—"}</div><div className="stat-note">Fila de processamento</div></div>
      </section>

      <section className="content-grid">
        <div className="card">
          <div className="card-header"><div><div className="card-title">Onboardings recentes</div><div className="card-subtitle">Acompanhe os processos mais recentes</div></div><Link href="/onboardings" className="btn btn-secondary">Ver todos <ArrowRight size={13} /></Link></div>
          {summary?.recent_onboardings?.length ? <div className="table-wrap"><table><thead><tr><th>Empresa</th><th>Status</th><th>Documentos</th><th>Pendências</th><th></th></tr></thead><tbody>{summary.recent_onboardings.map((item) => <tr key={item.id}><td className="company-cell">{item.company_name}</td><td><span className={statusClass(item.status)}>{statusLabels[item.status] ?? item.status}</span></td><td>{item.document_count}</td><td>{item.open_findings_count}</td><td><Link href={`/onboardings/${item.id}`} style={{ color: "#5746e8", fontWeight: 700 }}>Abrir →</Link></td></tr>)}</tbody></table></div> : <div className="empty-state"><strong>{summary ? "Nenhum onboarding cadastrado" : "Carregando dados..."}</strong>{summary && "Crie o primeiro processo para começar a acompanhar sua operação."}</div>}
        </div>
        <div>
          <div className="card quick-card"><div className="quick-icon"><BookOpenCheck size={22} /></div><div className="quick-title">Copiloto inteligente</div><p className="quick-copy">Analise documentos, consulte procedimentos com RAG e gere comunicações contextualizadas para os clientes.</p><Link href="/copiloto" className="btn btn-primary" style={{ width: "100%" }}>Abrir copiloto <ArrowRight size={14} /></Link></div>
          <div className="tip-box"><strong>Como o OnboardIA ajuda?</strong><p>Combina validações determinísticas com IA generativa. A IA recomenda; o analista revisa e mantém a decisão final.</p></div>
        </div>
      </section>
    </main>
  );
}
