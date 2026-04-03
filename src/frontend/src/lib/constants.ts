import { BidStatus, JobStatus, SRMRole } from "../backend";

export const JOB_CATEGORIES = [
  "Electrical",
  "Plumbing",
  "Mechanical",
  "Carpentry",
  "Painting",
  "IT Services",
  "Civil",
  "Other",
] as const;

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  [JobStatus.posted]: "Posted",
  [JobStatus.bidding]: "Bidding",
  [JobStatus.assigned]: "Assigned",
  [JobStatus.inProgress]: "In Progress",
  [JobStatus.completed]: "Completed",
  [JobStatus.reviewed]: "Reviewed",
  [JobStatus.cancelled]: "Cancelled",
  [JobStatus.disputed]: "Disputed",
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  [JobStatus.posted]: "bg-blue-100 text-blue-700 border-blue-200",
  [JobStatus.bidding]: "bg-yellow-100 text-yellow-700 border-yellow-200",
  [JobStatus.assigned]: "bg-purple-100 text-purple-700 border-purple-200",
  [JobStatus.inProgress]: "bg-orange-100 text-orange-700 border-orange-200",
  [JobStatus.completed]: "bg-green-100 text-green-700 border-green-200",
  [JobStatus.reviewed]: "bg-teal-100 text-teal-700 border-teal-200",
  [JobStatus.cancelled]: "bg-gray-100 text-gray-600 border-gray-200",
  [JobStatus.disputed]: "bg-red-100 text-red-700 border-red-200",
};

export const BID_STATUS_COLORS: Record<BidStatus, string> = {
  [BidStatus.pending]: "bg-yellow-100 text-yellow-700 border-yellow-200",
  [BidStatus.accepted]: "bg-green-100 text-green-700 border-green-200",
  [BidStatus.rejected]: "bg-red-100 text-red-700 border-red-200",
};

export const ROLE_LABELS: Record<SRMRole, string> = {
  [SRMRole.admin]: "Admin",
  [SRMRole.institution]: "Institution",
  [SRMRole.serviceProvider]: "Service Provider",
};

export function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(timestamp: bigint): string {
  return new Date(Number(timestamp)).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function shortenPrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
