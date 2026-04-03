import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useAppContext } from "../../hooks/useAppContext";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  ocid?: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
}

export default function DashboardLayout({
  children,
  navItems,
  title,
}: DashboardLayoutProps) {
  const { clear } = useInternetIdentity();
  const { userProfile, role } = useAppContext();
  const qc = useQueryClient();
  const location = useLocation();

  const handleLogout = () => {
    clear();
    qc.clear();
  };

  const initials = userProfile?.name
    ? userProfile.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="p-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-bold text-sm">
                  SRM
                </span>
              </div>
              <div>
                <p className="font-display font-bold text-sidebar-foreground text-sm">
                  SRM
                </p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">
                  {role ?? ""}
                </p>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      location.pathname === item.to ||
                      location.pathname.startsWith(`${item.to}/`);
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link to={item.to} data-ocid={item.ocid}>
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {userProfile?.name ?? "User"}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {userProfile?.organization}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              data-ocid="dashboard.logout.button"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex items-center gap-2 h-14 px-4 border-b border-border bg-white sticky top-0 z-10">
            <SidebarTrigger className="text-foreground/70" />
            <div className="h-4 w-px bg-border" />
            <h1 className="font-display font-semibold text-foreground text-sm">
              {title}
            </h1>
          </header>
          <main className="flex-1 p-4 md:p-6 bg-muted/30 min-h-[calc(100vh-3.5rem)]">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
