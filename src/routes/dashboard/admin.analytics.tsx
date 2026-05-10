import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, TrendingUp, Users, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";

export const Route = createFileRoute("/dashboard/admin/analytics")({
  component: AdminAnalytics,
});

const ENROLLMENT_DATA = [
  { year: "2022", students: 2210 },
  { year: "2023", students: 2480 },
  { year: "2024", students: 2650 },
  { year: "2025", students: 2847 },
];

const PROGRAM_STATS = [
  { program: "BS Computer Science", enrolled: 485, passed: 462, retention: "95.3%" },
  { program: "BS Information Technology", enrolled: 420, passed: 395, retention: "94.0%" },
  { program: "BS Business Administration", enrolled: 390, passed: 370, retention: "94.9%" },
  { program: "BS Accountancy", enrolled: 310, passed: 288, retention: "92.9%" },
  { program: "BS Education", enrolled: 280, passed: 271, retention: "96.8%" },
];

function AdminAnalytics() {
  const maxStudents = Math.max(...ENROLLMENT_DATA.map((d) => d.students));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Institutional performance and trends</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Enrollment", value: "2,847", icon: Users, trend: { value: "7.4% growth", positive: true } },
          { title: "Avg. Retention", value: "94.8%", icon: TrendingUp, trend: { value: "1.2% up", positive: true } },
          { title: "Programs Offered", value: "18", icon: BookOpen, subtitle: "5 colleges" },
          { title: "Faculty-Student Ratio", value: "1:23", icon: BarChart3, subtitle: "Below national avg" },
        ].map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-heading text-sm font-semibold text-card-foreground">Enrollment Growth</h2>
          <div className="mt-6 flex items-end gap-4 h-48">
            {ENROLLMENT_DATA.map((d) => (
              <div key={d.year} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium text-foreground">{d.students}</span>
                <motion.div
                  className="w-full rounded-t-lg bg-accent"
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.students / maxStudents) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
                <span className="text-xs text-muted-foreground">{d.year}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-heading text-sm font-semibold text-card-foreground">Program Retention Rates</h2>
          <div className="mt-4 space-y-3">
            {PROGRAM_STATS.map((p) => (
              <div key={p.program} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{p.program}</span>
                  <span className="text-xs font-bold text-accent">{p.retention}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <motion.div className="h-2 rounded-full bg-accent" initial={{ width: 0 }}
                    animate={{ width: p.retention }} transition={{ duration: 0.8 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
