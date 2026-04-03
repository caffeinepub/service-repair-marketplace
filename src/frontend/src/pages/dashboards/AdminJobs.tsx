import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, ListChecks, ShieldCheck, UserCog } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type JobInfo, JobStatus } from "../../backend";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmptyState from "../../components/shared/EmptyState";
import JobCard from "../../components/shared/JobCard";
import SearchFilter from "../../components/shared/SearchFilter";
import { useGetAllJobs, useUpdateJob } from "../../hooks/useQueries";
import { JOB_STATUS_LABELS } from "../../lib/constants";

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

const ADMIN_STATUS_TABS = [
  { value: "all", label: "All" },
  { value: JobStatus.posted, label: "Posted" },
  { value: JobStatus.bidding, label: "Bidding" },
  { value: JobStatus.assigned, label: "Assigned" },
  { value: JobStatus.inProgress, label: "In Progress" },
  { value: JobStatus.disputed, label: "Disputed" },
  { value: JobStatus.completed, label: "Completed" },
];

export default function AdminJobs() {
  const { data: jobs, isLoading } = useGetAllJobs();
  const updateJob = useUpdateJob();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [statusTab, setStatusTab] = useState("all");

  const filtered = (jobs ?? []).filter((j) => {
    if (statusTab !== "all" && j.status !== statusTab) return false;
    if (category !== "all" && j.category !== category) return false;
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const handleResolveDispute = async (jobId: bigint, job: JobInfo) => {
    try {
      await updateJob.mutateAsync({
        jobId,
        jobInfo: { ...job, status: JobStatus.assigned },
      });
      toast.success("Dispute resolved. Job status restored.");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to resolve dispute");
    }
  };

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="All Jobs">
      <div className="space-y-4">
        <h2 className="font-display font-bold text-foreground text-xl">
          Monitor All Jobs
        </h2>

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
            {ADMIN_STATUS_TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="text-xs"
                data-ocid="admin.jobs.status.tab"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={statusTab} className="mt-4">
            {isLoading ? (
              <div className="space-y-3" data-ocid="admin.jobs.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No jobs found"
                description="No jobs match this filter."
                ocid="admin.jobs.empty_state"
              />
            ) : (
              <div className="space-y-4">
                {filtered.map((job, idx) => (
                  <div key={job.id.toString()}>
                    <JobCard
                      job={job}
                      linkPrefix="/dashboard/provider/jobs"
                      index={idx + 1}
                    />
                    {job.status === JobStatus.disputed && (
                      <div className="mt-2 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => handleResolveDispute(job.id, job)}
                          disabled={updateJob.isPending}
                          data-ocid={`admin.jobs.item.${idx + 1}.primary_button`}
                        >
                          Resolve Dispute
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
