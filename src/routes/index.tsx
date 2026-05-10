import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth, type UserRole } from "@/lib/auth-context";
import { BookOpen, DollarSign, Shield, ClipboardList, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { findApprovedByEmail, getRegistrations } from "@/lib/registrations-store";
import bwestLogo from "@/assets/bwest-logo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BWEST College — Academic & Financial Management System" },
      { name: "description", content: "Secure role-based academic and financial management system for BWEST College." },
    ],
  }),
  component: LoginPage,
});

const roles: { role: UserRole; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { role: "faculty", label: "Faculty", desc: "Manage classes & attendance", icon: BookOpen },
  { role: "finance", label: "Finance Officer", desc: "Manage payments & accounts", icon: DollarSign },
  { role: "admin", label: "Administrator", desc: "System analytics & user management", icon: Shield },
  { role: "registrar", label: "Registrar", desc: "Records & registration approvals", icon: ClipboardList },
];

const roleDashboardPaths: Record<UserRole, string> = {
  student: "/dashboard/student",
  faculty: "/dashboard/faculty",
  finance: "/dashboard/finance",
  admin: "/dashboard/admin",
  registrar: "/dashboard/registrar",
};

function LoginPage() {
  const { login, loginAs, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate({ to: roleDashboardPaths[user.role] });
    }
  }, [isAuthenticated, user, navigate]);

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const reg = findApprovedByEmail(email, password);
    if (!reg) {
      const all = getRegistrations();
      const found = all.find((r) => r.email.toLowerCase() === email.trim().toLowerCase());
      if (found && found.status === "pending") setError("Your registration is still pending registrar approval.");
      else if (found && found.status === "rejected") setError("Your registration was rejected. Please contact the registrar.");
      else setError("Invalid email or password.");
      return;
    }
    loginAs({
      id: reg.id,
      name: `${reg.firstName} ${reg.lastName}`,
      email: reg.email,
      role: "student",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-2xl shadow-lg">
            <img src={bwestLogo} alt="BWEST College logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">BWEST College</h1>
          <p className="mt-1 text-sm text-muted-foreground">Academic & Financial Management System</p>
        </div>

        {/* Student login */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="font-heading text-sm font-semibold text-foreground">Student Login</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Sign in with your registered email and password</p>
          <form onSubmit={handleStudentLogin} className="mt-4 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
              <LogIn className="h-4 w-4" /> Sign In
            </button>
          </form>
          <div className="mt-3 text-center text-xs text-muted-foreground">
            New student?{" "}
            <Link to="/register" className="font-medium text-accent hover:underline">Create an account</Link>
          </div>
        </div>

        {/* Staff demo */}
        <div className="mt-6 rounded-2xl border bg-card p-6 shadow-sm">
          <p className="mb-3 text-center text-xs font-medium text-muted-foreground">Staff demo access — pick a role</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {roles.map((r, i) => (
              <motion.button
                key={r.role}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                onClick={() => login(r.role)}
                className="group flex items-center gap-3 rounded-xl border bg-background p-3 text-left transition-all hover:border-accent hover:bg-accent/5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <r.icon className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-heading text-xs font-semibold text-foreground">{r.label}</span>
                  <p className="text-[10px] text-muted-foreground">{r.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Students must be approved by the Registrar before logging in.
        </p>
      </motion.div>
    </div>
  );
}
