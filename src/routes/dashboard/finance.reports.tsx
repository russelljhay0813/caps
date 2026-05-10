import { createFileRoute } from "@tanstack/react-router";
import { FileText, TrendingUp, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";

export const Route = createFileRoute("/dashboard/finance/reports")({
  component: FinanceReports,
});

const MONTHLY_DATA = [
  { month: "Jan", collected: 4200000 },
  { month: "Feb", collected: 5100000 },
  { month: "Mar", collected: 6300000 },
  { month: "Apr", collected: 8500000 },
  { month: "May", collected: 8000000 },
];

function FinanceReports() {
  const maxVal = Math.max(...MONTHLY_DATA.map((d) => d.collected));
  const totalCollected = MONTHLY_DATA.reduce((s, d) => s + d.collected, 0);
  const fmt = (n: number) => `₱${(n / 1_000_000).toFixed(1)}M`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">Financial Reports</h1>
        <p className="text-sm text-muted-foreground">Revenue summaries and collection reports</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Total Collected (YTD)", value: fmt(totalCollected), icon: DollarSign, trend: { value: "On track", positive: true } },
          { title: "Monthly Average", value: fmt(totalCollected / MONTHLY_DATA.length), icon: TrendingUp },
          { title: "Reports Generated", value: "24", icon: FileText, subtitle: "This semester" },
        ].map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-heading text-sm font-semibold text-card-foreground">Monthly Collections (2026)</h2>
        <div className="mt-6 flex items-end gap-4 h-48">
          {MONTHLY_DATA.map((d) => (
            <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-medium text-foreground">{fmt(d.collected)}</span>
              <motion.div
                className="w-full rounded-t-lg bg-accent"
                initial={{ height: 0 }}
                animate={{ height: `${(d.collected / maxVal) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
              <span className="text-xs text-muted-foreground">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-heading text-sm font-semibold text-card-foreground">Collection Summary by Program</h2>
        <div className="mt-4 space-y-3">
          {[
            { program: "BS Computer Science", collected: 8200000, target: 9000000 },
            { program: "BS Information Technology", collected: 7100000, target: 7500000 },
            { program: "BS Business Administration", collected: 6500000, target: 7000000 },
            { program: "BS Accountancy", collected: 5800000, target: 6200000 },
            { program: "BS Education", collected: 4500000, target: 5000000 },
          ].map((p) => (
            <div key={p.program} className="rounded-lg bg-muted/50 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{p.program}</span>
                <span className="text-xs text-muted-foreground">{fmt(p.collected)} / {fmt(p.target)}</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                <motion.div className="h-1.5 rounded-full bg-accent" initial={{ width: 0 }}
                  animate={{ width: `${Math.round((p.collected / p.target) * 100)}%` }} transition={{ duration: 0.8 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
