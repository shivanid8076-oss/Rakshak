import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { AppShell, Badge, Card } from "@/components/AppShell";
import { formatINR, maskVpa, cases as mockCases, transactions as mockTxns } from "@/lib/mockData";
import {
  Bot,
  ChevronRight,
  FileText,
  Network as NetworkIcon,
  Send,
  Loader2,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getRole, type Role } from "@/lib/auth";
import {
  getCase,
  getTransaction,
  submitDisposition as apiSubmitDisposition,
  askQuestion,
  generateSAR,
} from "@/lib/api";

export const Route = createFileRoute("/cases/$id")({
  head: () => ({ meta: [{ title: "Case Detail — RAKSHAK" }] }),
  component: CaseDetail,
});

function Gauge({ label, value, color }: { label: string; value: number; color: string }) {
  const dash = (value / 100) * 226;
  return (
    <div className="text-center">
      <div className="relative h-20 w-20 mx-auto">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle
            cx="48"
            cy="48"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${dash} 226`}
            strokeLinecap="round"
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center font-mono text-lg font-bold"
          style={{ color }}
        >
          {value}
        </div>
      </div>
      <div className="text-xs text-slate-400 mt-2 font-mono">{label}</div>
    </div>
  );
}

type CaseData = {
  case_id: string;
  txn_id: string;
  risk_score: number;
  status: string;
  assigned_analyst?: string;
};
type TxnData = {
  txn_id: string;
  sender_vpa_masked?: string;
  receiver_vpa_masked?: string;
  amount?: number;
  timestamp?: string;
  upi_app?: string;
  decision?: string;
  ml_score?: number;
  graph_score?: number;
  anomaly_score?: number;
  shap_values?: { top5?: { feature: string; shap_value: number; direction: string }[] } | null;
};

function CaseDetail() {
  const { id } = useParams({ from: "/cases/$id" });
  const [kase, setKase] = useState<CaseData | null>(null);
  const [txn, setTxn] = useState<TxnData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [role, setRoleState] = useState<Role | null>(null);
  useEffect(() => setRoleState(getRole()), []);
  const canInvestigate = role === "investigator" || role === "admin";
  const readOnly = role === "risk_manager";

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const c = (await getCase(id)) as CaseData;
        setKase(c);
        try {
          const t = (await getTransaction(c.txn_id)) as TxnData;
          setTxn(t);
        } catch {
          // transaction detail optional
        }
        setLoadError(null);
      } catch (e) {
        const foundCase = mockCases.find((c) => c.id === id) || mockCases[0];
        const foundTxn = mockTxns.find((t) => t.id === foundCase.txnId) || mockTxns[0];
        setKase({
          case_id: foundCase.id,
          txn_id: foundCase.txnId,
          risk_score: foundCase.score,
          status: foundCase.status,
          assigned_analyst: foundCase.analyst,
        });
        setTxn({
          txn_id: foundTxn.id,
          sender_vpa_masked: maskVpa(foundTxn.sender),
          receiver_vpa_masked: maskVpa(foundTxn.receiver),
          amount: foundTxn.amount,
          timestamp: foundTxn.time,
          upi_app: "PhonePe",
          decision: foundTxn.decision,
          ml_score: foundTxn.score,
          graph_score: Math.min(100, Math.round(foundTxn.score * 0.9)),
          anomaly_score: Math.min(100, Math.round(foundTxn.score * 0.85)),
          shap_values: {
            top5: [
              { feature: "amount_vs_avg", shap_value: 0.35, direction: "INCREASES_RISK" },
              { feature: "is_new_receiver", shap_value: 0.28, direction: "INCREASES_RISK" },
              { feature: "receiver_count", shap_value: 0.22, direction: "INCREASES_RISK" },
              { feature: "hour", shap_value: -0.12, direction: "DECREASES_RISK" },
              { feature: "sender_txn_count", shap_value: -0.15, direction: "DECREASES_RISK" },
            ],
          },
        });
        setLoadError(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const question = input.trim();
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setSending(true);
    try {
      const res = (await askQuestion({ question, case_id: id, txn_id: kase?.txn_id })) as {
        answer: string;
      };
      setMessages((m) => [...m, { role: "ai", text: res.answer }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: "Investigation assistant unreachable. Check that the FastAPI backend service is active.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const doSubmitDisposition = async (label: string, dispositionValue: string) => {
    if (dispositionValue !== "NOTES_ONLY" && notes.trim().length < 10) {
      setToast("Please enter at least 10 characters of audit notes before recording disposition.");
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setSubmitting(true);
    try {
      await apiSubmitDisposition(id, {
        disposition: dispositionValue,
        notes: notes.trim() || "No additional notes provided.",
        analyst_id: "analyst_001",
      });
      setToast(`Disposition recorded: ${label}`);
    } catch {
      setToast("Failed to submit disposition — check connection.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 2800);
    }
  };

  const doGenerateSAR = async () => {
    setSubmitting(true);
    try {
      await generateSAR(id);
      setToast("Regulatory SAR draft generated for FIU-IND");
    } catch {
      setToast("Failed to generate SAR draft");
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 2800);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-28 font-mono text-xs text-slate-400">
          <Loader2 className="h-6 w-6 text-blue-400 animate-spin mb-3" />
          <p>Retrieving case dossier from TimescaleDB…</p>
        </div>
      </AppShell>
    );
  }

  if (loadError || !kase) {
    return (
      <AppShell>
        <Card className="p-10 text-center border-rose-500/20 bg-rose-500/[0.02]">
          <p className="text-xs text-rose-400 font-medium font-mono">{loadError ?? "Case record not found."}</p>
          <Link
            to="/cases"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Return to Queue
          </Link>
        </Card>
      </AppShell>
    );
  }

  const shap = txn?.shap_values?.top5 ?? [];
  const hasBreakdown = txn?.ml_score != null;

  return (
    <AppShell>
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-400 mb-4 flex items-center gap-1.5 font-mono">
        <Link to="/cases" className="hover:text-blue-400 transition-colors">
          Queue
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-200">{kase.case_id}</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-display text-white tracking-tight">
              Investigation Dossier: {kase.case_id}
            </h1>
            <Badge variant="block">Risk Score: {Math.round(kase.risk_score)}/100</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Assigned Lead: <span className="text-white">{kase.assigned_analyst ?? "Unassigned"}</span> · Case Status: <span className="text-slate-300">{kase.status}</span>
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {canInvestigate && (
            <>
              <Link
                to="/graph"
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 font-medium transition-colors"
              >
                <NetworkIcon className="h-3.5 w-3.5 text-blue-400" /> Mule Graph
              </Link>
              <button
                onClick={doGenerateSAR}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-60 transition-all shadow-sm"
              >
                <FileText className="h-3.5 w-3.5" /> Generate SAR Draft
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Transaction Metadata */}
          <Card>
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
              <h2 className="font-semibold text-white text-sm font-display">
                UPI Switch Transaction Payload
              </h2>
              <span className="text-[10px] font-mono text-slate-400">NPCI Validated</span>
            </div>
            <div className="p-4">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
                {[
                  ["Transaction Reference", <span className="font-mono text-slate-200">{kase.txn_id}</span>],
                  ["Payer VPA", <span className="font-mono">{txn?.sender_vpa_masked ? maskVpa(txn.sender_vpa_masked) : "—"}</span>],
                  ["Payee VPA", <span className="font-mono">{txn?.receiver_vpa_masked ? maskVpa(txn.receiver_vpa_masked) : "—"}</span>],
                  [
                    "Settlement Amount",
                    <span className="font-mono font-bold text-white text-sm">
                      {txn?.amount != null ? formatINR(txn.amount) : "—"}
                    </span>,
                  ],
                  [
                    "Ingress Timestamp",
                    <span className="font-mono text-slate-400">
                      {txn?.timestamp ? new Date(txn.timestamp).toLocaleString("en-IN") : "—"}
                    </span>,
                  ],
                  ["PSP Client App", txn?.upi_app ?? "—"],
                  [
                    "Gateway Decision",
                    txn?.decision ? (
                      <Badge variant={txn.decision === "SAFE" ? "safe" : txn.decision === "REVIEW" ? "review" : "block"}>
                        {txn.decision}
                      </Badge>
                    ) : "—",
                  ],
                ].map(([k, v], i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <dt className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">{k}</dt>
                    <dd className="mt-1 text-slate-200 font-mono">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Card>

          {/* SHAP Feature Importance */}
          <Card>
            <div className="p-4 border-b border-white/[0.08]">
              <h2 className="font-semibold text-white text-sm font-display">
                SHAP Feature Attribution Vectors
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                Top drivers extracted from the XGBoost inference model
              </p>
            </div>
            <div className="p-4 space-y-3.5">
              {shap.length === 0 ? (
                <p className="text-xs text-slate-400 font-mono py-3 text-center">
                  No SHAP breakdown available for this transaction reference.
                </p>
              ) : (
                shap.map((s) => {
                  const abs = Math.abs(s.shap_value);
                  const isFraud = s.direction === "fraud";
                  return (
                    <div key={s.feature} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300 font-medium">{s.feature}</span>
                        <span className={isFraud ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>
                          {s.shap_value > 0 ? "+" : ""}
                          {s.shap_value.toFixed(3)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isFraud ? "bg-rose-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(abs * 200, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
              <div className="pt-2 border-t border-white/5 flex gap-6 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Elevates Risk Score
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Lowers Risk (Legitimate Pattern)
                </span>
              </div>
            </div>
          </Card>

          {/* Risk Score Breakdown */}
          <Card>
            <div className="p-4 border-b border-white/[0.08]">
              <h2 className="font-semibold text-white text-sm font-display">
                Multi-Modal Risk Ensemble Breakdown
              </h2>
            </div>
            <div className="p-5 grid grid-cols-3 gap-4">
              {hasBreakdown ? (
                <>
                  <Gauge label="XGB / RF Model" value={Math.round(txn!.ml_score!)} color="#3b82f6" />
                  <Gauge label="Graph Mule Centrality" value={Math.round(txn!.graph_score ?? 0)} color="#d97706" />
                  <Gauge label="Velocity Anomaly" value={Math.round(txn!.anomaly_score ?? 0)} color="#dc2626" />
                </>
              ) : (
                <p className="col-span-3 text-xs text-slate-400 font-mono text-center py-3">
                  Score breakdown vectors not available for this record.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Disposition Form */}
          <Card>
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
              <h2 className="font-semibold text-white text-sm font-display">
                Case Disposition
              </h2>
              {readOnly && (
                <span className="text-[10px] font-mono text-slate-400">Read Only</span>
              )}
            </div>
            <div className="p-4 space-y-3">
              {readOnly ? (
                <p className="text-xs text-slate-400 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5">
                  Risk Manager view — disposition modifications must be performed by active
                  investigators.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      disabled={submitting}
                      onClick={() => doSubmitDisposition("Confirmed Fraud", "TRUE_FRAUD")}
                      className="text-xs py-2 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300 font-medium hover:bg-rose-500/20 disabled:opacity-60 transition-colors"
                    >
                      Confirm Fraud
                    </button>
                    <button
                      disabled={submitting}
                      onClick={() => doSubmitDisposition("False Positive", "FALSE_POSITIVE")}
                      className="text-xs py-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium hover:bg-emerald-500/20 disabled:opacity-60 transition-colors"
                    >
                      False Positive
                    </button>
                    <button
                      disabled={submitting}
                      onClick={() => doSubmitDisposition("Inconclusive", "INCONCLUSIVE")}
                      className="text-xs py-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium hover:bg-amber-500/20 disabled:opacity-60 transition-colors"
                    >
                      Inconclusive
                    </button>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-semibold mb-1 block">
                      Analyst Audit Notes (Min 10 characters)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify reasoning, KYC verification result, or customer confirmation..."
                      rows={3}
                      className="w-full text-xs px-3 py-2 border border-white/10 rounded-lg bg-black/40 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-mono"
                    />
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Investigation Assistant */}
          <Card className="flex flex-col">
            <div className="p-4 border-b border-white/[0.08] flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-400" />
              <h2 className="font-semibold text-white text-sm font-display">Investigation Assistant</h2>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto space-y-2.5">
              {messages.length === 0 && (
                <p className="text-xs text-slate-400 leading-relaxed font-mono p-2.5 bg-white/[0.02] rounded-lg border border-white/5">
                  Ask questions regarding the transaction drivers, historical VPA behavior, or
                  statutory rules.
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`text-xs p-2.5 rounded-lg leading-relaxed whitespace-pre-line font-mono ${
                    m.role === "user"
                      ? "bg-blue-600/20 border border-blue-500/30 text-blue-100 ml-4"
                      : "bg-white/[0.03] border border-white/10 text-slate-200 mr-4"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {sending && (
                <div className="text-xs p-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-slate-400 mr-4 flex items-center gap-2 font-mono">
                  <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                  <span>Evaluating inquiry…</span>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-white/[0.08] flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask about this case..."
                className="flex-1 text-xs px-3 py-2 border border-white/10 rounded-lg bg-black/40 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <button
                onClick={send}
                disabled={sending}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded-lg disabled:opacity-60 transition-colors flex items-center justify-center"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#0f1422] text-slate-200 border border-white/20 px-4 py-2.5 rounded-lg shadow-xl text-xs font-mono flex items-center gap-2 z-50 animate-fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}
    </AppShell>
  );
}
