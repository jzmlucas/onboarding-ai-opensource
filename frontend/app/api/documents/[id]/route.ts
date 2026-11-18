import { NextResponse } from "next/server";
import { getDocumentQueue } from "@/lib/queue";

export const runtime = "nodejs";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const queue = getDocumentQueue();
    const job = await queue.getJob(`document-${id}`);
    if (job) {
      const state = await job.getState();
      if (state !== "active") {
        try { await job.remove(); } catch { /* The worker may have claimed it during removal. */ }
      }
    }

    const apiBase = (process.env.API_INTERNAL_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
    const upstream = await fetch(`${apiBase}/documents/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!upstream.ok) {
      const body = await upstream.json().catch(() => ({}));
      return NextResponse.json(body, { status: upstream.status });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível remover o documento.";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
