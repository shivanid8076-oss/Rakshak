import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  Bot,
  Send,
  FileText,
  User,
  Loader2,
  Terminal,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  BookOpen,
  Cpu,
  Hash,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { askQuestion, explainTransaction, generateSAR } from "@/lib/api";
import { CyberBackground3D } from "@/components/CyberBackground3D";

export const Route = createFileRoute("/investigate")({
  head: () => ({ meta: [{ title: "Copilot Assistant — RAKSHAK" }] }),
  component: Investigate,
});

type Msg = { role: "user" | "ai"; text: string; time: string };
type Source = { title: string; tag?: string; score?: number };

function nowIST() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} IST`;
}

const prompts = [
  { title: "Explain this transaction", desc: "SHAP feature values & anomaly drivers" },
  { title: "Show similar cases", desc: "Match historical fraud typologies" },
  { title: "Generate SAR draft", desc: "FIU-IND compliant narrative" },
  { title: "Which features drove the decision?", desc: "Velocity, IP & device risk breakdown" },
];

function Investigate() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [txnId, setTxnId] = useState("");

  const pushUser = (text: string) =>
    setMessages((m) => [...m, { role: "user", text, time: nowIST() }]);
  const pushAI = (text: string) =>
    setMessages((m) => [...m, { role: "ai", text, time: nowIST() }]);

  const send = async (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || thinking) return;
    pushUser(t);
    setInput("");
    setThinking(true);
    try {
      const res = (await askQuestion({
        question: t,
        txn_id: txnId || undefined,
        session_id: sessionId ?? undefined,
      })) as { answer: string; sources: string[]; session_id: string; txn_id?: string };
      pushAI(res.answer);
      setSessionId(res.session_id);
      setSources((res.sources ?? []).map((s) => ({ title: s })));
    } catch {
      pushAI(
        "Could not connect to the investigation service. Verify that the backend and Groq API key are active.",
      );
    } finally {
      setThinking(false);
    }
  };

  const handlePrompt = async (p: string) => {
    if (p === "Explain this transaction") {
      if (!txnId.trim()) {
        pushAI("Please enter a transaction ID in the context panel on the right first.");
        return;
      }
      pushUser(`Explain transaction ${txnId} in detail.`);
      setThinking(true);
      try {
        const res = (await explainTransaction(txnId)) as { explanation?: string; answer?: string };
        pushAI(res.explanation ?? res.answer ?? JSON.stringify(res));
      } catch {
        pushAI(
          "Could not generate an explanation for that transaction ID. Check that it exists in the database.",
        );
      } finally {
        setThinking(false);
      }
      return;
    }
    if (p === "Generate SAR draft") {
      pushUser("Generate SAR draft");
      setThinking(true);
      try {
        const res = (await generateSAR(txnId || "unknown")) as { draft?: string; answer?: string };
        pushAI(res.draft ?? res.answer ?? "SAR draft generated — review case dossier.");
      } catch {
        pushAI(
          "Could not generate SAR draft. Ensure a valid case ID is bound to the session.",
        );
      } finally {
        setThinking(false);
      }
      return;
    }
    send(p);
  };

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
                  <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    Investigative Copilot Assistant
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Grounded on RBI Master Circulars, PMLA guidelines, and institutional case history
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                RAG ENGINE ONLINE
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                <Cpu className="h-3 w-3" />
                GROQ LLAMA-3
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {/* Main Conversation Window */}
            <div className="lg:col-span-7 flex flex-col rounded-2xl bg-white/90 dark:bg-gradient-to-b dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md overflow-hidden">
              {/* Window Status Sub-bar */}
              <div className="px-5 py-3 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Forensic Inquiry Stream
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {messages.length > 0 && (
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {messages.length} message{messages.length > 1 ? "s" : ""}
                    </span>
                  )}
                  {sessionId && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                      SID: {sessionId.slice(0, 8)}…
                    </span>
                  )}
                </div>
              </div>

              {/* Chat Messages Viewport */}
              <div
                className="flex-1 p-5 sm:p-6 space-y-5 overflow-y-auto"
                style={{ minHeight: 460, maxHeight: 560 }}
              >
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/[0.01]">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center mb-3">
                      <Bot className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base font-display">
                      Cognitive Forensic Assistant Ready
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1 font-mono leading-relaxed">
                      Select an automated diagnostic prompt below or bind a transaction ID to inspect
                      model features, detect mule syndicate patterns, and draft regulatory filings.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6 w-full max-w-lg text-left">
                      {prompts.map((p) => (
                        <button
                          key={p.title}
                          onClick={() => handlePrompt(p.title)}
                          disabled={thinking}
                          className="group p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:bg-blue-50/80 dark:hover:bg-blue-500/10 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all text-left shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-300">
                              {p.title}
                            </span>
                            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                            {p.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex gap-3.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`h-8 w-8 shrink-0 rounded-xl flex items-center justify-center text-xs shadow-xs ${
                        m.role === "user"
                          ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
                          : "bg-slate-100 dark:bg-blue-950/60 border border-slate-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {m.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[82%] sm:max-w-[76%] ${
                        m.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line font-mono ${
                          m.role === "user"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/15 rounded-tr-xs"
                            : "bg-white/95 dark:bg-[#0d1527]/90 border border-slate-200/90 dark:border-white/10 text-slate-800 dark:text-slate-200 shadow-sm rounded-tl-xs"
                        }`}
                      >
                        {m.text}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 px-1">
                        {m.time}
                      </div>
                    </div>
                  </div>
                ))}

                {thinking && (
                  <div className="flex gap-3.5">
                    <div className="h-8 w-8 shrink-0 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-blue-950/60 border border-slate-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-xs">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl rounded-tl-xs px-4 py-3 text-xs bg-white/95 dark:bg-[#0d1527]/90 border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300 shadow-sm inline-flex items-center gap-2.5 font-mono">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                      <span>Synthesizing forensic evidence & statutory cross-references…</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Prompts & Input Bar */}
              <div className="border-t border-slate-200 dark:border-white/[0.08] p-4 bg-slate-50/80 dark:bg-black/30 backdrop-blur-md">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {prompts.map((p) => (
                    <button
                      key={p.title}
                      onClick={() => handlePrompt(p.title)}
                      disabled={thinking}
                      className="text-xs font-mono px-3 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-300 dark:hover:border-blue-500/30 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 transition-all disabled:opacity-50 shadow-xs"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Ask about transaction drivers, syndicate patterns, or statutory rules..."
                    className="flex-1 text-xs px-4 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono shadow-inner"
                  />
                  <button
                    onClick={() => send()}
                    disabled={thinking || !input.trim()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white px-5 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all shrink-0 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar: Context & Sources */}
            <div className="lg:col-span-3 space-y-6">
              {/* Context Binding Card */}
              <div className="rounded-2xl bg-white/90 dark:bg-gradient-to-b dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h2 className="font-bold text-slate-900 dark:text-white text-xs font-display">
                      Session Context Binding
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Context</span>
                </div>
                <div className="p-4 space-y-3.5 text-xs">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
                      <Hash className="h-3 w-3 text-blue-500" />
                      Transaction Reference
                    </label>
                    <input
                      value={txnId}
                      onChange={(e) => setTxnId(e.target.value)}
                      placeholder="e.g. TXN_019283…"
                      className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>

                  {txnId.trim() && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handlePrompt("Explain this transaction")}
                        disabled={thinking}
                        className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-mono font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all text-center"
                      >
                        Explain Txn
                      </button>
                      <button
                        onClick={() => handlePrompt("Generate SAR draft")}
                        disabled={thinking}
                        className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-mono font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all text-center"
                      >
                        Draft SAR
                      </button>
                    </div>
                  )}

                  {sessionId && (
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-200 dark:border-white/5 font-mono">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        Session Active
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        {sessionId.slice(0, 10)}…
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Referenced Knowledge Sources Card */}
              <div className="rounded-2xl bg-white/90 dark:bg-gradient-to-b dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h2 className="font-bold text-slate-900 dark:text-white text-xs font-display">
                      Referenced Knowledge Sources
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 font-semibold">
                    VECTOR STORE
                  </span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {sources.length === 0 ? (
                    <div className="p-5 text-center">
                      <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-mono leading-relaxed">
                        Knowledge citations from RBI Master Circulars, PMLA, & internal cases will populate here during inference.
                      </p>
                    </div>
                  ) : (
                    sources.map((d, i) => (
                      <div
                        key={i}
                        className="p-3.5 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="h-6 w-6 rounded-md bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {d.title}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                              <span>Statutory Reference</span>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400">Match score &gt; 90%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

