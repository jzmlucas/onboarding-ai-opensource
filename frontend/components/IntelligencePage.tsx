"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, type Onboarding } from "@/lib/api";
import { OnboardingWorkspace } from "@/components/OnboardingWorkspace";

export function IntelligencePage({ view }: { view: "copilot" | "knowledge" }) {
  const [items, setItems] = useState<Onboarding[]>([]);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    apiFetch<Onboarding[]>("/onboardings").then((data) => {
      if (!active) return;
      setItems(data);
      const whatsappOnboarding = view === "copilot" ? data.find((item) => item.contact_whatsapp) : undefined;
      setSelected(whatsappOnboarding?.id ?? data[0]?.id ?? "");
    }).catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt, view]);
  return <main className="page-content intelligence-page">
    <div className="page-heading"><div>
      <h1 className="page-title">{view === "copilot" ? "Copiloto IA" : "Base de conhecimento"}</h1>
      <p className="page-description">{view === "copilot" ? "Consulte documentos, revise pendências e prepare comunicações com o contexto de cada cliente." : "Organize os documentos que dão contexto às respostas do copiloto."}</p>
    </div></div>
    {loading ? <div className="loading" role="status">Carregando processos...</div> : error ?
      <div className="alert alert-error" role="alert">Não foi possível carregar os processos: {error} <button className="btn btn-secondary" onClick={() => setAttempt(attempt + 1)}>Tentar novamente</button></div> : items.length === 0 ?
      <div className="card empty-state" data-tour={view === "knowledge" ? "knowledge-destination" : "copilot-destination"}><strong>Comece com um onboarding</strong><p>Cadastre uma empresa para reunir os documentos e conversar com o copiloto.</p><Link className="btn btn-primary" href="/onboardings/new">Criar onboarding</Link></div> : <>
        <div className="scope-selector"><div className="field"><label htmlFor="onboarding-scope">Contexto do cliente</label><select id="onboarding-scope" value={selected} onChange={(event) => setSelected(event.target.value)}>{items.map((item) => <option value={item.id} key={item.id}>{item.company_name}</option>)}</select></div><Link className="btn btn-secondary" href={`/onboardings/${selected}`}>Ver processo completo</Link></div>
        <OnboardingWorkspace key={selected} onboardingId={selected} view={view} />
      </>}
  </main>;
}
