# Service & Repair Marketplace

## Current State

SRM has three role dashboards. After login, users redirect to their role dashboard.
Admin dashboard calls getAnalytics() and getUnverifiedProviders() - both require isSRMAdmin().

Bug: after logging in as Platform Admin, the admin dashboard appears blank/empty.

Root causes:
1. Landing.tsx calls useGetAnalytics() which traps for non-admin users
2. AdminDashboard has no error/empty fallback - blank when queries fail
3. useAppContext does not handle query errors from useGetCallerUserProfile
4. No role guard on admin routes

## Requested Changes (Diff)

### Add
- RequireAdmin wrapper in App.tsx for /dashboard/admin/* routes
- Error/empty states in AdminDashboard when queries fail
- isError handling in useAppContext

### Modify
- Landing.tsx: replace useGetAnalytics() with useGetAllJobs()+useGetProviders() for stats
- useQueries.ts useGetCallerUserProfile: add throwOnError: false
- useAppContext.tsx: handle isError from profile query
- AdminDashboard.tsx: add isError states and loading UI
- App.tsx: add RequireAdmin guard for admin routes

### Remove
- Nothing

## Implementation Plan

1. Fix Landing.tsx stats: use getAllJobs() and getProviders() counts instead of getAnalytics()
2. Fix useGetCallerUserProfile: add throwOnError: false
3. Fix useAppContext: handle isError gracefully
4. Fix AdminDashboard: add error states so blank screen is replaced with informative UI
5. Add RequireAdmin in App.tsx for admin routes
