import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/StatCard";
import { ClipboardList, FileText, GraduationCap, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard/registrar/")({
  component: RegistrarDashboard,
});

function RegistrarDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">Registrar Dashboard</h1>
        <p className="text-sm text-muted-foreground">Student records and enrollment management</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Active Enrollments", value: "2,847", icon: ClipboardList, trend: { value: "Enrollment open", positive: true } },
          { title: "Pending Requests", value: "58", icon: FileText, subtitle: "Transcript & cert requests" },
          { title: "Graduating Students", value: "342", icon: GraduationCap, subtitle: "This academic year" },
          { title: "Verified Records", value: "98.2%", icon: UserCheck, subtitle: "Data accuracy rate" },
        ].map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-heading text-sm font-semibold text-card-foreground">Pending Transcript Requests</h2>
        <div className="mt-4 space-y-3">
          {[
            { student: "Juan Dela Cruz", id: "2021-00145", type: "Official Transcript", date: "Apr 12, 2026" },
            { student: "Maria Garcia", id: "2020-00892", type: "Certificate of Grades", date: "Apr 13, 2026" },
            { student: "Pedro Reyes", id: "2022-00334", type: "Official Transcript", date: "Apr 14, 2026" },
            { student: "Ana Santos", id: "2021-00567", type: "Good Moral Certificate", date: "Apr 14, 2026" },
          ].map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <div>
                <span className="text-sm font-medium text-foreground">{r.student}</span>
                <span className="ml-2 text-xs text-muted-foreground">ID: {r.id}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-accent">{r.type}</span>
                <span className="block text-[10px] text-muted-foreground">Requested: {r.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
