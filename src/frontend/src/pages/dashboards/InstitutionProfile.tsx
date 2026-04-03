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
import type { ExternalBlob } from "../../backend";
import DashboardLayout from "../../components/layout/DashboardLayout";
import FileUpload from "../../components/shared/FileUpload";
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
  const [profileImage, setProfileImage] = useState<ExternalBlob | undefined>(
    userProfile?.profileImage ?? undefined,
  );
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
        profileImage: profileImage,
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
        {/* Profile Image */}
        <Card className="border border-border shadow-card rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">
              Profile Photo
            </CardTitle>
            <CardDescription>
              Upload your institution's logo or representative photo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-border">
                {profileImage ? (
                  <img
                    src={profileImage.getDirectURL()}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <FileUpload
                  accept="image/*"
                  maxFiles={1}
                  label="Upload Profile Photo"
                  onUpload={(blob) => setProfileImage(blob)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile form */}
        <Card className="border border-border shadow-card rounded-xl">
          <CardHeader className="flex-row items-center gap-4 pb-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage.getDirectURL()}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-7 w-7 text-primary" />
              )}
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
                  placeholder="Your full name"
                  data-ocid="institution.profile.input"
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
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="iorg">Organization Name</Label>
                <Input
                  id="iorg"
                  value={form.organization}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, organization: e.target.value }))
                  }
                  placeholder="Ministry / Department / Institution name"
                />
              </div>
              <Button
                type="submit"
                className="bg-primary text-white rounded-lg w-full"
                disabled={updateUser.isPending}
                data-ocid="institution.profile.save_button"
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
      </div>
    </DashboardLayout>
  );
}
