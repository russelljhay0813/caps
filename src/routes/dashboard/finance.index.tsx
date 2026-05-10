import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/StatCard";
import { DollarSign, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard/finance/")({
  component: FinanceDashboard,
});

function FinanceDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">Finance Dashboard</h1>
        <p className="text-sm text-muted-foreground">Financial overview and payment management</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Collected", value: "₱32.1M", icon: DollarSign, trend: { value: "92% of target", positive: true } },
          { title: "Pending Payments", value: "₱4.8M", icon: CreditCard, subtitle: "486 students" },
          { title: "Overdue Accounts", value: "127", icon: AlertTriangle, trend: { value: "15 more this month", positive: false } },
          { title: "Clearances Issued", value: "1,842", icon: CheckCircle, subtitle: "This semester" },
        ].map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-heading text-sm font-semibold text-card-foreground">Recent Transactions</h2>
          <div className="mt-4 space-y-3">
            {[
              { student: "Juan Dela Cruz", amount: "₱12,500", method: "PayMongo", time: "10 min ago" },
              { student: "Maria Garcia", amount: "₱8,750", method: "Bank Transfer", time: "25 min ago" },
              { student: "Pedro Reyes", amount: "₱15,000", method: "Cash", time: "1 hr ago" },
              { student: "Ana Santos", amount: "₱10,200", method: "PayMongo", time: "2 hrs ago" },
            ].map((t) => (
              <div key={t.student} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <div>
                  <span className="text-sm font-medium text-foreground">{t.student}</span>
                  <span className="block text-[10px] text-muted-foreground">{t.method} · {t.time}</span>
                </div>
                <span className="font-heading text-sm font-bold text-success">{t.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-heading text-sm font-semibold text-card-foreground">Collection by Program</h2>
          <div className="mt-4 space-y-3">
            {[
              { program: "BS Computer Science", collected: "₱8.2M", target: "₱9.0M", pct: 91 },
              { program: "BS Information Technology", collected: "₱7.1M", target: "₱7.5M", pct: 95 },
              { program: "BS Business Administration", collected: "₱6.5M", target: "₱7.0M", pct: 93 },
              { program: "BS Accountancy", collected: "₱5.8M", target: "₱6.2M", pct: 94 },
            ].map((p) => (
              <div key={p.program} className="rounded-lg bg-muted/50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{p.program}</span>
                  <span className="text-xs text-muted-foreground">{p.collected} / {p.target}</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                  <div className="h-1.5 rounded-full bg-accent" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
