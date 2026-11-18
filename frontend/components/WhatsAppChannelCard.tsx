"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { apiFetch, type Onboarding } from "@/lib/api";

export function WhatsAppChannelCard({ onboarding }: { onboarding: Onboarding }) {
  const [phone, setPhone] = useState(onboarding.contact_whatsapp ?? "");
  const [saved, setSaved] = useState(onboarding.contact_whatsapp ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const updated = await apiFetch<Onboarding>(`/onboardings/${onboarding.id}`, { method: "PATCH", body: JSON.stringify({ contact_whatsapp: phone }) });
      setPhone(updated.contact_whatsapp ?? ""); setSaved(updated.contact_whatsapp ?? "");
      setMessage(updated.contact_whatsapp ? "Número vinculado a este onboarding." : "Número removido deste onboarding.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar o WhatsApp."); }
    finally { setSaving(false); }
  }

  return <section className="card panel whatsapp-channel-card">
    <div className="panel-heading"><div><h3>Canal de atendimento WhatsApp</h3><span>Identifica quais mensagens recebidas pertencem a este cliente.</span></div><span className={`badge ${saved ? "badge-green" : "badge-gray"}`}>{saved ? "Número configurado" : "Sem número"}</span></div>
    <form onSubmit={save} className="whatsapp-channel-form">
      <div className="field"><label htmlFor="client-whatsapp">WhatsApp do cliente</label><input id="client-whatsapp" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+55 11 99999-9999" aria-describedby="client-whatsapp-hint" /><span className="field-hint" id="client-whatsapp-hint">Inclua o código do país. As mensagens desse número serão atendidas pela IA e aparecerão neste onboarding.</span></div>
      <button type="submit" className="btn btn-secondary" disabled={saving || phone === saved}><Save size={14} />{saving ? "Salvando…" : "Salvar número"}</button>
    </form>
    {message && <p className="success-text" role="status">{message}</p>}{error && <p className="error-text" role="alert">{error}</p>}
    <p className="whatsapp-channel-note">A conta de atendimento da Evolution é conectada uma vez no ambiente Docker. Este campo associa o remetente recebido ao onboarding do cliente.</p>
  </section>;
}
