import { Worker, type Job } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379/0";
const apiBaseUrl = (process.env.API_INTERNAL_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
const internalApiKey = process.env.INTERNAL_API_KEY ?? "change-this-internal-key";
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

interface ProcessDocumentJob {
  documentId: string;
  onboardingId: string;
  filename: string;
}

interface AnalyzeCustomerIssueJob {
  customerIssueId: string;
}

const worker = new Worker(
  "document-processing",
  async (job: Job<ProcessDocumentJob>) => {
    if (job.name !== "process-document") {
      throw new Error(`Job não suportado: ${job.name}`);
    }
    const { documentId } = job.data;
    console.info(`[worker] Processando documento ${documentId}`);

    const response = await fetch(`${apiBaseUrl}/internal/documents/${documentId}/process`, {
      method: "POST",
      headers: { "X-Internal-API-Key": internalApiKey },
      signal: AbortSignal.timeout(15 * 60 * 1000),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`API retornou ${response.status}: ${body}`);
    }

    const result = await response.json();
    console.info(`[worker] Documento ${documentId} concluído`, result);
    return result;
  },
  {
    connection,
    concurrency: Number(process.env.WORKER_CONCURRENCY ?? 2),
    limiter: { max: 8, duration: 60_000 },
  },
);

const customerIssueWorker = new Worker(
  "customer-issue-processing",
  async (job: Job<AnalyzeCustomerIssueJob>) => {
    if (job.name !== "analyze-customer-issue") {
      throw new Error(`Job não suportado: ${job.name}`);
    }
    const { customerIssueId } = job.data;
    console.info(`[worker] Analisando relato de cliente ${customerIssueId}`);
    const response = await fetch(`${apiBaseUrl}/internal/customer-issues/${customerIssueId}/process`, {
      method: "POST",
      headers: { "X-Internal-API-Key": internalApiKey },
      signal: AbortSignal.timeout(15 * 60 * 1000),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`API retornou ${response.status}: ${body}`);
    }
    const result = await response.json();
    console.info(`[worker] Relato ${customerIssueId} analisado`, result);
    return result;
  },
  {
    connection,
    concurrency: Math.max(1, Math.floor(Number(process.env.WORKER_CONCURRENCY ?? 2) / 2)),
    limiter: { max: 8, duration: 60_000 },
  },
);

worker.on("completed", (job) => console.info(`[worker] Job ${job.id} concluído`));
worker.on("failed", (job, error) => console.error(`[worker] Job ${job?.id} falhou:`, error.message));
worker.on("error", (error) => console.error("[worker] Erro:", error));
customerIssueWorker.on("completed", (job) => console.info(`[worker] Relato ${job.id} concluído`));
customerIssueWorker.on("failed", (job, error) => console.error(`[worker] Relato ${job?.id} falhou:`, error.message));
customerIssueWorker.on("error", (error) => console.error("[worker] Erro na fila de relatos:", error));

console.info(`[worker] Escutando fila document-processing em ${redisUrl}`);

const shutdown = async () => {
  await Promise.all([worker.close(), customerIssueWorker.close()]);
  await connection.quit();
  process.exit(0);
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
