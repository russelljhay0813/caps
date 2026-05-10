import {
  LayoutDashboard,
  GraduationCap,
  DollarSign,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  FileText,
  Calendar,
  CreditCard,
  Shield,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import bwestLogo from "@/assets/bwest-logo.jpg";
import { Link, useLocation } from "@tanstack/react-router";
import { useAuth, type UserRole } from "@/lib/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const roleNavItems: Record<UserRole, NavItem[]> = {
  student: [
    { title: "Dashboard", url: "/dashboard/student", icon: LayoutDashboard },
    { title: "Enrollment", url: "/dashboard/student/enrollment", icon: ClipboardList },
    { title: "Grades", url: "/dashboard/student/grades", icon: BookOpen },
    { title: "Finances", url: "/dashboard/student/finances", icon: DollarSign },
    { title: "Schedule", url: "/dashboard/student/schedule", icon: Calendar },
  ],
  faculty: [
    { title: "Dashboard", url: "/dashboard/faculty", icon: LayoutDashboard },
    { title: "Classes", url: "/dashboard/faculty/classes", icon: BookOpen },
    { title: "Attendance", url: "/dashboard/faculty/attendance", icon: UserCheck },
  ],
  finance: [
    { title: "Dashboard", url: "/dashboard/finance", icon: LayoutDashboard },
    { title: "Student Accounts", url: "/dashboard/finance/accounts", icon: Users },
    { title: "Payments", url: "/dashboard/finance/payments", icon: CreditCard },
    { title: "Clearance", url: "/dashboard/finance/clearance", icon: ShieldCheck },
    { title: "Reports", url: "/dashboard/finance/reports", icon: FileText },
  ],
  admin: [
    { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
    { title: "Users", url: "/dashboard/admin/users", icon: Users },
    { title: "Analytics", url: "/dashboard/admin/analytics", icon: BarChart3 },
    { title: "Security", url: "/dashboard/admin/security", icon: Shield },
    { title: "Settings", url: "/dashboard/admin/settings", icon: Settings },
  ],
  registrar: [
    { title: "Dashboard", url: "/dashboard/registrar", icon: LayoutDashboard },
    { title: "Registrations", url: "/dashboard/registrar/registrations", icon: UserCheck },
    { title: "Enrollment", url: "/dashboard/registrar/enrollment", icon: ClipboardList },
    { title: "Records", url: "/dashboard/registrar/records", icon: FileText },
    { title: "Transcripts", url: "/dashboard/registrar/transcripts", icon: GraduationCap },
  ],
};

const roleLabels: Record<UserRole, string> = {
  student: "Student Portal",
  faculty: "Faculty Portal",
  finance: "Finance Office",
  admin: "Administration",
  registrar: "Registrar Office",
};

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  if (!user) return null;

  const navItems = roleNavItems[user.role];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src={bwestLogo} alt="BWEST" className="h-8 w-8 rounded-md object-cover" />
            <div className="flex flex-col gap-0.5">
              <span className="font-heading text-sm font-bold tracking-wide text-sidebar-primary-foreground">
                BWEST College
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                {roleLabels[user.role]}
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <img src={bwestLogo} alt="BWEST" className="h-7 w-7 rounded-md object-cover" />
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
              {user.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-sidebar-foreground">{user.name}</span>
              <span className="text-[10px] text-sidebar-foreground/50">{user.email}</span>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
