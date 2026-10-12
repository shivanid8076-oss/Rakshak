import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Badge } from "@/components/AppShell";
import { CheckCircle2, Clock, User, Loader2, ArrowRight, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { listCases } from "@/lib/api";
import { CyberBackground3D } from "@/components/CyberBackground3D";

export const Route = createFileRoute("/cases/")({
  head: () => ({ meta: [{ title: "Case Queue — RAKSHAK" }] }),
  component: Cases,
});

const tabs = ["All", "Open", "In Progress", "Closed"] as const;

// Backend enum values → UI label
const STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  CLOSED: "Closed",
  ESCALATED: "Open",
};

type CaseRow = {
  id: string;
  txnId: string;
  score: number;
  status: string;
  analyst: string;
  slaMinutes: number;
  fraudType: string;
};

function CircleScore({ score }: { score: number }) {
  const color = score >= 75 ? "#ef4444" : score >= 50 ? "#f59e0b" : "#10b981";
  const dash = (score / 100) * 176;
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          className="stroke-slate-200 dark:stroke-white/10"
          strokeWidth="5"
        />
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={`${dash} 176`}
          strokeLinecap="round"
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs"
        style={{ color }}
      >
        <span>{score}</span>
      </div>
    </div>
  );
}

function Cases() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await listCases();
        const rows: CaseRow[] = (Array.isArray(data) ? data : []).map((c) => {
          const slaMs = c.sla_deadline ? new Date(c.sla_deadline).getTime() - Date.now() : 0;
          return {
            id: c.case_id,
            txnId: c.txn_id,
            score: Math.round(c.risk_score ?? 0),
            status: STATUS_LABEL[c.status] ?? c.status ?? "Open",
            analyst: c.assigned_analyst ?? "Unassigned",
            slaMinutes: Math.max(0, Math.round(slaMs / 60000)),
            fraudType: c.disposition ?? "under_review",
          };
        });
        setCases(rows);
        setError(null);
      } catch (e) {
        setError("Could not load cases from the API. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const filtered = tab === "All" ? cases : cases.filter((c) => c.status === tab);

  return (
    <AppShell>
      <div className="relative -m-6 md:-m-8 p-6 md:p-8 min-h-[calc(100vh-56px)] overflow-hidden">
        {/* 3D Cyber Perspective Background Animation */}
        <CyberBackground3D />

        <div className="relative z-10">
          {/* Header Banner */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/90 dark:bg-gradient-to-r dark:from-[#0c1427] dark:via-[#0f1932] dark:to-[#0b1224] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-lg dark:shadow-black/20 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
                  Fraud Triage & Case Queue
                </h1>
                <span className="text-xs font-mono font-semibold bg-blue-50 dark:bg-white/5 text-blue-600 dark:text-slate-300 border border-blue-200 dark:border-white/10 px-2.5 py-1 rounded-full">
                  {cases.length} Total Cases
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
                Flagged UPI transactions requiring human review and final disposition
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-white/[0.08] mb-6 overflow-x-auto pb-1">
            {tabs.map((t) => {
              const active = tab === t;
              const count = t === "All" ? cases.length : cases.filter((c) => c.status === t).length;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    active
                      ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-white font-bold"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="font-sans">{t}</span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                      active
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                        : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="p-16 text-center rounded-2xl bg-white/90 dark:bg-[#0b101c] border border-slate-200 dark:border-white/[0.08] shadow-sm backdrop-blur-md">
              <Loader2 className="h-6 w-6 text-blue-500 mx-auto animate-spin" />
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-sans">
                Syncing case ledger…
              </p>
            </div>
          ) : error ? (
            <div className="p-16 text-center rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/80 dark:bg-rose-500/[0.02] backdrop-blur-md">
              <ShieldAlert className="h-8 w-8 text-rose-500 dark:text-rose-400 mx-auto mb-3" />
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center rounded-2xl bg-white/90 dark:bg-[#0b101c] border border-slate-200 dark:border-white/[0.08] shadow-sm backdrop-blur-md">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 dark:text-emerald-400 mx-auto mb-2" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base font-display">
                Queue Cleared
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
                No pending cases match this filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-white/90 dark:bg-gradient-to-b dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-lg dark:shadow-black/20 backdrop-blur-md hover:-translate-y-1 hover:shadow-md dark:hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-4">
                      <CircleScore score={c.score} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-mono text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                            {c.id}
                          </div>
                          <Badge
                            variant={
                              c.status === "Open"
                                ? "block"
                                : c.status === "In Progress"
                                  ? "review"
                                  : "safe"
                            }
                          >
                            {c.status}
                          </Badge>
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                          Txn: {c.txnId}
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1.5 font-sans text-xs">
                            <User className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                            {c.analyst}
                          </span>
                          {c.slaMinutes > 0 && (
                            <span
                              className={`flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded-md ${
                                c.slaMinutes < 30
                                  ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                                  : "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300"
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              SLA {c.slaMinutes}m
                            </span>
                          )}
                        </div>
                        <div className="mt-3">
                          <Badge variant="primary">{c.fraudType}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] font-sans font-medium text-slate-400 dark:text-slate-500">
                      Triage Pending
                    </span>
                    <Link
                      to="/cases/$id"
                      params={{ id: c.id }}
                      className="text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 px-3.5 py-1.5 rounded-lg font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <span>Investigate</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
