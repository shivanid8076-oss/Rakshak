import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Badge } from "@/components/AppShell";
import { scoreDistribution, fraudTypeDist } from "@/lib/mockData";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { getModelPerformance, getDashboardSummary } from "@/lib/api";
import {
  BarChart3,
  Cpu,
  Sparkles,
  TrendingUp,
  Layers,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { CyberBackground3D } from "@/components/CyberBackground3D";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — RAKSHAK" }] }),
  component: Analytics,
});

const decColor = (d: string) =>
  d === "SAFE" ? "#10b981" : d === "REVIEW" ? "#f59e0b" : "#ef4444";

type Metrics = {
  model_version: string;
  xgb_pr_auc: number;
  rf_pr_auc: number;
  ensemble_pr_auc: number;
  best_f2: number;
};
type Summary = { blocked: number; reviews: number; safe: number };

const customTooltipStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.95)",
  borderColor: "rgba(255, 255, 255, 0.15)",
  borderRadius: "14px",
  color: "#f8fafc",
  fontSize: "11px",
  fontFamily: "monospace",
  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
  padding: "10px 14px",
};

function Analytics() {
  const [metricsData, setMetricsData] = useState<Metrics | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, s] = await Promise.all([getModelPerformance(), getDashboardSummary()]);
        setMetricsData(m as Metrics);
        setSummary(s as Summary);
      } catch {
        // fall back to null → cards show placeholders
      }
    };
    load();
  }, []);

  const metrics = metricsData
    ? [
        { name: "XGB PR-AUC", value: metricsData.xgb_pr_auc, color: "#0ea5e9" },
        { name: "RF PR-AUC", value: metricsData.rf_pr_auc, color: "#8b5cf6" },
        { name: "Ensemble PR-AUC", value: metricsData.ensemble_pr_auc, color: "#f97316" },
        { name: "Best F2", value: metricsData.best_f2, color: "#10b981" },
      ]
    : [];

  const decisionBreakdown = summary
    ? [
        { name: "BLOCK", value: summary.blocked, color: "#ef4444" },
        { name: "REVIEW", value: summary.reviews, color: "#f59e0b" },
        { name: "SAFE", value: summary.safe, color: "#10b981" },
      ]
    : [];

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
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    Risk Intelligence Analytics
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Precision-recall performance curves, score histograms, and taxonomy breakdowns
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ML TELEMETRY ONLINE
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                <Cpu className="h-3 w-3" />
                INFERENCE BENCHMARK
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Score Distribution */}
            <div className="rounded-2xl bg-white/90 dark:bg-gradient-to-b dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white font-display text-sm sm:text-base">
                    Composite Risk Distribution
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Binned risk score frequencies across active settlement volume
                  </p>
                </div>
                <span className="text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/10">
                  10-PT BUCKETS
                </span>
              </div>
              <div className="p-5" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip contentStyle={customTooltipStyle} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {scoreDistribution.map((s, i) => (
                        <Cell key={i} fill={decColor(s.decision)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Decision Breakdown */}
            <div className="rounded-2xl bg-white/90 dark:bg-gradient-to-b dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white font-display text-sm sm:text-base">
                    Decision Proportions
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Live stream triage outcomes · Last 24 hours
                  </p>
                </div>
                <span className="text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-500/20">
                  AGGREGATED
                </span>
              </div>
              <div className="p-5" style={{ height: 320 }}>
                {decisionBreakdown.length === 0 || decisionBreakdown.every((d) => d.value === 0) ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                    No decision events recorded in the last 24h window.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={decisionBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={4}
                      >
                        {decisionBreakdown.map((d, i) => (
                          <Cell key={i} fill={d.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={customTooltipStyle} />
                      <Legend
                        iconType="circle"
                        formatter={(val) => (
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-medium">
                            {val}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Model Performance */}
          <div className="mb-6 rounded-2xl bg-white/90 dark:bg-gradient-to-b dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white font-display text-sm sm:text-base">
                  Production Model Evaluation Metrics
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                  Live validation benchmarks against labeled UPI fraud ground-truth
                </p>
              </div>
              <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                Version {metricsData?.model_version ?? "v2.1"}
              </span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {metrics.length === 0 ? (
                <p className="col-span-4 text-xs text-slate-400 font-mono py-4 text-center">
                  Fetching model validation metrics from registry…
                </p>
              ) : (
                metrics.map((m) => (
                  <div
                    key={m.name}
                    className="bg-slate-50/80 dark:bg-white/[0.02] p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.04] shadow-xs"
                  >
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider font-semibold">
                      {m.name}
                    </div>
                    <div className="mt-2 text-3xl font-extrabold font-mono tracking-tight" style={{ color: m.color }}>
                      {m.value.toFixed(4)}
                    </div>
                    <div className="mt-3 h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${m.value * 100}%`, backgroundColor: m.color }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Fraud Type Distribution */}
          <div className="rounded-2xl bg-white/90 dark:bg-gradient-to-b dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white font-display text-sm sm:text-base">
                  Modus Operandi Taxonomy
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                  Observed scam vector distribution across real-time fraud alerts
                </p>
              </div>
              <span className="text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/10">
                TYPOLOGY CLASSIFIER
              </span>
            </div>
            <div className="p-5" style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fraudTypeDist} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis
                    type="category"
                    dataKey="type"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    width={140}
                  />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {fraudTypeDist.map((f, i) => (
                      <Cell key={i} fill={f.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

