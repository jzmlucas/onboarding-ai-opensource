"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { apiFetch, type Onboarding } from "@/lib/api";

const labels: Record<string, string> = { in_progress: "Em andamento", waiting_client: "Aguardando cliente", review: "Em revisão", completed: "Concluído", paused: "Pausado" };
const badge: Record<string, string> = { in_progress: "badge badge-blue", waiting_client: "badge badge-yellow", review: "badge badge-blue", completed: "badge badge-green", paused: "badge badge-gray" };

export default function OnboardingsPage() {
  const [items, setItems] = useState<Onboarding[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { apiFetch<Onboarding[]>("/onboardings").then(setItems).catch((err) => setError(err.message)); }, []);
  const filtered = items.filter((item) => item.company_name.toLowerCase().includes(search.toLowerCase()) || (item.tax_id ?? "").includes(search));

  return (
    <main className="page-content">
      <div className="page-heading">
        <div><h1 className="page-title">Onboardings</h1><p className="page-description">Gerencie os processos de implantação e acompanhe documentos e pendências de cada empresa.</p></div>
        <Link href="/onboardings/new" data-tour="onboardings-create" className="btn btn-primary"><Plus size={15} /> Novo onboarding</Link>
      </div>
      {error && <div className="alert alert-error">{error}. Verifique se a API está em execução.</div>}
      <div className="card">
        <div className="card-header"><div><div className="card-title">Todos os processos</div><div className="card-subtitle">{items.length} empresa(s) cadastrada(s)</div></div><div style={{ position: "relative", width: 230 }}><Search size={14} style={{ position: "absolute", left: 11, top: 11, color: "#91a2a4" }} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar empresa ou CNPJ" style={{ width: "100%", border: "1px solid #e1e9e9", borderRadius: 8, padding: "9px 10px 9px 32px", fontSize: 11, outline: "none" }} /></div></div>
        {filtered.length ? <div className="table-wrap"><table><thead><tr><th>Empresa</th><th>Contato</th><th>Status</th><th>Documentos</th><th>Pendências</th><th>Cadastro</th><th></th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><div className="company-cell">{item.company_name}</div><div className="muted-cell" style={{ fontSize: 9, marginTop: 4 }}>{item.tax_id || "CNPJ não informado"}</div></td><td>{item.contact_name || "—"}<div className="muted-cell" style={{ fontSize: 9, marginTop: 4 }}>{item.contact_email || ""}</div></td><td><span className={badge[item.status] ?? "badge badge-gray"}>{labels[item.status] ?? item.status}</span></td><td>{item.document_count}</td><td>{item.open_findings_count}</td><td>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(item.created_at))}</td><td><Link href={`/onboardings/${item.id}`} style={{ color: "#5746e8", fontWeight: 700 }}>Abrir →</Link></td></tr>)}</tbody></table></div> : <div className="empty-state"><strong>{search ? "Nenhum resultado" : "Nenhum onboarding cadastrado"}</strong>{search ? "Tente buscar por outro nome ou CNPJ." : "Cadastre uma empresa para iniciar o acompanhamento."}</div>}
      </div>
    </main>
  );
}
