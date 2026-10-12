import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Zap,
  X,
  Send,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { submitTransaction } from "@/lib/api";
import { Badge } from "@/components/AppShell";

interface TransactionSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (txn: any) => void;
}

export function TransactionSimulatorModal({
  isOpen,
  onClose,
  onSuccess,
}: TransactionSimulatorModalProps) {
  const [simSender, setSimSender] = useState("rohit@okhdfcbank");
  const [simReceiver, setSimReceiver] = useState("swiggy@icici");
  const [simAmount, setSimAmount] = useState("250");
  const [simApp, setSimApp] = useState("PhonePe");
  const [simSubmitting, setSimSubmitting] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [simError, setSimError] = useState<string | null>(null);

  if (!isOpen) return null;

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
      if (onSuccess) {
        onSuccess({ ...res, amount: amt, sender_vpa: simSender });
      }
    } catch (err: any) {
      setSimError(err.message || "Failed to process transaction. Check backend connection.");
    } finally {
      setSimSubmitting(false);
    }
  };

  return (
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
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
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
                className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 text-left transition-all cursor-pointer"
              >
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Safe Payment
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  ₹250 (Swiggy)
                </div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("review")}
                className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 text-left transition-all cursor-pointer"
              >
                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Velocity Spike
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  ₹45,000 (Midnight)
                </div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("block")}
                className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/15 text-left transition-all cursor-pointer"
              >
                <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" /> Mule Fraud
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

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-sans">
                  ✓ Ingested into Timescale & Graph
                </span>
                <Link
                  to="/dashboard"
                  onClick={onClose}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>Open Live Ledger</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
