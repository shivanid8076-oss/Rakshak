import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell, Badge } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { getRole, ROLE_LABELS, type Role } from "@/lib/auth";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Lock,
  UserPlus,
} from "lucide-react";
import { CyberBackground3D } from "@/components/CyberBackground3D";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Access Governance — RAKSHAK" }] }),
  component: Admin,
});

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Suspended";
  lastLogin: string;
};

const SEED: UserRow[] = [
  {
    id: "u1",
    name: "A. Sharma",
    email: "a.sharma@bank.co.in",
    role: "admin",
    status: "Active",
    lastLogin: "Today 09:14",
  },
  {
    id: "u2",
    name: "P. Iyer",
    email: "p.iyer@bank.co.in",
    role: "risk_manager",
    status: "Active",
    lastLogin: "Today 08:02",
  },
  {
    id: "u3",
    name: "R. Verma",
    email: "r.verma@bank.co.in",
    role: "fraud_analyst",
    status: "Active",
    lastLogin: "Yesterday 22:41",
  },
  {
    id: "u4",
    name: "S. Nair",
    email: "s.nair@bank.co.in",
    role: "investigator",
    status: "Active",
    lastLogin: "Yesterday 19:20",
  },
  {
    id: "u5",
    name: "K. Rao",
    email: "k.rao@bank.co.in",
    role: "fraud_analyst",
    status: "Suspended",
    lastLogin: "Jun 28, 14:11",
  },
];

function Admin() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState<UserRow[]>(SEED);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "fraud_analyst" as Role,
    password: "",
  });

  useEffect(() => {
    const r = getRole();
    if (r !== "admin") {
      navigate({ to: "/login" });
      return;
    }
    setReady(true);
  }, [navigate]);

  if (!ready) return null;

  const addUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers((u) => [
      ...u,
      {
        id: `u${u.length + 1}`,
        name: form.name,
        email: form.email,
        role: form.role,
        status: "Active",
        lastLogin: "—",
      },
    ]);
    setForm({ name: "", email: "", role: "fraud_analyst", password: "" });
    setOpen(false);
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
                  <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    Access Governance & Operator RBAC
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Provision, audit, and revoke institutional security credentials for fraud desks and risk officers
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                DIRECTORY SECURE
              </span>
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Provision Operator
              </button>
            </div>
          </div>

          {/* User Directory Table Card */}
          <div className="rounded-2xl bg-white/90 dark:bg-gradient-to-b dark:from-[#0e1628] dark:to-[#0a0f1d] border border-slate-200 dark:border-white/[0.08] shadow-sm dark:shadow-xl dark:shadow-black/20 backdrop-blur-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h2 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm font-display">
                  Active Operator Directory
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                {users.length} registered operators
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead className="bg-slate-50/80 dark:bg-white/[0.02] text-[10px] uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-white/[0.04]">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold">User Identity</th>
                    <th className="px-5 py-3 text-left font-semibold">Institutional Email</th>
                    <th className="px-5 py-3 text-left font-semibold">Role</th>
                    <th className="px-5 py-3 text-left font-semibold">Status</th>
                    <th className="px-5 py-3 text-left font-semibold">Last Login</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 flex items-center justify-center text-blue-600 dark:text-slate-300">
                          <UserCheck className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold">{u.name}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant="primary">{ROLE_LABELS[u.role]}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {u.status === "Active" ? (
                          <Badge variant="safe">Active</Badge>
                        ) : (
                          <Badge variant="block">Suspended</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[11px] text-slate-500 dark:text-slate-400">{u.lastLogin}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                            title="Edit profile"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setUsers((list) => list.filter((x) => x.id !== u.id))}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                            title="Revoke access"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0f1422] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h2 className="font-bold text-slate-900 dark:text-white text-xs font-display">
                  Provision Operator Account
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={addUser} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                  Legal Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. S. Sen"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono shadow-inner"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                  Institutional Email
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="s.sen@bank.co.in"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono shadow-inner"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                  Security Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#090d16] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono shadow-inner"
                >
                  <option value="fraud_analyst">Fraud Analyst</option>
                  <option value="investigator">Investigator</option>
                  <option value="risk_manager">Risk Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                  Temporary Credential
                </label>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono shadow-inner"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

