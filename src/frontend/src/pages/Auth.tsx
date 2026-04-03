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
import Navbar from "../components/layout/Navbar";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import { useAppContext } from "../hooks/useAppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

type SetupStep = "role" | "details";

const ROLE_OPTIONS = [
  {
    value: SRMRole.institution,
    label: "Government Institution",
    desc: "Post service jobs, review bids, and manage contractors.",
    icon: Building2,
    activeColor: "border-primary bg-primary text-white",
  },
  {
    value: SRMRole.serviceProvider,
    label: "ITI Service Provider",
    desc: "Browse jobs, submit bids, and grow your business.",
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
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <LoadingSpinner />
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Card className="border border-border shadow-card rounded-2xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-primary to-accent-orange" />
              <CardHeader className="text-center pb-2 pt-8">
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="font-display text-2xl text-foreground">
                  Sign In to SRM
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Use your Internet Identity to securely sign in. No password
                  required.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-4 space-y-4">
                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full bg-primary text-white rounded-xl h-12 font-semibold text-base shadow-btn"
                  data-ocid="auth.signin.primary_button"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      Sign In with Internet Identity
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  New here? Signing in will automatically create your account.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Profile setup wizard
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        principal: identity!.getPrincipal(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        organization: form.organization.trim(),
        skills: form.skills.trim(),
        experience: form.experience.trim(),
        role: selectedRole,
        isVerified: false,
        createdAt: BigInt(Date.now()),
      });
      toast.success("Profile created! Welcome to SRM.");
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
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <Card className="border border-border shadow-card rounded-2xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary to-accent-orange" />
            <CardHeader className="pt-8 pb-2">
              <CardTitle className="font-display text-2xl text-foreground">
                Complete Your Profile
              </CardTitle>
              <CardDescription>
                {step === "role"
                  ? "Choose your role on the platform"
                  : "Fill in your details"}
              </CardDescription>
              {/* Progress */}
              <div className="flex gap-2 mt-4">
                {(["role", "details"] as SetupStep[]).map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      step === s || (step === "details" && s === "role")
                        ? "bg-primary"
                        : "bg-border"
                    }`}
                  />
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {step === "role" && (
                  <motion.div
                    key="role"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {ROLE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = selectedRole === opt.value;
                      return (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() => setSelectedRole(opt.value)}
                          data-ocid={`auth.role.${String(opt.value)}.button`}
                          className={`w-full text-left border-2 rounded-xl p-4 transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isSelected
                                  ? opt.activeColor
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {opt.label}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {opt.desc}
                              </p>
                            </div>
                            {isSelected && (
                              <div
                                className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                                aria-hidden="true"
                              >
                                <svg
                                  className="h-3 w-3 text-white"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  role="img"
                                  aria-label="selected"
                                >
                                  <title>Selected</title>
                                  <path
                                    d="M2 6l3 3 5-5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                    <Button
                      onClick={() => setStep("details")}
                      className="w-full bg-primary text-white rounded-xl"
                      data-ocid="auth.role.next.button"
                    >
                      Continue <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </motion.div>
                )}

                {step === "details" && (
                  <motion.form
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSubmitProfile}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder="e.g. Rajesh Kumar"
                        required
                        data-ocid="auth.name.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, phone: e.target.value }))
                        }
                        placeholder="+91 98765 43210"
                        data-ocid="auth.phone.input"
                      />
                    </div>
                    {selectedRole === SRMRole.institution ? (
                      <div className="space-y-1.5">
                        <Label htmlFor="org">Organization / Department</Label>
                        <Input
                          id="org"
                          value={form.organization}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              organization: e.target.value,
                            }))
                          }
                          placeholder="e.g. Municipal Corporation, Delhi"
                          data-ocid="auth.organization.input"
                        />
                      </div>
                    ) : selectedRole === SRMRole.serviceProvider ? (
                      <>
                        <div className="space-y-1.5">
                          <Label htmlFor="skills">
                            Skills (comma-separated)
                          </Label>
                          <Input
                            id="skills"
                            value={form.skills}
                            onChange={(e) =>
                              setForm((p) => ({ ...p, skills: e.target.value }))
                            }
                            placeholder="Electrical, Plumbing, Welding"
                            data-ocid="auth.skills.input"
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
                            placeholder="Describe your experience and qualifications..."
                            rows={3}
                            data-ocid="auth.experience.textarea"
                          />
                        </div>
                      </>
                    ) : (
                      /* Admin role -- just name and phone, no extra fields */
                      <div className="rounded-xl bg-green-50 border border-green-200 p-3">
                        <p className="text-xs text-green-700 font-medium">
                          You are registering as a Platform Admin. You will have
                          full access to verify providers, monitor jobs, and
                          manage all users.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep("role")}
                        className="flex-1"
                        data-ocid="auth.back.button"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={saveProfile.isPending}
                        className="flex-1 bg-primary text-white rounded-xl"
                        data-ocid="auth.submit.primary_button"
                      >
                        {saveProfile.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Create Profile"
                        )}
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
