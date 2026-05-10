import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/StatCard";
import { BookOpen, Users, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useSubjects } from "@/lib/subjects-store";
import { useMemo } from "react";

export const Route = createFileRoute("/dashboard/faculty/")({
  component: FacultyDashboard,
});

function FacultyDashboard() {
  const subjects = useSubjects();

  const totalUnits = useMemo(
    () => subjects.reduce((sum, s) => sum + s.units, 0),
    [subjects],
  );

  const todayToken = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date().getDay()];
  const todayAliases: Record<string, string[]> = {
    MON: ["M", "MW", "MWF", "MTH", "MON"],
    TUE: ["T", "TTH", "TF", "TUE"],
    WED: ["W", "MW", "MWF", "WF", "WED"],
    THU: ["TH", "TTH", "MTH", "THU"],
    FRI: ["F", "MWF", "TF", "WF", "FRI"],
    SAT: ["S", "SAT"],
    SUN: ["SUN"],
  };
  const aliases = todayAliases[todayToken] ?? [];

  const todayClasses = useMemo(
    () =>
      subjects.filter((s) => {
        const upper = s.schedule.toUpperCase();
        return aliases.some((a) => upper.includes(a));
      }),
    [subjects, aliases],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">Faculty Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage your classes and academic responsibilities
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Active Classes",
            value: String(subjects.length),
            subtitle: "This semester",
            icon: BookOpen,
          },
          {
            title: "Total Units",
            value: String(totalUnits),
            subtitle: "Teaching load",
            icon: Clock,
          },
          {
            title: "Today's Classes",
            value: String(todayClasses.length),
            subtitle: todayToken,
            icon: CheckCircle,
          },
          {
            title: "Total Students",
            value: "—",
            subtitle: "Across all sections",
            icon: Users,
          },
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

      {/* Today's Schedule */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-heading text-sm font-semibold text-card-foreground">
          Today's Schedule
        </h2>
        {todayClasses.length === 0 ? (
          <p className="mt-4 rounded-lg bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">
            No classes scheduled for today.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {todayClasses.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 rounded-lg bg-muted/50 px-4 py-3"
              >
                <div className="flex-1">
                  <span className="font-heading text-sm font-bold text-foreground">{s.code}</span>
                  <span className="ml-2 text-sm text-foreground">{s.title}</span>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {s.schedule} · {s.room} · {s.units} units
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Subjects */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-heading text-sm font-semibold text-card-foreground">
          All Assigned Subjects ({subjects.length})
        </h2>
        {subjects.length === 0 ? (
          <p className="mt-4 rounded-lg bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">
            No subjects assigned yet. Go to Classes to add subjects.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4">Code</th>
                  <th className="pb-2 pr-4">Subject</th>
                  <th className="pb-2 pr-4">Units</th>
                  <th className="pb-2 pr-4">Schedule</th>
                  <th className="pb-2">Room</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.id} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-heading font-bold text-foreground">{s.code}</td>
                    <td className="py-2 pr-4 text-foreground">{s.title}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{s.units}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{s.schedule}</td>
                    <td className="py-2 text-muted-foreground">{s.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
