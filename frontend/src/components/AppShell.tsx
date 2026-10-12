import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderOpen,
  Network,
  BarChart3,
  MessageSquare,
  Settings,
  Bell,
  User,
  UserCog,
  LogOut,
  ShieldCheck,
  X,
  Lock,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { getRole, clearRole, ROLE_LABELS, type Role } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";
import { FraudShieldEmblem } from "./FraudShieldLogo";

const ALL_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/cases", label: "Case Queue", icon: FolderOpen },
  { to: "/graph", label: "Mule Network Graph", icon: Network },
  { to: "/analytics", label: "Risk Analytics", icon: BarChart3 },
  { to: "/investigate", label: "Copilot Assistant", icon: MessageSquare },
  { to: "/admin", label: "User Access", icon: ShieldCheck },
  { to: "/settings", label: "System Config", icon: Settings },
] as const;

const ROLE_NAV: Record<Role, string[]> = {
  admin: ["/dashboard", "/cases", "/graph", "/analytics", "/investigate", "/admin", "/settings"],
  risk_manager: ["/dashboard", "/analytics", "/settings"],
  fraud_analyst: ["/dashboard", "/cases", "/investigate"],
  investigator: ["/dashboard", "/cases", "/graph", "/investigate"],
};

// ── Profile Modal ─────────────────────────────────────────────────────────────
function ProfileModal({ onClose, roleLabel }: { onClose: () => void; roleLabel: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white dark:bg-[#0f1422] text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">User Profile</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 flex items-center justify-center text-blue-600 dark:text-slate-300">
            <User className="h-6 w-6" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">Demo Analyst</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{roleLabel}</div>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-white/[0.02] p-3.5 rounded-xl border border-slate-200/80 dark:border-white/5">
          Active session initialized in demonstration sandbox mode. Role-based privileges are
          simulated locally.
        </p>
        <div className="flex justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main AppShell ─────────────────────────────────────────────────────────────
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [role, setRoleState] = useState<Role | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = getRole();
    if (!current) {
      navigate({ to: "/login" });
    } else {
      setRoleState(current);
    }
  }, [navigate]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const logout = () => {
    clearRole();
    navigate({ to: "/login" });
  };

  // Strictly block direct rendering if unauthenticated
  if (!role) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-6 text-slate-100 selection:bg-cyan-500/30">
        <div className="p-8 rounded-3xl bg-[#0c1427] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] text-center max-w-md w-full">
          <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-7 w-7 text-cyan-400 animate-pulse" />
          </div>
          <h2 className="text-lg font-bold font-display text-white mb-1.5">Authentication Required</h2>
          <p className="text-xs text-slate-400 font-mono mb-5 leading-relaxed">
            Direct access restricted. Please log in with your institutional operator credentials to access this workspace.
          </p>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-5">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse w-3/4" />
          </div>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-bold text-xs shadow-md transition-transform hover:scale-[1.02]"
          >
            <span>Proceed to Login</span>
          </Link>
        </div>
      </div>
    );
  }

  const allowed = ROLE_NAV[role];
  const nav = ALL_NAV.filter((n) => allowed.includes(n.to));
  const roleLabel = ROLE_LABELS[role];

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-[#090d16] text-slate-900 dark:text-slate-200 antialiased selection:bg-blue-600/30 selection:text-blue-200 transition-colors">
      {/* Modals */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} roleLabel={roleLabel} />}

      {/* Header */}
      <header className="h-14 border-b border-slate-200/90 dark:border-white/[0.08] bg-white/90 dark:bg-[#0c1220]/90 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 transition-all shadow-xs dark:shadow-md dark:shadow-black/20">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative p-1 rounded-xl bg-slate-900/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 shadow-sm shadow-cyan-500/10 group-hover:scale-105 group-hover:border-cyan-500/40 transition-all flex items-center justify-center">
            <FraudShieldEmblem size={24} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
              RAK<span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">SHAK</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              / UPI Operations
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <button className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-blue-500 rounded-full ring-2 ring-white dark:ring-[#0c1220]" />
          </button>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block" />
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 px-2.5 py-1.5 transition-colors"
            >
              <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 flex items-center justify-center text-blue-600 dark:text-slate-300">
                <User className="h-3.5 w-3.5" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-semibold text-xs text-slate-800 dark:text-white leading-tight">Demo user</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-tight">{roleLabel}</div>
              </div>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 w-52 bg-white/95 dark:bg-[#0f1422] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl py-1.5 z-40 backdrop-blur-md text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-white/5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  Signed in as <span className="font-semibold text-slate-800 dark:text-slate-200">{roleLabel}</span>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowProfile(true);
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white text-left transition-colors font-medium"
                >
                  <UserCog className="h-3.5 w-3.5 text-blue-500" /> My Profile
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-white/5" />
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-left transition-colors font-medium"
                >
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex">
        {/* Operations Navigation Sidebar */}
        <aside className="w-60 border-r border-slate-200/90 dark:border-white/[0.08] bg-white/90 dark:bg-[#0b101c]/95 min-h-[calc(100vh-3.5rem)] p-3.5 sticky top-14 self-start hidden md:flex flex-col justify-between backdrop-blur-md transition-colors">
          <div>
            {/* Section Header */}
            <div className="flex items-center justify-between px-3 py-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400">
                  Operations
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/20 font-semibold">
                ACTIVE
              </span>
            </div>

            {/* Nav Links */}
            <nav className="space-y-1">
              {nav.map((item) => {
                const active =
                  pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      active
                        ? "bg-blue-50 dark:bg-blue-600/15 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-500/30 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
                    )}
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        active
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Bottom Telemetry / Operational Health Box */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] mt-6">
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Core Rails
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">99.98%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-white/10 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[99.98%]" />
              </div>
              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 pt-0.5">
                Inference: 34ms · Mumbai-01
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "safe" | "review" | "block" | "default" | "primary";
}) {
  const styles = {
    safe: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    review: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    block: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
    primary: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
    default: "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10",
  }[variant];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-sans font-semibold tracking-wide border ${styles}`}
    >
      {children}
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white/90 dark:bg-[#0f1422] rounded-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-sm text-slate-900 dark:text-slate-100 backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

