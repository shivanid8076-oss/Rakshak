import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  Shield,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Activity,
  Network,
  BarChart3,
  ShieldCheck,
  Check,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getRole, setRole, ROLE_HOME, type Role } from "@/lib/auth";
import { CyberShieldBackground } from "@/components/CyberShieldBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FraudShieldEmblem } from "@/components/FraudShieldLogo";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { role?: Role; redirect?: string } => {
    const r = search?.role as string;
    const redirect = search?.redirect as string;
    const res: { role?: Role; redirect?: string } = {};
    if (r && ["admin", "risk_manager", "fraud_analyst", "investigator"].includes(r)) {
      res.role = r as Role;
    }
    if (redirect && typeof redirect === "string") {
      res.redirect = redirect;
    }
    return res;
  },
  component: Login,
});

interface RoleOption {
  id: Role;
  title: string;
  subtitle: string;
  badge: string;
  email: string;
  passkey: string;
  destination: string;
  icon: typeof Shield;
}

const ROLE_OPTIONS: Record<Role, RoleOption> = {
  fraud_analyst: {
    id: "fraud_analyst",
    title: "Fraud Analyst",
    subtitle: "Live Alert & Queue Triage",
    badge: "Operations Level 1",
    email: "analyst@rakshak.io",
    passkey: "analyst-token-2026",
    destination: "/dashboard",
    icon: Activity,
  },
  investigator: {
    id: "investigator",
    title: "Investigator",
    subtitle: "Graph & Mule Ring Tracing",
    badge: "Intelligence Level 2",
    email: "investigator@rakshak.io",
    passkey: "investigator-token-2026",
    destination: "/graph",
    icon: Network,
  },
  risk_manager: {
    id: "risk_manager",
    title: "Risk Manager",
    subtitle: "Loss Trends & Policy Models",
    badge: "Analytics Level 3",
    email: "risk.manager@rakshak.io",
    passkey: "risk-token-2026",
    destination: "/analytics",
    icon: BarChart3,
  },
  admin: {
    id: "admin",
    title: "Administrator",
    subtitle: "System Governance & Audit",
    badge: "Superuser Level 4",
    email: "admin@rakshak.io",
    passkey: "admin-token-2026",
    destination: "/admin",
    icon: ShieldCheck,
  },
};

const ROLES: Role[] = ["fraud_analyst", "investigator", "risk_manager", "admin"];

