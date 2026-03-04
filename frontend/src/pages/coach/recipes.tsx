import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import CoachLayout from "@/components/coach/CoachLayout";
import { UserRole, useProfileQuery } from "@/graphql/generated/schema";
import { getDefaultDashboardHref } from "@/lib/auth";

export default function CoachRecipes() {
  const router = useRouter();
  const { data, loading } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (!loading) {
      if (!data?.me) {
        void router.replace({
          pathname: "/coach/login",
          query: { returnUrl: router.asPath },
        });
      } else if (data.me.role !== UserRole.Coach) {
        void router.replace(getDefaultDashboardHref(data.me.role));
      }
    }
  }, [data, loading, router]);

  if (loading) {
    return (
      <CoachLayout pageTitle="Recettes">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </CoachLayout>
    );
  }

  if (!data?.me || data.me.role !== UserRole.Coach) {
    return null;
  }

  return (
    <CoachLayout pageTitle="Recettes">
      <div className="bg-light-bg py-6 md:py-8 px-4 md:px-6 flex-1">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
            Gestion des recettes
          </h1>
          <p className="text-gray-600">Coming soon...</p>
        </div>
      </div>
    </CoachLayout>
  );
}
