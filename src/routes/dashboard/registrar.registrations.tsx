import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle, XCircle, Clock, UserPlus } from "lucide-react";
import {
  getRegistrations,
  approveRegistration,
  rejectRegistration,
  REGISTRATIONS_EVENT,
  type StudentRegistration,
} from "@/lib/registrations-store";

export const Route = createFileRoute("/dashboard/registrar/registrations")({
  component: RegistrarRegistrations,
});

function RegistrarRegistrations() {
  const [list, setList] = useState<StudentRegistration[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "pending" | "approved" | "rejected">("pending");

  const refresh = () => setList(getRegistrations());

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(REGISTRATIONS_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(REGISTRATIONS_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const filtered = list.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.program.toLowerCase().includes(q);
    const matchStatus = filter === "All" || r.status === filter;
    return matchSearch && matchStatus;
  });

  const counts = {
    pending: list.filter((r) => r.status === "pending").length,
    approved: list.filter((r) => r.status === "approved").length,
    rejected: list.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">Student Registrations</h1>
        <p className="text-sm text-muted-foreground">Review and approve incoming student registration applications</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Pending", count: counts.pending, color: "text-warning", icon: Clock },
          { label: "Approved", count: counts.approved, color: "text-success", icon: CheckCircle },
          { label: "Rejected", count: counts.rejected, color: "text-destructive", icon: XCircle },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className={`font-heading text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or program..."
            className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="flex gap-1">
          {(["All", "pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filter === s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-[240px]">
                <div className="flex items-center gap-2">
                  <p className="font-heading text-base font-semibold text-foreground">
                    {r.firstName} {r.lastName}
                  </p>
                  <StatusBadge status={r.status} />
                  {r.studentId && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{r.studentId}</span>}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.email} · {r.contactNumber}</p>
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  <Detail label="Program" value={r.program} />
                  <Detail label="Year Level" value={r.yearLevel} />
                  <Detail label="Address" value={r.address} />
                  <Detail label="Submitted" value={new Date(r.submittedAt).toLocaleString()} />
                </div>
              </div>
              {r.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => approveRegistration(r.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-success-foreground hover:opacity-90"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => {
                      const note = prompt("Reason for rejection (optional):") ?? undefined;
                      rejectRegistration(r.id, note || undefined);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
            {r.reviewNote && <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground"><span className="font-medium">Note:</span> {r.reviewNote}</p>}
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed bg-card p-10 text-center">
            <UserPlus className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No registrations found in this view</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-foreground">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: StudentRegistration["status"] }) {
  const cls =
    status === "approved" ? "bg-success/10 text-success" :
    status === "rejected" ? "bg-destructive/10 text-destructive" :
    "bg-warning/10 text-warning";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${cls}`}>{status}</span>;
}
