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
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  CheckCircle2,
  ListTodo,
  Loader2,
  Search,
  User,
  XCircle,
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
    to: "/dashboard/provider",
    icon: Briefcase,
    ocid: "dashboard.nav.overview.link",
  },
  {
    label: "Browse Jobs",
    to: "/dashboard/provider/jobs",
    icon: Search,
    ocid: "dashboard.nav.jobs.link",
  },
  {
    label: "My Bids",
    to: "/dashboard/provider/bids",
    icon: ListTodo,
    ocid: "dashboard.nav.bids.link",
  },
  {
    label: "Profile",
    to: "/dashboard/provider/profile",
    icon: User,
    ocid: "dashboard.nav.profile.link",
  },
];

export default function ProviderProfile() {
  const { userProfile, refetchProfile } = useAppContext();
  const updateUser = useUpdateUser();
  const [profileImage, setProfileImage] = useState<ExternalBlob | undefined>(
    userProfile?.profileImage ?? undefined,
  );
  const [form, setForm] = useState({
    name: userProfile?.name ?? "",
    phone: userProfile?.phone ?? "",
    skills: userProfile?.skills ?? "",
    experience: userProfile?.experience ?? "",
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
        skills: form.skills,
        experience: form.experience,
        organization: form.organization,
        profileImage: profileImage,
      });
      refetchProfile();
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to update");
    }
  };

  const skillTags = (form.skills || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="My Profile">
      <div className="max-w-xl space-y-5">
        {/* Verification status */}
        <Card
          className={`border rounded-xl ${
            userProfile?.isVerified
              ? "border-green-200 bg-green-50"
              : "border-yellow-200 bg-yellow-50"
          }`}
        >
          <CardContent className="p-4 flex items-center gap-3">
            {userProfile?.isVerified ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Account Verified
                  </p>
                  <p className="text-xs text-green-700">
                    You can bid on posted jobs.
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">
                    Pending Verification
                  </p>
                  <p className="text-xs text-yellow-700">
                    An admin will review and verify your profile soon.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Profile Image */}
        <Card className="border border-border shadow-card rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">
              Profile Photo
            </CardTitle>
            <CardDescription>Upload a clear photo of yourself</CardDescription>
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
                {userProfile?.name ?? "Service Provider"}
              </CardTitle>
              <CardDescription>{userProfile?.organization}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="pname">Full Name</Label>
                <Input
                  id="pname"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Your full name"
                  data-ocid="provider.profile.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pphone">Phone</Label>
                <Input
                  id="pphone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="porg">Organization / Company</Label>
                <Input
                  id="porg"
                  value={form.organization}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, organization: e.target.value }))
                  }
                  placeholder="Your organization name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pskills">Skills (comma-separated)</Label>
                <Input
                  id="pskills"
                  value={form.skills}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, skills: e.target.value }))
                  }
                  placeholder="Electrical, Plumbing, Carpentry"
                />
                {skillTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {skillTags.map((s) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="text-xs bg-primary/10 text-primary"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pexp">Experience</Label>
                <Textarea
                  id="pexp"
                  value={form.experience}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, experience: e.target.value }))
                  }
                  placeholder="Describe your experience and certifications..."
                  rows={3}
                />
              </div>
              <Button
                type="submit"
                className="bg-primary text-white rounded-lg w-full"
                disabled={updateUser.isPending}
                data-ocid="provider.profile.save_button"
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
