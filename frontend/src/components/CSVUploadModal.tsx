import { useState, useRef, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  Upload,
  X,
  FileSpreadsheet,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import { submitTransaction } from "@/lib/api";
import { Badge } from "@/components/AppShell";

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchComplete?: (results: BatchResult[]) => void;
}

interface ParsedTransaction {
  sender_vpa: string;
  receiver_vpa: string;
  amount: number;
  upi_app?: string;
  device_id?: string;
  ip_address?: string;
  remarks?: string;
}

interface BatchResult {
  rowIndex: number;
  sender_vpa: string;
  receiver_vpa: string;
  amount: number;
  decision?: string;
  composite_score?: number;
  processing_ms?: number;
  error?: string;
  score_breakdown?: {
    ml_score?: number;
    graph_score?: number;
    anomaly_score?: number;
  };
}

// ── Lightweight CSV parser ──────────────────────────────────────────────────
function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

// ── Column Mapper ───────────────────────────────────────────────────────────
const EXPECTED_COLUMNS: Record<string, string[]> = {
  sender_vpa: ["sender_vpa", "sender", "from", "payer", "sender_upi", "payer_vpa"],
  receiver_vpa: ["receiver_vpa", "receiver", "to", "payee", "receiver_upi", "payee_vpa", "merchant"],
  amount: ["amount", "amt", "value", "txn_amount", "transaction_amount"],
  upi_app: ["upi_app", "app", "upi_application", "platform"],
  device_id: ["device_id", "device", "device_hash"],
  ip_address: ["ip_address", "ip", "source_ip"],
  remarks: ["remarks", "note", "notes", "description"],
};

function mapColumns(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {};
  for (const [field, aliases] of Object.entries(EXPECTED_COLUMNS)) {
    const idx = headers.findIndex((h) => aliases.includes(h));
    if (idx !== -1) mapping[field] = idx;
  }
  return mapping;
}

// ── Sample CSV download ─────────────────────────────────────────────────────
const SAMPLE_CSV = `sender_vpa,receiver_vpa,amount,upi_app,device_id,ip_address,remarks
rohit@okhdfcbank,swiggy@icici,250,PhonePe,dev-001,103.22.10.1,Food order
aniket@okaxis,crypto.p2p@ibl,45000,GooglePay,dev-002,192.168.1.50,Midnight transfer
priya@ybl,amazon@apl,1200,Paytm,dev-003,10.0.0.5,Shopping
mule99@okaxis,scammer99@paytm,95000,BHIM,dev-004,172.16.0.1,Suspicious large txn
deepak@oksbi,zomato@hdfc,430,PhonePe,dev-005,103.22.50.10,Dinner order`;

