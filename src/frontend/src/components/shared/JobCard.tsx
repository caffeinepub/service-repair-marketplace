import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { Clock, DollarSign, MapPin, Tag, Users } from "lucide-react";
import type { JobInfo } from "../../backend";
import { formatCurrency, formatDate } from "../../lib/constants";
import StatusBadge from "./StatusBadge";

interface JobCardProps {
  job: JobInfo;
  linkPrefix?: string;
  bidCount?: number;
  index?: number;
}

export default function JobCard({
  job,
  linkPrefix = "/dashboard/provider/jobs",
  bidCount,
  index = 1,
}: JobCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    const path = `${linkPrefix}/${job.id.toString()}`;
    void navigate({ to: path as any });
  };

  return (
    <Card
      className="hover:shadow-card transition-shadow border border-border rounded-xl"
      data-ocid={`jobs.item.${index}`}
    >
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={job.status} type="job" />
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {job.category}
              </span>
            </div>
            <h3 className="font-display font-semibold text-foreground text-base line-clamp-1 mt-1">
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {job.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5 flex-shrink-0 text-accent-orange" />
            <span className="truncate">{formatCurrency(job.budget)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
            <span className="truncate">{formatDate(job.deadline)}</span>
          </div>
          {bidCount !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
              <span>
                {bidCount} bid{bidCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={handleClick}
            className="rounded-lg border-primary text-primary hover:bg-primary hover:text-white"
            data-ocid={`jobs.item.${index}.button`}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
