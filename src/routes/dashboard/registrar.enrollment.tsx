import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, CheckCircle, Clock, XCircle } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard/registrar/enrollment")({
  component: RegistrarEnrollment,
});

const MOCK_ENROLLEES = [
  { id: "2025-00001", name: "Carlos Reyes", program: "BS Computer Science", status: "Pending", date: "May 1, 2026" },
  { id: "2025-00002", name: "Isabella Cruz", program: "BS Information Technology", status: "Approved", date: "May 2, 2026" },
  { id: "2025-00003", name: "Miguel Torres", program: "BS Business Administration", status: "Pending", date: "May 3, 2026" },
  { id: "2025-00004", name: "Sofia Navarro", program: "BS Education", status: "Approved", date: "May 3, 2026" },
  { id: "2025-00005", name: "Liam Garcia", program: "BS Accountancy", status: "Rejected", date: "May 4, 2026" },
  { id: "2025-00006", name: "Emma Flores", program: "BS Computer Science", status: "Pending", date: "May 5, 2026" },
];

function RegistrarEnrollment() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = MOCK_ENROLLEES.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.id.includes(search);
    const matchStatus = statusFilter === "All" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusIcon = (s: string) => s === "Approved" ? <CheckCircle className="h-3.5 w-3.5 text-success" /> : s === "Rejected" ? <XCircle className="h-3.5 w-3.5 text-destructive" /> : <Clock className="h-3.5 w-3.5 text-warning" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">Enrollment Management</h1>
        <p className="text-sm text-muted-foreground">Review and process student enrollment applications</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Pending", count: MOCK_ENROLLEES.filter((e) => e.status === "Pending").length, color: "text-warning" },
          { label: "Approved", count: MOCK_ENROLLEES.filter((e) => e.status === "Approved").length, color: "text-success" },
          { label: "Rejected", count: MOCK_ENROLLEES.filter((e) => e.status === "Rejected").length, color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4 shadow-sm text-center">
            <p className={`font-heading text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or ID..."
            className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div className="flex gap-1">
          {["All", "Pending", "Approved", "Rejected"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((e, i) => (
          <motion.div key={e.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between rounded-xl border bg-card px-5 py-4 shadow-sm">
            <div>
              <p className="text-sm font-medium text-foreground">{e.name}</p>
              <p className="text-xs text-muted-foreground">{e.id} · {e.program}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground">{e.date}</span>
              <div className="flex items-center gap-1">{statusIcon(e.status)}<span className="text-xs font-medium">{e.status}</span></div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No enrollment applications found</p>}
      </div>
    </div>
  );
}
