import type { BidStatus, JobStatus } from "../../backend";
import {
  BID_STATUS_COLORS,
  JOB_STATUS_COLORS,
  JOB_STATUS_LABELS,
} from "../../lib/constants";

interface StatusBadgeProps {
  status: JobStatus | BidStatus;
  type?: "job" | "bid";
  className?: string;
}

export default function StatusBadge({
  status,
  type = "job",
  className = "",
}: StatusBadgeProps) {
  const colorClass =
    type === "job"
      ? (JOB_STATUS_COLORS[status as JobStatus] ??
        "bg-gray-100 text-gray-600 border-gray-200")
      : (BID_STATUS_COLORS[status as BidStatus] ??
        "bg-gray-100 text-gray-600 border-gray-200");

  const label =
    type === "job"
      ? (JOB_STATUS_LABELS[status as JobStatus] ?? status)
      : (status as string).charAt(0).toUpperCase() +
        (status as string).slice(1);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}
