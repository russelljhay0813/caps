import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { StatCard } from "@/components/StatCard";
import { Users, GraduationCap, DollarSign, ShieldCheck, Database, Trash2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { seedDemoData, clearDemoData, isDemoSeeded, getSeededAt } from "@/lib/demo-seed";

export const Route = createFileRoute("/dashboard/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [seeded, setSeeded] = useState(false);
  const [seededAt, setSeededAt] = useState<string | null>(null);

  useEffect(() => {
    setSeeded(isDemoSeeded());
    setSeededAt(getSeededAt());
  }, []);

  const handleSeed = () => {
    seedDemoData();
    setSeeded(true);
    setSeededAt(getSeededAt());
  };

  const handleClear = () => {
    if (!confirm("Clear all demo data? This will remove subjects, payments, and attendance records.")) return;
    clearDemoData();
    setSeeded(false);
    setSeededAt(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">System overview and analytics</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleSeed} size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            {seeded ? "Reseed Demo Data" : "Load Demo Data"}
          </Button>
          {seeded && (
            <Button onClick={handleClear} size="sm" variant="outline" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {seeded && seededAt && (
        <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 px-4 py-2.5 text-xs text-success">
          <Database className="h-4 w-4" />
          Demo data active — seeded {new Date(seededAt).toLocaleString()}. All dashboards now show sample students, subjects, payments, and attendance.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Students", value: "2,847", icon: GraduationCap, trend: { value: "12% from last year", positive: true } },
          { title: "Active Faculty", value: "124", icon: Users, subtitle: "98% attendance" },
          { title: "Revenue (YTD)", value: "₱48.2M", icon: DollarSign, trend: { value: "8% above target", positive: true } },
          { title: "Security Score", value: "96%", icon: ShieldCheck, subtitle: "No incidents this month" },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-heading text-sm font-semibold text-card-foreground">Enrollment Trends</h2>
          <div className="mt-4 space-y-3">
            {[
              { program: "BS Computer Science", count: 485, change: "+12%" },
              { program: "BS Information Technology", count: 420, change: "+8%" },
              { program: "BS Business Administration", count: 390, change: "+5%" },
              { program: "BS Accountancy", count: 310, change: "-2%" },
              { program: "BS Education", count: 280, change: "+15%" },
            ].map((p) => (
              <div key={p.program} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm font-medium text-foreground">{p.program}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{p.count}</span>
                  <span className={`text-xs font-medium ${p.change.startsWith("+") ? "text-success" : "text-destructive"}`}>
                    {p.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-heading text-sm font-semibold text-card-foreground">Recent System Activity</h2>
          <div className="mt-4 space-y-3">
            {[
              { action: "New enrollment batch processed", time: "2 min ago", type: "info" },
              { action: "Financial clearance issued (42 students)", time: "15 min ago", type: "success" },
              { action: "Grade submission deadline reminder sent", time: "1 hr ago", type: "warning" },
              { action: "System backup completed", time: "3 hrs ago", type: "info" },
              { action: "User access audit completed", time: "5 hrs ago", type: "success" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-muted/50 px-4 py-3">
                <div className={`mt-1 h-2 w-2 rounded-full ${a.type === "success" ? "bg-success" : a.type === "warning" ? "bg-warning" : "bg-accent"}`} />
                <div className="flex-1">
                  <span className="text-sm text-foreground">{a.action}</span>
                  <span className="block text-[10px] text-muted-foreground">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
