import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getCustomerIssueQueue } from "@/lib/queue";

export const runtime = "nodejs";

type IngestItem = {
  accepted?: boolean;
  customer_issue_id?: string;
  duplicate?: boolean;
  reason?: string;
};

type IngestResult = IngestItem & { results?: IngestItem[] };

function sameSecret(received: string, expected: string) {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const expected = process.env.EVOLUTION_WEBHOOK_SECRET ?? "";
  const received = new URL(request.url).searchParams.get("secret") ?? "";
  if (!expected || !sameSecret(received, expected)) {
    return NextResponse.json({ detail: "Webhook não autorizado." }, { status: 401 });
  }

  try {
    const rawPayload = await request.arrayBuffer();
    if (rawPayload.byteLength > 2 * 1024 * 1024) {
      return NextResponse.json({ detail: "Evento excede o limite permitido." }, { status: 413 });
    }
    const payload = JSON.parse(new TextDecoder().decode(rawPayload));
    const apiBase = (process.env.API_INTERNAL_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
    const ingest = await fetch(`${apiBase}/internal/evolution/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-API-Key": process.env.INTERNAL_API_KEY ?? "",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    const result = await ingest.json().catch(() => ({})) as IngestResult;
    if (!ingest.ok) {
      console.error("[evolution-webhook] API recusou o evento", { status: ingest.status });
      return NextResponse.json(result, { status: ingest.status });
    }

    const eventResults: IngestItem[] = Array.isArray(result.results) ? result.results : [result];
    const acceptedIssues = eventResults.filter((item) => item.accepted && item.customer_issue_id);
    if (acceptedIssues.length) {
      const queue = getCustomerIssueQueue();
      for (const eventResult of acceptedIssues) {
        await queue.add(
          "analyze-customer-issue",
          { customerIssueId: eventResult.customer_issue_id },
          { jobId: `customer-issue-${eventResult.customer_issue_id}` },
        );
        console.info("[evolution-webhook] Relato enfileirado", { issueId: eventResult.customer_issue_id, duplicate: eventResult.duplicate });
      }
    }
    if (!result.accepted) {
      console.warn("[evolution-webhook] Evento ignorado", {
        reason: result.reason ?? "batch_without_accepted_messages",
        rejected: eventResults.filter((item) => !item.accepted).length,
      });
    }
    return NextResponse.json({ received: true, ...result }, { status: 200 });
  } catch (error) {
    console.error("[evolution-webhook] Falha ao receber mensagem", error);
    return NextResponse.json({ detail: "Não foi possível registrar a mensagem recebida." }, { status: 503 });
  }
}
