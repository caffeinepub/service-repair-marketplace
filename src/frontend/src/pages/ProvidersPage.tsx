import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, User } from "lucide-react";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import EmptyState from "../components/shared/EmptyState";
import StarRating from "../components/shared/StarRating";
import { useGetProviders } from "../hooks/useQueries";
import { shortenPrincipal } from "../lib/constants";

export default function ProvidersPage() {
  const { data: providers, isLoading } = useGetProviders();
  const verified = (providers ?? []).filter((p) => p.isVerified);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-6">
          <h1 className="font-display font-bold text-foreground text-3xl mb-1">
            Service Providers
          </h1>
          <p className="text-muted-foreground">
            {verified.length} verified skilled providers
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : verified.length === 0 ? (
          <EmptyState
            title="No verified providers"
            description="Check back soon as providers complete verification."
            ocid="public.providers.empty_state"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {verified.map((p) => {
              const skillTags = (p.skills || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              return (
                <Card
                  key={p.principal.toString()}
                  className="border border-border rounded-xl shadow-card"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {shortenPrincipal(p.principal.toString())}
                        </p>
                      </div>
                    </div>
                    {skillTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {skillTags.slice(0, 4).map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="text-xs"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {p.experience && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {p.experience}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        Verified Provider
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