function downloadSampleCSV() {
  const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sample_transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ───────────────────────────────────────────────────────────────
export function CSVUploadModal({ isOpen, onClose, onBatchComplete }: CSVUploadModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  // File & parsing
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedTransaction[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(true);

  // Processing
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [batchDone, setBatchDone] = useState(false);

  // Drag state
  const [dragging, setDragging] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setFileName(null);
    setParsedRows([]);
    setParseErrors([]);
    setShowPreview(true);
    setProcessing(false);
    setProgress(0);
    setResults([]);
    setBatchDone(false);
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setParseErrors(["Only .csv files are supported"]);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setParseErrors(["File size must be under 5 MB"]);
      return;
    }

    setFileName(file.name);
    setParseErrors([]);
    setParsedRows([]);
    setResults([]);
    setBatchDone(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCSV(text);

      if (headers.length === 0) {
        setParseErrors(["CSV file is empty"]);
        return;
      }

      const colMap = mapColumns(headers);
      const errors: string[] = [];

      if (colMap.sender_vpa === undefined) errors.push("Missing required column: sender_vpa (or sender, from, payer)");
      if (colMap.receiver_vpa === undefined) errors.push("Missing required column: receiver_vpa (or receiver, to, payee)");
      if (colMap.amount === undefined) errors.push("Missing required column: amount (or amt, value)");

      if (errors.length > 0) {
        setParseErrors(errors);
        return;
      }

      const parsed: ParsedTransaction[] = [];
      rows.forEach((row, i) => {
        const sender = row[colMap.sender_vpa]?.trim();
        const receiver = row[colMap.receiver_vpa]?.trim();
        const amtStr = row[colMap.amount]?.trim();

        if (!sender || !receiver || !amtStr) {
          errors.push(`Row ${i + 2}: Missing sender, receiver, or amount`);
          return;
        }
        if (!sender.includes("@")) {
          errors.push(`Row ${i + 2}: Invalid sender VPA "${sender}" (missing @)`);
          return;
        }
        if (!receiver.includes("@")) {
          errors.push(`Row ${i + 2}: Invalid receiver VPA "${receiver}" (missing @)`);
          return;
        }
        const amt = parseFloat(amtStr);
        if (isNaN(amt) || amt <= 0) {
          errors.push(`Row ${i + 2}: Invalid amount "${amtStr}"`);
          return;
        }

        parsed.push({
          sender_vpa: sender,
          receiver_vpa: receiver,
          amount: amt,
          upi_app: colMap.upi_app !== undefined ? row[colMap.upi_app]?.trim() || "PhonePe" : "PhonePe",
          device_id: colMap.device_id !== undefined ? row[colMap.device_id]?.trim() || undefined : undefined,
          ip_address: colMap.ip_address !== undefined ? row[colMap.ip_address]?.trim() || undefined : undefined,
          remarks: colMap.remarks !== undefined ? row[colMap.remarks]?.trim() || undefined : undefined,
        });
      });

      if (parsed.length === 0 && errors.length === 0) {
        errors.push("No valid transactions found in CSV");
      }

      setParseErrors(errors);
      setParsedRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  // ── Batch processing ────────────────────────────────────────────────────
  const runBatch = async () => {
    setProcessing(true);
    setProgress(0);
    setBatchDone(false);
    const batchResults: BatchResult[] = [];

    for (let i = 0; i < parsedRows.length; i++) {
      const txn = parsedRows[i];
      try {
        const res: any = await submitTransaction({
          sender_vpa: txn.sender_vpa,
          receiver_vpa: txn.receiver_vpa,
          amount: txn.amount,
          upi_app: txn.upi_app || "PhonePe",
          device_id: txn.device_id || "csv-batch-" + Math.floor(1000 + Math.random() * 9000),
          ip_address: txn.ip_address || "103.22." + Math.floor(10 + Math.random() * 200) + ".1",
        });

        batchResults.push({
          rowIndex: i,
          sender_vpa: txn.sender_vpa,
          receiver_vpa: txn.receiver_vpa,
          amount: txn.amount,
          decision: res.decision,
          composite_score: res.composite_score,
          processing_ms: res.processing_ms,
          score_breakdown: res.score_breakdown,
        });
      } catch (err: any) {
        batchResults.push({
          rowIndex: i,
          sender_vpa: txn.sender_vpa,
          receiver_vpa: txn.receiver_vpa,
          amount: txn.amount,
          error: err.message || "Failed",
        });
      }

      setProgress(Math.round(((i + 1) / parsedRows.length) * 100));
      setResults([...batchResults]);

      // Tiny delay to avoid overwhelming the backend
      if (i < parsedRows.length - 1) {
        await new Promise((r) => setTimeout(r, 150));
      }
    }

    setBatchDone(true);
    setProcessing(false);
    if (onBatchComplete) onBatchComplete(batchResults);
  };

  // ── Compute summary stats ─────────────────────────────────────────────
  const safeCount = results.filter((r) => r.decision === "SAFE").length;
  const reviewCount = results.filter((r) => r.decision === "REVIEW").length;
  const blockCount = results.filter((r) => r.decision === "BLOCK").length;
  const errorCount = results.filter((r) => r.error).length;
  const avgScore =
    results.length > 0
      ? results.filter((r) => r.composite_score != null).reduce((sum, r) => sum + (r.composite_score || 0), 0) /
        Math.max(results.filter((r) => r.composite_score != null).length, 1)
      : 0;

  // ── Export results to CSV ─────────────────────────────────────────────
  const exportResults = () => {
    const header = "row,sender_vpa,receiver_vpa,amount,decision,composite_score,ml_score,graph_score,anomaly_score,processing_ms,error";
    const lines = results.map(
      (r) =>
        `${r.rowIndex + 1},${r.sender_vpa},${r.receiver_vpa},${r.amount},${r.decision || ""},${r.composite_score?.toFixed(1) || ""},${r.score_breakdown?.ml_score?.toFixed(1) || ""},${r.score_breakdown?.graph_score?.toFixed(1) || ""},${r.score_breakdown?.anomaly_score?.toFixed(1) || ""},${r.processing_ms || ""},${r.error || ""}`
    );
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rakshak_batch_results_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-white/[0.12] shadow-2xl overflow-hidden">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base font-display">
                CSV Batch Upload
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                Upload transactions CSV for bulk AI risk inference
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { resetState(); onClose(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────────────── */}
        <div className="p-5 space-y-4 max-h-[calc(85vh-100px)] overflow-y-auto">

          {/* Step 1: Upload Area */}
          {parsedRows.length === 0 && !batchDone && (
            <>
              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileRef.current?.click()}
                className={`
                  relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all
                  ${dragging
                    ? "border-violet-500 bg-violet-500/10 scale-[1.01]"
                    : "border-slate-300 dark:border-white/[0.12] bg-slate-50/50 dark:bg-white/[0.02] hover:border-violet-400 hover:bg-violet-500/5"
                  }
                `}
              >
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${
                  dragging ? "bg-violet-500/20 text-violet-500" : "bg-slate-100 dark:bg-white/[0.06] text-slate-400"
                }`}>
                  <Upload className="h-7 w-7" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {dragging ? "Drop your CSV here" : "Drag & drop CSV file here"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    or click to browse · max 5 MB
                  </p>
                </div>
                {fileName && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-mono">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    {fileName}
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Sample download + format hint */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <p className="font-semibold">Required columns: <code className="text-violet-500">sender_vpa</code>, <code className="text-violet-500">receiver_vpa</code>, <code className="text-violet-500">amount</code></p>
                  <p>Optional: <code>upi_app</code>, <code>device_id</code>, <code>ip_address</code>, <code>remarks</code></p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); downloadSampleCSV(); }}
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold mt-1 cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    Download sample CSV template
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Parse errors */}
          {parseErrors.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
              {parseErrors.map((err, i) => (
                <div key={i} className="text-xs text-rose-600 dark:text-rose-400 flex items-start gap-1.5">
                  <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                  {err}
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Preview + Run */}
          {parsedRows.length > 0 && !batchDone && (
            <>
              {/* File info bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {parsedRows.length} transactions parsed from <span className="font-mono text-violet-500">{fileName}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title={showPreview ? "Hide preview" : "Show preview"}
                  >
                    {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={resetState}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Preview table */}
              {showPreview && (
                <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] overflow-hidden">
                  <div className="overflow-x-auto max-h-52">
                    <table className="w-full text-[11px]">
                      <thead className="bg-slate-50 dark:bg-white/[0.03] sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-400">#</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-400">Sender</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-400">Receiver</th>
                          <th className="px-3 py-2 text-right font-semibold text-slate-500 dark:text-slate-400">Amount</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-400">App</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                        {parsedRows.slice(0, 20).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                            <td className="px-3 py-1.5 font-mono text-slate-400">{i + 1}</td>
                            <td className="px-3 py-1.5 font-mono text-slate-700 dark:text-slate-300">{row.sender_vpa}</td>
                            <td className="px-3 py-1.5 font-mono text-slate-700 dark:text-slate-300">{row.receiver_vpa}</td>
                            <td className="px-3 py-1.5 font-mono text-right text-slate-700 dark:text-slate-300">₹{row.amount.toLocaleString()}</td>
                            <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400">{row.upi_app}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedRows.length > 20 && (
                    <div className="px-3 py-1.5 text-[10px] text-slate-400 text-center bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.04]">
                      Showing first 20 of {parsedRows.length} rows
                    </div>
                  )}
                </div>
              )}

              {/* Progress bar (during processing) */}
              {processing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-violet-500" />
                      Processing transactions...
                    </span>
                    <span className="font-mono font-bold text-violet-500">{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 text-center">
                    {results.length} / {parsedRows.length} completed
                  </div>
                </div>
              )}

              {/* Run button */}
              {!processing && (
                <button
                  type="button"
                  onClick={runBatch}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold font-sans bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="h-4 w-4" />
                  <span>Run Batch Risk Inference ({parsedRows.length} txns)</span>
                </button>
              )}
            </>
          )}

          {/* Step 3: Results Summary */}
          {batchDone && results.length > 0 && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {/* Summary Cards */}
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Batch Complete — {results.length} Transactions Processed
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                  <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Safe</span>
                  </div>
                  <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {safeCount}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Review</span>
                  </div>
                  <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
                    {reviewCount}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-center">
                  <div className="flex items-center justify-center gap-1 text-rose-500 mb-1">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Block</span>
                  </div>
                  <div className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">
                    {blockCount}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-500/5 border border-slate-500/20 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Avg Score
                  </div>
                  <div className="text-xl font-black font-mono text-slate-700 dark:text-slate-200">
                    {avgScore.toFixed(1)}
                  </div>
                </div>
              </div>

              {errorCount > 0 && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {errorCount} transaction(s) failed. Check exported results for details.
                </div>
              )}

              {/* Results table */}
              <div className="rounded-xl border border-slate-200 dark:border-white/[0.08] overflow-hidden">
                <div className="overflow-x-auto max-h-52">
                  <table className="w-full text-[11px]">
                    <thead className="bg-slate-50 dark:bg-white/[0.03] sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-400">#</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-400">Sender</th>
                        <th className="px-3 py-2 text-right font-semibold text-slate-500 dark:text-slate-400">Amount</th>
                        <th className="px-3 py-2 text-center font-semibold text-slate-500 dark:text-slate-400">Decision</th>
                        <th className="px-3 py-2 text-right font-semibold text-slate-500 dark:text-slate-400">Score</th>
                        <th className="px-3 py-2 text-right font-semibold text-slate-500 dark:text-slate-400">Latency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                      {results.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                          <td className="px-3 py-1.5 font-mono text-slate-400">{r.rowIndex + 1}</td>
                          <td className="px-3 py-1.5 font-mono text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{r.sender_vpa}</td>
                          <td className="px-3 py-1.5 font-mono text-right text-slate-700 dark:text-slate-300">₹{r.amount.toLocaleString()}</td>
                          <td className="px-3 py-1.5 text-center">
                            {r.error ? (
                              <span className="text-rose-500 text-[10px]">ERROR</span>
                            ) : (
                              <Badge variant={r.decision === "BLOCK" ? "block" : r.decision === "REVIEW" ? "review" : "safe"}>
                                {r.decision}
                              </Badge>
                            )}
                          </td>
                          <td className="px-3 py-1.5 font-mono text-right">
                            <span className={
                              r.decision === "BLOCK" ? "text-rose-500" :
                              r.decision === "REVIEW" ? "text-amber-500" :
                              "text-emerald-500"
                            }>
                              {r.composite_score?.toFixed(1) || "—"}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 font-mono text-right text-slate-400">
                            {r.processing_ms ? `${r.processing_ms}ms` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportResults}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export Results CSV
                  </button>
                  <button
                    type="button"
                    onClick={resetState}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-colors cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload Another
                  </button>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => { resetState(); onClose(); }}
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
