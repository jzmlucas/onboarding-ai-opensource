import { Queue } from "bullmq";

let documentQueue: Queue | null = null;
let customerIssueQueue: Queue | null = null;

function getConnection() {
  const redisUrl = new URL(process.env.REDIS_URL ?? "redis://localhost:6379/0");
  return {
    host: redisUrl.hostname,
    port: Number(redisUrl.port || 6379),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    db: Number(redisUrl.pathname.replace("/", "") || 0),
    maxRetriesPerRequest: null,
    ...(redisUrl.protocol === "rediss:" ? { tls: {} } : {}),
  };
}

export function getDocumentQueue() {
  if (documentQueue) return documentQueue;
  const connection = getConnection();
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

export function getCustomerIssueQueue() {
  if (customerIssueQueue) return customerIssueQueue;
  customerIssueQueue = new Queue("customer-issue-processing", {
    connection: getConnection(),
    defaultJobOptions: {
      attempts: 4,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });
  return customerIssueQueue;
}
