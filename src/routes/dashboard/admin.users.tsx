import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Search, UserCheck, UserX, Shield } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard/admin/users")({
  component: AdminUsers,
});

const MOCK_USERS = [
  { id: "2021-00145", name: "Juan Dela Cruz", email: "juan@bwest.edu.ph", role: "Student", status: "Active", program: "BS Computer Science" },
  { id: "2020-00892", name: "Maria Garcia", email: "maria.g@bwest.edu.ph", role: "Student", status: "Active", program: "BS Information Technology" },
  { id: "FAC-001", name: "Dr. Maria Santos", email: "maria.s@bwest.edu.ph", role: "Faculty", status: "Active", program: "Computer Science Dept." },
  { id: "FAC-002", name: "Prof. Jose Rizal", email: "jose@bwest.edu.ph", role: "Faculty", status: "Active", program: "Mathematics Dept." },
  { id: "FIN-001", name: "Ana Reyes", email: "ana@bwest.edu.ph", role: "Finance", status: "Active", program: "Finance Office" },
  { id: "REG-001", name: "Rosa Mendoza", email: "rosa@bwest.edu.ph", role: "Registrar", status: "Active", program: "Registrar Office" },
  { id: "2022-00334", name: "Pedro Reyes", email: "pedro@bwest.edu.ph", role: "Student", status: "Inactive", program: "BS Accountancy" },
  { id: "2021-00567", name: "Ana Santos", email: "ana.s@bwest.edu.ph", role: "Student", status: "Active", program: "BS Education" },
];

function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filtered = MOCK_USERS.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roles = ["All", "Student", "Faculty", "Finance", "Registrar"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground">Manage all system users and roles</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { title: "Total Users", value: MOCK_USERS.length, icon: Users },
          { title: "Active", value: MOCK_USERS.filter((u) => u.status === "Active").length, icon: UserCheck },
          { title: "Inactive", value: MOCK_USERS.filter((u) => u.status === "Inactive").length, icon: UserX },
          { title: "Roles", value: roles.length - 1, icon: Shield },
        ].map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent"><s.icon className="h-4 w-4" /></div>
              <div><p className="text-xs text-muted-foreground">{s.title}</p><p className="font-heading text-lg font-bold text-foreground">{s.value}</p></div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or ID..."
            className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div className="flex gap-1">
          {roles.map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${roleFilter === r ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Department</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
          </tr></thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">{u.role}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{u.program}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.status === "Active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{u.status}</span></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
