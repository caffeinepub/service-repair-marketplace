import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  BarChart3,
  Briefcase,
  ListChecks,
  MessageSquare,
  ShieldCheck,
  Star,
  UserCog,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  useGetAnalytics,
  useGetUnverifiedProviders,
} from "../../hooks/useQueries";

const NAV_ITEMS = [
  {
    label: "Overview",
    to: "/dashboard/admin",
    icon: BarChart3,
    ocid: "dashboard.nav.overview.link",
  },
  {
    label: "Providers",
    to: "/dashboard/admin/providers",
    icon: ShieldCheck,
    ocid: "dashboard.nav.providers.link",
  },
  {
    label: "All Jobs",
    to: "/dashboard/admin/jobs",
    icon: ListChecks,
    ocid: "dashboard.nav.jobs.link",
  },
  {
    label: "All Users",
    to: "/dashboard/admin/users",
    icon: UserCog,
    ocid: "dashboard.nav.users.link",
  },
];

export default function AdminDashboard() {
  const {
    data: analytics,
    isLoading,
    isError: analyticsError,
  } = useGetAnalytics();
  const { data: unverified, isError: unverifiedError } =
    useGetUnverifiedProviders();

  const hasError = analyticsError || unverifiedError;

  const stats = [
    {
      label: "Total Users",
      value: analytics ? Number(analytics.totalUsers) : 0,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Total Jobs",
      value: analytics ? Number(analytics.totalJobs) : 0,
      icon: Briefcase,
      color: "text-accent-orange",
      bg: "bg-orange-100",
    },
    {
      label: "Total Bids",
      value: analytics ? Number(analytics.totalBids) : 0,
      icon: MessageSquare,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Avg Rating",
      value: analytics ? analytics.avgRating.toFixed(1) : "0",
      icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-50",
    },
    {
      label: "Total Reviews",
      value: analytics ? Number(analytics.totalReviews) : 0,
      icon: Star,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      label: "Pending Verif.",
      value: unverified?.length ?? 0,
      icon: ShieldCheck,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Admin Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="font-display font-bold text-foreground text-2xl">
            Platform Analytics
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of all platform activity
          </p>
        </div>

        {/* Error state */}
        {hasError && (
          <Alert
            variant="destructive"
            className="rounded-xl"
            data-ocid="admin.dashboard.error_state"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Could not load admin data</AlertTitle>
            <AlertDescription>
              You may not have admin permissions, or please refresh the page.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="border border-border shadow-card rounded-xl">
                <CardContent className="p-4">
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-10 mb-1" />
                  ) : (
                    <p className="text-xl font-display font-bold text-foreground">
                      {stat.value}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Pending verifications alert */}
        {(unverified?.length ?? 0) > 0 && (
          <Card className="border-yellow-200 bg-yellow-50 rounded-xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-yellow-800">
                  {unverified?.length} skilled provider
                  {unverified!.length > 1 ? "s" : ""} pending verification
                </p>
                <p className="text-sm text-yellow-700">
                  Review and verify skilled providers to enable bidding.
                </p>
              </div>
              <Button
                asChild
                size="sm"
                className="bg-yellow-600 text-white hover:bg-yellow-700 rounded-lg"
                data-ocid="admin.verify.primary_button"
              >
                <Link to="/dashboard/admin/providers">Review Now</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <div>
          <h3 className="font-display font-semibold text-foreground text-lg mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Verify Providers",
                desc: `${unverified?.length ?? 0} pending`,
                to: "/dashboard/admin/providers",
                icon: ShieldCheck,
                color: "bg-primary",
              },
              {
                label: "Monitor Jobs",
                desc: "All job statuses",
                to: "/dashboard/admin/jobs",
                icon: ListChecks,
                color: "bg-accent-orange",
              },
              {
                label: "Manage Users",
                desc: "All user roles",
                to: "/dashboard/admin/users",
                icon: UserCog,
                color: "bg-purple-600",
              },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                data-ocid={`admin.${action.label.toLowerCase().replace(/\s+/g, "_")}.button`}
              >
                <Card className="border border-border rounded-xl hover:shadow-card transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center`}
                    >
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {action.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {action.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
