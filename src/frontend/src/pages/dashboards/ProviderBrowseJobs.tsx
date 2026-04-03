import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, ListTodo, Search, User } from "lucide-react";
import { useState } from "react";
import { JobStatus } from "../../backend";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmptyState from "../../components/shared/EmptyState";
import JobCard from "../../components/shared/JobCard";
import SearchFilter from "../../components/shared/SearchFilter";
import { useGetAllJobs } from "../../hooks/useQueries";

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

export default function ProviderBrowseJobs() {
  const { data: jobs, isLoading } = useGetAllJobs();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("");

  const available = (jobs ?? []).filter(
    (j) => j.status === JobStatus.posted || j.status === JobStatus.bidding,
  );

  const filtered = available.filter((j) => {
    if (category && category !== "all" && j.category !== category) return false;
    if (location && !j.location.toLowerCase().includes(location.toLowerCase()))
      return false;
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Browse Jobs">
      <div className="space-y-4">
        <h2 className="font-display font-bold text-foreground text-xl">
          Browse Available Jobs
        </h2>

        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          location={location}
          onLocationChange={setLocation}
          onReset={() => {
            setSearch("");
            setCategory("all");
            setLocation("");
          }}
        />

        {isLoading ? (
          <div className="space-y-4" data-ocid="provider.jobs.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No jobs available"
            description="No jobs match your filters. Try adjusting your search."
            ocid="provider.jobs.empty_state"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((job, idx) => (
              <JobCard
                key={job.id.toString()}
                job={job}
                linkPrefix="/dashboard/provider/jobs"
                index={idx + 1}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
