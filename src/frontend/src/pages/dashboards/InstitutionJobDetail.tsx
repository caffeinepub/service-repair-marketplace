import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from "@tanstack/react-router";
import {
  Calendar,
  DollarSign,
  LayoutDashboard,
  ListChecks,
  Loader2,
  MapPin,
  PlusCircle,
  Settings,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BidStatus, JobStatus } from "../../backend";
import DashboardLayout from "../../components/layout/DashboardLayout";
import BidCard from "../../components/shared/BidCard";
import EmptyState from "../../components/shared/EmptyState";
import StarRating from "../../components/shared/StarRating";
import StatusBadge from "../../components/shared/StatusBadge";
import { useAppContext } from "../../hooks/useAppContext";
import {
  useAcceptBid,
  useGetBidsForJob,
  useGetJob,
  useGetReviewsByJob,
  useRejectBid,
  useSubmitReview,
  useUpdateJob,
} from "../../hooks/useQueries";
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

export default function InstitutionJobDetail() {
  const { jobId } = useParams({ from: "/dashboard/institution/jobs/$jobId" });
  const { userProfile } = useAppContext();
  const jobIdBig = jobId ? BigInt(jobId) : null;

  const { data: job, isLoading: jobLoading } = useGetJob(jobIdBig);
  const { data: bids, isLoading: bidsLoading } = useGetBidsForJob(jobIdBig);
  const { data: reviews } = useGetReviewsByJob(jobIdBig);
  const acceptBid = useAcceptBid();
  const rejectBid = useRejectBid();
  const updateJob = useUpdateJob();
  const submitReview = useSubmitReview();

  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  const pendingBids = (bids ?? []).filter(
    (b) => b.status === BidStatus.pending,
  );
  const acceptedBid = (bids ?? []).find((b) => b.status === BidStatus.accepted);
  const hasReview = reviews && reviews.length > 0;

  const handleAcceptBid = async (bidId: bigint) => {
    if (!jobIdBig) return;
    try {
      await acceptBid.mutateAsync({ bidId, jobId: jobIdBig });
      toast.success("Bid accepted! Provider has been assigned.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to accept bid");
    }
  };

  const handleRejectBid = async (bidId: bigint) => {
    try {
      await rejectBid.mutateAsync(bidId);
      toast.success("Bid rejected.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to reject bid");
    }
  };

  const handleMarkInProgress = async () => {
    if (!job || !jobIdBig) return;
    try {
      await updateJob.mutateAsync({
        jobId: jobIdBig,
        jobInfo: { ...job, status: JobStatus.inProgress },
      });
      toast.success("Job marked as In Progress.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update job");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !jobIdBig || !userProfile) return;
    const assignedTo = job.assignedTo;
    if (!assignedTo) {
      toast.error("No provider assigned");
      return;
    }
    try {
      await submitReview.mutateAsync({
        id: BigInt(0),
        jobId: jobIdBig,
        rating: BigInt(rating),
        feedback,
        institutionId: userProfile.principal,
        serviceProviderId: assignedTo,
        createdAt: BigInt(Date.now()),
      });
      await updateJob.mutateAsync({
        jobId: jobIdBig,
        jobInfo: { ...job, status: JobStatus.reviewed },
      });
      toast.success("Review submitted!");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to submit review");
    }
  };

  if (jobLoading) {
    return (
      <DashboardLayout navItems={NAV_ITEMS} title="Job Details">
        <div
          className="space-y-4 max-w-3xl"
          data-ocid="institution.job.loading_state"
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
          description="This job doesn't exist or you don't have access."
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={NAV_ITEMS} title={job.title}>
      <div className="max-w-3xl space-y-5">
        <Card className="border border-border rounded-xl shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <StatusBadge status={job.status} type="job" />
                <CardTitle className="font-display text-xl text-foreground mt-2">
                  {job.title}
                </CardTitle>
              </div>
              {job.status === JobStatus.assigned && (
                <Button
                  onClick={handleMarkInProgress}
                  disabled={updateJob.isPending}
                  className="bg-accent-orange text-white rounded-lg"
                  data-ocid="institution.job.mark_progress.button"
                >
                  {updateJob.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Mark In Progress"
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
              {job.description}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Category
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {job.category}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Budget
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {formatCurrency(job.budget)}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Deadline
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {formatDate(job.deadline)}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Location
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {job.location}
                </p>
              </div>
            </div>

            {job.images && job.images.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Attachments ({job.images.length})
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {job.images.map((img) => (
                    <img
                      key={img.getDirectURL()}
                      src={img.getDirectURL()}
                      alt="job-attachment"
                      className="rounded-lg aspect-square object-cover border border-border"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bids */}
        <div>
          <h3 className="font-display font-semibold text-foreground text-lg mb-3">
            Bids ({bids?.length ?? 0})
          </h3>

          {acceptedBid && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-green-600 mb-1">
                ACCEPTED BID
              </p>
              <BidCard bid={acceptedBid} index={1} />
            </div>
          )}

          {bidsLoading ? (
            <div
              className="space-y-3"
              data-ocid="institution.bids.loading_state"
            >
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : pendingBids.length === 0 && !acceptedBid ? (
            <EmptyState
              title="No bids yet"
              description="Providers haven't bid on this job yet."
              ocid="institution.bids.empty_state"
            />
          ) : (
            <div className="space-y-3">
              {pendingBids.map((bid, idx) => (
                <BidCard
                  key={bid.id.toString()}
                  bid={bid}
                  index={idx + 2}
                  actions={
                    <>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                            data-ocid={`bids.item.${idx + 2}.delete_button`}
                          >
                            Reject
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-ocid="bids.reject.dialog">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Reject this bid?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="bids.reject.cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRejectBid(bid.id)}
                              className="bg-destructive text-white"
                              data-ocid="bids.reject.confirm_button"
                            >
                              Reject
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        size="sm"
                        className="bg-primary text-white"
                        onClick={() => handleAcceptBid(bid.id)}
                        disabled={acceptBid.isPending}
                        data-ocid={`bids.item.${idx + 2}.primary_button`}
                      >
                        {acceptBid.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Accept"
                        )}
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Review form */}
        {job.status === JobStatus.completed && !hasReview && (
          <Card className="border border-border rounded-xl shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Leave a Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Rating</Label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share your experience with the provider..."
                    rows={3}
                    data-ocid="institution.review.textarea"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitReview.isPending}
                  className="bg-primary text-white rounded-xl"
                  data-ocid="institution.review.submit.primary_button"
                >
                  {submitReview.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {hasReview && reviews[0] && (
          <Card className="border border-green-200 bg-green-50 rounded-xl">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-green-700 mb-1">
                Review Submitted
              </p>
              <StarRating value={Number(reviews[0].rating)} readonly />
              <p className="text-sm text-foreground/80 mt-2">
                {reviews[0].feedback}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
