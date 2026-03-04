import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import CoachDashboard from "@/components/coach/CoachDashboard";
import CoachLayout from "@/components/coach/CoachLayout";
import { UserRole, useProfileQuery } from "@/graphql/generated/schema";
import { getDefaultDashboardHref } from "@/lib/auth";

export default function CoachDashboardPage() {
  const router = useRouter();
  const { data, loading } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });

  // Redirect if user is not connected or not a coach
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

  // Show loader while checking authentication
  if (loading) {
    return (
      <CoachLayout pageTitle="Dashboard Coach">
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </CoachLayout>
    );
  }

  // Don't render if user is not a coach (redirect in progress)
  if (!data?.me || data.me.role !== UserRole.Coach) {
    return null;
  }

  return (
    <CoachLayout pageTitle="Dashboard Coach" footerVariant="userSlim">
      <CoachDashboard />
    </CoachLayout>
  );
}
