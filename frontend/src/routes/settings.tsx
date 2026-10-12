import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  Sliders,
  Cpu,
  Sparkles,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { checkHealth } from "@/lib/api";
import { CyberBackground3D } from "@/components/CyberBackground3D";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — RAKSHAK" }] }),
  component: Settings,
});

type HealthState = {
  timescaledb: string;
  neo4j: string;
  redis: string;
  kafka: string;
  ollama: string;
  models: string;
} | null;

function Settings() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slaWarn, setSlaWarn] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);
  const [health, setHealth] = useState<HealthState>(null);
  const [healthError, setHealthError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const h = await checkHealth();
        setHealth(h);
        setHealthError(false);
      } catch {
        setHealthError(true);
      }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const integrations = [
    { label: "TimescaleDB Ledger", key: "timescaledb" as const },
    { label: "Redis State Cache", key: "redis" as const },
    { label: "Kafka Event Ingress", key: "kafka" as const },
    { label: "Neo4j Graph Database", key: "neo4j" as const },
    { label: "Ollama (Local LLM / Groq)", key: "ollama" as const },
  ];

  return (
    <AppShell>
      <div className="relative -m-6 md:-m-8 p-6 md:p-8 min-h-[calc(100vh-56px)] overflow-hidden">
        {/* 3D Cyber Perspective Background Animation */}
        <CyberBackground3D />

        <div className="relative z-10">
          {/* Header Command Banner */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/90 dark:bg-gradient-to-r dark:from-[#0c1427] dark:via-[#0f1932] dark:to-[#0b1224] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-lg dark:shadow-black/20 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Sliders className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    System & Risk Configuration
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Adjust risk decision gates, audit notification channels, and inspect backend microservices
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                CONTROL PLANE ACTIVE
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                <Server className="h-3 w-3" />
                CLUSTER GOVERNANCE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Thresholds */}
            <div className="rounded-2xl bg-white/90 dark:bg-gradient-to-b dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md overflow-hidden p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <Sliders className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="font-bold text-slate-900 dark:text-white font-display text-base">
                    Decision Cutoff Thresholds
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                  Global boundary scores governing auto-clear vs human investigation vs instant block
                </p>
                <div className="mt-6 space-y-4">
                  {[
                    {
                      label: "SAFE Threshold",
                      cutoff: "Score ≤ 30",
                      value: 30,
                      color: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
                    },
                    {
                      label: "HUMAN REVIEW Band",
                      cutoff: "30 < Score < 70",
                      value: 70,
                      color: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
                    },
                    {
                      label: "INSTANT BLOCK Gate",
                      cutoff: "Score ≥ 70",
                      value: 70,
                      color: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
                    },
                  ].map((t) => (
                    <div
                      key={t.label}
                      className="bg-slate-50/80 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.04] shadow-xs"
                    >
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{t.label}</span>
                        <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-cyan-400">{t.cutoff}</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${t.color}`} style={{ width: `${t.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Calibrated against historical UPI loss surfaces. Policy adjustments require Risk Officer quorum.
              </p>
            </div>

            {/* Alert Preferences */}
            <div className="rounded-2xl bg-white/90 dark:bg-gradient-to-b dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md overflow-hidden p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="font-bold text-slate-900 dark:text-white font-display text-base">
                    Notification Channels
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                  Configure telemetry delivery channels and escalation webhooks
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    {
                      label: "Instant dispatch on BLOCK transactions",
                      desc: "High-priority SMS & PagerDuty webhook trigger",
                      value: emailAlerts,
                      set: setEmailAlerts,
                    },
                    {
                      label: "SLA Deadline Warning",
                      desc: "Alert when case reaches 75% of review window",
                      value: slaWarn,
                      set: setSlaWarn,
                    },
                    {
                      label: "Daily Risk & Fraud Digest",
                      desc: "Summary report dispatched to security operations",
                      value: dailySummary,
                      set: setDailySummary,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-white/[0.02] rounded-xl border border-slate-200/80 dark:border-white/[0.04] shadow-xs"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-200">{row.label}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">{row.desc}</div>
                      </div>
                      <Switch checked={row.value} onCheckedChange={row.set} />
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Delivery policies cached in active browser profile session.
              </p>
            </div>

            {/* Model Health */}
            <div className="rounded-2xl bg-white/90 dark:bg-gradient-to-b dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md overflow-hidden p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="font-bold text-slate-900 dark:text-white font-display text-base">Model Health & Registry</h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Readiness reported by the FastAPI inference service</p>
                <div className="mt-6 space-y-3 text-xs">
                  {[
                    ["Model Artifacts Check", health?.models ?? (healthError ? "Unavailable" : "Checking registry…")],
                    ["Scheduled Retraining", "Managed via Airflow Pipeline"],
                    ["SHAP TreeExplainer", "Active (5 Background Threads)"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between p-3.5 bg-slate-50/80 dark:bg-white/[0.02] rounded-xl border border-slate-200/80 dark:border-white/[0.04] shadow-xs"
                    >
                      <span className="text-slate-500 dark:text-slate-400 font-mono">{k}</span>
                      <span className="font-semibold text-slate-900 dark:text-white font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                disabled
                className="mt-6 w-full bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 py-2.5 rounded-xl text-xs font-mono font-medium cursor-not-allowed border border-slate-200 dark:border-white/5"
              >
                Retraining Pipeline Managed Automatically
              </button>
            </div>

            {/* Microservices */}
            <div className="rounded-2xl bg-white/90 dark:bg-gradient-to-b dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md overflow-hidden p-6">
              <div className="flex items-center gap-2.5 mb-1">
                <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h2 className="font-bold text-slate-900 dark:text-white font-display text-base">Backend Microservices</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Telemetry heartbeat pinging /health</p>
              <div className="mt-6 space-y-3 text-xs">
                {healthError ? (
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 font-mono text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>Backend health endpoint unreachable. Ensure FastAPI server is listening on port 8000.</span>
                  </div>
                ) : (
                  integrations.map((row) => {
                    const status = health ? health[row.key] : "checking…";
                    const isUp = status === "up" || status === "loaded";
                    return (
                      <div
                        key={row.key}
                        className="flex items-center justify-between p-3.5 bg-slate-50/80 dark:bg-white/[0.02] rounded-xl border border-slate-200/80 dark:border-white/[0.04] shadow-xs"
                      >
                        <span className="text-slate-800 dark:text-slate-300 font-medium">{row.label}</span>
                        <span
                          className={`text-[11px] font-mono font-semibold flex items-center gap-1.5 ${
                            isUp ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isUp ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" : "bg-amber-500"
                            }`}
                          />
                          {status}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

