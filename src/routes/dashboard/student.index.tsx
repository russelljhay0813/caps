import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/StatCard";
import { BookOpen, DollarSign, Calendar, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useSubjects } from "@/lib/subjects-store";
import { useMemo } from "react";

export const Route = createFileRoute("/dashboard/student/")({
  component: StudentDashboard,
});

const TUITION_PER_UNIT = 1500;
const MISC_FEE = 5000;

function StudentDashboard() {
  const subjects = useSubjects();

  const totalUnits = useMemo(() => subjects.reduce((s, sub) => s + sub.units, 0), [subjects]);
  const totalAssessment = useMemo(() => totalUnits * TUITION_PER_UNIT + MISC_FEE, [totalUnits]);

  const totalPaid = useMemo(() => {
    if (typeof window === "undefined") return 0;
    try {
      const payments = JSON.parse(localStorage.getItem("bwest:paymongo-payments") || "[]");
      return payments
        .filter((p: any) => p.status === "paid")
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    } catch {
      return 0;
    }
  }, []);

  const balance = totalAssessment - totalPaid;

  const todaySchedule = useMemo(() => {
    const days = ["SU", "M", "T", "W", "TH", "F", "SA"];
    const jsDay = new Date().getDay();
    const todayToken = days[jsDay];

    return subjects.filter((s) => {
      const sched = s.schedule.toUpperCase();
      if (todayToken === "TH") return sched.includes("TH");
      if (todayToken === "T") return sched.includes("T") && !sched.replace(/TH/g, "").includes("T") ? false : sched.replace(/TH/g, "").includes("T");
      if (todayToken === "M") return sched.includes("M") && !sched.includes("MW") ? sched.includes("M") : sched.includes("M");
      return sched.includes(todayToken);
    });
  }, [subjects]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">Student Dashboard</h1>
        <p className="text-sm text-muted-foreground">Academic year 2025–2026, 2nd Semester</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Subjects Enrolled",
            value: subjects.length,
            subtitle: `${totalUnits} total units`,
            icon: BookOpen,
          },
          {
            title: "Balance",
            value: `₱${balance.toLocaleString()}`,
            subtitle: balance <= 0 ? "Fully paid" : "Remaining balance",
            icon: DollarSign,
          },
          {
            title: "Units Enrolled",
            value: totalUnits,
            subtitle: `${subjects.length} subjects`,
            icon: Calendar,
          },
          {
            title: "Clearance",
            value: balance <= 0 ? "Cleared" : "Pending",
            subtitle: balance <= 0 ? "All requirements met" : "Settle balance first",
            icon: CheckCircle,
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-accent" />
            <h2 className="font-heading text-sm font-semibold text-card-foreground">Today's Schedule</h2>
          </div>
          {todaySchedule.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No classes scheduled today.</p>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((s) => (
                <div key={s.id} className="flex items-center gap-4 rounded-lg bg-muted/50 px-4 py-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-sm font-bold text-foreground">{s.code}</span>
                      <span className="text-sm text-foreground">{s.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.schedule} · {s.room}</span>
                  </div>
                  <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                    {s.units} units
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-accent" />
            <h2 className="font-heading text-sm font-semibold text-card-foreground">Financial Summary</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: "Tuition Fee", amount: `₱${(totalUnits * TUITION_PER_UNIT).toLocaleString()}`, status: totalPaid >= totalUnits * TUITION_PER_UNIT ? "Paid" : "Pending" },
              { label: "Miscellaneous", amount: `₱${MISC_FEE.toLocaleString()}`, status: totalPaid >= totalAssessment ? "Paid" : "Pending" },
              { label: "Total Assessment", amount: `₱${totalAssessment.toLocaleString()}`, status: "info" },
              { label: "Total Paid", amount: `₱${totalPaid.toLocaleString()}`, status: "info" },
              { label: "Remaining Balance", amount: `₱${Math.max(0, balance).toLocaleString()}`, status: balance <= 0 ? "Paid" : "Pending" },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm font-medium text-foreground">{f.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{f.amount}</span>
                  {f.status !== "info" && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${f.status === "Paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                      {f.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-4 w-4 text-accent" />
          <h2 className="font-heading text-sm font-semibold text-card-foreground">Enrolled Subjects</h2>
        </div>
        {subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No subjects enrolled yet. Subjects will appear once your faculty assigns them.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4">Code</th>
                  <th className="pb-2 pr-4">Subject</th>
                  <th className="pb-2 pr-4">Units</th>
                  <th className="pb-2 pr-4">Schedule</th>
                  <th className="pb-2 pr-4">Room</th>
                  <th className="pb-2">Instructor</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.id} className="border-b border-muted/50 last:border-0">
                    <td className="py-3 pr-4 font-heading font-bold text-foreground">{s.code}</td>
                    <td className="py-3 pr-4 text-foreground">{s.title}</td>
                    <td className="py-3 pr-4 text-foreground">{s.units}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{s.schedule}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{s.room}</td>
                    <td className="py-3 text-muted-foreground">{s.instructor}</td>
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
