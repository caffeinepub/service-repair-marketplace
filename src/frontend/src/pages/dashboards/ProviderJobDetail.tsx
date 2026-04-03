import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "@tanstack/react-router";
import {
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  ListTodo,
  Loader2,
  MapPin,
  Search,
  Tag,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BidStatus, JobStatus } from "../../backend";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmptyState from "../../components/shared/EmptyState";
import StarRating from "../../components/shared/StarRating";
import StatusBadge from "../../components/shared/StatusBadge";
import { useAppContext } from "../../hooks/useAppContext";
import {
  useGetBidsForJob,
  useGetJob,
  useGetReviewsByJob,
  useSubmitBid,
  useUpdateJob,
} from "../../hooks/useQueries";
import { formatCurrency, formatDate } from "../../lib/constants";

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

export default function ProviderJobDetail() {
  const { jobId } = useParams({ from: "/dashboard/provider/jobs/$jobId" });
  const { userProfile } = useAppContext();
  const jobIdBig = jobId ? BigInt(jobId) : null;

  const { data: job, isLoading: jobLoading } = useGetJob(jobIdBig);
  const { data: bids } = useGetBidsForJob(jobIdBig);
  const { data: reviews } = useGetReviewsByJob(jobIdBig);
  const submitBid = useSubmitBid();
  const updateJob = useUpdateJob();

  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");

  const myBid = (bids ?? []).find(
    (b) => b.userId.toString() === userProfile?.principal?.toString(),
  );
  const isAssignedToMe =
    job?.assignedTo?.toString() === userProfile?.principal?.toString();
  const avgRating = reviews?.length
    ? (
        reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length
      ).toFixed(1)
    : null;

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !userProfile || !jobIdBig) return;
    if (!bidAmount) {
      toast.error("Please enter a bid amount");
      return;
    }
    try {
      await submitBid.mutateAsync({
        id: BigInt(0),
        jobId: jobIdBig,
        userId: userProfile.principal,
        bidAmount: Number(bidAmount),
        message: bidMessage,
        status: BidStatus.pending,
        createdAt: BigInt(Date.now()),
      });
      toast.success("Bid submitted successfully!");
      setBidAmount("");
      setBidMessage("");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to submit bid");
    }
  };

  const handleMarkCompleted = async () => {
    if (!job || !jobIdBig) return;
    try {
      await updateJob.mutateAsync({
        jobId: jobIdBig,
        jobInfo: { ...job, status: JobStatus.completed },
      });
      toast.success("Job marked as completed!");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update job");
    }
  };

  if (jobLoading) {
    return (
      <DashboardLayout navItems={NAV_ITEMS} title="Job Details">
        <div
          className="space-y-4 max-w-2xl"
          data-ocid="provider.job.loading_state"
        >
          <Skeleton className="h-12 w-2/3 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout navItems={NAV_ITEMS} title="Job Details">
        <EmptyState
          title="Job not found"
          description="This job doesn't exist or has been removed."
        />
      </DashboardLayout>
    );
  }

  const canBid =
    !myBid &&
    (job.status === JobStatus.posted || job.status === JobStatus.bidding);

  return (
    <DashboardLayout navItems={NAV_ITEMS} title={job.title}>
      <div className="max-w-2xl space-y-5">
        <Card className="border border-border rounded-xl shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <StatusBadge status={job.status} type="job" />
                <CardTitle className="font-display text-xl mt-2">
                  {job.title}
                </CardTitle>
              </div>
              {isAssignedToMe && job.status === JobStatus.inProgress && (
                <Button
                  onClick={handleMarkCompleted}
                  disabled={updateJob.isPending}
                  className="bg-green-600 text-white rounded-lg hover:bg-green-700"
                  data-ocid="provider.job.complete.primary_button"
                >
                  {updateJob.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Mark as Completed"
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">{job.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Category
                </p>
                <p className="text-sm font-semibold">{job.category}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Budget
                </p>
                <p className="text-sm font-semibold">
                  {formatCurrency(job.budget)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Deadline
                </p>
                <p className="text-sm font-semibold">
                  {formatDate(job.deadline)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Location
                </p>
                <p className="text-sm font-semibold">{job.location}</p>
              </div>
            </div>

            {avgRating && (
              <div className="flex items-center gap-2">
                <StarRating value={Number(avgRating)} readonly size="sm" />
                <span className="text-sm text-muted-foreground">
                  {avgRating} avg rating
                </span>
              </div>
            )}

            {job.images && job.images.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Job Images</p>
                <div className="grid grid-cols-3 gap-2">
                  {job.images.map((img) => (
                    <img
                      key={img.getDirectURL()}
                      src={img.getDirectURL()}
                      alt="job-image"
                      className="rounded-lg aspect-square object-cover border border-border"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Verification card — shown instead of bid form for unverified providers */}
        {canBid && !userProfile?.isVerified && (
          <Card
            className="border border-yellow-200 bg-yellow-50 rounded-xl"
            data-ocid="provider.bid.pending_verification.card"
          >
            <CardContent className="p-5 flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  Pending Verification
                </p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  Admin is reviewing your profile. You'll be notified once
                  verified.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bid submission form — only for verified providers */}
        {canBid && userProfile?.isVerified && (
          <Card className="border border-border rounded-xl shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Submit Your Bid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBid} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bidAmt">Bid Amount (INR) *</Label>
                  <Input
                    id="bidAmt"
                    type="number"
                    min="0"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Up to ${formatCurrency(job.budget)}`}
                    required
                    data-ocid="provider.bid.amount.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bidMsg">Message</Label>
                  <Textarea
                    id="bidMsg"
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    placeholder="Describe your approach and why you're the best fit..."
                    rows={3}
                    data-ocid="provider.bid.message.textarea"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitBid.isPending}
                  className="w-full bg-accent-orange text-white rounded-xl hover:bg-accent-orange/90"
                  data-ocid="provider.bid.submit.primary_button"
                >
                  {submitBid.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Bid"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Existing bid status */}
        {myBid && (
          <Card className="border border-border rounded-xl">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-foreground mb-2">
                Your Bid
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(myBid.bidAmount)}
                  </p>
                  {myBid.message && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {myBid.message}
                    </p>
                  )}
                </div>
                <StatusBadge status={myBid.status} type="bid" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
