import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  Dumbbell,
  Shield,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, resource: "dashboard", action: "view" },
  { title: "Alunos", url: "/students", icon: Users, resource: "students", action: "read" },
  { title: "Professores", url: "/teachers", icon: GraduationCap, resource: "teachers", action: "read" },
  { title: "Cursos", url: "/courses", icon: BookOpen, resource: "courses", action: "read" },
  { title: "Aulas", url: "/classes", icon: Calendar, resource: "classes", action: "read" },
  { title: "Check-ins", url: "/checkins", icon: ClipboardCheck, resource: "checkins", action: "read" },
  { title: "Usuários", url: "/users", icon: Shield, resource: "users", action: "read" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { hasPermission } = useAuth();
  const visibleMenuItems = menuItems.filter((item) => hasPermission(item.resource, item.action));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Dumbbell className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-base font-bold text-sidebar-foreground tracking-tight">
              GymHub
            </span>
          )}
        </div>
      </SidebarHeader>
      <Separator className="bg-sidebar-border" />
      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50 px-2">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => {
                const active = item.url === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="mr-2.5 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
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
          <p className="text-[10px] text-sidebar-foreground/40">© 2026 GymFlow</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
