import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type JobID = bigint;
export type Time = bigint;
export type ReviewID = bigint;
export interface UserInfo {
    principal: Principal;
    name: string;
    createdAt: Time;
    role: SRMRole;
    experience: string;
    isVerified: boolean;
    organization: string;
    phone: string;
    skills: string;
}
export type UserID = Principal;
export type BidID = bigint;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface ReviewInfo {
    id: ReviewID;
    serviceProviderId: UserID;
    createdAt: Time;
    jobId: JobID;
    feedback: string;
    institutionId: UserID;
    rating: bigint;
}
export interface JobInfo {
    id: bigint;
    status: JobStatus;
    title: string;
    postedBy: UserID;
    assignedTo?: UserID;
    createdAt: Time;
    description: string;
    deadline: Time;
    category: string;
    budget: number;
    location: string;
    images: Array<ExternalBlob>;
}
export interface Analytics {
    totalBids: bigint;
    totalJobs: bigint;
    totalUsers: bigint;
    totalReviews: bigint;
    avgRating: number;
}
export interface BidInfo {
    id: BidID;
    status: BidStatus;
    userId: UserID;
    createdAt: Time;
    jobId: JobID;
    bidAmount: number;
    message: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum BidStatus {
    pending = "pending",
    rejected = "rejected",
    accepted = "accepted"
}
export enum JobStatus {
    assigned = "assigned",
    cancelled = "cancelled",
    disputed = "disputed",
    completed = "completed",
    bidding = "bidding",
    reviewed = "reviewed",
    inProgress = "inProgress",
    posted = "posted"
}
export enum SRMRole {
    admin = "admin",
    institution = "institution",
    serviceProvider = "serviceProvider"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptBid(bidId: bigint, jobId: bigint): Promise<void>;
    addUser(newUserInfo: UserInfo): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    exists(): Promise<boolean>;
    filterJobsByCategory(category: string): Promise<Array<JobInfo>>;
    filterJobsByStatus(status: JobStatus): Promise<Array<JobInfo>>;
    getAllJobs(): Promise<Array<JobInfo>>;
    getAllUsers(): Promise<Array<UserInfo>>;
    getAnalytics(): Promise<Analytics>;
    getBidById(bidId: BidID): Promise<BidInfo | null>;
    getBidsByProvider(): Promise<Array<BidInfo>>;
    getBidsForJob(jobId: JobID): Promise<Array<BidInfo>>;
    getCallerUserProfile(): Promise<UserInfo | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInstitutions(): Promise<Array<UserInfo>>;
    getJob(jobId: bigint): Promise<JobInfo | null>;
    getJobsByInstitution(institutionId: string): Promise<Array<JobInfo>>;
    getProviders(): Promise<Array<UserInfo>>;
    getReviewsByInstitution(): Promise<Array<ReviewInfo>>;
    getReviewsByJob(jobId: JobID): Promise<Array<ReviewInfo>>;
    getReviewsByProvider(providerId: UserID): Promise<Array<ReviewInfo>>;
    getUnverifiedProviders(): Promise<Array<UserInfo>>;
    getUserById(principal: UserID): Promise<UserInfo | null>;
    getUserProfile(user: Principal): Promise<UserInfo | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    rejectBid(bidId: bigint): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserInfo): Promise<void>;
    saveJob(jobInfo: JobInfo): Promise<JobID>;
    searchJobsByLocation(searchTerm: string): Promise<Array<JobInfo>>;
    searchJobsByTitle(searchTerm: string): Promise<Array<JobInfo>>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    submitBid(bidInfo: BidInfo): Promise<BidID>;
    submitJob(jobInfo: JobInfo): Promise<void>;
    submitReview(reviewInfo: ReviewInfo): Promise<ReviewID>;
    updateBid(bidId: BidID, newBidInfo: BidInfo): Promise<void>;
    updateJob(jobId: bigint, newJobInfo: JobInfo): Promise<void>;
    updateUser(newUserInfo: UserInfo): Promise<void>;
    verifyProvider(providerId: UserID): Promise<void>;
}
