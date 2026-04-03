import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { JobStatus } from "../../backend";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmptyState from "../../components/shared/EmptyState";
import JobCard from "../../components/shared/JobCard";
import SearchFilter from "../../components/shared/SearchFilter";
import { useAppContext } from "../../hooks/useAppContext";
import { useGetJobsByInstitution } from "../../hooks/useQueries";

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

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: JobStatus.posted, label: "Posted" },
  { value: JobStatus.bidding, label: "Bidding" },
  { value: JobStatus.assigned, label: "Assigned" },
  { value: JobStatus.inProgress, label: "In Progress" },
  { value: JobStatus.completed, label: "Completed" },
];

export default function InstitutionJobs() {
  const { userProfile } = useAppContext();
  const institutionId = userProfile?.principal?.toString();
  const { data: jobs, isLoading } = useGetJobsByInstitution(institutionId);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [statusTab, setStatusTab] = useState("all");

  const filtered = (jobs ?? []).filter((j) => {
    if (statusTab !== "all" && j.status !== statusTab) return false;
    if (category && category !== "all" && j.category !== category) return false;
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="My Jobs">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-foreground text-xl">
            My Jobs
          </h2>
          <Button
            asChild
            className="bg-primary text-white rounded-xl"
            size="sm"
            data-ocid="institution.jobs.new.primary_button"
          >
            <Link to="/dashboard/institution/jobs/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Post Job
            </Link>
          </Button>
        </div>

        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          onReset={() => {
            setSearch("");
            setCategory("all");
          }}
        />

        <Tabs value={statusTab} onValueChange={setStatusTab}>
          <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {STATUS_TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="text-xs"
                data-ocid="institution.jobs.status.tab"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={statusTab} className="mt-4">
            {isLoading ? (
              <div
                className="space-y-3"
                data-ocid="institution.jobs.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No jobs found"
                description="Try adjusting your filters or post a new job."
                ocid="institution.jobs.empty_state"
                action={
                  <Button
                    asChild
                    className="bg-primary text-white rounded-lg"
                    data-ocid="institution.jobs.empty.primary_button"
                  >
                    <Link to="/dashboard/institution/jobs/new">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Post a Job
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filtered.map((job, idx) => (
                  <JobCard
                    key={job.id.toString()}
                    job={job}
                    linkPrefix="/dashboard/institution/jobs"
                    index={idx + 1}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
