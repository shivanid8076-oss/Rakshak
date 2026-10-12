import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Network,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Eye,
  Minus,
  ChevronRight,
  ChevronDown,
  Terminal,
  Zap,
  Sliders,
  Layers,
  Database,
  FileText,
  UserCog,
  Lock,
  Shield,
} from "lucide-react";
import { getRole, setRole, ROLE_HOME, type Role } from "@/lib/auth";

interface RoleDetails {
  id: Role;
  name: string;
  level: string;
  badge: string;
  tagline: string;
  description: string;
  primaryDesk: string;
  accentColor: string;
  borderColor: string;
  bgGlow: string;
  icon: typeof Activity;
  sla: string;
  authority: string;
  telemetry: {
    label: string;
    value: string;
    sub: string;
  }[];
  capabilities: string[];
  terminalLog: string[];
}

const ROLES_DATA: Record<Role, RoleDetails> = {
  fraud_analyst: {
    id: "fraud_analyst",
    name: "Fraud Analyst",
    level: "Level 1",
    badge: "OPERATIONS L1",
    tagline: "Live Alert Stream & Queue Triage Desk",
    description:
      "Frontline operations defense responsible for sub-minute UPI transaction triage, validating ML anomaly signals, and issuing immediate case dispositions.",
    primaryDesk: "/dashboard",
    accentColor: "from-cyan-400 to-blue-500",
    borderColor: "border-blue-500/40 hover:border-blue-400",
    bgGlow: "rgba(56, 189, 248, 0.15)",
    icon: Activity,
    sla: "< 2 Minutes SLA",
    authority: "Queue Resolution & Case Disposition",
    telemetry: [
      { label: "Active Queue", value: "24 Pending", sub: "8 high priority" },
      { label: "Resolution SLA", value: "94.8%", sub: "within 30m window" },
      { label: "Payer Telemetry", value: "Real-Time", sub: "Velocity & Geo" },
      { label: "SHAP Drivers", value: "Active", sub: "Top 5 features" },
    ],
    capabilities: [
      "Real-time UPI transaction ingress monitoring",
      "SLA-driven case queue prioritization & triage",
      "Transaction dossier inspection with SHAP vectors",
      "1-Click disposition (Confirm Fraud / False Positive / Inconclusive)",
      "Forensic inquiry via AI Copilot Assistant",
    ],
    terminalLog: [
      "[INGRESS] Stream active: 1,842 UPI txns/sec via Mumbai-01 switch",
      "[DETECTION] Case #CS-9021 flagged with Risk Score 88.4 / 100",
      "[SHAP] Top driver: Payer_Velocity_1h (+0.412 contribution)",
      "[DISPOSITION] Operator logged TRUE_FRAUD with audit reasoning",
      "[SLA] Queue item closed in 42 seconds · Telemetry synced to TimescaleDB",
    ],
  },
  investigator: {
    id: "investigator",
    name: "Investigator",
    level: "Level 2",
    badge: "INTELLIGENCE L2",
    tagline: "Mule Network & Organized Syndicate Forensics",
    description:
      "Deep forensic intelligence desk specialized in multi-hop graph traversals, detecting money mule rings, cycling fund loops, and filing statutory regulatory SARs.",
    primaryDesk: "/graph",
    accentColor: "from-teal-400 to-emerald-500",
    borderColor: "border-teal-500/40 hover:border-teal-400",
    bgGlow: "rgba(20, 184, 166, 0.15)",
    icon: Network,
    sla: "Deep Forensics",
    authority: "Syndicate Graph & FIU-IND SAR Drafts",
    telemetry: [
      { label: "Mule Rings", value: "6 Syndicates", sub: "3 cycling loops" },
      { label: "Graph Depth", value: "5 Hops", sub: "Neo4j traversal" },
      { label: "High Degree Hubs", value: "14 Nodes", sub: "PageRank > 0.85" },
      { label: "SAR Drafts", value: "FIU-IND Ready", sub: "Auto-generated" },
    ],
    capabilities: [
      "Interactive graph traversal across VPAs, accounts, and IFSC hubs",
      "Automated cycle and fund-layering detection algorithms",
      "Centrality scoring (PageRank, Betweenness, In/Out degree)",
      "Statutory Suspicious Activity Report (SAR) auto-drafting for FIU-IND",
      "Cross-institutional syndicate evidence compilation",
    ],
    terminalLog: [
      "[GRAPH] Loaded Neo4j cluster: 1,420 nodes · 3,890 edges traversed",
      "[CYCLE DETECT] 3-hop circular fund diversion identified in Syndicate-Alpha",
      "[PAGERANK] Hub node 9876543210@ybl centrality elevated to 0.941",
      "[EVIDENCE] Aggregated ₹18,40,000 across 9 layer-2 mule accounts",
      "[SAR COMPLIANCE] Draft generated for FIU-IND regulatory submission",
    ],
  },
  risk_manager: {
    id: "risk_manager",
    name: "Risk Manager",
    level: "Level 3",
    badge: "ANALYTICS L3",
    tagline: "Portfolio Analytics & Model Policy Governance",
    description:
      "Strategic policy desk supervising portfolio loss ratios, ML model performance drift (AUC-ROC), decision thresholds, and core microservice reliability.",
    primaryDesk: "/analytics",
    accentColor: "from-purple-400 to-indigo-500",
    borderColor: "border-purple-500/40 hover:border-purple-400",
    bgGlow: "rgba(168, 85, 247, 0.15)",
    icon: BarChart3,
    sla: "Portfolio Governance",
    authority: "Model Cutoffs & System Policies",
    telemetry: [
      { label: "Model AUC-ROC", value: "0.994", sub: "XGBoost v2.4.1" },
      { label: "Auto-Block Score", value: "85 / 100", sub: "Hard cutoff" },
      { label: "Review Threshold", value: "60 / 100", sub: "Queue trigger" },
      { label: "Services Health", value: "100% Up", sub: "Timescale/Redis/Neo4j" },
    ],
    capabilities: [
      "Macro risk analytics: Loss prevented, false-positive ratios, trend graphs",
      "Model performance monitoring: AUC-ROC, Precision/Recall, SHAP global drift",
      "Dynamic threshold calibration: Auto-Block cutoff & Manual Review score",
      "Model registry oversight & zero-downtime weight rollback",
      "Infrastructure ping monitoring across TimescaleDB, Redis, and Neo4j",
    ],
    terminalLog: [
      "[EVALUATION] Model registry updated: XGBoost v2.4.1 active in prod",
      "[METRICS] AUC-ROC verified at 0.9942 · Precision 96.8% · Recall 94.1%",
      "[THRESHOLD] Set Auto-Block score to 85 · Manual review band [60-84]",
      "[HEALTH] TimescaleDB 3.2ms · Redis cache 1.1ms · Neo4j engine 8.4ms",
      "[LOSS PREVENTED] ₹4.2 Crore shielded across 2.4M transactions this cycle",
    ],
  },
  admin: {
    id: "admin",
    name: "Administrator",
    level: "Level 4",
    badge: "SUPERUSER L4",
    tagline: "System Governance & Operator Access Control",
    description:
      "Executive security governance desk with unrestricted access to all 7 platform modules, user directory management, operator provisioning, and credential rotation.",
    primaryDesk: "/admin",
    accentColor: "from-amber-400 to-rose-500",
    borderColor: "border-amber-500/40 hover:border-amber-400",
    bgGlow: "rgba(245, 158, 11, 0.15)",
    icon: ShieldCheck,
    sla: "Master Control",
    authority: "Unrestricted Authority (7/7 Modules)",
    telemetry: [
      { label: "Registered Operators", value: "5 Active", sub: "Institutional desks" },
      { label: "RBAC Policies", value: "Enforced", sub: "JWT scoped claims" },
      { label: "Access Revocation", value: "Instant", sub: "Audit logged" },
      { label: "Platform Scope", value: "7 of 7", sub: "Unrestricted modules" },
    ],
    capabilities: [
      "Unrestricted authority across all 7 platform desks and modules",
      "Onboarding & provisioning new bank operators with specific security tiers",
      "Passkey credential issuance and emergency access revocation",
      "Security audit log inspection and compliance verification",
      "Full case disposition, SAR generation, and threshold configuration",
    ],
    terminalLog: [
      "[AUTH GOVERNANCE] Active session validated as Superuser (Admin Tier 4)",
      "[DIRECTORY] Operator directory synchronized: 5 institutional officers",
      "[PROVISIONING] New analyst credential generated with scoped JWT token",
      "[POLICY] RBAC policy integrity checked: 0 unauthorized privilege escalations",
      "[SYSTEM] Master control active across all operational ingestion rails",
    ],
  },
};

