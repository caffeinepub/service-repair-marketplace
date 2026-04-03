# Service & Repair Marketplace (SRM)

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Full-stack ICP decentralized marketplace connecting Government Institutions (demand) with ITI-trained Service Providers (supply)
- Three user roles: Admin, Institution, Service Provider
- Authentication: role-based access with ICP authorization component
- Institution Dashboard: post jobs (title, description, category, budget, deadline, location, image upload), view/accept/reject bids, track job status
- Service Provider Dashboard: profile (skills, experience, certifications upload), browse/search/filter jobs, submit bids (amount + message), track assigned work, mark job completed
- Admin Panel: verify providers, monitor all jobs, basic analytics (job counts, bid counts, user counts), handle disputes (change job status)
- Job lifecycle: Posted → Bidding → Assigned → InProgress → Completed → Reviewed
- Bid system: create bid, accept bid (assigns job), reject bid
- Rating & review system: institution rates provider after job completion
- Notifications: in-app notification list per user (new bid, bid accepted/rejected, job assigned, job completed)
- Search & filter: search jobs by title/category/location, filter by status/budget range
- File uploads: job images and provider certifications via blob-storage component
- Stable storage for all structured data (users, jobs, bids, reviews, notifications)

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- User management: register, login (username/password hash), get profile, update profile, role-based guards
- Job management: createJob, getJobs (with filters), getJobById, updateJobStatus, deleteJob
- Bid management: createBid, getBidsForJob, getBidsForProvider, acceptBid, rejectBid
- Review management: createReview, getReviewsForProvider
- Notification management: createNotification, getNotifications, markNotificationRead
- Admin: verifyProvider, getAnalytics, getAllUsers, getAllJobs, resolveDispute
- Stable storage: HashMap-based stores for users, jobs, bids, reviews, notifications with auto-incrementing IDs
- Authorization component for session/role management
- Blob-storage component for file uploads

### Frontend (React + Tailwind)
- Landing page: hero, features section, how it works, CTA
- Auth pages: Login, Register (with role selection)
- Role-based routing: redirect to correct dashboard after login
- Institution Dashboard: job post form, my jobs list, job detail (bids panel), status tracker
- Provider Dashboard: profile editor, job browser (search/filter), job detail (bid form), my bids, assigned jobs
- Admin Panel: provider verification list, jobs monitor, analytics cards, dispute management
- Shared components: Navigation, NotificationBell, StatusBadge, LoadingSpinner, ErrorBoundary
- Mobile-first responsive layout
- Government-friendly: high contrast, accessible, large touch targets
