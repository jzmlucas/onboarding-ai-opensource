"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, LoaderCircle, MessageCircle, RefreshCw, Smartphone } from "lucide-react";

type Connection = { state: string; qrCode?: string | null; pairingCode?: string | null };

const stateLabels: Record<string, string> = {
  open: "Conectado",
  connecting: "Aguardando leitura do QR Code",
  close: "Desconectado",
  not_created: "Ainda não configurado",
  unknown: "Verificando conexão",
};

export function WhatsAppConnectionPage() {
  const [connection, setConnection] = useState<Connection>({ state: "unknown" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/evolution/connection", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Falha ao consultar o estado da conexão.");
      setConnection((current) => ({ ...current, state: data.state ?? "unknown" }));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível consultar a Evolution API.");
    }
  }, []);

  const generateQr = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/evolution/connection", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Não foi possível gerar o QR Code.");
      setConnection({ state: data.state ?? "connecting", qrCode: data.qrCode, pairingCode: data.pairingCode });
      if (!data.qrCode && data.state !== "open") setError("A Evolution API respondeu sem QR Code. Tente atualizar em alguns segundos.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível conectar ao WhatsApp.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (connection.state === "open") return;
    const timer = window.setInterval(() => { void refresh(); }, 4000);
    return () => window.clearInterval(timer);
  }, [connection.state, refresh]);

  const connected = connection.state === "open";
  const statusText = stateLabels[connection.state] ?? stateLabels.unknown;

  return (
    <main className="page-content whatsapp-connect-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">Canal de atendimento</div>
          <h1 className="page-title">Conectar WhatsApp</h1>
          <p className="page-description">Vincule o número da equipe para receber mensagens dos clientes nos respectivos onboardings. Para testar, envie uma mensagem do número do cliente cadastrado para este número conectado.</p>
        </div>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <section className="card whatsapp-connect-card">
        <div className="whatsapp-connect-copy">
          <div className="whatsapp-connect-icon"><MessageCircle size={23} /></div>
          <div>
            <h2>Número da equipe</h2>
            <p>Esta conexão recebe as mensagens. O número de cada cliente continua sendo cadastrado no onboarding dele.</p>
          </div>
        </div>

        <div className={`whatsapp-connection-status ${connected ? "is-connected" : ""}`} aria-live="polite">
          <span className="status-dot" /> {statusText}
        </div>

        <div className="whatsapp-connect-body">
          <div className="whatsapp-qr-frame" aria-live="polite">
            {connected ? (
              <div className="whatsapp-connected-state"><div><Check size={30} /></div><strong>WhatsApp conectado</strong><span>As mensagens novas serão processadas pelo sistema.</span></div>
            ) : connection.qrCode ? (
              <img className="whatsapp-qr-image" src={connection.qrCode} alt="QR Code para conectar o WhatsApp da equipe" />
            ) : (
              <div className="whatsapp-qr-placeholder">
                {loading ? <LoaderCircle className="spin" size={30} /> : <Smartphone size={32} />}
                <span>{loading ? "Preparando QR Code…" : "O QR Code aparecerá aqui"}</span>
              </div>
            )}
          </div>
          <div className="whatsapp-steps">
            <h3>Como conectar</h3>
            <ol>
              <li>Selecione <strong>Gerar QR Code</strong>.</li>
              <li>No celular da equipe, abra o WhatsApp e toque em <strong>Aparelhos conectados</strong>.</li>
              <li>Toque em <strong>Conectar aparelho</strong> e leia o QR Code desta tela.</li>
            </ol>
            {connection.pairingCode && <p className="whatsapp-pairing-code">Código de pareamento: <strong>{connection.pairingCode}</strong></p>}
            <p className="whatsapp-connect-note">Mantenha esta tela aberta. O estado é atualizado automaticamente enquanto você faz a leitura.</p>
            <button className="btn btn-primary" type="button" onClick={() => void generateQr()} disabled={loading || connected}>
              {loading ? <LoaderCircle className="spin" size={15} /> : <RefreshCw size={15} />}
              {loading ? "Gerando QR Code…" : connection.qrCode ? "Atualizar QR Code" : connected ? "Conectado" : "Gerar QR Code"}
            </button>
            {connected && <button className="btn btn-secondary whatsapp-refresh-status" type="button" onClick={() => void refresh()}>Atualizar estado</button>}
          </div>
        </div>
      </section>
      <p className="whatsapp-connect-footnote">A conexão é mantida pela Evolution API configurada no ambiente Docker.</p>
    </main>
  );
}
