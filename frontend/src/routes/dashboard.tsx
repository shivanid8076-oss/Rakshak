import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, Badge } from "@/components/AppShell";
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
  Activity,
  Send,
  PlusCircle,
  X,
  Zap,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CyberBackground3D } from "@/components/CyberBackground3D";
import { getDashboardSummary, listTransactions, submitTransaction } from "@/lib/api";
import { CSVUploadModal } from "@/components/CSVUploadModal";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Summary {
  total_txns: number;
  blocked: number;
  reviews: number;
  safe: number;
  avg_score: number;
  total_amount: number;
}

interface Transaction {
  txn_id: string;
  sender_vpa: string;
  amount: number;
  decision: string;
  composite_score: number;
  timestamp: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function maskVpa(vpa: string) {
  const [name, bank] = vpa.split("@");
  if (!bank) return vpa;
  const masked = name.slice(0, 2) + "*".repeat(Math.max(0, name.length - 2));
  return `${masked}@${bank}`;
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

// ── Fallback mock data ────────────────────────────────────────────────────────
const MOCK_SUMMARY: Summary = {
  total_txns: 12158,
  blocked: 198,
  reviews: 850,
  safe: 11110,
  avg_score: 18.4,
  total_amount: 45600000,
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    txn_id: "TXN001",
    sender_vpa: "rahul123@okicici",
    amount: 245000,
    decision: "BLOCK",
    composite_score: 92,
    timestamp: new Date(Date.now() - 900000).toISOString(),
  },
  {
    txn_id: "TXN002",
    sender_vpa: "priya@ybl",
    amount: 4500,
    decision: "SAFE",
    composite_score: 12,
    timestamp: new Date(Date.now() - 1320000).toISOString(),
  },
  {
    txn_id: "TXN003",
    sender_vpa: "vikram@okaxis",
    amount: 89000,
    decision: "REVIEW",
    composite_score: 78,
    timestamp: new Date(Date.now() - 1860000).toISOString(),
  },
  {
    txn_id: "TXN004",
    sender_vpa: "neha@okicici",
    amount: 1200,
    decision: "SAFE",
    composite_score: 8,
    timestamp: new Date(Date.now() - 2280000).toISOString(),
  },
  {
    txn_id: "TXN005",
    sender_vpa: "sanjay@ybl",
    amount: 55000,
    decision: "REVIEW",
    composite_score: 65,
    timestamp: new Date(Date.now() - 3060000).toISOString(),
  },
];

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Operations Dashboard — RAKSHAK" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [summary, setSummary] = useState<Summary>(MOCK_SUMMARY);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [liveAlerts, setLiveAlerts] = useState<Transaction[]>([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Simulator Modal State ──────────────────────────────────────────────────
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [isCSVUploadOpen, setIsCSVUploadOpen] = useState(false);
  const [simSender, setSimSender] = useState("rohit@okhdfcbank");
  const [simReceiver, setSimReceiver] = useState("swiggy@icici");
  const [simAmount, setSimAmount] = useState("250");
  const [simApp, setSimApp] = useState("PhonePe");
  const [simSubmitting, setSimSubmitting] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [simError, setSimError] = useState<string | null>(null);

  const applyPreset = (preset: "safe" | "review" | "block") => {
    setSimResult(null);
    setSimError(null);
    if (preset === "safe") {
      setSimSender("rohit@okhdfcbank");
      setSimReceiver("swiggy@icici");
      setSimAmount("250");
      setSimApp("PhonePe");
    } else if (preset === "review") {
      setSimSender("aniket@okaxis");
      setSimReceiver("crypto.p2p@ibl");
      setSimAmount("45000");
      setSimApp("GooglePay");
    } else {
      setSimSender("mule99@okaxis");
      setSimReceiver("scammer99@paytm");
      setSimAmount("95000");
      setSimApp("Paytm");
    }
  };

