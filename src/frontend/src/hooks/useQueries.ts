import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Analytics,
  BidInfo,
  JobInfo,
  JobStatus,
  ReviewInfo,
  UserInfo,
} from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ──────────────────────────────────────────────
// User profile queries
// ──────────────────────────────────────────────
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserInfo | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 1000 * 60 * 5,
    throwOnError: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserInfo[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProviders() {
  const { actor, isFetching } = useActor();
  return useQuery<UserInfo[]>({
    queryKey: ["providers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProviders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUnverifiedProviders() {
  const { actor, isFetching } = useActor();
  return useQuery<UserInfo[]>({
    queryKey: ["unverifiedProviders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUnverifiedProviders();
    },
    enabled: !!actor && !isFetching,
    throwOnError: false,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserInfo) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useUpdateUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userInfo: UserInfo) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateUser(userInfo);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
      qc.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useVerifyProvider() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      providerId: import("@icp-sdk/core/principal").Principal,
    ) => {
      if (!actor) throw new Error("Not connected");
      return actor.verifyProvider(providerId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["unverifiedProviders"] });
      qc.invalidateQueries({ queryKey: ["providers"] });
      qc.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useDeleteUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: import("@icp-sdk/core/principal").Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteUser(userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

// ──────────────────────────────────────────────
// Job queries
// ──────────────────────────────────────────────
export function useGetAllJobs() {
  const { actor, isFetching } = useActor();
  return useQuery<JobInfo[]>({
    queryKey: ["allJobs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllJobs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetJob(jobId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<JobInfo | null>({
    queryKey: ["job", jobId?.toString()],
    queryFn: async () => {
      if (!actor || jobId === null) return null;
      return actor.getJob(jobId);
    },
    enabled: !!actor && !isFetching && jobId !== null,
  });
}

export function useGetJobsByInstitution(institutionId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<JobInfo[]>({
    queryKey: ["institutionJobs", institutionId],
    queryFn: async () => {
      if (!actor || !institutionId) return [];
      return actor.getJobsByInstitution(institutionId);
    },
    enabled: !!actor && !isFetching && !!institutionId,
  });
}

export function useSaveJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobInfo: JobInfo) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveJob(jobInfo);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allJobs"] });
      qc.invalidateQueries({ queryKey: ["institutionJobs"] });
    },
  });
}

export function useUpdateJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      jobId,
      jobInfo,
    }: { jobId: bigint; jobInfo: JobInfo }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateJob(jobId, jobInfo);
    },
    onSuccess: (_d, { jobId }) => {
      qc.invalidateQueries({ queryKey: ["job", jobId.toString()] });
      qc.invalidateQueries({ queryKey: ["allJobs"] });
      qc.invalidateQueries({ queryKey: ["institutionJobs"] });
    },
  });
}

// ──────────────────────────────────────────────
// Bid queries
// ──────────────────────────────────────────────
export function useGetBidsForJob(jobId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<BidInfo[]>({
    queryKey: ["bidsForJob", jobId?.toString()],
    queryFn: async () => {
      if (!actor || jobId === null) return [];
      return actor.getBidsForJob(jobId);
    },
    enabled: !!actor && !isFetching && jobId !== null,
  });
}

export function useGetBidsByProvider() {
  const { actor, isFetching } = useActor();
  return useQuery<BidInfo[]>({
    queryKey: ["providerBids"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBidsByProvider();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitBid() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bidInfo: BidInfo) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitBid(bidInfo);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bidsForJob"] });
      qc.invalidateQueries({ queryKey: ["providerBids"] });
    },
  });
}

export function useAcceptBid() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bidId, jobId }: { bidId: bigint; jobId: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.acceptBid(bidId, jobId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bidsForJob"] });
      qc.invalidateQueries({ queryKey: ["allJobs"] });
      qc.invalidateQueries({ queryKey: ["institutionJobs"] });
      qc.invalidateQueries({ queryKey: ["job"] });
    },
  });
}

export function useRejectBid() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bidId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.rejectBid(bidId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bidsForJob"] });
    },
  });
}

// ──────────────────────────────────────────────
// Review queries
// ──────────────────────────────────────────────
export function useGetReviewsByProvider(
  providerId: import("@icp-sdk/core/principal").Principal | undefined,
) {
  const { actor, isFetching } = useActor();
  return useQuery<ReviewInfo[]>({
    queryKey: ["reviewsByProvider", providerId?.toString()],
    queryFn: async () => {
      if (!actor || !providerId) return [];
      return actor.getReviewsByProvider(providerId);
    },
    enabled: !!actor && !isFetching && !!providerId,
  });
}

export function useGetReviewsByJob(jobId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ReviewInfo[]>({
    queryKey: ["reviewsByJob", jobId?.toString()],
    queryFn: async () => {
      if (!actor || jobId === null) return [];
      return actor.getReviewsByJob(jobId);
    },
    enabled: !!actor && !isFetching && jobId !== null,
  });
}

export function useSubmitReview() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reviewInfo: ReviewInfo) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitReview(reviewInfo);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviewsByJob"] });
      qc.invalidateQueries({ queryKey: ["reviewsByProvider"] });
      qc.invalidateQueries({ queryKey: ["allJobs"] });
    },
  });
}

// ──────────────────────────────────────────────
// Analytics
// ──────────────────────────────────────────────
export function useGetAnalytics() {
  const { actor, isFetching } = useActor();
  return useQuery<Analytics>({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAnalytics();
    },
    enabled: !!actor && !isFetching,
    throwOnError: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFilterJobsByStatus(status: JobStatus | null) {
  const { actor, isFetching } = useActor();
  return useQuery<JobInfo[]>({
    queryKey: ["jobsByStatus", status],
    queryFn: async () => {
      if (!actor || !status) return [];
      return actor.filterJobsByStatus(status);
    },
    enabled: !!actor && !isFetching && !!status,
  });
}
