import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Search, Download, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard/registrar/transcripts")({
  component: RegistrarTranscripts,
});

const MOCK_REQUESTS = [
  { id: "TR-001", student: "Juan Dela Cruz", studentId: "2021-00145", type: "Official Transcript", status: "Ready", requestDate: "Apr 12, 2026", copies: 2 },
  { id: "TR-002", student: "Maria Garcia", studentId: "2020-00892", type: "Certificate of Grades", status: "Processing", requestDate: "Apr 13, 2026", copies: 1 },
  { id: "TR-003", student: "Pedro Reyes", studentId: "2022-00334", type: "Official Transcript", status: "Processing", requestDate: "Apr 14, 2026", copies: 3 },
  { id: "TR-004", student: "Ana Santos", studentId: "2021-00567", type: "Good Moral Certificate", status: "Ready", requestDate: "Apr 14, 2026", copies: 1 },
  { id: "TR-005", student: "Rico Mendoza", studentId: "2023-00112", type: "Certificate of Enrollment", status: "Processing", requestDate: "May 1, 2026", copies: 1 },
  { id: "TR-006", student: "Lara Tan", studentId: "2023-00245", type: "Official Transcript", status: "Ready", requestDate: "May 2, 2026", copies: 2 },
];

function RegistrarTranscripts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = MOCK_REQUESTS.filter((r) => {
    const matchSearch = r.student.toLowerCase().includes(search.toLowerCase()) || r.studentId.includes(search);
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">Transcripts & Certificates</h1>
        <p className="text-sm text-muted-foreground">Process document requests from students</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm text-center">
          <p className="font-heading text-2xl font-bold text-foreground">{MOCK_REQUESTS.length}</p>
          <p className="text-xs text-muted-foreground">Total Requests</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm text-center">
          <p className="font-heading text-2xl font-bold text-success">{MOCK_REQUESTS.filter((r) => r.status === "Ready").length}</p>
          <p className="text-xs text-muted-foreground">Ready for Release</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm text-center">
          <p className="font-heading text-2xl font-bold text-warning">{MOCK_REQUESTS.filter((r) => r.status === "Processing").length}</p>
          <p className="text-xs text-muted-foreground">Processing</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by student name or ID..."
            className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div className="flex gap-1">
          {["All", "Processing", "Ready"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between rounded-xl border bg-card px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{r.student} <span className="text-xs text-muted-foreground">({r.studentId})</span></p>
                <p className="text-xs text-muted-foreground">{r.type} · {r.copies} {r.copies > 1 ? "copies" : "copy"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground">{r.requestDate}</span>
              <div className="flex items-center gap-1">
                {r.status === "Ready" ? <CheckCircle className="h-3.5 w-3.5 text-success" /> : <Clock className="h-3.5 w-3.5 text-warning" />}
                <span className={`text-xs font-medium ${r.status === "Ready" ? "text-success" : "text-warning"}`}>{r.status}</span>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No transcript requests found</p>}
      </div>
    </div>
  );
}
