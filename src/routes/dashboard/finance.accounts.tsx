import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Users } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard/finance/accounts")({
  component: FinanceAccounts,
});

const MOCK_ACCOUNTS = [
  { id: "2021-00145", name: "Juan Dela Cruz", program: "BSCS", assessed: 45000, paid: 32500, balance: 12500, status: "Partial" },
  { id: "2020-00892", name: "Maria Garcia", program: "BSIT", assessed: 42000, paid: 42000, balance: 0, status: "Cleared" },
  { id: "2022-00334", name: "Pedro Reyes", program: "BSA", assessed: 48000, paid: 15000, balance: 33000, status: "Overdue" },
  { id: "2021-00567", name: "Ana Santos", program: "BSEd", assessed: 38000, paid: 38000, balance: 0, status: "Cleared" },
  { id: "2023-00112", name: "Rico Mendoza", program: "BSCS", assessed: 45000, paid: 22500, balance: 22500, status: "Partial" },
  { id: "2023-00245", name: "Lara Tan", program: "BSBA", assessed: 40000, paid: 0, balance: 40000, status: "Overdue" },
];

function FinanceAccounts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = MOCK_ACCOUNTS.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search);
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const fmt = (n: number) => `₱${n.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">Student Accounts</h1>
        <p className="text-sm text-muted-foreground">View student financial accounts and balances</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or ID..."
            className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div className="flex gap-1">
          {["All", "Cleared", "Partial", "Overdue"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student ID</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Program</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Assessed</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Paid</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Balance</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
          </tr></thead>
          <tbody>
            {filtered.map((a, i) => (
              <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{a.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{a.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.program}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{fmt(a.assessed)}</td>
                <td className="px-4 py-3 text-right text-success font-medium">{fmt(a.paid)}</td>
                <td className="px-4 py-3 text-right font-medium text-foreground">{fmt(a.balance)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.status === "Cleared" ? "bg-success/10 text-success" : a.status === "Overdue" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>{a.status}</span>
                </td>
              </motion.tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No accounts found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
