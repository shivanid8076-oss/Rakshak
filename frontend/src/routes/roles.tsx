import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { OperationalDesksSection } from "@/components/OperationalDesksSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FraudShieldEmblem } from "@/components/FraudShieldLogo";

export const Route = createFileRoute("/roles")({
  head: () => ({ meta: [{ title: "4 Operational Desks & RBAC — RAKSHAK" }] }),
  component: RolesPage,
});

function RolesPage() {
  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* ── Background Cyber Glows ── */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-[-100px] w-[500px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-blue-700/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ── Header Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#040814]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative p-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.25)] group-hover:scale-105 group-hover:border-cyan-400/60 transition-all flex items-center justify-center">
              <FraudShieldEmblem size={28} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 leading-none">
                <span className="font-display font-extrabold text-lg text-white tracking-tight">
                  RAK<span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">SHAK</span>
                </span>
                <span className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                  RBAC
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 tracking-tight mt-0.5">
                Institutional Access Tiers
              </span>
            </div>
          </Link>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-xs font-mono transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
            <ThemeToggle />
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-slate-950 font-bold px-4 py-2 rounded-full text-xs shadow-[0_0_15px_rgba(56,189,248,0.35)] transition-all"
            >
              <span>Sign In</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Roles Section ── */}
      <main className="flex-1">
        <OperationalDesksSection id="roles-page" isStandalonePage={true} />
      </main>

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
    </div>
  );
}
