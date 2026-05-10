import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, AlertTriangle, FileCheck, RotateCcw, Search, Wallet } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  CLEARANCE_EVENT,
  getAccounts,
  getClearances,
  issueClearance,
  markAccountPaid,
  revokeClearance,
  type ClearanceRecord,
  type StudentAccount,
} from "@/lib/clearance-store";
import { StatCard } from "@/components/StatCard";

export const Route = createFileRoute("/dashboard/finance/clearance")({
  component: FinanceClearance,
});

const SEMESTER = "1st Sem AY 2025-2026";

function FinanceClearance() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<StudentAccount[]>([]);
  const [clearances, setClearances] = useState<ClearanceRecord[]>([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ kind: "success" | "error"; msg: string } | null>(null);

  const refresh = () => {
    setAccounts(getAccounts());
    setClearances(getClearances());
  };

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener(CLEARANCE_EVENT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(CLEARANCE_EVENT, h);
      window.removeEventListener("storage", h);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const issuedByStudent = useMemo(() => {
    const map = new Map<string, ClearanceRecord>();
    clearances
      .filter((c) => c.status === "issued" && c.semester === SEMESTER)
      .forEach((c) => map.set(c.studentId, c));
    return map;
  }, [clearances]);

  const filtered = accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase())
  );

  const eligibleCount = accounts.filter((a) => a.balance === 0).length;
  const issuedCount = clearances.filter((c) => c.status === "issued").length;
  const pendingCount = accounts.filter((a) => a.balance === 0 && !issuedByStudent.has(a.id)).length;

  const handleIssue = (a: StudentAccount) => {
    const res = issueClearance(a, {
      issuedBy: user?.name ?? "Finance Officer",
      semester: SEMESTER,
    });
    if (res.ok) {
      setToast({ kind: "success", msg: `Clearance ${res.record.referenceNumber} issued for ${a.name}` });
    } else {
      setToast({ kind: "error", msg: res.error });
    }
    refresh();
  };

  const handleMarkPaid = (a: StudentAccount) => {
    markAccountPaid(a.id);
    setToast({ kind: "success", msg: `${a.name}'s account marked fully paid.` });
    refresh();
  };

  const handleRevoke = (id: string) => {
    if (!confirm("Revoke this clearance? Student will no longer be cleared.")) return;
    revokeClearance(id);
    setToast({ kind: "success", msg: "Clearance revoked." });
    refresh();
  };

  const fmt = (n: number) => `₱${n.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground">Financial Clearance</h1>
          <p className="text-sm text-muted-foreground">
            Issue clearance certificates to students whose accounts are fully paid · {SEMESTER}
          </p>
        </div>
      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${
            toast.kind === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {toast.kind === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.msg}
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Fully Paid" value={eligibleCount} subtitle="Eligible accounts" icon={Wallet} />
        <StatCard title="Pending Issuance" value={pendingCount} subtitle="Awaiting clearance" icon={ShieldCheck} />
        <StatCard title="Cleared Students" value={issuedCount} subtitle="This semester" icon={FileCheck} />
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="font-heading text-sm font-bold text-foreground">Student Accounts</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-56 rounded-lg border bg-background py-1.5 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Student</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Program</th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Assessed</th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Balance</th>
              <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Clearance</th>
              <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => {
              const issued = issuedByStudent.get(a.id);
              const eligible = a.balance === 0;
              return (
                <motion.tr
                  key={a.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{a.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{a.id}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.program}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{fmt(a.assessed)}</td>
                  <td className={`px-4 py-3 text-right font-medium ${a.balance > 0 ? "text-destructive" : "text-success"}`}>
                    {fmt(a.balance)}
                  </td>
                  <td className="px-4 py-3">
                    {issued ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                        <ShieldCheck className="h-3 w-3" /> {issued.referenceNumber}
                      </span>
                    ) : eligible ? (
                      <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                        Ready to issue
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        Not eligible
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {issued ? (
                      <button
                        onClick={() => handleRevoke(issued.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                      >
                        <RotateCcw className="h-3 w-3" /> Revoke
                      </button>
                    ) : eligible ? (
                      <button
                        onClick={() => handleIssue(a)}
                        className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground hover:opacity-90"
                      >
                        <ShieldCheck className="h-3 w-3" /> Issue Clearance
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkPaid(a)}
                        className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </motion.tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No accounts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b px-5 py-3">
          <h2 className="font-heading text-sm font-bold text-foreground">Issued Clearances</h2>
          <p className="text-xs text-muted-foreground">Audit trail of all clearance certificates</p>
        </div>
        {clearances.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            No clearances issued yet. Issue one from the table above.
          </div>
        ) : (
          <div className="divide-y">
            {clearances.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      c.status === "issued" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <FileCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {c.studentName}{" "}
                      <span className="font-mono text-[10px] text-muted-foreground">({c.studentId})</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.referenceNumber} · {c.program} · {c.semester}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-xs font-medium text-foreground">{fmt(c.amountCleared)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(c.issuedAt).toLocaleDateString()} · {c.issuedBy}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      c.status === "issued"
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {c.status === "issued" ? "Active" : "Revoked"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
