"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Building2, Save } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { onboardingSchema, type OnboardingInput } from "@/lib/schemas";

const initial: OnboardingInput = { company_name: "", tax_id: "", contact_name: "", contact_email: "", contact_whatsapp: "", description: "" };

export default function NewOnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState<OnboardingInput>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field: keyof OnboardingInput, value: string) { setForm((current) => ({ ...current, [field]: value })); }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    const parsed = onboardingSchema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => { nextErrors[String(issue.path[0])] = issue.message; });
      setErrors(nextErrors); return;
    }
    setErrors({}); setSaving(true);
    try {
      const created = await apiFetch<{ id: string }>("/onboardings", { method: "POST", body: JSON.stringify(parsed.data) });
      router.push(`/onboardings/${created.id}`);
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível criar o onboarding."); }
    finally { setSaving(false); }
  }

  return (
    <main className="page-content">
      <div className="page-heading"><div><h1 className="page-title">Cadastrar empresa</h1><p className="page-description">Registre as informações iniciais para começar o processo de onboarding.</p></div><Link href="/onboardings" className="btn btn-secondary"><ArrowLeft size={14} /> Voltar</Link></div>
      {error && <div className="alert alert-error">{error}</div>}
      <form className="card form-card" data-tour="onboarding-form" onSubmit={submit}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}><div className="quick-icon" style={{ margin: 0 }}><Building2 size={18} /></div><div><div className="card-title">Dados da empresa</div><div className="card-subtitle">Os campos com * são obrigatórios.</div></div></div>
        <div className="form-grid">
          <div className="field full"><label>Nome da empresa *</label><input value={form.company_name} onChange={(e) => update("company_name", e.target.value)} placeholder="Ex.: Grupo Aurora" />{errors.company_name && <span className="error-text">{errors.company_name}</span>}</div>
          <div className="field"><label>CNPJ</label><input value={form.tax_id} onChange={(e) => update("tax_id", e.target.value)} placeholder="00.000.000/0001-00" /></div>
          <div className="field"><label>Nome do contato</label><input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} placeholder="Nome do responsável" /></div>
          <div className="field full"><label>E-mail do contato</label><input type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} placeholder="contato@empresa.com.br" />{errors.contact_email && <span className="error-text">{errors.contact_email}</span>}</div>
          <div className="field full"><label>WhatsApp do cliente</label><input type="tel" value={form.contact_whatsapp} onChange={(e) => update("contact_whatsapp", e.target.value)} placeholder="+55 11 99999-9999" /><span className="field-hint">Inclua o código do país. As mensagens desse número serão associadas a este onboarding.</span></div>
          <div className="field full"><label>Contexto / observações</label><textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Registre informações relevantes para a implantação..." /><span className="field-hint">Você poderá complementar essas informações durante o processo.</span></div>
        </div>
        <div className="form-actions"><Link href="/onboardings" className="btn btn-secondary">Cancelar</Link><button className="btn btn-primary" disabled={saving}><Save size={14} /> {saving ? "Salvando..." : "Criar onboarding"}</button></div>
      </form>
    </main>
  );
}
