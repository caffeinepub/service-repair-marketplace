import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LayoutDashboard,
  ListChecks,
  Loader2,
  PlusCircle,
  Settings,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAppContext } from "../../hooks/useAppContext";
import { useUpdateUser } from "../../hooks/useQueries";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/dashboard/institution",
    icon: LayoutDashboard,
    ocid: "dashboard.nav.overview.link",
  },
  {
    label: "My Jobs",
    to: "/dashboard/institution/jobs",
    icon: ListChecks,
    ocid: "dashboard.nav.jobs.link",
  },
  {
    label: "Post New Job",
    to: "/dashboard/institution/jobs/new",
    icon: PlusCircle,
    ocid: "dashboard.nav.newjob.link",
  },
  {
    label: "Profile",
    to: "/dashboard/institution/profile",
    icon: Settings,
    ocid: "dashboard.nav.profile.link",
  },
];

export default function InstitutionProfile() {
  const { userProfile, refetchProfile } = useAppContext();
  const updateUser = useUpdateUser();
  const [form, setForm] = useState({
    name: userProfile?.name ?? "",
    phone: userProfile?.phone ?? "",
    organization: userProfile?.organization ?? "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    try {
      await updateUser.mutateAsync({
        ...userProfile,
        name: form.name,
        phone: form.phone,
        organization: form.organization,
      });
      refetchProfile();
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update profile");
    }
  };

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Profile">
      <div className="max-w-xl space-y-5">
        <Card className="border border-border shadow-card rounded-xl">
          <CardHeader className="flex-row items-center gap-4 pb-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display text-xl">
                {userProfile?.name ?? "Institution"}
              </CardTitle>
              <CardDescription>{userProfile?.organization}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="iname">Full Name</Label>
                <Input
                  id="iname"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  data-ocid="institution.profile.name.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="iphone">Phone</Label>
                <Input
                  id="iphone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  data-ocid="institution.profile.phone.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="iorg">Organization</Label>
                <Input
                  id="iorg"
                  value={form.organization}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, organization: e.target.value }))
                  }
                  data-ocid="institution.profile.organization.input"
                />
              </div>
              <Button
                type="submit"
                disabled={updateUser.isPending}
                className="bg-primary text-white rounded-xl"
                data-ocid="institution.profile.save.primary_button"
              >
                {updateUser.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-xl">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-foreground mb-2">
              Account Details
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <Badge
                  variant="outline"
                  className="text-primary border-primary"
                >
                  Institution
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Principal ID</span>
                <span className="font-mono text-xs text-foreground/70 max-w-[180px] truncate">
                  {userProfile?.principal?.toString() ?? "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