interface RoleMatrixRow {
  feature: string;
  category: string;
  analyst: "yes" | "no" | "read";
  investigator: "yes" | "no" | "read";
  manager: "yes" | "no" | "read";
  admin: "yes" | "no" | "read";
  desc: string;
}

const ROLE_MATRIX: RoleMatrixRow[] = [
  {
    feature: "Operations Dashboard & Threat Stream",
    category: "Real-time Monitoring",
    analyst: "yes",
    investigator: "yes",
    manager: "yes",
    admin: "yes",
    desc: "Live UPI transaction throughput, threat rate radar, and sub-second ingestion telemetry.",
  },
  {
    feature: "High-Risk Case Queue & SLA Triage",
    category: "Case Management",
    analyst: "yes",
    investigator: "yes",
    manager: "no",
    admin: "yes",
    desc: "Priority case cards, deadline countdown timers, risk score distributions, and triage filters.",
  },
  {
    feature: "Case Audit Disposition",
    category: "Incident Resolution",
    analyst: "yes",
    investigator: "yes",
    manager: "read",
    admin: "yes",
    desc: "Formally submit Confirm Fraud, False Positive, or Inconclusive decisions with analyst audit notes.",
  },
  {
    feature: "Forensic AI Copilot Assistant",
    category: "GenAI Investigation",
    analyst: "yes",
    investigator: "yes",
    manager: "no",
    admin: "yes",
    desc: "Vector-augmented assistant to evaluate complex transaction patterns, NPCI rules, and customer VPAs.",
  },
  {
    feature: "Mule Network Graph Traversal",
    category: "Deep Forensics",
    analyst: "no",
    investigator: "yes",
    manager: "no",
    admin: "yes",
    desc: "Interactive graph canvas to detect money mule rings, cycling fund loops, and multi-hop syndicate hubs.",
  },
  {
    feature: "Regulatory SAR Draft Generation",
    category: "Compliance",
    analyst: "no",
    investigator: "yes",
    manager: "no",
    admin: "yes",
    desc: "Automated generation of statutory Suspicious Activity Reports for FIU-IND and RBI regulatory filings.",
  },
  {
    feature: "Risk Analytics & Model Performance",
    category: "Macro Intelligence",
    analyst: "no",
    investigator: "no",
    manager: "yes",
    admin: "yes",
    desc: "Portfolio-wide loss metrics, XGBoost/PyTorch AUC-ROC, SHAP global feature weights, and risk distributions.",
  },
  {
    feature: "System Thresholds & Infrastructure Config",
    category: "System Administration",
    analyst: "no",
    investigator: "no",
    manager: "yes",
    admin: "yes",
    desc: "Calibrate Auto-Block cutoffs, manual review scores, active model registry, and Timescale/Redis/Neo4j health.",
  },
  {
    feature: "User Access & Operator RBAC Provisioning",
    category: "Governance & Security",
    analyst: "no",
    investigator: "no",
    manager: "no",
    admin: "yes",
    desc: "Onboard bank operators, assign operational security tiers, issue temporary passkeys, and revoke credentials.",
  },
];

