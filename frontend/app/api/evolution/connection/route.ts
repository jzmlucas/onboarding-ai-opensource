import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getEvolutionConfig() {
  const base = (process.env.EVOLUTION_API_URL ?? "http://evolution:8080").replace(/\/$/, "");
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE ?? "onboardia";
  if (!apiKey) throw new Error("EVOLUTION_API_KEY não está configurada no servidor.");
  return { base, apiKey, instance };
}

async function evolutionRequest(path: string, init?: RequestInit) {
  const { base, apiKey } = getEvolutionConfig();
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: { apikey: apiKey, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

function readState(data: any): string {
  return String(data?.instance?.state ?? data?.state ?? data?.status ?? "unknown").toLowerCase();
}

export async function GET() {
  try {
    const { instance } = getEvolutionConfig();
    const { response, data } = await evolutionRequest(`/instance/connectionState/${encodeURIComponent(instance)}`);
    if (response.status === 404) return NextResponse.json({ configured: true, state: "not_created" });
    if (!response.ok) return NextResponse.json({ detail: data?.message ?? "Não foi possível consultar o WhatsApp." }, { status: 502 });
    return NextResponse.json({ configured: true, state: readState(data) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao consultar a conexão.";
    return NextResponse.json({ configured: false, detail: message }, { status: 503 });
  }
}

export async function POST() {
  try {
    const { instance } = getEvolutionConfig();
    let { response, data } = await evolutionRequest(`/instance/connectionState/${encodeURIComponent(instance)}`);

    if (response.status === 404) {
      ({ response, data } = await evolutionRequest("/instance/create", {
        method: "POST",
        body: JSON.stringify({ instanceName: instance, integration: "WHATSAPP-BAILEYS", qrcode: true }),
      }));
      if (!response.ok && response.status !== 409) {
        return NextResponse.json({ detail: data?.message ?? "Não foi possível criar a conexão." }, { status: 502 });
      }
      if (response.status === 409) {
        ({ response, data } = await evolutionRequest(`/instance/connect/${encodeURIComponent(instance)}`));
      }
    } else if (response.ok && readState(data) === "open") {
      return NextResponse.json({ state: "open" });
    } else {
      ({ response, data } = await evolutionRequest(`/instance/connect/${encodeURIComponent(instance)}`));
    }

    if (!response.ok) return NextResponse.json({ detail: data?.message ?? "A Evolution API não retornou o QR Code." }, { status: 502 });
    const qr = data?.qrcode ?? data?.qrCode ?? data;
    const rawBase64 = qr?.base64 ?? qr?.code ?? data?.base64 ?? data?.code;
    const qrCode = typeof rawBase64 === "string" && rawBase64
      ? (rawBase64.startsWith("data:image/") ? rawBase64 : `data:image/png;base64,${rawBase64}`)
      : null;
    return NextResponse.json({ state: readState(data), qrCode, pairingCode: qr?.pairingCode ?? data?.pairingCode ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao solicitar QR Code.";
    return NextResponse.json({ detail: message }, { status: 503 });
  }
}
