import { Toaster } from "@/components/ui/sonner";
import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { SRMRole } from "./backend";
import LoadingSpinner from "./components/shared/LoadingSpinner";
import { AppProvider, useAppContext } from "./hooks/useAppContext";

import AuthPage from "./pages/Auth";
// Pages
import Landing from "./pages/Landing";
import ProvidersPage from "./pages/ProvidersPage";
import PublicJobs from "./pages/PublicJobs";

// Institution pages
import InstitutionDashboard from "./pages/dashboards/InstitutionDashboard";
import InstitutionJobDetail from "./pages/dashboards/InstitutionJobDetail";
import InstitutionJobs from "./pages/dashboards/InstitutionJobs";
import InstitutionProfile from "./pages/dashboards/InstitutionProfile";
import NewJob from "./pages/dashboards/NewJob";

import ProviderBids from "./pages/dashboards/ProviderBids";
import ProviderBrowseJobs from "./pages/dashboards/ProviderBrowseJobs";
// Provider pages
import ProviderDashboard from "./pages/dashboards/ProviderDashboard";
import ProviderJobDetail from "./pages/dashboards/ProviderJobDetail";
import ProviderProfile from "./pages/dashboards/ProviderProfile";

// Admin pages
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import AdminJobs from "./pages/dashboards/AdminJobs";
import AdminProviders from "./pages/dashboards/AdminProviders";
import AdminUsers from "./pages/dashboards/AdminUsers";

// Auth guard wrapper
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoadingProfile } = useAppContext();
  if (isLoadingProfile) return <LoadingSpinner className="min-h-screen" />;
  if (!isAuthenticated) return <Navigate to="/auth" />;
  return <>{children}</>;
}

function DashboardRedirect() {
  const { role, isLoadingProfile } = useAppContext();
  if (isLoadingProfile) return <LoadingSpinner className="min-h-screen" />;
  if (role === SRMRole.institution)
    return <Navigate to="/dashboard/institution" />;
  if (role === SRMRole.serviceProvider)
    return <Navigate to="/dashboard/provider" />;
  if (role === SRMRole.admin) return <Navigate to="/dashboard/admin" />;
  return <Navigate to="/auth" />;
}

// Router setup
const rootRoute = createRootRoute({
  component: () => (
    <AppProvider>
      <Outlet />
      <Toaster richColors position="top-right" />
    </AppProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Landing,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const jobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jobs",
  component: PublicJobs,
});

const providersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/providers",
  component: ProvidersPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardRedirect,
});

// Institution routes
const institutionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/institution",
  component: () => (
    <RequireAuth>
      <InstitutionDashboard />
    </RequireAuth>
  ),
});

const institutionJobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/institution/jobs",
  component: () => (
    <RequireAuth>
      <InstitutionJobs />
    </RequireAuth>
  ),
});

const newJobRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/institution/jobs/new",
  component: () => (
    <RequireAuth>
      <NewJob />
    </RequireAuth>
  ),
});

const institutionJobDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/institution/jobs/$jobId",
  component: () => (
    <RequireAuth>
      <InstitutionJobDetail />
    </RequireAuth>
  ),
});

const institutionProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/institution/profile",
  component: () => (
    <RequireAuth>
      <InstitutionProfile />
    </RequireAuth>
  ),
});

// Provider routes
const providerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/provider",
  component: () => (
    <RequireAuth>
      <ProviderDashboard />
    </RequireAuth>
  ),
});

const providerJobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/provider/jobs",
  component: () => (
    <RequireAuth>
      <ProviderBrowseJobs />
    </RequireAuth>
  ),
});

const providerJobDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/provider/jobs/$jobId",
  component: () => (
    <RequireAuth>
      <ProviderJobDetail />
    </RequireAuth>
  ),
});

const providerBidsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/provider/bids",
  component: () => (
    <RequireAuth>
      <ProviderBids />
    </RequireAuth>
  ),
});

const providerProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/provider/profile",
  component: () => (
    <RequireAuth>
      <ProviderProfile />
    </RequireAuth>
  ),
});

// Admin routes
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/admin",
  component: () => (
    <RequireAuth>
      <AdminDashboard />
    </RequireAuth>
  ),
});

const adminProvidersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/admin/providers",
  component: () => (
    <RequireAuth>
      <AdminProviders />
    </RequireAuth>
  ),
});

const adminJobsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/admin/jobs",
  component: () => (
    <RequireAuth>
      <AdminJobs />
    </RequireAuth>
  ),
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/admin/users",
  component: () => (
    <RequireAuth>
      <AdminUsers />
    </RequireAuth>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  jobsRoute,
  providersRoute,
  dashboardRoute,
  institutionRoute,
  institutionJobsRoute,
  newJobRoute,
  institutionJobDetailRoute,
  institutionProfileRoute,
  providerRoute,
  providerJobsRoute,
  providerJobDetailRoute,
  providerBidsRoute,
  providerProfileRoute,
  adminRoute,
  adminProvidersRoute,
  adminJobsRoute,
  adminUsersRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
