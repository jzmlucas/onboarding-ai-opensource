import { NextResponse } from "next/server";
import { getDocumentQueue } from "@/lib/queue";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const onboardingId = formData.get("onboarding_id");
    if (!(file instanceof File) || typeof onboardingId !== "string") {
      return NextResponse.json({ detail: "Arquivo e onboarding_id são obrigatórios." }, { status: 400 });
    }

    const apiBase = (process.env.API_INTERNAL_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
    const upstream = await fetch(`${apiBase}/documents`, { method: "POST", body: formData });
    const body = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return NextResponse.json(body, { status: upstream.status });
    }

    await getDocumentQueue().add(
      "process-document",
      { documentId: body.id, onboardingId, filename: body.filename },
      { jobId: `document-${body.id}` },
    );

    return NextResponse.json({ ...body, queued: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao enviar documento.";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
