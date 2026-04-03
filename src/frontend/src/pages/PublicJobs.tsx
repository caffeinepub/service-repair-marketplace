import { useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { JobStatus } from "../backend";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import EmptyState from "../components/shared/EmptyState";
import JobCard from "../components/shared/JobCard";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import SearchFilter from "../components/shared/SearchFilter";
import { useGetAllJobs } from "../hooks/useQueries";

export default function PublicJobs() {
  const searchParams = useSearch({ from: "/jobs" });
  const { data: jobs, isLoading } = useGetAllJobs();

  const [search, setSearch] = useState((searchParams as any)?.search ?? "");
  const [category, setCategory] = useState(
    (searchParams as any)?.category ?? "all",
  );
  const [location, setLocation] = useState(
    (searchParams as any)?.location ?? "",
  );

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
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-6">
          <h1 className="font-display font-bold text-foreground text-3xl mb-1">
            Browse Jobs
          </h1>
          <p className="text-muted-foreground">
            {available.length} available jobs
          </p>
        </div>

        <div className="mb-6">
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
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-20" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No jobs found"
            description="Try different search terms or check back later."
            ocid="public.jobs.empty_state"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </main>
      <Footer />
    </div>
  );
}
