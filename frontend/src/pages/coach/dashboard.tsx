import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import CoachDashboard from "@/components/coach/CoachDashboard";
import CoachLayout from "@/components/coach/CoachLayout";
import { UserRole, useProfileQuery } from "@/graphql/generated/schema";

export default function CoachDashboardPage() {
  const router = useRouter();
  const { data, loading } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });

  // Redirect if user is not connected or not a coach
  useEffect(() => {
    if (!loading) {
      if (!data?.me) {
        router.push("/login");
      } else if (data.me.role !== UserRole.Coach && data.me.role !== UserRole.Admin) {
        // Redirect to appropriate dashboard based on role
        if (data.me.role === UserRole.Coachee) {
          router.push("/dashboard_user");
        } else {
          router.push("/");
        }
      }
    }
  }, [data, loading, router]);

  // Show loader while checking authentication
  if (loading) {
    return (
      <CoachLayout pageTitle="Dashboard Coach">
        <div className="flex-1 flex items-center justify-center min-h-100">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </CoachLayout>
    );
  }

  // Don't render if user is not a coach or admin (redirect in progress)
  if (!data?.me || (data.me.role !== UserRole.Coach && data.me.role !== UserRole.Admin)) {
    return null;
  }

  return (
    <CoachLayout pageTitle="Dashboard Coach">
      <CoachDashboard />
    </CoachLayout>
  );
}
