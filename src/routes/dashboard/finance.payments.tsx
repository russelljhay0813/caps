import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Search, CheckCircle, Clock, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/finance/payments")({
  component: FinancePayments,
});

const MOCK_PAYMENTS = [
  { id: "PAY-001", student: "Juan Dela Cruz", amount: 12500, method: "PayMongo", date: "May 5, 2026", status: "Completed" },
  { id: "PAY-002", student: "Maria Garcia", amount: 8750, method: "Bank Transfer", date: "May 4, 2026", status: "Completed" },
  { id: "PAY-003", student: "Pedro Reyes", amount: 15000, method: "Cash", date: "May 3, 2026", status: "Completed" },
  { id: "PAY-004", student: "Ana Santos", amount: 10200, method: "PayMongo", date: "May 3, 2026", status: "Completed" },
  { id: "PAY-005", student: "Rico Mendoza", amount: 5000, method: "PayMongo", date: "May 2, 2026", status: "Pending" },
  { id: "PAY-006", student: "Lara Tan", amount: 20000, method: "Bank Transfer", date: "May 1, 2026", status: "Failed" },
];

function FinancePayments() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_PAYMENTS.filter((p) =>
    p.student.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n: number) => `₱${n.toLocaleString()}`;
  const statusIcon = (s: string) => s === "Completed" ? <CheckCircle className="h-3.5 w-3.5 text-success" /> : s === "Failed" ? <XCircle className="h-3.5 w-3.5 text-destructive" /> : <Clock className="h-3.5 w-3.5 text-warning" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground">Track and manage all payment transactions</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search payments..."
          className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
      </div>

      <div className="space-y-2">
        {filtered.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between rounded-xl border bg-card px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{p.student}</p>
                <p className="text-xs text-muted-foreground">{p.id} · {p.method}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-heading text-sm font-bold text-foreground">{fmt(p.amount)}</span>
              <span className="text-[10px] text-muted-foreground">{p.date}</span>
              <div className="flex items-center gap-1">{statusIcon(p.status)}<span className="text-xs font-medium">{p.status}</span></div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No payments found</p>}
      </div>
    </div>
  );
}