function Login() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  const getInitialRole = (): Role => {
    if (search?.role && ROLES.includes(search.role)) {
      return search.role;
    }
    if (typeof window !== "undefined") {
      const fromSession = window.sessionStorage.getItem("fs_selected_desk") as Role;
      if (fromSession && ROLES.includes(fromSession)) {
        return fromSession;
      }
      const params = new URLSearchParams(window.location.search);
      const r = params.get("role") as Role;
      if (r && ROLES.includes(r)) return r;
    }
    return "fraud_analyst";
  };

  const [selectedRole, setSelectedRole] = useState<Role>(getInitialRole);
  const [email, setEmail] = useState("");
  const [passkey, setPasskey] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authStatus, setAuthStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // If operator is already logged in, seamlessly forward to requested destination or active workspace
    const current = getRole();
    if (current) {
      const redirectParam =
        search?.redirect ||
        (typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect")
          : null);
      if (redirectParam && redirectParam.startsWith("/")) {
        navigate({ to: redirectParam });
        return;
      }
      if (search?.role && ROLES.includes(search.role as Role)) {
        const targetRole = search.role as Role;
        setRole(targetRole);
        navigate({ to: ROLE_HOME[targetRole] });
        return;
      }
      navigate({ to: ROLE_HOME[current] });
      return;
    }

    if (search?.role && ROLES.includes(search.role)) {
      setSelectedRole(search.role);
    } else if (typeof window !== "undefined") {
      const fromSession = window.sessionStorage.getItem("fs_selected_desk") as Role;
      if (fromSession && ROLES.includes(fromSession)) {
        setSelectedRole(fromSession);
      }
    }
  }, [search?.role, search?.redirect, navigate]);

  const isRoleRedirect =
    Boolean(search?.role) ||
    (typeof window !== "undefined" &&
      (Boolean(new URLSearchParams(window.location.search).get("role")) ||
        Boolean(window.sessionStorage.getItem("fs_selected_desk"))));

  const currentRole = ROLE_OPTIONS[selectedRole];

  // Handle role switch
  const handleSelectRole = (r: Role) => {
    setSelectedRole(r);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("fs_selected_desk", r);
    }
    setEmail("");
    setPasskey("");
    setErrorMessage("");
  };

  // Submit authentication
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !passkey.trim()) {
      setErrorMessage("Please enter both email and security passkey.");
      return;
    }

    setIsSubmitting(true);
    setAuthStatus("Verifying session credentials...");

    setTimeout(() => {
      setAuthStatus(`Authorizing ${currentRole.title} access...`);
      setTimeout(() => {
        setRole(selectedRole);
        const redirectParam = search?.redirect || (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null);
        if (redirectParam && redirectParam.startsWith("/")) {
          navigate({ to: redirectParam });
        } else {
          navigate({ to: ROLE_HOME[selectedRole] });
        }
      }, 350);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none selection:bg-blue-600/30 selection:text-blue-200">
      {/* ── Background: Interactive Mouse-Reactive Cyber Particle Constellation ── */}
      <CyberShieldBackground />

      {/* ── Top-right theme toggle button ── */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      {/* ── Top Header Brand ── */}
      <div className="relative z-10 mb-6 flex items-center justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all text-xs text-slate-300 group"
        >
          <div className="p-0.5 rounded-md bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
            <FraudShieldEmblem size={20} />
          </div>
          <span className="font-extrabold text-white font-display tracking-tight">
            RAK<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">SHAK</span>
          </span>
          <span className="text-[10px] text-cyan-400 font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/20">
            Console
          </span>
        </Link>
      </div>

      {/* ── Focused Authentication Box ── */}
      <div className="w-full max-w-[480px] bg-[#0c1220]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 sm:p-7 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)] relative z-10 overflow-hidden">
        {/* Subtle Top Edge Highlight */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent pointer-events-none" />

        {/* Card Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold font-display text-white tracking-tight">
            Sign In to Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Select an authorized platform role and enter credentials to continue.
          </p>
        </div>

        {isRoleRedirect && (
          <div className="mb-5 p-3.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 flex items-start gap-2.5 text-xs text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Lock className="h-4 w-4 shrink-0 mt-0.5 text-cyan-400" />
            <div>
              <span className="font-semibold text-white block mb-0.5">Desk Access Locked</span>
              Institutional security protocol requires operator sign-in to enter the <strong className="text-cyan-300 font-bold">{currentRole.title}</strong> desk.
            </div>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          {/* ── 4 Roles Clean 2x2 Grid ── */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold text-slate-300">
                Authorized Role (4 Options)
              </label>
              <span className="text-[10px] text-blue-400 font-mono font-medium">
                {currentRole.badge}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {ROLES.map((roleKey) => {
                const role = ROLE_OPTIONS[roleKey];
                const isSelected = selectedRole === roleKey;
                const Icon = role.icon;

                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handleSelectRole(roleKey)}
                    disabled={isSubmitting}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-blue-600/15 border-blue-500/80 text-white shadow-xs"
                        : "bg-[#060a14] border-white/10 hover:border-white/20 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white/5 text-slate-400"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div
                        className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-slate-600 bg-transparent"
                        }`}
                      >
                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-white tracking-tight">
                        {role.title}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                        {role.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Input Fields ── */}
          <div className="space-y-3 pt-1">
            {/* Email Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Operator Email / User ID
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (email) {
                      setEmail("");
                    } else {
                      setEmail(currentRole.email);
                    }
                  }}
                  className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-mono cursor-pointer"
                >
                  {email ? "Clear Email" : "Use Demo Email"}
                </button>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                placeholder={`e.g. ${currentRole.email}`}
                className="w-full bg-[#060a14] border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all font-mono"
              />
            </div>

            {/* Security Passkey Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Security Passkey
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (passkey) {
                      setPasskey("");
                    } else {
                      setPasskey(currentRole.passkey);
                    }
                  }}
                  className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-mono cursor-pointer"
                >
                  {passkey ? "Clear Key" : "Use Demo Key"}
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <input
                  type={showPasskey ? "text" : "password"}
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Enter passkey"
                  className="w-full bg-[#060a14] border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 rounded-xl pl-9 pr-9 py-2.5 text-xs font-mono text-white placeholder-slate-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey(!showPasskey)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPasskey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200 cursor-pointer text-xs"
              >
                <div
                  className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                    rememberMe
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "border-slate-700 bg-[#060a14]"
                  }`}
                >
                  {rememberMe && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
                <span>Remember this session</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Route: {currentRole.destination}</span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {errorMessage}
            </div>
          )}

          {/* ── Submit Action Button ── */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-sm ${
              isSubmitting
                ? "bg-blue-600/50 text-white cursor-wait"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:scale-[0.99]"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="font-mono text-[11px]">{authStatus}</span>
              </>
            ) : (
              <>
                <span>Sign In as {currentRole.title}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setRole("fraud_analyst");
              navigate({ to: "/dashboard" });
            }}
            className="w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 active:scale-[0.99]"
          >
            <Zap className="h-3.5 w-3.5 text-emerald-200 animate-pulse" />
            <span>⚡ Instant Demo Access (Open Dashboard)</span>
          </button>

          {/* Security Compliance Footer */}
          <div className="pt-2 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5 border-t border-white/5">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>Encrypted Session · FIPS 140-3 Hardware Token Active</span>
          </div>
        </form>
      </div>

      {/* ── Public Homepage Return Link ── */}
      <div className="relative z-10 mt-6 text-center">
        <Link
          to="/"
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Return to Public Homepage
        </Link>
      </div>
    </div>
  );
}