  const handleSimulate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSimSubmitting(true);
    setSimError(null);
    try {
      const amt = parseFloat(simAmount) || 100;
      const res: any = await submitTransaction({
        sender_vpa: simSender,
        receiver_vpa: simReceiver,
        amount: amt,
        upi_app: simApp,
        device_id: "dev-sim-" + Math.floor(1000 + Math.random() * 9000),
        ip_address: "103.22." + Math.floor(10 + Math.random() * 200) + ".1",
      });

      setSimResult(res);

      const newTxn: Transaction = {
        txn_id: res.txn_id,
        sender_vpa: res.masked_sender || simSender,
        amount: amt,
        decision: res.decision,
        composite_score: res.composite_score,
        timestamp: res.timestamp || new Date().toISOString(),
      };

      setTransactions((prev) => [newTxn, ...prev]);

      if (res.decision === "BLOCK" || res.decision === "REVIEW") {
        setLiveAlerts((prev) => [newTxn, ...prev.slice(0, 3)]);
      }

      setSummary((prev) => ({
        ...prev,
        total_txns: prev.total_txns + 1,
        total_amount: prev.total_amount + amt,
        safe: res.decision === "SAFE" ? prev.safe + 1 : prev.safe,
        reviews: res.decision === "REVIEW" ? prev.reviews + 1 : prev.reviews,
        blocked: res.decision === "BLOCK" ? prev.blocked + 1 : prev.blocked,
      }));
    } catch (err: any) {
      setSimError(err.message || "Failed to process transaction");
    } finally {
      setSimSubmitting(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [sumData, txnData] = await Promise.all([
          getDashboardSummary().catch(() => null),
          listTransactions(10).catch(() => null),
        ]);

        if (sumData) {
          setSummary(sumData as Summary);
          setApiOnline(true);
        }

        if (Array.isArray(txnData) && txnData.length > 0) {
          setTransactions(txnData as Transaction[]);
          setLiveAlerts(
            (txnData as Transaction[])
              .filter((t: Transaction) => t.decision === "BLOCK" || t.decision === "REVIEW")
              .slice(0, 4),
          );
        }
      } catch {
        setApiOnline(false);
        setLiveAlerts(
          MOCK_TRANSACTIONS.filter((t) => t.decision === "BLOCK" || t.decision === "REVIEW"),
        );
      } finally {
        setLoading(false);
      }
    };

    load();
    const interval = apiOnline ? setInterval(load, 30000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [apiOnline]);

  const kpis = [
    {
      label: "Total Transactions",
      value: summary.total_txns.toLocaleString("en-IN"),
      sub: "Today's Volume",
      badge: "+12.4% vs avg",
      icon: TrendingUp,
      iconColor: "text-blue-400",
      accent: "from-blue-500/80 to-blue-600/20",
      glow: "bg-blue-500/10 border-blue-500/20",
      borderHover: "hover:border-blue-500/40",
    },
    {
      label: "Blocked Fraud",
      value: summary.blocked.toLocaleString("en-IN"),
      sub: "1.6% of volume",
      badge: "Shielded ₹4.2M",
      icon: ShieldAlert,
      iconColor: "text-rose-400",
      accent: "from-rose-500/80 to-rose-600/20",
      glow: "bg-rose-500/10 border-rose-500/20",
      borderHover: "hover:border-rose-500/40",
    },
    {
      label: "Under Review",
      value: summary.reviews.toLocaleString("en-IN"),
      sub: "Awaiting Analyst",
      badge: "Queue SLA 4m",
      icon: AlertTriangle,
      iconColor: "text-amber-400",
      accent: "from-amber-500/80 to-amber-600/20",
      glow: "bg-amber-500/10 border-amber-500/20",
      borderHover: "hover:border-amber-500/40",
    },
    {
      label: "Straight-Through (Safe)",
      value: summary.safe.toLocaleString("en-IN"),
      sub: "Auto-cleared",
      badge: "91.4% pass rate",
      icon: ShieldCheck,
      iconColor: "text-emerald-400",
      accent: "from-emerald-500/80 to-emerald-600/20",
      glow: "bg-emerald-500/10 border-emerald-500/20",
      borderHover: "hover:border-emerald-500/40",
    },
  ];

  const alertsToShow =
    liveAlerts.length > 0 ? liveAlerts : MOCK_TRANSACTIONS.filter((t) => t.decision !== "SAFE");

