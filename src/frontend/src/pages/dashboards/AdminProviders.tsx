import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  ListChecks,
  Loader2,
  ShieldCheck,
  User,
  UserCog,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserInfo } from "../../backend";
import DashboardLayout from "../../components/layout/DashboardLayout";
import EmptyState from "../../components/shared/EmptyState";
import {
  useGetProviders,
  useGetUnverifiedProviders,
  useVerifyProvider,
} from "../../hooks/useQueries";
import { shortenPrincipal } from "../../lib/constants";

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

function ProviderCard({
  provider,
  showVerify,
  index,
}: { provider: UserInfo; showVerify?: boolean; index: number }) {
  const verify = useVerifyProvider();
  const skillTags = (provider.skills || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const handleVerify = async () => {
    try {
      await verify.mutateAsync(provider.principal);
      toast.success(`${provider.name} verified as a skilled provider!`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to verify provider");
    }
  };

  return (
    <Card
      className="border border-border rounded-xl"
      data-ocid={`admin.providers.item.${index}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">
                {provider.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {shortenPrincipal(provider.principal.toString())}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {provider.isVerified ? (
              <Badge
                className="bg-green-100 text-green-700 border-green-200"
                variant="outline"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified Skilled Provider
              </Badge>
            ) : (
              <Badge
                className="bg-yellow-100 text-yellow-700 border-yellow-200"
                variant="outline"
              >
                <Clock className="h-3 w-3 mr-1" />
                Pending Verification
              </Badge>
            )}
            {showVerify && !provider.isVerified && (
              <Button
                size="sm"
                onClick={handleVerify}
                disabled={verify.isPending}
                className="bg-primary text-white rounded-lg text-xs"
                data-ocid={`admin.providers.item.${index}.primary_button`}
              >
                {verify.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            )}
          </div>
        </div>
        {skillTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {skillTags.slice(0, 4).map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
        )}
        {provider.experience && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {provider.experience}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminProviders() {
  const { data: allProviders, isLoading: allLoading } = useGetProviders();
  const { data: unverified, isLoading: unverifiedLoading } =
    useGetUnverifiedProviders();
  const [tab, setTab] = useState("all");

  const displayList =
    tab === "unverified" ? (unverified ?? []) : (allProviders ?? []);
  const isLoading = tab === "unverified" ? unverifiedLoading : allLoading;

  return (
    <DashboardLayout navItems={NAV_ITEMS} title="Skilled Providers">
      <div className="space-y-4">
        <h2 className="font-display font-bold text-foreground text-xl">
          Skilled Providers
        </h2>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all" data-ocid="admin.providers.all.tab">
              All Skilled Providers
            </TabsTrigger>
            <TabsTrigger
              value="unverified"
              data-ocid="admin.providers.unverified.tab"
            >
              Pending Verification{" "}
              {(unverified?.length ?? 0) > 0 && `(${unverified!.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            {isLoading ? (
              <div
                className="space-y-3"
                data-ocid="admin.providers.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : displayList.length === 0 ? (
              <EmptyState
                title="No providers found"
                description={
                  tab === "unverified"
                    ? "All skilled providers are verified."
                    : "No skilled providers have registered yet."
                }
                ocid="admin.providers.empty_state"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayList.map((p, idx) => (
                  <ProviderCard
                    key={p.principal.toString()}
                    provider={p}
                    showVerify={tab === "unverified" || !p.isVerified}
                    index={idx + 1}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