function PermissionBadge({ status }: { status: "yes" | "no" | "read" }) {
  if (status === "yes") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-medium shadow-[0_0_8px_rgba(16,185,129,0.15)] transition-all">
        <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
        <span>Full Access</span>
      </span>
    );
  }
  if (status === "read") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-medium shadow-[0_0_8px_rgba(245,158,11,0.15)] transition-all">
        <Eye className="h-3 w-3 text-amber-400 shrink-0" />
        <span>Read-Only</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/[0.02] text-slate-500 border border-white/5 text-[10px] font-mono">
      <Minus className="h-3 w-3 text-slate-600" />
      <span className="text-[10px] font-medium text-slate-500">Restricted</span>
    </span>
  );
}

interface OperationalDesksSectionProps {
  id?: string;
  isStandalonePage?: boolean;
}

export function OperationalDesksSection({
  id = "roles",
  isStandalonePage = false,
}: OperationalDesksSectionProps) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>("fraud_analyst");
  const [viewMode, setViewMode] = useState<"cockpit" | "grid">("cockpit");
  const [showMatrix, setShowMatrix] = useState<boolean>(false);

  const activeData = ROLES_DATA[selectedRole];
  const ActiveIcon = activeData.icon;

  const handleLaunchRole = (role: Role) => {
    const current = getRole();
    if (current) {
      setRole(role);
      navigate({ to: ROLE_HOME[role] });
      return;
    }
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("fs_selected_desk", role);
    }
    navigate({ to: "/login", search: { role } as any });
  };

  return (
    <section
      id={id}
      className={`relative z-10 w-full ${
        isStandalonePage
          ? "pt-8 pb-20 px-6 max-w-7xl mx-auto"
          : "py-24 px-6 max-w-7xl mx-auto border-t border-white/[0.06]"
      }`}
    >
      {/* ── Section Header with Cyber Aura Animations ── */}
      <div className="text-center max-w-3xl mx-auto mb-12 relative">
        {/* Floating background cyber ambient glow */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-80 sm:w-[540px] h-36 bg-gradient-to-r from-cyan-500/20 via-sky-500/15 to-blue-600/20 blur-3xl rounded-full pointer-events-none animate-float-slow -z-10" />

        {/* Cyber Overline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(6,182,212,0.18)] backdrop-blur-md">
          <Shield className="h-3 w-3 text-cyan-400" />
          <span>Role-Based Operations Hub</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display tracking-tight text-white leading-tight">
          <span>4 Specialized </span>
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(56,189,248,0.35)]">
            Operational Desks
          </span>
        </h2>

        <div className="mt-5 max-w-2xl mx-auto space-y-4">
          <p className="text-sm sm:text-base md:text-[17px] text-slate-300 leading-relaxed font-normal">
            <span className="text-white font-semibold">RAKSHAK</span> separates{" "}
            <span className="text-cyan-300 font-medium bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md inline-block">
              frontline triage
            </span>
            ,{" "}
            <span className="text-sky-300 font-medium bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md inline-block">
              graph intelligence
            </span>
            ,{" "}
            <span className="text-blue-300 font-medium bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md inline-block">
              risk policies
            </span>
            , and{" "}
            <span className="text-indigo-300 font-medium bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md inline-block">
              governance
            </span>{" "}
            into distinct operational tiers.
          </p>

          {/* Interactive Directive Capsule */}
          <div className="flex justify-center pt-1">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#081226]/80 border border-cyan-500/30 text-cyan-200/90 text-xs sm:text-sm font-mono tracking-wide shadow-[0_4px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(6,182,212,0.12)] backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              <span>Select any desk below to authenticate and enter its workspace.</span>
            </div>
          </div>
        </div>

        {/* View Toggle Bar (Cockpit vs Grid) */}
        <div className="mt-7 inline-flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setViewMode("cockpit")}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              viewMode === "cockpit"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Interactive Cockpit View
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All 4 Desks Grid
          </button>
        </div>
      </div>

      {/* ── Role Selector Tabs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {(Object.keys(ROLES_DATA) as Role[]).map((rKey) => {
          const role = ROLES_DATA[rKey];
          const isSelected = selectedRole === rKey;
          const RoleIcon = role.icon;

          return (
            <button
              key={rKey}
              onClick={() => setSelectedRole(rKey)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? "bg-[#0f1932] border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] scale-[1.02]"
                  : "bg-[#090e1c]/80 border-white/10 hover:border-white/25 hover:bg-[#0c1426]"
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
              )}
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "bg-white/5 text-slate-400 border border-white/10"
                  }`}
                >
                  <RoleIcon className="h-4 w-4" />
                </div>
                <span
                  className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "bg-white/5 text-slate-500 border border-white/5"
                  }`}
                >
                  {role.level}
                </span>
              </div>
              <div className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                {role.name}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                {role.badge}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── VIEW MODE 1: Interactive Cockpit Spotlight ── */}
      {viewMode === "cockpit" && (
        <div className="rounded-3xl bg-gradient-to-b from-[#0c152a] via-[#090f20] to-[#050914] border border-cyan-500/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] p-6 sm:p-8 lg:p-10 mb-14 relative overflow-hidden backdrop-blur-2xl">
          {/* Subtle Ambient Backlight */}
          <div
            className="absolute top-0 right-0 w-[500px] h-[400px] rounded-full blur-[140px] pointer-events-none transition-all duration-500"
            style={{ backgroundColor: activeData.bgGlow }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column: Role Dossier & Instant Launch */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                    <ActiveIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {activeData.badge}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
                      {activeData.name}
                    </h3>
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-mono text-cyan-300/90 font-medium">
                  {activeData.tagline}
                </p>
                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                  {activeData.description}
                </p>
              </div>

              {/* Live Telemetry Metric Tiles */}
              <div className="grid grid-cols-2 gap-3">
                {activeData.telemetry.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm"
                  >
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      {t.label}
                    </div>
                    <div className="text-base sm:text-lg font-bold font-mono text-white mt-1">
                      {t.value}
                    </div>
                    <div className="text-[11px] text-cyan-400/90 font-mono mt-0.5">{t.sub}</div>
                  </div>
                ))}
              </div>

              {/* Core Capabilities Checklist */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                  Operational Powers & Toolset:
                </div>
                <div className="space-y-1.5">
                  {activeData.capabilities.map((c, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-slate-200 font-sans"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Sandbox Launch Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => handleLaunchRole(selectedRole)}
                  className="flex-1 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Lock className="h-4 w-4 text-slate-950" />
                  <span>Authenticate & Enter {activeData.name} Desk</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <div className="text-center sm:text-left text-[11px] font-mono text-slate-400">
                  Target: <span className="text-cyan-400 font-semibold">{activeData.primaryDesk}</span>
                  <br />
                  <span className="text-amber-400 flex items-center gap-1 sm:justify-start justify-center">
                    <Shield className="h-3 w-3" /> Requires Passkey Login
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Simulated Terminal Cockpit */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[#040812] border border-cyan-500/30 p-5 shadow-2xl relative overflow-hidden">
                {/* Terminal Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="text-slate-400 text-[11px] ml-2">
                      rakshak://terminal/{selectedRole}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>STREAM ONLINE</span>
                  </div>
                </div>

                {/* Simulated Live Stream Feed */}
                <div className="space-y-3 font-mono text-xs text-slate-300 min-h-[260px] flex flex-col justify-between">
                  <div className="space-y-2.5">
                    {activeData.terminalLog.map((log, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] leading-relaxed animate-fade-in"
                      >
                        <span className="text-cyan-400 mr-2">$</span>
                        {log}
                      </div>
                    ))}
                  </div>

                  {/* Terminal Bottom Prompt */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Ready for live operator interaction</span>
                    </div>
                    <span className="text-cyan-400 font-semibold">{activeData.sla}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW MODE 2: 4 Grid Cards Side-by-Side ── */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {(Object.keys(ROLES_DATA) as Role[]).map((rKey) => {
            const role = ROLES_DATA[rKey];
            const CardIcon = role.icon;

            return (
              <div
                key={rKey}
                className={`rounded-3xl bg-gradient-to-b from-[#0d162c] to-[#070b16] border ${role.borderColor} p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <CardIcon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {role.level}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-white">{role.name}</h3>
                  <p className="text-xs text-cyan-400 font-mono mt-0.5">{role.tagline}</p>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
                  <div className="text-[11px] font-mono text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      Primary Desk: <span className="text-cyan-400 font-semibold">{role.primaryDesk}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {role.sla}
                    </div>
                  </div>
                  <button
                    onClick={() => handleLaunchRole(rKey)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer group-hover:scale-[1.02]"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Sign In to {role.name} Desk</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Toggle Button for RBAC Permissions Matrix ── */}
      <div className="mt-10 mb-8 flex flex-col items-center justify-center relative">
        {/* Floating animated Call-to-action pointer badge */}
        {!showMatrix && (
          <div className="mb-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-cyan-500/25 via-sky-500/35 to-blue-500/25 border border-cyan-400/60 text-cyan-300 text-xs font-mono font-bold tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.45)] animate-bounce">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-90" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="text-white font-extrabold uppercase tracking-widest text-[11px]">
              👉 CLICK HERE TO VIEW TABLE
            </span>
            <Sparkles className="h-3 w-3 text-cyan-300 animate-pulse" />
          </div>
        )}

        {/* Glowing Outer Chassis Ring */}
        <div className="relative group">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 opacity-60 blur-md group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />

          <button
            onClick={() => setShowMatrix((prev) => !prev)}
            className="relative inline-flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-[#091124] hover:bg-[#0c1630] border-2 border-cyan-400/80 hover:border-cyan-300 text-white text-xs sm:text-sm font-display font-bold tracking-tight shadow-[0_0_30px_rgba(6,182,212,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <div className="h-7 w-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 animate-pulse shrink-0">
              <Shield className="h-4 w-4" />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-white text-sm sm:text-base">
                Role-Based Access Control
              </span>
              <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent font-extrabold text-sm sm:text-base">
                (RBAC)
              </span>
              <span className="font-extrabold text-white text-sm sm:text-base">
                Permissions Matrix
              </span>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-mono font-black uppercase tracking-wider animate-pulse shadow-sm ml-1 shrink-0">
              {showMatrix ? "HIDE" : "CLICK HERE"}
            </span>

            <ChevronDown
              className={`h-4 w-4 text-cyan-300 transition-transform duration-300 shrink-0 ${
                showMatrix ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {!showMatrix && (
          <p className="text-[11px] font-mono text-cyan-300/80 mt-2.5 flex items-center gap-1.5">
            <span>Tap above to inspect granular permissions & multi-tier access table</span>
          </p>
        )}
      </div>

      {/* ── Comprehensive Capability & Permissions Matrix Table (Rendered on Button Click) ── */}
      {showMatrix && (
        <div className="relative rounded-2xl bg-gradient-to-b from-[#0b1228]/95 via-[#070c1b]/95 to-[#040814]/98 border border-cyan-500/20 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.08)] overflow-hidden backdrop-blur-xl animate-fade-in">
        {/* Top glowing cyber accent laser */}
        <div className="h-0.5 w-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />

        {/* Ambient interior corner glow */}
        <div className="absolute top-0 right-0 w-64 h-48 bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-48 bg-cyan-500/5 blur-3xl pointer-events-none" />

        {/* Table Header / Title Bar */}
        <div className="py-3.5 px-5 sm:px-6 border-b border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
              </span>
              <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400">
                ZERO-TRUST RBAC MATRIX
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold font-display text-white tracking-tight flex items-center gap-1.5">
              <span>Role-Based Access Control</span>
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent font-extrabold">
                (RBAC)
              </span>
              <span>Permissions Matrix</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Granular institutional authorization across modules, investigation workflows, and compliance
            </p>
          </div>

          {/* Compact Legend Badges */}
          <div className="flex items-center gap-2 text-[10px] font-mono self-start sm:self-center p-1.5 rounded-xl bg-white/[0.03] border border-white/10 shrink-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Full Access
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Read-Only
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.03] text-slate-400 border border-white/5 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600" /> Restricted
            </span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="py-2.5 px-5 font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold w-[34%]">
                  Platform Capability / Action
                </th>
                <th className="py-2.5 px-3 text-center w-[16.5%] bg-blue-500/[0.02]">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-display font-semibold text-[11px]">
                    <Activity className="h-3 w-3 text-blue-400" />
                    <span>Fraud Analyst</span>
                  </div>
                  <div className="text-[9px] text-blue-400/80 font-mono mt-0.5">Tier 1 · SLA Triage</div>
                </th>
                <th className="py-2.5 px-3 text-center w-[16.5%] bg-teal-500/[0.02]">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 font-display font-semibold text-[11px]">
                    <Network className="h-3 w-3 text-teal-400" />
                    <span>Investigator</span>
                  </div>
                  <div className="text-[9px] text-teal-400/80 font-mono mt-0.5">Tier 2 · Mule Graph</div>
                </th>
                <th className="py-2.5 px-3 text-center w-[16.5%] bg-purple-500/[0.02]">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-display font-semibold text-[11px]">
                    <BarChart3 className="h-3 w-3 text-purple-400" />
                    <span>Risk Manager</span>
                  </div>
                  <div className="text-[9px] text-purple-400/80 font-mono mt-0.5">Tier 3 · Policy & ML</div>
                </th>
                <th className="py-2.5 px-3 text-center w-[16.5%] bg-amber-500/[0.02]">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-display font-semibold text-[11px]">
                    <ShieldCheck className="h-3 w-3 text-amber-400" />
                    <span>Administrator</span>
                  </div>
                  <div className="text-[9px] text-amber-400/80 font-mono mt-0.5">Tier 4 · Superuser</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] font-sans">
              {ROLE_MATRIX.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-cyan-500/[0.03] transition-colors group border-l-2 border-l-transparent hover:border-l-cyan-400"
                >
                  <td className="py-2.5 px-5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-xs sm:text-[13px] group-hover:text-cyan-200 transition-colors">
                        {row.feature}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-cyan-300 border border-cyan-500/20 font-medium">
                        {row.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug max-w-xl">
                      {row.desc}
                    </p>
                  </td>
                  <td className="py-2 px-3 text-center align-middle bg-blue-500/[0.01] group-hover:bg-blue-500/[0.02]">
                    <PermissionBadge status={row.analyst} />
                  </td>
                  <td className="py-2 px-3 text-center align-middle bg-teal-500/[0.01] group-hover:bg-teal-500/[0.02]">
                    <PermissionBadge status={row.investigator} />
                  </td>
                  <td className="py-2 px-3 text-center align-middle bg-purple-500/[0.01] group-hover:bg-purple-500/[0.02]">
                    <PermissionBadge status={row.manager} />
                  </td>
                  <td className="py-2 px-3 text-center align-middle bg-amber-500/[0.01] group-hover:bg-amber-500/[0.02]">
                    <PermissionBadge status={row.admin} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compact Table Footer */}
        <div className="py-2.5 px-5 sm:px-6 bg-black/20 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono relative z-10">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span>
              <strong className="text-cyan-300 font-semibold">FastAPI Enterprise Gateway</strong> validates active JWT role claims.
            </span>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/40 text-cyan-300 hover:text-white font-medium transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)] shrink-0 text-xs"
          >
            <span>Credentials Console</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    )}
  </section>
);
}
