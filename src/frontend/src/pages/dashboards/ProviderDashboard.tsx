import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  ListTodo,
  Search,
  Star,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { BidStatus, JobStatus } from "../../backend";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmptyState from "../../components/shared/EmptyState";
import StatusBadge from "../../components/shared/StatusBadge";
import { useAppContext } from "../../hooks/useAppContext";
import {
  useGetAllJobs,
  useGetBidsByProvider,
  useGetReviewsByProvider,
} from "../../hooks/useQueries";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/dashboard/provider",
    icon: Briefcase,
    ocid: "dashboard.nav.overview.link",
  },
  {
    label: "Browse Jobs",
    to: "/dashboard/provider/jobs",
    icon: Search,
    ocid: "dashboard.nav.jobs.link",
  },
  {
    label: "My Bids",
    to: "/dashboard/provider/bids",
    icon: ListTodo,
    ocid: "dashboard.nav.bids.link",
  },
  {
    label: "Profile",
    to: "/dashboard/provider/profile",
    icon: User,
    ocid: "dashboard.nav.profile.link",
  },
];

export default function ProviderDashboard() {
  const { userProfile } = useAppContext();
  const { data: bids } = useGetBidsByProvider();
  const { data: allJobs, isLoading: jobsLoading } = useGetAllJobs();
  const { data: reviews } = useGetReviewsByProvider(userProfile?.principal);
  const navigate = useNavigate();

  const activeBids = (bids ?? []).filter(
    (b) => b.status === BidStatus.pending,
  ).length;
  const acceptedBids = (bids ?? []).filter(
    (b) => b.status === BidStatus.accepted,
  );
  const assignedJobs = (allJobs ?? []).filter(
    (j) =>
      j.assignedTo?.toString() === userProfile?.principal?.toString() &&
      [JobStatus.assigned, JobStatus.inProgress].includes(j.status),
  ).length;
  const completedJobs = (allJobs ?? []).filter(
    (j) =>
      j.assignedTo?.toString() === userProfile?.principal?.toString() &&
      [JobStatus.completed, JobStatus.reviewed].includes(j.status),
  ).length;
  const avgRating = reviews?.length
    ? (
        reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
      ).toFixed(1)
    : "\u2014";

  const isVerified = userProfile?.isVerified;

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Provider Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="font-display font-bold text-foreground text-2xl">
            Welcome, {userProfile?.name?.split(" ")[0] ?? "Provider"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Skilled Service Provider
          </p>
        </div>

        {!isVerified && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Your account is pending verification by admin. You can browse jobs
              but bidding will be activated after verification.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Active Bids",
              value: activeBids,
              icon: Clock,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Assigned Jobs",
              value: assignedJobs,
              icon: Briefcase,
              color: "text-accent-orange",
              bg: "bg-orange-100",
            },
            {
              label: "Completed",
              value: completedJobs,
              icon: CheckCircle2,
              color: "text-green-600",
              bg: "bg-green-100",
            },
            {
              label: "Avg. Rating",
              value: avgRating,
              icon: Star,
              color: "text-yellow-500",
              bg: "bg-yellow-50",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="border border-border shadow-card rounded-xl">
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => void navigate({ to: "/dashboard/provider/jobs" })}
            className="bg-primary text-white rounded-xl"
            data-ocid="provider.browse_jobs.primary_button"
          >
            <Search className="h-4 w-4 mr-2" />
            Browse Jobs
          </Button>
          <Button
            variant="outline"
            onClick={() => void navigate({ to: "/dashboard/provider/bids" })}
            className="rounded-xl"
            data-ocid="provider.my_bids.button"
          >
            <ListTodo className="h-4 w-4 mr-2" />
            My Bids
          </Button>
          <Button
            variant="outline"
            onClick={() => void navigate({ to: "/dashboard/provider/profile" })}
            className="rounded-xl"
            data-ocid="provider.profile.button"
          >
            <User className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Assigned jobs */}
        <div>
          <h3 className="font-display font-semibold text-foreground text-lg mb-3">
            Assigned Jobs
          </h3>
          {jobsLoading ? (
            <div className="space-y-2" data-ocid="provider.loading_state">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : acceptedBids.length === 0 ? (
            <EmptyState
              title="No assigned jobs"
              description="Start bidding on jobs to get assigned."
              ocid="provider.jobs.empty_state"
              action={
                <Button
                  onClick={() =>
                    void navigate({ to: "/dashboard/provider/jobs" })
                  }
                  className="bg-primary text-white rounded-lg"
                  data-ocid="provider.empty.primary_button"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Browse Jobs
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {acceptedBids.slice(0, 5).map((bid, idx) => (
                <button
                  type="button"
                  key={bid.id.toString()}
                  onClick={() =>
                    void navigate({
                      to: `/dashboard/provider/jobs/${bid.jobId.toString()}` as any,
                    })
                  }
                  className="block w-full text-left"
                  data-ocid={`provider.jobs.item.${idx + 1}`}
                >
                  <Card className="border border-border rounded-xl hover:shadow-card transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Job #{bid.jobId.toString()}
                        </p>
                        <StatusBadge status={BidStatus.accepted} type="bid" />
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
