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
                  <p className="text-sm font-semibold text-green-700">
                    Verified Provider
                  </p>
                  <p className="text-xs text-green-600">
                    Your account is verified. You can bid on jobs.
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-700">
                    Pending Verification
                  </p>
                  <p className="text-xs text-yellow-600">
                    Admin is reviewing your profile. You'll be notified once
                    verified.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border shadow-card rounded-xl">
          <CardHeader>
            <CardTitle className="font-display text-xl">Edit Profile</CardTitle>
            <CardDescription>Update your professional details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pname">Full Name</Label>
                  <Input
                    id="pname"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    data-ocid="provider.profile.name.input"
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
                    data-ocid="provider.profile.phone.input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pskills">Skills (comma-separated)</Label>
                <Input
                  id="pskills"
                  value={form.skills}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, skills: e.target.value }))
                  }
                  placeholder="Electrical, Plumbing, HVAC"
                  data-ocid="provider.profile.skills.input"
                />
                {skillTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {skillTags.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
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
                  rows={3}
                  placeholder="Describe your ITI qualifications and work experience..."
                  data-ocid="provider.profile.experience.textarea"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Certifications Upload</Label>
                <FileUpload
                  onUpload={(_blob: ExternalBlob) =>
                    toast.info("Certificate uploaded")
                  }
                  accept=".pdf,.jpg,.jpeg,.png"
                  label="Upload ITI Certificates or Qualifications"
                />
              </div>

              <Button
                type="submit"
                disabled={updateUser.isPending}
                className="w-full bg-primary text-white rounded-xl"
                data-ocid="provider.profile.save.primary_button"
              >
                {updateUser.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
