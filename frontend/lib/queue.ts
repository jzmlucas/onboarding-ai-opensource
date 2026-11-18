import { Queue } from "bullmq";

let documentQueue: Queue | null = null;

export function getDocumentQueue() {
  if (documentQueue) return documentQueue;
  const redisUrl = new URL(process.env.REDIS_URL ?? "redis://localhost:6379/0");
  const connection = {
    host: redisUrl.hostname,
    port: Number(redisUrl.port || 6379),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    db: Number(redisUrl.pathname.replace("/", "") || 0),
    maxRetriesPerRequest: null,
    ...(redisUrl.protocol === "rediss:" ? { tls: {} } : {}),
  };
  documentQueue = new Queue("document-processing", {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });
  return documentQueue;
}
