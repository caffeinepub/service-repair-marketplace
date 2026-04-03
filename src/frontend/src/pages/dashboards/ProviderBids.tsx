import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Briefcase, ExternalLink, ListTodo, Search, User } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import BidCard from "../../components/shared/BidCard";
import EmptyState from "../../components/shared/EmptyState";
import { useGetBidsByProvider } from "../../hooks/useQueries";

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

export default function ProviderBids() {
  const { data: bids, isLoading } = useGetBidsByProvider();
  const navigate = useNavigate();

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="My Bids">
      <div className="space-y-4">
        <h2 className="font-display font-bold text-foreground text-xl">
          My Bids
        </h2>

        {isLoading ? (
          <div className="space-y-3" data-ocid="provider.bids.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : !bids || bids.length === 0 ? (
          <EmptyState
            title="No bids yet"
            description="Browse jobs and submit your first bid."
            ocid="provider.bids.empty_state"
            action={
              <Button
                onClick={() =>
                  void navigate({ to: "/dashboard/provider/jobs" })
                }
                className="bg-primary text-white rounded-lg"
                data-ocid="provider.bids.empty.primary_button"
              >
                <Search className="h-4 w-4 mr-2" />
                Browse Jobs
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {bids.map((bid, idx) => (
              <BidCard
                key={bid.id.toString()}
                bid={bid}
                index={idx + 1}
                actions={
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      void navigate({
                        to: `/dashboard/provider/jobs/${bid.jobId.toString()}` as any,
                      })
                    }
                    data-ocid={`provider.bids.item.${idx + 1}.button`}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Job
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
