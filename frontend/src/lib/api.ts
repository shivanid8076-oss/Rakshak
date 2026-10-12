// ── RAKSHAK API Client ─────────────────────────────────────────────────
const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  (import.meta.env.VITE_API_URLl as string | undefined)?.replace(/\/+$/, "") ||
  "https://rakshak-backend-4aph.onrender.com/api/v1";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ── Transactions ───────────────────────────────────────────────────────────
export const submitTransaction = (txn: object) =>
  request("/transactions", { method: "POST", body: JSON.stringify(txn) });

export const listTransactions = (limit = 50, decision?: string) =>
  request(`/transactions?limit=${limit}${decision ? `&decision=${decision}` : ""}`);

export const getTransaction = (txnId: string) => request(`/transactions/${txnId}`);

// ── Cases ──────────────────────────────────────────────────────────────────
export type CaseRecord = {
  case_id: string;
  txn_id: string;
  risk_score: number;
  status: string;
  assigned_analyst: string | null;
  sla_deadline: string | null;
  disposition: string | null;
};

export const listCases = (status?: string) =>
  request<CaseRecord[]>(`/cases${status ? `?status=${status}` : ""}`);

export const getCase = (caseId: string) => request(`/cases/${caseId}`);

export const submitDisposition = (caseId: string, body: object) =>
  request(`/cases/${caseId}/disposition`, { method: "PATCH", body: JSON.stringify(body) });

export const addCaseNote = (caseId: string, body: object) =>
  request(`/cases/${caseId}/notes`, { method: "POST", body: JSON.stringify(body) });

export const getSimilarCases = (caseId: string) => request(`/cases/${caseId}/similar`);

// ── Investigation ──────────────────────────────────────────────────────────
export const explainTransaction = (txnId: string) =>
  request(`/investigate/explain/${txnId}`, { method: "POST" });

export const askQuestion = (body: object) =>
  request("/investigate/ask", { method: "POST", body: JSON.stringify(body) });

export const generateSAR = (caseId: string) =>
  request(`/investigate/sar/${caseId}`, { method: "POST" });

// ── Graph ──────────────────────────────────────────────────────────────────
export const getAccountGraph = (vpa: string) =>
  request(`/graph/account/${encodeURIComponent(vpa)}`);

export const getMuleAccounts = () => request("/graph/mules");

export const getFraudRings = () => request("/graph/rings");

// ── Analytics ─────────────────────────────────────────────────────────────
export const getModelPerformance = () => request("/analytics/model/performance");

export const getDashboardSummary = () => request("/analytics/summary");

export const getHeatmap = () => request("/analytics/heatmap");

// ── Health ─────────────────────────────────────────────────────────────────
const ROOT_URL = BASE_URL.replace(/\/api\/v1\/?$/, "");

export const checkHealth = async () => {
  const res = await fetch(`${ROOT_URL}/health`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<{
    status: string;
    timescaledb: string;
    neo4j: string;
    redis: string;
    kafka: string;
    ollama: string;
    models: string;
  }>;
};
