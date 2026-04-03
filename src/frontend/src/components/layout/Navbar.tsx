import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { SRMRole } from "../../backend";
import { useAppContext } from "../../hooks/useAppContext";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Jobs", to: "/jobs" },
  { label: "Providers", to: "/providers" },
  { label: "How It Works", to: "/#how-it-works" },
  { label: "Contact", to: "/#contact" },
];

function NavLink({
  to,
  label,
  onClick,
}: { to: string; label: string; onClick?: () => void }) {
  const location = useLocation();
  const isActive =
    location.pathname === to || (to === "/" && location.pathname === "/");

  if (to.startsWith("/#")) {
    return (
      <a
        href={to}
        onClick={onClick}
        className={`text-sm font-medium transition-colors hover:text-primary pb-0.5 ${
          isActive
            ? "text-primary border-b-2 border-primary"
            : "text-foreground/70"
        }`}
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      data-ocid={`nav.${label.toLowerCase().replace(/\s+/g, "-")}.link`}
      className={`text-sm font-medium transition-colors hover:text-primary pb-0.5 ${
        isActive
          ? "text-primary border-b-2 border-primary"
          : "text-foreground/70"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const { login, isLoggingIn } = useInternetIdentity();
  const { userProfile, isAuthenticated, role } = useAppContext();
  const qc = useQueryClient();
  const { clear } = useInternetIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clear();
    qc.clear();
  };

  const getDashboardLink = () => {
    if (role === SRMRole.institution) return "/dashboard/institution";
    if (role === SRMRole.serviceProvider) return "/dashboard/provider";
    if (role === SRMRole.admin) return "/dashboard/admin";
    return "/dashboard";
  };

  const initials = userProfile?.name
    ? userProfile.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const profileImageUrl =
    userProfile?.profileImage?.getDirectURL() ?? undefined;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0"
            data-ocid="nav.home.link"
          >
            <img
              src="/assets/generated/srm-logo-transparent.dim_64x64.png"
              alt="SRM"
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-display font-bold text-foreground text-lg hidden sm:block">
              Service &amp; Repair
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} label={l.label} />
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={login}
                  disabled={isLoggingIn}
                  data-ocid="nav.signin.button"
                  className="text-foreground/70 hover:text-primary"
                >
                  {isLoggingIn ? "Signing in..." : "Sign In"}
                </Button>
                <Button
                  size="sm"
                  onClick={login}
                  disabled={isLoggingIn}
                  data-ocid="nav.register.button"
                  className="bg-primary text-white hover:bg-primary/90 rounded-lg"
                >
                  Register
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    data-ocid="nav.user.button"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profileImageUrl} />
                      <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
                      {userProfile?.name ?? "Profile"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-foreground">
                      {userProfile?.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {role ?? "user"}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      to={getDashboardLink()}
                      data-ocid="nav.dashboard.link"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                    data-ocid="nav.logout.button"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden ml-1 p-2 rounded-md text-foreground/70 hover:text-primary"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              label={l.label}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </div>
      )}
    </header>
  );
}
