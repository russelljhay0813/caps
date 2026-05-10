import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, FileText } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard/registrar/records")({
  component: RegistrarRecords,
});

const MOCK_RECORDS = [
  { id: "2021-00145", name: "Juan Dela Cruz", program: "BS Computer Science", yearLevel: "4th Year", gpa: "1.45", units: 142, status: "Regular" },
  { id: "2020-00892", name: "Maria Garcia", program: "BS Information Technology", yearLevel: "4th Year", gpa: "1.62", units: 138, status: "Regular" },
  { id: "2022-00334", name: "Pedro Reyes", program: "BS Accountancy", yearLevel: "3rd Year", gpa: "2.10", units: 96, status: "Irregular" },
  { id: "2021-00567", name: "Ana Santos", program: "BS Education", yearLevel: "4th Year", gpa: "1.38", units: 140, status: "Regular" },
  { id: "2023-00112", name: "Rico Mendoza", program: "BS Computer Science", yearLevel: "2nd Year", gpa: "1.75", units: 64, status: "Regular" },
  { id: "2023-00245", name: "Lara Tan", program: "BS Business Administration", yearLevel: "2nd Year", gpa: "1.90", units: 60, status: "Regular" },
];

function RegistrarRecords() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_RECORDS.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">Student Records</h1>
        <p className="text-sm text-muted-foreground">View and manage student academic records</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or student ID..."
          className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student ID</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Program</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Year</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">GPA</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Units</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
          </tr></thead>
          <tbody>
            {filtered.map((r, i) => (
              <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.program}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.yearLevel}</td>
                <td className="px-4 py-3 font-medium text-foreground">{r.gpa}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.units}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.status === "Regular" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{r.status}</span>
                </td>
              </motion.tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No records found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
