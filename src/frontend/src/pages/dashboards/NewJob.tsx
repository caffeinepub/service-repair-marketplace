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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ListChecks,
  Loader2,
  PlusCircle,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type ExternalBlob, JobStatus } from "../../backend";
import DashboardLayout from "../../components/layout/DashboardLayout";
import FileUpload from "../../components/shared/FileUpload";
import { useAppContext } from "../../hooks/useAppContext";
import { useSaveJob } from "../../hooks/useQueries";
import { JOB_CATEGORIES } from "../../lib/constants";

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

export default function NewJob() {
  const navigate = useNavigate();
  const { userProfile } = useAppContext();
  const saveJob = useSaveJob();
  const [images, setImages] = useState<ExternalBlob[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    deadline: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.title ||
      !form.category ||
      !form.budget ||
      !form.deadline ||
      !form.location
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const deadlineTs = BigInt(new Date(form.deadline).getTime());
      await saveJob.mutateAsync({
        id: BigInt(0),
        status: JobStatus.posted,
        title: form.title,
        description: form.description,
        category: form.category,
        budget: Number(form.budget),
        deadline: deadlineTs,
        location: form.location,
        postedBy: userProfile!.principal,
        createdAt: BigInt(Date.now()),
        images: images,
      });
      toast.success("Job posted successfully!");
      void navigate({ to: "/dashboard/institution/jobs" });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to post job");
    }
  };

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Post New Job">
      <div className="max-w-2xl">
        <Card className="border border-border shadow-card rounded-2xl">
          <CardHeader>
            <CardTitle className="font-display text-xl text-foreground">
              Post a Service Job
            </CardTitle>
            <CardDescription>
              Fill in the details to attract the best service providers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Electrical rewiring of 3rd floor offices"
                  required
                  data-ocid="new_job.title.input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Describe the work required in detail..."
                  rows={4}
                  data-ocid="new_job.description.textarea"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Category *</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, category: v }))
                    }
                    required
                  >
                    <SelectTrigger data-ocid="new_job.category.select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="budget">Budget (INR) *</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    value={form.budget}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, budget: e.target.value }))
                    }
                    placeholder="50000"
                    required
                    data-ocid="new_job.budget.input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={form.deadline}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, deadline: e.target.value }))
                    }
                    min={new Date().toISOString().split("T")[0]}
                    required
                    data-ocid="new_job.deadline.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, location: e.target.value }))
                    }
                    placeholder="e.g. New Delhi, Block 12"
                    required
                    data-ocid="new_job.location.input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Job Images (optional)</Label>
                <FileUpload
                  onUpload={(blob) => setImages((prev) => [...prev, blob])}
                  label="Upload job site images"
                />
              </div>

              <Button
                type="submit"
                disabled={saveJob.isPending}
                className="w-full bg-primary text-white rounded-xl h-11"
                data-ocid="new_job.submit.primary_button"
              >
                {saveJob.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting Job...
                  </>
                ) : (
                  "Post Job"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