  return (
    <AppShell>
      <div className="relative -m-6 md:-m-8 p-6 md:p-8 min-h-[calc(100vh-56px)] overflow-hidden">
        {/* 3D Cyber Perspective Background Animation */}
        <CyberBackground3D />

        <div className="relative z-10">
          {/* Header Banner */}
          <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white/90 dark:bg-gradient-to-r dark:from-[#0c1427] dark:via-[#0f1932] dark:to-[#0b1224] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-lg dark:shadow-black/20 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Activity className="h-3 w-3" /> Live Operations
                </span>
                <span className="text-slate-400 dark:text-slate-600 text-xs">/</span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  NPCI Ingress Mumbai Core-01
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
                UPI Risk Operations Console
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-1">
                Real-time inference stream across 28 banking settlement rails · Average latency 34ms
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Mean Score</div>
                  <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {summary.avg_score.toFixed(1)} / 100
                  </div>
                </div>
                <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10" />
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase text-slate-400">24h Value</div>
                  <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    {formatINR(summary.total_amount)}
                  </div>
                </div>
              </div>

              {apiOnline ? (
                <span className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Gateway Online · 34ms
                </span>
              ) : !loading ? (
                <span className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                  Demonstration Mode
                </span>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setSimResult(null);
                  setSimError(null);
                  setIsSimulateOpen(true);
                }}
                className="relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5 text-cyan-200 animate-pulse" />
                <span>+ Simulate Transaction</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCSVUploadOpen(true)}
                className="relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white shadow-md shadow-violet-500/20 hover:shadow-violet-500/35 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-violet-200" />
                <span>📄 CSV Batch Upload</span>
              </button>
            </div>
          </div>

          {/* KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((k) => (
              <div
                key={k.label}
                className={`group relative overflow-hidden rounded-2xl bg-white/90 dark:bg-gradient-to-b dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] p-5 shadow-sm dark:shadow-lg dark:shadow-black/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-2xl ${k.borderHover}`}
              >
                {/* Top hairline accent bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${k.accent} opacity-70 group-hover:opacity-100 transition-opacity duration-300`}
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans">
                    {k.label}
                  </span>
                  <div
                    className={`h-9 w-9 rounded-xl ${k.glow} border flex items-center justify-center transition-all duration-300 group-hover:scale-110`}
                  >
                    <k.icon className={`h-4.5 w-4.5 ${k.iconColor}`} />
                  </div>
                </div>

                <div className="mt-3 text-3xl lg:text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {k.value}
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-sans font-medium">
                    {k.sub}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
                    {k.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Recent Transactions Table */}
            <div className="lg:col-span-3 rounded-2xl bg-white/90 dark:bg-[#0b101c] border border-slate-200 dark:border-white/[0.08] overflow-hidden shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md flex flex-col">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white text-base font-display tracking-tight">
                      Live Ingress Ledger
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      Real-time transaction stream across UPI gateways
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSimResult(null);
                      setSimError(null);
                      setIsSimulateOpen(true);
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 font-semibold font-sans inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all cursor-pointer"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Simulate</span>
                  </button>
                  <Link
                    to="/cases"
                    className="group text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold font-sans inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-all"
                  >
                    <span>View Queue</span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50/80 dark:bg-white/[0.02] text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans border-b border-slate-200 dark:border-white/[0.06]">
                    <tr>
                      <th className="text-left px-5 py-3.5">Txn ID</th>
                      <th className="text-left px-4 py-3.5">Sender VPA</th>
                      <th className="text-right px-4 py-3.5">Amount</th>
                      <th className="text-right px-4 py-3.5">Risk Gauge</th>
                      <th className="text-center px-4 py-3.5">Decision</th>
                      <th className="text-right px-5 py-3.5">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                    {transactions.slice(0, 8).map((t) => (
                      <tr
                        key={t.txn_id}
                        className="group hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors duration-150"
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-semibold text-xs text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {t.txn_id.slice(0, 10)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                            {maskVpa(t.sender_vpa)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white tabular-nums">
                            {formatINR(t.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-14 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  t.composite_score >= 70
                                    ? "bg-rose-500"
                                    : t.composite_score >= 40
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.min(100, Math.max(8, t.composite_score))}%` }}
                              />
                            </div>
                            <span
                              className={`font-extrabold font-mono text-xs tabular-nums ${
                                t.composite_score >= 70
                                  ? "text-rose-600 dark:text-rose-400"
                                  : t.composite_score >= 40
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {Math.round(t.composite_score)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <Badge
                            variant={
                              t.decision === "SAFE"
                                ? "safe"
                                : t.decision === "REVIEW"
                                  ? "review"
                                  : "block"
                            }
                          >
                            {t.decision}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right text-xs text-slate-500 dark:text-slate-400 font-sans whitespace-nowrap">
                          {timeAgo(t.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Alerts List */}
            <div className="lg:col-span-2 rounded-2xl bg-white/90 dark:bg-[#0b101c] border border-slate-200 dark:border-white/[0.08] overflow-hidden shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md flex flex-col">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white text-base font-display tracking-tight">
                      High-Priority Risk Alerts
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      Transactions exceeding risk thresholds
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25 font-bold">
                  {alertsToShow.length} Active
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[480px]">
                {alertsToShow.map((a, i) => (
                  <div
                    key={i}
                    className={`group relative p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      a.decision === "BLOCK"
                        ? "border-rose-200 dark:border-rose-500/25 bg-rose-50/70 dark:bg-gradient-to-r dark:from-rose-500/[0.05] dark:to-transparent hover:border-rose-300 dark:hover:border-rose-500/40"
                        : "border-amber-200 dark:border-amber-500/25 bg-amber-50/70 dark:bg-gradient-to-r dark:from-amber-500/[0.05] dark:to-transparent hover:border-amber-300 dark:hover:border-amber-500/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded tracking-wide ${
                              a.decision === "BLOCK"
                                ? "bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/35"
                                : "bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/35"
                            }`}
                          >
                            SCORE {Math.round(a.composite_score)}
                          </span>
                          <span className="text-xs font-mono text-slate-700 dark:text-slate-200 font-medium truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            {maskVpa(a.sender_vpa)}
                          </span>
                        </div>

                        <div className="mt-2.5 flex items-baseline gap-2">
                          <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                            {formatINR(a.amount)}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                            Txn #{a.txn_id}
                          </span>
                        </div>

                        {/* Mini risk meter */}
                        <div className="mt-2.5 w-full bg-slate-200 dark:bg-white/5 rounded-full h-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              a.decision === "BLOCK" ? "bg-rose-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.min(100, a.composite_score)}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <Badge variant={a.decision === "BLOCK" ? "block" : "review"}>
                          {a.decision}
                        </Badge>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-2">
                          {timeAgo(a.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Transaction Simulator Modal ────────────────────────────────────── */}
        {isSimulateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-white/[0.12] shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base font-display">
                      Simulate UPI Transaction
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      Inject real-time transaction into RAKSHAK inference engine
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSimulateOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 max-h-[calc(85vh-100px)] overflow-y-auto">
                {/* 1-Click Presets */}
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                    Quick Scenario Presets
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => applyPreset("safe")}
                      className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 text-left transition-all"
                    >
                      <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        🟢 Safe Payment
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        ₹250 (Swiggy)
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("review")}
                      className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 text-left transition-all"
                    >
                      <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        🟡 Velocity Spike
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        ₹45,000 (Midnight)
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("block")}
                      className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/15 text-left transition-all"
                    >
                      <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        🔴 Mule Fraud
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        ₹95,000 (Target)
                      </div>
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSimulate} className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                        Sender UPI ID (VPA)
                      </label>
                      <input
                        type="text"
                        value={simSender}
                        onChange={(e) => setSimSender(e.target.value)}
                        placeholder="e.g. rohit@okhdfcbank"
                        required
                        className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                        Receiver UPI ID (VPA)
                      </label>
                      <input
                        type="text"
                        value={simReceiver}
                        onChange={(e) => setSimReceiver(e.target.value)}
                        placeholder="e.g. swiggy@icici"
                        required
                        className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                        Amount (₹ INR)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        step="any"
                        value={simAmount}
                        onChange={(e) => setSimAmount(e.target.value)}
                        placeholder="250.00"
                        required
                        className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                        UPI Application
                      </label>
                      <select
                        value={simApp}
                        onChange={(e) => setSimApp(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-sans bg-slate-50 dark:bg-[#11192e] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="PhonePe">PhonePe</option>
                        <option value="GooglePay">Google Pay (GPay)</option>
                        <option value="Paytm">Paytm</option>
                        <option value="BHIM">BHIM UPI</option>
                        <option value="Cred">Cred UPI</option>
                      </select>
                    </div>
                  </div>

                  {simError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                      {simError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={simSubmitting}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-bold font-sans bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {simSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Evaluating Risk in Real-time...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Run Real-time AI Risk Inference</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Simulation Result Card */}
                {simResult && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Inference Complete
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {simResult.processing_ms ? `${simResult.processing_ms}ms` : "< 10ms"} latency
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/[0.06]">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-slate-400">Decision</div>
                        <div className="mt-1">
                          <Badge
                            variant={
                              simResult.decision === "BLOCK"
                                ? "block"
                                : simResult.decision === "REVIEW"
                                ? "review"
                                : "safe"
                            }
                          >
                            {simResult.decision}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono uppercase text-slate-400">Composite Score</div>
                        <div
                          className={`text-lg font-black font-mono mt-0.5 ${
                            simResult.decision === "BLOCK"
                              ? "text-rose-500"
                              : simResult.decision === "REVIEW"
                              ? "text-amber-500"
                              : "text-emerald-500"
                          }`}
                        >
                          {simResult.composite_score?.toFixed(1) || 0} / 100
                        </div>
                      </div>
                    </div>

                    {simResult.score_breakdown && (
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.02]">
                          <div className="text-slate-400">ML XGBoost</div>
                          <div className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                            {simResult.score_breakdown.ml_score?.toFixed(1) || 0}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.02]">
                          <div className="text-slate-400">Graph Risk</div>
                          <div className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                            {simResult.score_breakdown.graph_score?.toFixed(1) || 0}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.02]">
                          <div className="text-slate-400">Anomaly</div>
                          <div className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                            {simResult.score_breakdown.anomaly_score?.toFixed(1) || 0}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-sans flex items-center justify-between">
                      <span>✓ Ingested into Live Ledger & Timescale</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        Txn #{simResult.txn_id?.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
