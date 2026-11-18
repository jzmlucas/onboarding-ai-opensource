export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

export type Onboarding = {
  id: string;
  company_name: string;
  tax_id: string | null;
  contact_name: string | null;
  contact_email: string | null;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  document_count: number;
  open_findings_count: number;
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
