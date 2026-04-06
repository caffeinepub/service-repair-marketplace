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
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  HardHat,
  Loader2,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { SRMRole } from "../backend";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import { useAppContext } from "../hooks/useAppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

type SetupStep = "role" | "details";

const ROLE_OPTIONS = [
  {
    value: SRMRole.institution,
    label: "Institution",
    desc: "Post service jobs, review bids, and manage contractors.",
    icon: Building2,
    activeColor: "border-primary bg-primary text-white",
  },
  {
    value: SRMRole.serviceProvider,
    label: "Skilled Service Provider",
    desc: "Browse jobs, submit bids, and grow your business with your skills.",
    icon: HardHat,
    activeColor: "border-accent-orange bg-accent-orange text-white",
  },
  {
    value: SRMRole.admin,
    label: "Platform Admin",
    desc: "Verify providers, monitor jobs, and manage the platform.",
    icon: ShieldCheck,
    activeColor: "border-green-600 bg-green-600 text-white",
  },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { userProfile, isLoadingProfile, role: _role } = useAppContext();
  const saveProfile = useSaveCallerUserProfile();

  const [step, setStep] = useState<SetupStep>("role");
  const [selectedRole, setSelectedRole] = useState<SRMRole>(
    SRMRole.institution,
  );
  const [form, setForm] = useState({
    name: "",
    phone: "",
    organization: "",
    skills: "",
    experience: "",
  });

  const isAuthenticated = !!identity;

  // Redirect if profile already exists
  if (
    isAuthenticated &&
    !isLoadingProfile &&
    userProfile !== null &&
    userProfile !== undefined
  ) {
    const r = userProfile.role;
    let dest = "/dashboard/institution";
    if (r === SRMRole.serviceProvider) dest = "/dashboard/provider";
    if (r === SRMRole.admin) dest = "/dashboard/admin";
    void navigate({ to: dest });
    return null;
  }

  if (isInitializing || isLoadingProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-10 px-4">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Card className="border border-border shadow-card rounded-2xl">
              <CardHeader className="text-center pb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <LogIn className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="font-display text-2xl">
                  Welcome to SRM
                </CardTitle>
                <CardDescription>
                  Sign in with Internet Identity to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full bg-primary text-white rounded-lg"
                  size="lg"
                  onClick={login}
                  disabled={isLoggingIn}
                  data-ocid="auth.signin.button"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In with Internet Identity
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  No account needed. Your Internet Identity is your account.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // Logged in — profile setup
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) return;
    if (!form.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        principal: identity.getPrincipal(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        organization: form.organization.trim(),
        skills: form.skills.trim(),
        experience: form.experience.trim(),
        role: selectedRole,
        isVerified: false,
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      });
      let dest = "/dashboard/institution";
      if (selectedRole === SRMRole.serviceProvider)
        dest = "/dashboard/provider";
      if (selectedRole === SRMRole.admin) dest = "/dashboard/admin";
      void navigate({ to: dest });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save profile");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {step === "role" ? (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className="border border-border shadow-card rounded-2xl">
                  <CardHeader className="text-center">
                    <CardTitle className="font-display text-2xl">
                      Choose Your Role
                    </CardTitle>
                    <CardDescription>
                      Select how you'll use the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {ROLE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = selectedRole === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSelectedRole(opt.value)}
                          className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? opt.activeColor
                              : "border-border bg-white hover:border-primary/50"
                          }`}
                          data-ocid={`auth.role.${opt.value}.toggle`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "bg-white/20" : "bg-primary/10"
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                isSelected ? "text-white" : "text-primary"
                              }`}
                            />
                          </div>
                          <div>
                            <p
                              className={`font-semibold text-sm ${
                                isSelected ? "text-white" : "text-foreground"
                              }`}
                            >
                              {opt.label}
                            </p>
                            <p
                              className={`text-xs mt-0.5 ${
                                isSelected
                                  ? "text-white/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {opt.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                    <Button
                      className="w-full bg-primary text-white rounded-lg mt-2"
                      size="lg"
                      onClick={() => setStep("details")}
                      data-ocid="auth.role.next.button"
                    >
                      Continue <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border border-border shadow-card rounded-2xl">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl">
                      Your Details
                    </CardTitle>
                    <CardDescription>
                      Tell us a bit about yourself
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitProfile} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, name: e.target.value }))
                          }
                          placeholder="Your full name"
                          required
                          data-ocid="auth.details.name.input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={form.phone}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, phone: e.target.value }))
                          }
                          placeholder="+91 XXXXX XXXXX"
                          data-ocid="auth.details.phone.input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="org">Organization</Label>
                        <Input
                          id="org"
                          value={form.organization}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              organization: e.target.value,
                            }))
                          }
                          placeholder="Company / Organization / Institution"
                          data-ocid="auth.details.organization.input"
                        />
                      </div>
                      {selectedRole === SRMRole.serviceProvider && (
                        <>
                          <div className="space-y-1.5">
                            <Label htmlFor="skills">Skills</Label>
                            <Input
                              id="skills"
                              value={form.skills}
                              onChange={(e) =>
                                setForm((p) => ({
                                  ...p,
                                  skills: e.target.value,
                                }))
                              }
                              placeholder="e.g. Electrical, Plumbing, IT Support, Painting"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="exp">Experience</Label>
                            <Textarea
                              id="exp"
                              value={form.experience}
                              onChange={(e) =>
                                setForm((p) => ({
                                  ...p,
                                  experience: e.target.value,
                                }))
                              }
                              placeholder="Describe your experience, certifications, or trade background..."
                              rows={3}
                            />
                          </div>
                        </>
                      )}
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 rounded-lg"
                          onClick={() => setStep("role")}
                          data-ocid="auth.details.back.button"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-primary text-white rounded-lg"
                          disabled={saveProfile.isPending}
                          data-ocid="auth.details.submit.button"
                        >
                          {saveProfile.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            "Create Profile"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
