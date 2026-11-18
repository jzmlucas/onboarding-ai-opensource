export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

export type Onboarding = {
  id: string;
  company_name: string;
  tax_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_whatsapp: string | null;
  whatsapp_mode: "ai_active" | "human_active" | string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  document_count: number;
  open_findings_count: number;
};

export type CustomerIssue = {
  id: string;
  onboarding_id: string;
  sender_phone: string;
  sender_name: string | null;
  message_type: "text" | "audio" | string;
  original_text: string | null;
  transcript: string | null;
  processing_status: "queued" | "processing" | "processed" | "failed" | string;
  review_status: "open" | "in_review" | "resolved" | "dismissed" | string;
  title: string | null;
  summary: string | null;
  assistant_reply: string | null;
  reply_status: "pending" | "sending" | "sent" | "failed" | "paused" | string;
  reply_error: string | null;
  category: string | null;
  urgency: "low" | "medium" | "high" | "critical" | string | null;
  customer_impact: string | null;
  missing_information: string[];
  recommendations: string[];
  source_references: { filename: string; chunk_index: number; excerpt: string }[];
  transcription_provider: string | null;
  analysis_provider: string | null;
  error_message: string | null;
  received_at: string;
  processed_at: string | null;
};

export type CustomerConversation = {
  id: string;
  onboarding_id: string;
  contact_phone: string;
  memory_summary: string | null;
  mode: string;
  updated_at: string;
};

export type DocumentItem = {
  id: string;
  onboarding_id: string;
  filename: string;
  mime_type: string | null;
  file_size: number;
  status: string;
  processing_note: string | null;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
};

export type Finding = {
  id: string;
  onboarding_id: string;
  document_id: string | null;
  severity: string;
  category: string;
  title: string;
  description: string;
  recommendation: string;
  source_excerpt: string | null;
  status: string;
  created_at: string;
};

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `Erro ${response.status} ao consultar a API.`);
  }
  return response.json() as Promise<T>;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
