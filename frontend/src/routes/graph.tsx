import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { maskVpa } from "@/lib/mockData";
import { useState } from "react";
import { getAccountGraph, getMuleAccounts, getFraudRings } from "@/lib/api";
import {
  Loader2,
  Network as NetworkIcon,
  Search,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  Zap,
  RefreshCw,
  Layers,
  ArrowUpRight,
  Eye,
  Info,
  Activity,
} from "lucide-react";
import { CyberBackground3D } from "@/components/CyberBackground3D";

export const Route = createFileRoute("/graph")({
  head: () => ({ meta: [{ title: "Mule Graph — RAKSHAK" }] }),
  component: GraphPage,
});

type NodeType = "normal" | "suspicious" | "fraud";

interface GraphNode {
  id: string;
  x: number;
  y: number;
  type: NodeType;
  label: string;
  score?: number;
}

const demoNodes: GraphNode[] = [
  { id: "A", x: 190, y: 170, type: "normal", label: "rahul123", score: 18 },
  { id: "B", x: 330, y: 110, type: "suspicious", label: "vikas.m", score: 62 },
  { id: "C", x: 470, y: 190, type: "fraud", label: "shop9x", score: 94 },
  { id: "D", x: 380, y: 310, type: "fraud", label: "cash4u", score: 98 },
  { id: "E", x: 560, y: 330, type: "suspicious", label: "quickpay", score: 58 },
  { id: "F", x: 620, y: 140, type: "normal", label: "amit.k", score: 22 },
  { id: "G", x: 230, y: 340, type: "normal", label: "priya", score: 12 },
  { id: "H", x: 710, y: 240, type: "fraud", label: "fastmoney", score: 89 },
  { id: "I", x: 140, y: 270, type: "suspicious", label: "arjun_r", score: 66 },
];

const demoEdges = [
  ["A", "C"],
  ["A", "B"],
  ["B", "C"],
  ["C", "D"],
  ["D", "E"],
  ["C", "F"],
  ["E", "H"],
  ["G", "D"],
  ["I", "D"],
  ["I", "C"],
  ["B", "F"],
  ["H", "F"],
];

const QUICK_PRESETS = [
  "cash4u@ybl",
  "shop9x@okaxis",
  "fastmoney@icici",
  "vikas.m@upi",
];

type MuleAccount = { vpa: string; score: number; inDeg: number; outDeg: number };
type FraudRing = { id: string; members: number; exposure: number; type: string };

