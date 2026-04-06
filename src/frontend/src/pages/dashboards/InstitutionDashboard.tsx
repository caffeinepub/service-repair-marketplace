import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Briefcase,
  CheckCircle2,
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  Settings,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { JobStatus } from "../../backend";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmptyState from "../../components/shared/EmptyState";
import StatusBadge from "../../components/shared/StatusBadge";
import { useAppContext } from "../../hooks/useAppContext";
import { useGetJobsByInstitution } from "../../hooks/useQueries";
import { formatCurrency, formatDate } from "../../lib/constants";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/dashboard/institution",
    icon: LayoutDashboard,
    ocid: "dashboard.nav.overview.link",
  },
  {
    label: "My Jobs",
    to: "/dashboard/institution/jobs",
    icon: ListChecks,
    ocid: "dashboard.nav.jobs.link",
  },
  {
    label: "Post New Job",
    to: "/dashboard/institution/jobs/new",
    icon: PlusCircle,
    ocid: "dashboard.nav.newjob.link",
  },
  {
    label: "Profile",
    to: "/dashboard/institution/profile",
    icon: Settings,
    ocid: "dashboard.nav.profile.link",
  },
];

export default function InstitutionDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAppContext();
  const institutionId = userProfile?.principal?.toString();
  const { data: jobs, isLoading } = useGetJobsByInstitution(institutionId);

  const activeJobs =
    jobs?.filter(
      (j) =>
        ![
          JobStatus.completed,
          JobStatus.cancelled,
          JobStatus.reviewed,
        ].includes(j.status),
    ).length ?? 0;
  const completedJobs =
    jobs?.filter((j) =>
      [JobStatus.completed, JobStatus.reviewed].includes(j.status),
    ).length ?? 0;
  const recentJobs = jobs?.slice(0, 5) ?? [];

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Institution Dashboard">
      <div className="space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="font-display font-bold text-foreground text-2xl">
            Welcome back, {userProfile?.name?.split(" ")[0] ?? "User"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {userProfile?.organization || "Institution"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Active Jobs",
              value: activeJobs,
              icon: Briefcase,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Completed Jobs",
              value: completedJobs,
              icon: CheckCircle2,
              color: "text-green-600",
              bg: "bg-green-100",
            },
            {
              label: "Total Jobs",
              value: jobs?.length ?? 0,
              icon: TrendingUp,
              color: "text-accent-orange",
              bg: "bg-orange-100",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="border border-border shadow-card rounded-xl">
                <CardContent className="p-5 flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    {isLoading ? (
                      <Skeleton className="h-7 w-10 mb-1" />
                    ) : (
                      <p className="text-2xl font-display font-bold text-foreground">
                        {stat.value}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            className="bg-primary text-white rounded-xl"
            data-ocid="institution.new_job.primary_button"
          >
            <Link to="/dashboard/institution/jobs/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Post New Job
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-xl"
            data-ocid="institution.all_jobs.button"
          >
            <Link to="/dashboard/institution/jobs">
              <ListChecks className="h-4 w-4 mr-2" />
              View All Jobs
            </Link>
          </Button>
        </div>

        {/* Recent jobs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-foreground text-lg">
              Recent Jobs
            </h3>
            <Button
              asChild
              variant="ghost"
              size="sm"
              data-ocid="institution.view_all.button"
            >
              <Link to="/dashboard/institution/jobs">View All</Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3" data-ocid="institution.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : recentJobs.length === 0 ? (
            <EmptyState
              title="No jobs posted yet"
              description="Start by posting your first service job."
              action={
                <Button
                  asChild
                  className="bg-primary text-white rounded-lg"
                  data-ocid="institution.empty.primary_button"
                >
                  <Link to="/dashboard/institution/jobs/new">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Post a Job
                  </Link>
                </Button>
              }
              ocid="institution.jobs.empty_state"
            />
          ) : (
            <div className="space-y-2">
              {recentJobs.map((job, idx) => (
                <button
                  type="button"
                  key={job.id.toString()}
                  onClick={() =>
                    void navigate({
                      to: `/dashboard/institution/jobs/${job.id.toString()}` as any,
                    })
                  }
                  data-ocid={`institution.jobs.item.${idx + 1}`}
                  className="block w-full text-left"
                >
                  <Card className="border border-border rounded-xl hover:shadow-card transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <StatusBadge status={job.status} type="job" />
                          <span className="text-xs text-muted-foreground">
                            {job.category}
                          </span>
                        </div>
                        <p className="font-semibold text-foreground text-sm truncate">
                          {job.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(job.budget)} &middot; Deadline{" "}
                          {formatDate(job.deadline)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
