import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  ListChecks,
  ShieldCheck,
  Trash2,
  User,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import { SRMRole } from "../../backend";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmptyState from "../../components/shared/EmptyState";
import { useDeleteUser, useGetAllUsers } from "../../hooks/useQueries";
import { ROLE_LABELS, shortenPrincipal } from "../../lib/constants";

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

const ROLE_BADGE_COLORS: Record<SRMRole, string> = {
  [SRMRole.admin]: "bg-red-100 text-red-700 border-red-200",
  [SRMRole.institution]: "bg-blue-100 text-blue-700 border-blue-200",
  [SRMRole.serviceProvider]: "bg-orange-100 text-orange-700 border-orange-200",
};

export default function AdminUsers() {
  const { data: users, isLoading } = useGetAllUsers();
  const deleteUser = useDeleteUser();

  const handleDelete = async (
    userId: import("@icp-sdk/core/principal").Principal,
    name: string,
  ) => {
    try {
      await deleteUser.mutateAsync(userId);
      toast.success(`User "${name}" deleted successfully`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete user");
    }
  };

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="All Users">
      <div className="space-y-4">
        <h2 className="font-display font-bold text-foreground text-xl">
          All Users
        </h2>
        <p className="text-sm text-muted-foreground">
          {users?.length ?? 0} registered users
        </p>

        {isLoading ? (
          <div className="space-y-3" data-ocid="admin.users.loading_state">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : !users || users.length === 0 ? (
          <EmptyState
            title="No users registered"
            ocid="admin.users.empty_state"
          />
        ) : (
          <div className="grid grid-cols-1 gap-3" data-ocid="admin.users.table">
            {users.map((user, idx) => (
              <Card
                key={user.principal.toString()}
                className="border border-border rounded-xl"
                data-ocid={`admin.users.item.${idx + 1}`}
              >
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage.getDirectURL()}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {shortenPrincipal(user.principal.toString())}
                      </p>
                      {user.organization && (
                        <p className="text-xs text-muted-foreground">
                          {user.organization}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${ROLE_BADGE_COLORS[user.role]}`}
                    >
                      {ROLE_LABELS[user.role]}
                    </span>
                    {user.isVerified && (
                      <Badge
                        variant="outline"
                        className="text-green-700 border-green-200 text-xs"
                      >
                        ✓ Verified
                      </Badge>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          className="ml-1 p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          data-ocid={`admin.users.delete_button.${idx + 1}`}
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent data-ocid="admin.users.dialog">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>{user.name}</strong>? This action cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-ocid="admin.users.cancel_button">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDelete(user.principal, user.name)
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            data-ocid="admin.users.confirm_button"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
