import { NextResponse } from "next/server";
import { getCustomerIssueQueue } from "@/lib/queue";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const queue = getCustomerIssueQueue();
    const jobId = `customer-issue-${id}`;
    const existing = await queue.getJob(jobId);
    if (existing) {
      const state = await existing.getState();
      if (state === "active") return NextResponse.json({ detail: "O relato já está sendo processado." }, { status: 409 });
      await existing.remove();
    }

    const apiBase = (process.env.API_INTERNAL_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
    const retry = await fetch(`${apiBase}/customer-issues/${encodeURIComponent(id)}/retry`, {
      method: "POST",
      headers: { "X-Internal-API-Key": process.env.INTERNAL_API_KEY ?? "" },
      signal: AbortSignal.timeout(15000),
    });
    const issue = await retry.json().catch(() => ({}));
    if (!retry.ok) return NextResponse.json(issue, { status: retry.status });
    await queue.add("analyze-customer-issue", { customerIssueId: id }, { jobId });
    return NextResponse.json(issue);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível reenfileirar o relato.";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}
