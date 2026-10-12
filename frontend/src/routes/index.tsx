import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Network,
  Cpu,
  MessageSquare,
  Radio,
  ChevronRight,
  Sparkles,
  Lock,
  Zap,
  FileSpreadsheet,
  LogOut,
} from "lucide-react";
import { HolographicShield } from "../components/HolographicShield";
import { LiveThreatStream } from "../components/LiveThreatStream";
import { ThemeToggle } from "../components/ThemeToggle";
import { FraudShieldEmblem } from "../components/FraudShieldLogo";
import { OperationalDesksSection } from "../components/OperationalDesksSection";
import { CyberBackground3D } from "../components/CyberBackground3D";
import { getRole, ROLE_HOME, type Role } from "../lib/auth";
import { TransactionSimulatorModal } from "../components/TransactionSimulatorModal";
import { CSVUploadModal } from "../components/CSVUploadModal";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [isCSVUploadOpen, setIsCSVUploadOpen] = useState(false);

  useEffect(() => {
    setActiveRole(getRole());
  }, []);

  const defaultConsolePath = activeRole ? ROLE_HOME[activeRole] : "/login";

  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* ── 3D Interactive Cyber Perspective Horizon & Particle Animation ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <CyberBackground3D />
      </div>

      {/* ── Background Cyber Glows ── */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-[-100px] w-[500px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-blue-700/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* ── Header Navbar Ribbon ── */}
      <header className="sticky top-0 z-50 bg-[#040814]/75 backdrop-blur-2xl border-b border-cyan-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_1px_0_rgba(6,182,212,0.15)] transition-all">
        {/* Top laser hairline glow */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="relative p-2 rounded-xl bg-gradient-to-b from-cyan-950/70 to-[#040814] border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] group-hover:scale-105 group-hover:border-cyan-400/70 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] transition-all flex items-center justify-center">
              <FraudShieldEmblem size={28} />
              <div className="absolute inset-0 rounded-xl bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5 leading-none">
                <span className="font-display font-black text-xl text-white tracking-tight">
                  RAK<span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">SHAK</span>
                </span>
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/35 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                  ENTERPRISE
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider mt-1 flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-cyan-400" />
                UPI Risk Intelligence Platform
              </span>
            </div>
          </Link>

          {/* Center Navigation Capsule */}
          <nav className="hidden md:flex items-center p-1.5 rounded-full bg-[#080e22]/80 border border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6),0_4px_16px_rgba(0,0,0,0.4)] backdrop-blur-md text-xs font-medium">
            <Link
              to="/"
              className="px-4 py-1.5 rounded-full bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
            >
              Home
            </Link>
            <a
              href="#threats"
              className="px-4 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              Threat Feed
            </a>
            <a
              href="#features"
              className="px-4 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              Features
            </a>
            <a
              href="#how"
              className="px-4 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              About
            </a>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {/* System Online Telemetry Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/35 text-emerald-400 text-xs font-mono font-medium shadow-[0_0_14px_rgba(16,185,129,0.18)] backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
              </span>
              <span className="tracking-wide">System Online</span>
            </div>

            {/* Theme Toggle */}
            <div className="p-1 rounded-full bg-slate-900/60 border border-white/10 hover:border-cyan-500/30 transition-all">
              <ThemeToggle />
            </div>

            {/* Simulate Transaction Button */}
            <button
              type="button"
              onClick={() => setIsSimulateOpen(true)}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 text-cyan-200 animate-pulse" />
              <span>Simulate Transaction</span>
            </button>

            {/* Login / Workspace Button */}
            <Link
              to={defaultConsolePath}
              className="px-4 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 text-slate-200 hover:text-white text-xs font-medium transition-all shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            >
              {activeRole ? "Workspace" : "Login"}
            </Link>

            {/* Get Started Button */}
            <Link
              to={defaultConsolePath}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:via-sky-300 hover:to-blue-400 text-slate-950 text-xs font-bold shadow-[0_0_18px_rgba(56,189,248,0.45)] hover:shadow-[0_0_26px_rgba(56,189,248,0.7)] transition-all hover:scale-105 active:scale-[0.98] flex items-center gap-1.5"
            >
              <span>{activeRole ? "Open Console" : "Get Started"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* Logout button if session active */}
            {activeRole && (
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.localStorage.removeItem("fs_role");
                    window.sessionStorage.removeItem("fs_role");
                    window.sessionStorage.removeItem("fs_selected_desk");
                    window.location.href = "/login";
                  }
                }}
                className="px-3.5 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-2xs"
                title="Log out of current workspace"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* ── Main Hero Section (Two-Column Split) ── */}
      <section className="relative z-10 pt-16 pb-12 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-6 text-left">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/70 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono font-semibold tracking-wider uppercase mb-6 shadow-sm">
              UPI Risk Intelligence Platform
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-bold text-white tracking-tight leading-[1.08] font-display">
              See the Scam
              <br />
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Before It Spreads.
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              RAKSHAK uses AI, graph intelligence and real-time analytics to detect, investigate
              and stop UPI fraud — before it reaches more people.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setIsSimulateOpen(true)}
                className="inline-flex items-center gap-2 border border-cyan-400/40 bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 hover:text-white font-bold rounded-full px-6 py-3 text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-105 active:scale-[0.98] cursor-pointer"
              >
                <Zap className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span>⚡ Simulate Live Transaction</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCSVUploadOpen(true)}
                className="inline-flex items-center gap-2 border border-violet-400/40 bg-violet-950/60 hover:bg-violet-900/70 text-violet-300 hover:text-white font-bold rounded-full px-6 py-3 text-sm shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:scale-105 active:scale-[0.98] cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 text-violet-400" />
                <span>📄 Upload CSV Batch</span>
              </button>

              <Link
                to={defaultConsolePath}
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-bold rounded-full px-6 py-3 text-sm shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all hover:scale-105 active:scale-[0.98]"
              >
                <span>{activeRole ? "Enter Console" : "Open Console"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: 3D Holographic Animated Shield with Particle Matrix and Floating Callouts */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <HolographicShield />
          </div>
        </div>
      </section>

      {/* ── Dynamic Live Threat Stream Ticker Bar ── */}
      <LiveThreatStream />

      {/* ── SECTION 2: 4 Specialized Operational Desks (PAGE 2 FOLD) ── */}
      <OperationalDesksSection id="roles" />

      {/* ── SECTION 3: ML Intelligence & Multi-Layered Defense (ML WALE KO NICHE) ── */}
      <section id="features" className="relative z-10 py-20 px-6 max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
            Multi-Layered{" "}
            <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
              Defense
            </span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed">
            Combining multiple intelligence layers for comprehensive fraud detection and faster response.
          </p>
        </div>

        {/* 4-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: ML Engine */}
          <Link
            to={activeRole ? "/analytics" : "/login"}
            search={activeRole ? undefined : ({ role: "risk_manager", redirect: "/analytics" } as any)}
            className="relative overflow-hidden bg-[#0c1427]/75 backdrop-blur-md rounded-2xl border border-white/[0.08] p-6 flex flex-col justify-between transition-all duration-300 group animate-[float-card-1_5s_ease-in-out_infinite] hover:[animation-play-state:paused] hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-[0_12px_35px_rgba(59,130,246,0.25)] cursor-pointer text-left block"
          >
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300">
                  <Cpu className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono text-blue-400/90 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Lock className="h-2.5 w-2.5" />
                  <span>{activeRole ? "Active Session" : "Secure Login"}</span>
                </span>
              </div>
              <h3 className="font-display font-bold text-base text-white group-hover:text-blue-300 transition-colors">
                ML Engine
              </h3>
              <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                Advanced machine learning models detect suspicious patterns in real-time with high accuracy.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-slate-400 group-hover:text-blue-300 transition-colors">
                {activeRole ? "Launch Analytics →" : "Authenticate & Enter →"}
              </span>
              <div className="h-8 w-8 rounded-full bg-white/[0.04] border border-white/10 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 flex items-center justify-center text-slate-400 group-hover:text-blue-300 transition-colors">
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          </Link>

          {/* Card 2: Graph Intelligence */}
          <Link
            to={activeRole ? "/graph" : "/login"}
            search={activeRole ? undefined : ({ role: "investigator", redirect: "/graph" } as any)}
            className="relative overflow-hidden bg-[#0c1427]/75 backdrop-blur-md rounded-2xl border border-white/[0.08] p-6 flex flex-col justify-between transition-all duration-300 group animate-[float-card-2_5.8s_ease-in-out_infinite] hover:[animation-play-state:paused] hover:-translate-y-2 hover:border-teal-500/50 hover:shadow-[0_12px_35px_rgba(20,184,166,0.25)] cursor-pointer text-left block"
          >
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400/60 to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all duration-300">
                  <Network className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono text-teal-400/90 bg-teal-950/60 border border-teal-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Lock className="h-2.5 w-2.5" />
                  <span>{activeRole ? "Active Session" : "Secure Login"}</span>
                </span>
              </div>
              <h3 className="font-display font-bold text-base text-white group-hover:text-teal-300 transition-colors">
                Graph Intelligence
              </h3>
              <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                Uncover hidden connections, mule accounts and fraud rings across the network.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-slate-400 group-hover:text-teal-300 transition-colors">
                {activeRole ? "Launch Graph →" : "Authenticate & Enter →"}
              </span>
              <div className="h-8 w-8 rounded-full bg-white/[0.04] border border-white/10 group-hover:bg-teal-500/20 group-hover:border-teal-500/30 flex items-center justify-center text-slate-400 group-hover:text-teal-300 transition-colors">
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          </Link>

          {/* Card 3: Copilot */}
          <Link
            to={activeRole ? "/investigate" : "/login"}
            search={activeRole ? undefined : ({ role: "investigator", redirect: "/investigate" } as any)}
            className="relative overflow-hidden bg-[#0c1427]/75 backdrop-blur-md rounded-2xl border border-white/[0.08] p-6 flex flex-col justify-between transition-all duration-300 group animate-[float-card-3_5.2s_ease-in-out_infinite] hover:[animation-play-state:paused] hover:-translate-y-2 hover:border-purple-500/50 hover:shadow-[0_12px_35px_rgba(168,85,247,0.25)] cursor-pointer text-left block"
          >
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400/60 to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:translate-x-0.5 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono text-purple-400/90 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Lock className="h-2.5 w-2.5" />
                  <span>{activeRole ? "Active Session" : "Secure Login"}</span>
                </span>
              </div>
              <h3 className="font-display font-bold text-base text-white group-hover:text-purple-300 transition-colors">
                Copilot
              </h3>
              <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                AI-powered assistant for faster investigation, insights and case resolution.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-slate-400 group-hover:text-purple-300 transition-colors">
                {activeRole ? "Launch Copilot →" : "Authenticate & Enter →"}
              </span>
              <div className="h-8 w-8 rounded-full bg-white/[0.04] border border-white/10 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 flex items-center justify-center text-slate-400 group-hover:text-purple-300 transition-colors">
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          </Link>

          {/* Card 4: Anomaly Radar */}
          <Link
            to={activeRole ? "/dashboard" : "/login"}
            search={activeRole ? undefined : ({ role: "fraud_analyst", redirect: "/dashboard" } as any)}
            className="relative overflow-hidden bg-[#0c1427]/75 backdrop-blur-md rounded-2xl border border-white/[0.08] p-6 flex flex-col justify-between transition-all duration-300 group animate-[float-card-4_6.2s_ease-in-out_infinite] hover:[animation-play-state:paused] hover:-translate-y-2 hover:border-amber-500/50 hover:shadow-[0_12px_35px_rgba(245,158,11,0.25)] cursor-pointer text-left block"
          >
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300">
                  <Radio className="h-6 w-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-mono text-amber-400/90 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Lock className="h-2.5 w-2.5" />
                  <span>{activeRole ? "Active Session" : "Secure Login"}</span>
                </span>
              </div>
              <h3 className="font-display font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                Anomaly Radar
              </h3>
              <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                Real-time monitoring of unusual transaction patterns and behavioral changes.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-slate-400 group-hover:text-amber-300 transition-colors">
                {activeRole ? "Launch Radar →" : "Authenticate & Enter →"}
              </span>
              <div className="h-8 w-8 rounded-full bg-white/[0.04] border border-white/10 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 flex items-center justify-center text-slate-400 group-hover:text-amber-300 transition-colors">
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Architectural Pipeline Overview (`#how`) ── */}
      <section id="how" className="relative z-10 py-24 px-6 max-w-7xl mx-auto w-full border-t border-white/[0.08]">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-64 bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-cyan-300 text-[11px] font-mono font-semibold tracking-wider uppercase mb-4 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span>END-TO-END INGRESS · 3-STAGE PIPELINE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight leading-tight">
            How Transactions Are{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(56,189,248,0.35)]">
              Evaluated
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
            From UPI PIN authorization to core settlement, every transaction passes through continuous intelligence layers.
          </p>
        </div>

        {/* 3 Interactive Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Card 1 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0c152e]/90 via-[#080e22]/90 to-[#050917]/95 border border-cyan-500/25 hover:border-cyan-400/60 p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_15px_35px_-10px_rgba(6,182,212,0.25)] group backdrop-blur-xl">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="h-11 w-11 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 flex items-center justify-center font-mono font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:scale-110 transition-transform">
                  01
                </div>
                <span className="text-[10px] font-mono font-semibold tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                  LATENCY &lt; 50ms
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
                Sub-50ms Ingress
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Streams ingest high-concurrency payment payloads from bank switches, extracting device, velocity, and VPA behavioral telemetry.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-cyan-400/80">
              <span>Switch Telemetry Ingress</span>
              <span className="text-emerald-400">● 5,000+ Txn/s</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0c152e]/90 via-[#080e22]/90 to-[#050917]/95 border border-indigo-500/25 hover:border-indigo-400/60 p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_15px_35px_-10px_rgba(99,102,241,0.25)] group backdrop-blur-xl">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="h-11 w-11 rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 flex items-center justify-center font-mono font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.25)] group-hover:scale-110 transition-transform">
                  02
                </div>
                <span className="text-[10px] font-mono font-semibold tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
                  GRAPH + ML CORE
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">
                Ensemble ML & Graph
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tree-based models and graph traversals identify synthetic identities, cycling fund paths, and coordinated fraud syndicates.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-indigo-400/80">
              <span>Mule Community Detection</span>
              <span className="text-indigo-300">● Louvain Depth 3</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0c152e]/90 via-[#080e22]/90 to-[#050917]/95 border border-emerald-500/25 hover:border-emerald-400/60 p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_15px_35px_-10px_rgba(16,185,129,0.25)] group backdrop-blur-xl">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="h-11 w-11 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center font-mono font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.25)] group-hover:scale-110 transition-transform">
                  03
                </div>
                <span className="text-[10px] font-mono font-semibold tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                  REGULATORY READY
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-white group-hover:text-emerald-300 transition-colors">
                Automated SAR Filing
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Flagged operations are triaged to analyst queues with pre-generated Suspicious Activity Reports (SAR) for FIU compliance.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-emerald-400/80">
              <span>FIU-IND Suspicious Activity</span>
              <span className="text-emerald-300">● 1-Click SAR</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-10 py-20 px-6 max-w-6xl mx-auto w-full text-center">
        <div className="relative rounded-3xl bg-gradient-to-b from-[#0b1328]/95 via-[#080d1e]/98 to-[#040713]/99 p-10 sm:p-14 lg:p-16 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(6,182,212,0.12)] overflow-hidden backdrop-blur-2xl">
          {/* Ambient inner neon glows */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-semibold mb-6 shadow-[0_0_20px_rgba(6,182,212,0.25)] tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>INSTITUTIONAL SANDBOX · ZERO-RISK OPERATOR SIMULATION</span>
          </div>

          {/* Main Headline */}
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Launch the RAKSHAK{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(56,189,248,0.45)]">
              Operations Workspace
            </span>
          </h2>

          <p className="mt-5 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Experience real-time UPI transaction scoring, graph syndicate detection, and AI case investigation in the sandbox.
          </p>

          {/* Feature Chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-300">
            <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Role-Based Zero Setup
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live Ingress Simulation
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              FIU-IND Compliance Ready
            </span>
          </div>

          {/* Primary CTA */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3">
            <Link
              to={defaultConsolePath}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold rounded-full px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all hover:scale-105 active:scale-[0.98] cursor-pointer group"
            >
              <span>{activeRole ? "Launch Platform Console" : "Access Platform Console"}</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <span className="text-[11px] font-mono text-slate-500">
              Encrypted FIPS 140-3 Hardware Token Session · Instant Role Selection
            </span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-8 px-6 bg-[#030610] text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-slate-400">
            <FraudShieldEmblem size={20} animated={false} />
            <span className="font-semibold text-slate-200">
              RAK<span className="text-cyan-400">SHAK</span>
            </span>
            <span>— UPI Risk Intelligence Platform</span>
          </div>
          <div>© {new Date().getFullYear()} All rights reserved. NPCI UPI 2.0 Ingress Specification.</div>
        </div>
      </footer>

      {/* ── Transaction Simulator Modal ── */}
      <TransactionSimulatorModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
      />

      {/* ── CSV Batch Upload Modal ── */}
      <CSVUploadModal
        isOpen={isCSVUploadOpen}
        onClose={() => setIsCSVUploadOpen(false)}
      />
    </div>
  );
}
