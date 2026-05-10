import { createFileRoute } from "@tanstack/react-router";
import { Shield, AlertTriangle, CheckCircle, Lock, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";

export const Route = createFileRoute("/dashboard/admin/security")({
  component: AdminSecurity,
});

const AUDIT_LOG = [
  { action: "Login attempt failed (3x)", user: "unknown@external.com", time: "10 min ago", severity: "high" },
  { action: "Password changed", user: "juan@bwest.edu.ph", time: "25 min ago", severity: "low" },
  { action: "Role updated to Faculty", user: "new.prof@bwest.edu.ph", time: "1 hr ago", severity: "medium" },
  { action: "Bulk data export requested", user: "admin@bwest.edu.ph", time: "2 hrs ago", severity: "medium" },
  { action: "System backup completed", user: "system", time: "3 hrs ago", severity: "low" },
  { action: "2FA enabled", user: "rosa@bwest.edu.ph", time: "4 hrs ago", severity: "low" },
  { action: "New admin account created", user: "admin@bwest.edu.ph", time: "5 hrs ago", severity: "high" },
];

function AdminSecurity() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">Security</h1>
        <p className="text-sm text-muted-foreground">System security and audit logs</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Security Score", value: "96%", icon: Shield, trend: { value: "2% up this month", positive: true } },
          { title: "Active Threats", value: "0", icon: AlertTriangle, subtitle: "All clear" },
          { title: "2FA Enabled", value: "78%", icon: Lock, subtitle: "Of all users" },
          { title: "Audit Events", value: "1,234", icon: Eye, subtitle: "Last 30 days" },
        ].map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-heading text-sm font-semibold text-card-foreground">Recent Audit Log</h2>
        <div className="mt-4 space-y-2">
          {AUDIT_LOG.map((log, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${log.severity === "high" ? "bg-destructive" : log.severity === "medium" ? "bg-warning" : "bg-success"}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{log.action}</p>
                  <p className="text-xs text-muted-foreground">{log.user}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${log.severity === "high" ? "bg-destructive/10 text-destructive" : log.severity === "medium" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                  {log.severity}
                </span>
                <p className="mt-1 text-[10px] text-muted-foreground">{log.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