function GraphPage() {
  const [showMule, setShowMule] = useState(true);
  const [vpaInput, setVpaInput] = useState("cash4u@ybl");
  const [loading, setLoading] = useState(false);
  const [graphNote, setGraphNote] = useState<string | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>(demoNodes);
  const [edges, setEdges] = useState<string[][]>(demoEdges);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(demoNodes[3]);
  const [typeFilter, setTypeFilter] = useState<"all" | NodeType>("all");

  const [mules, setMules] = useState<MuleAccount[]>([]);
  const [mulesLoading, setMulesLoading] = useState(false);
  const [mulesNote, setMulesNote] = useState<string | null>(null);
  const [muleLoadedOnce, setMuleLoadedOnce] = useState(false);

  const [rings, setRings] = useState<FraudRing[]>([]);

  const loadAccountGraph = async (overrideVpa?: string) => {
    const query = (overrideVpa ?? vpaInput).trim();
    if (!query) return;
    setLoading(true);
    setGraphNote(null);
    try {
      const res = (await getAccountGraph(query)) as {
        nodes?: { vpa: string; risk_score: number; label?: string }[];
        edges?: { source: string; target: string }[];
      };
      if (res.nodes && res.nodes.length > 0) {
        const laidOut: GraphNode[] = res.nodes.map((n, i) => {
          const angle = (i / res.nodes!.length) * 2 * Math.PI;
          return {
            id: n.vpa,
            x: 400 + 240 * Math.cos(angle),
            y: 230 + 130 * Math.sin(angle),
            type: n.risk_score >= 70 ? "fraud" : n.risk_score >= 40 ? "suspicious" : "normal",
            label: maskVpa(n.vpa),
            score: Math.round(n.risk_score),
          };
        });
        setNodes(laidOut);
        setEdges((res.edges ?? []).map((e) => [e.source, e.target]));
        setSelectedNode(laidOut[0] ?? null);
        setGraphNote(null);
      } else {
        setGraphNote(
          "No graph nodes returned for this VPA from the Neo4j instance. Rendering sample 2-hop topology.",
        );
        setNodes(demoNodes);
        setEdges(demoEdges);
      }
    } catch {
      setGraphNote("Neo4j graph service unreachable. Rendering sample 2-hop topology.");
      setNodes(demoNodes);
      setEdges(demoEdges);
    } finally {
      setLoading(false);
    }
  };

  const loadMuleAccounts = async () => {
    setMulesLoading(true);
    setMulesNote(null);
    try {
      const res = (await getMuleAccounts()) as {
        vpa: string;
        risk_score: number;
        in_degree: number;
        out_degree: number;
      }[];
      if (Array.isArray(res) && res.length > 0) {
        setMules(
          res.map((m) => ({
            vpa: m.vpa,
            score: Math.round(m.risk_score),
            inDeg: m.in_degree,
            outDeg: m.out_degree,
          })),
        );
      } else {
        setMulesNote("No mule accounts flagged in the current graph state.");
        setMules([]);
      }
      const ringsRes = (await getFraudRings()) as {
        id: string;
        members: number;
        exposure: number;
        type: string;
      }[];
      setRings(Array.isArray(ringsRes) ? ringsRes : []);
    } catch {
      setMulesNote("Could not reach graph API for mule accounts.");
      setMules([]);
    } finally {
      setMulesLoading(false);
      setMuleLoadedOnce(true);
    }
  };

  const visibleNodes = nodes.filter((n) => typeFilter === "all" || n.type === typeFilter);
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = edges.filter(([a, b]) => visibleNodeIds.has(a) && visibleNodeIds.has(b));

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
                  <NetworkIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    Mule Account & Network Graph
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Topological traversal for detecting mule rings, velocity cycles & aggregator hubs
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                NEO4J CLUSTER SYNCED
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                <Layers className="h-3 w-3" />
                2-HOP DFS TRAVERSAL
              </span>
            </div>
          </div>

          {/* Search, Preset Filters & Control Panel */}
          <div className="mb-6 p-4 rounded-2xl bg-white/90 dark:bg-gradient-to-r dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                value={vpaInput}
                onChange={(e) => setVpaInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadAccountGraph()}
                placeholder="Search VPA address (e.g. cash4u@ybl)..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl text-xs bg-white dark:bg-black/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono shadow-inner"
              />
            </div>

            <button
              onClick={() => loadAccountGraph()}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white px-5 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              <span>Traverse Graph</span>
            </button>

            <label className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-300 cursor-pointer select-none bg-slate-50 dark:bg-white/[0.03] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors shadow-xs">
              <input
                type="checkbox"
                checked={showMule}
                onChange={(e) => {
                  setShowMule(e.target.checked);
                  if (e.target.checked && !muleLoadedOnce) loadMuleAccounts();
                }}
                className="rounded accent-blue-600 cursor-pointer"
              />
              <span className="font-medium">Show Mule Accounts</span>
            </label>

            {/* Quick Sample VPAs */}
            <div className="w-full pt-1 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-500" />
                Quick Target:
              </span>
              {QUICK_PRESETS.map((vpa) => (
                <button
                  key={vpa}
                  onClick={() => {
                    setVpaInput(vpa);
                    loadAccountGraph(vpa);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-100 dark:bg-white/[0.03] hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-white/10 transition-colors"
                >
                  {vpa}
                </button>
              ))}
            </div>
          </div>

          {graphNote && (
            <div className="mb-4 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2.5 font-mono shadow-xs">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              <span>{graphNote}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SVG Network Canvas Box */}
            <div className="lg:col-span-2 rounded-2xl bg-white/90 dark:bg-gradient-to-b dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md overflow-hidden flex flex-col">
              {/* Canvas Header & Filter Tabs */}
              <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <NetworkIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm font-display">
                    2-Hop Neighborhood Topological Canvas
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-black/30 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-[11px] font-mono">
                  {(["all", "fraud", "suspicious", "normal"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        typeFilter === t
                          ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs font-semibold"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                      }`}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Visual Canvas Container */}
              <div
                className="relative bg-slate-50/80 dark:bg-[#070b14]/95 flex-1 overflow-hidden select-none"
                style={{ minHeight: 480 }}
              >
                <svg viewBox="0 0 800 460" className="w-full h-full">
                  <defs>
                    {/* Cyber Grid Pattern */}
                    <pattern id="graphGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        className="stroke-slate-200/70 dark:stroke-cyan-500/10"
                        strokeWidth="0.8"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="1.2"
                        className="fill-slate-300 dark:fill-cyan-400/25"
                      />
                    </pattern>

                    {/* Glowing Filters */}
                    <filter id="glowFraud" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ef4444" floodOpacity="0.6" />
                    </filter>
                    <filter id="glowSuspicious" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.5" />
                    </filter>
                    <filter id="glowNormal" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.4" />
                    </filter>
                  </defs>

                  {/* Canvas Grid Background */}
                  <rect width="800" height="460" fill="url(#graphGrid)" />

                  {/* Edges */}
                  {visibleEdges.map(([a, b], i) => {
                    const na = visibleNodes.find((n) => n.id === a);
                    const nb = visibleNodes.find((n) => n.id === b);
                    if (!na || !nb) return null;
                    const isHighRisk = na.type === "fraud" || nb.type === "fraud";
                    const isSelected = selectedNode && (selectedNode.id === a || selectedNode.id === b);

                    return (
                      <g key={i}>
                        <line
                          x1={na.x}
                          y1={na.y}
                          x2={nb.x}
                          y2={nb.y}
                          className={`transition-colors duration-200 ${
                            isSelected
                              ? "stroke-blue-500 dark:stroke-cyan-400 stroke-2"
                              : isHighRisk
                              ? "stroke-rose-400/50 dark:stroke-rose-500/40 stroke-[1.5]"
                              : "stroke-slate-300 dark:stroke-slate-700/60 stroke-1"
                          }`}
                          strokeDasharray={isHighRisk ? "4 3" : undefined}
                        />
                      </g>
                    );
                  })}

                  {/* Nodes */}
                  {visibleNodes.map((n) => {
                    const isFraud = n.type === "fraud";
                    const isSuspicious = n.type === "suspicious";
                    const isSelected = selectedNode?.id === n.id;
                    const strokeColor = isFraud ? "#ef4444" : isSuspicious ? "#f59e0b" : "#3b82f6";

                    return (
                      <g
                        key={n.id}
                        onClick={() => setSelectedNode(n)}
                        className="cursor-pointer group"
                      >
                        {/* Outer Pulse Halo for Fraud Nodes */}
                        {isFraud && (
                          <circle
                            cx={n.x}
                            cy={n.y}
                            r={26}
                            fill="#ef4444"
                            opacity={0.15}
                            className="animate-pulse"
                          />
                        )}

                        {/* Selection Halo */}
                        {isSelected && (
                          <circle
                            cx={n.x}
                            cy={n.y}
                            r={isFraud ? 22 : 18}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={2}
                            strokeDasharray="3 3"
                            className="animate-spin"
                            style={{ transformOrigin: `${n.x}px ${n.y}px`, animationDuration: "8s" }}
                          />
                        )}

                        {/* Main Center Node Circle */}
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r={isFraud ? 15 : isSuspicious ? 12 : 10}
                          fill={strokeColor}
                          filter={
                            isFraud
                              ? "url(#glowFraud)"
                              : isSuspicious
                              ? "url(#glowSuspicious)"
                              : "url(#glowNormal)"
                          }
                          className="transition-transform group-hover:scale-110"
                        />

                        {/* Inner Dot */}
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r={isFraud ? 5 : 3.5}
                          fill="#ffffff"
                        />

                        {/* Label Badge */}
                        <rect
                          x={n.x - 36}
                          y={n.y + 20}
                          width={72}
                          height={17}
                          rx={5}
                          className={`transition-colors ${
                            isSelected
                              ? "fill-blue-600 dark:fill-blue-500"
                              : "fill-white/90 dark:fill-[#0c1427]/90 stroke-slate-200 dark:stroke-white/10 stroke-1"
                          }`}
                        />
                        <text
                          x={n.x}
                          y={n.y + 32}
                          textAnchor="middle"
                          fontSize="9.5"
                          fontWeight="700"
                          fontFamily="monospace"
                          className={isSelected ? "fill-white" : "fill-slate-800 dark:fill-slate-200"}
                        >
                          {n.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Node Inspector Badge (Bottom Right) */}
                {selectedNode && (
                  <div className="absolute top-3 right-3 max-w-[220px] bg-white/95 dark:bg-[#0c1427]/90 border border-slate-200 dark:border-white/10 rounded-xl p-3 shadow-lg backdrop-blur-md text-xs font-mono animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-white/5 mb-1.5">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5 text-blue-500" />
                        Selected Node
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                          selectedNode.type === "fraud"
                            ? "bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400"
                            : selectedNode.type === "suspicious"
                            ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            : "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {selectedNode.type}
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                      <div><span className="text-slate-400">VPA:</span> <strong className="text-slate-900 dark:text-white">{selectedNode.label}</strong></div>
                      <div><span className="text-slate-400">Risk Score:</span> <strong className={selectedNode.type === "fraud" ? "text-rose-600" : "text-slate-900 dark:text-white"}>{selectedNode.score ?? 85}/100</strong></div>
                      <div><span className="text-slate-400">Topology:</span> 2-Hop Connected</div>
                    </div>
                  </div>
                )}

                {/* Legend Card (Bottom Left) */}
                <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-[#0c1427]/90 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-[10px] font-mono space-y-1.5 backdrop-blur-md shadow-lg">
                  <div className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[9px]">
                    Topology Classifications
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    <span className="text-slate-700 dark:text-slate-300">Normal Settled Account</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-700 dark:text-slate-300">Suspicious Intermediary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-600 animate-pulse" />
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">Flagged Mule / Syndicate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mule & Syndicate Sidebar */}
            <div className="space-y-6">
              {showMule && (
                <div className="rounded-2xl bg-white/90 dark:bg-gradient-to-b dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md overflow-hidden">
                  <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-rose-500" />
                      <h2 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm font-display">
                        Mule Accounts (High In-Degree)
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 font-semibold">
                      CENTRALITY
                    </span>
                  </div>
                  <div className="p-3.5">
                    {mulesLoading ? (
                      <div className="py-8 text-center text-xs text-slate-500 font-mono flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span>Analyzing graph centrality metrics…</span>
                      </div>
                    ) : mulesNote ? (
                      <div className="text-xs text-slate-600 dark:text-slate-400 p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/5 font-mono">
                        {mulesNote}
                      </div>
                    ) : mules.length === 0 ? (
                      <p className="text-xs text-slate-500 p-4 font-mono text-center">
                        Toggle "Show Mule Accounts" to query high in-degree transit nodes.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {mules.map((m) => (
                          <div
                            key={m.vpa}
                            className="p-3 bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 rounded-xl text-xs hover:border-rose-300 dark:hover:border-rose-500/30 transition-colors"
                          >
                            <div className="flex items-center justify-between font-mono">
                              <span className="font-semibold text-slate-900 dark:text-slate-200">
                                {maskVpa(m.vpa)}
                              </span>
                              <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-500/20 text-[11px]">
                                Score {m.score}
                              </span>
                            </div>
                            <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-200/60 dark:border-white/5">
                              <span>Inbound: <strong className="text-slate-800 dark:text-slate-200">{m.inDeg} txns</strong></span>
                              <span>Outbound: <strong className="text-slate-800 dark:text-slate-200">{m.outDeg} txns</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fraud Rings */}
              <div className="rounded-2xl bg-white/90 dark:bg-gradient-to-b dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <h2 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm font-display">
                      Syndicate Clusters
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 font-semibold">
                    {rings.length} CLUSTERS
                  </span>
                </div>
                <div className="p-3.5">
                  {rings.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 font-mono">
                      No multi-hop syndicate clusters registered in active buffer.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {rings.map((r) => (
                        <div
                          key={r.id}
                          className="p-3 bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 rounded-xl text-xs space-y-1.5"
                        >
                          <div className="flex justify-between font-mono font-bold">
                            <span className="text-slate-900 dark:text-white">{r.id}</span>
                            <span className="text-rose-600 dark:text-rose-400">
                              ₹{r.exposure.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-1 border-t border-slate-200/60 dark:border-white/5">
                            <span>{r.members} nodes linked</span>
                            <span className="text-blue-600 dark:text-blue-400 uppercase font-semibold">{r.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
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

