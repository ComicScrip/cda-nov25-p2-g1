import { useRouter } from "next/router";
import { useEffect } from "react";
import { UserRole, useProfileQuery } from "@/graphql/generated/schema";
import HomeLayout from "@/components/HomeLayout";
import UserPageLayout from "@/components/UserPageLayout";
import CoachLayout from "@/components/coach/CoachLayout";
import { Loader2 } from "lucide-react";

export default function AiChefPage() {
  const router = useRouter();
  const { data, loading } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (!loading) {
      if (!data?.me) {
        router.push("/login");
      }
    }
  }, [data, loading, router]);

  // Show loader while checking authentication
  if (loading) {
    return (
      <HomeLayout pageTitle="AI Chef">
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </HomeLayout>
    );
  }

  if (!data?.me) {
    return null;
  }

  const isCoachOrAdmin =
    data.me.role === UserRole.Coach || data.me.role === UserRole.Admin;
  const isCoachee = data.me.role === UserRole.Coachee;

  // Content component to avoid duplication
  const content = (
    <div className="bg-light-bg py-6 md:py-8 px-4 md:px-6 flex-1">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
          AI Chef
        </h1>
        <p className="text-gray-600">Coming soon...</p>
      </div>
    </div>
  );

  // Render with CoachLayout for coaches/admins
  if (isCoachOrAdmin) {
    return (
      <CoachLayout pageTitle="Chef IA">
        {content}
      </CoachLayout>
    );
  }

  // Render with HomeLayout + UserPageLayout for coachees
  if (isCoachee) {
    return (
      <HomeLayout pageTitle="AI Chef">
        <UserPageLayout activeNav="dashboard">
          <div className="max-w-4xl text-[#2c2c2c]">
            <h1 className="text-lg font-semibold">AI Chef</h1>
            <p className="mt-1 text-xs text-[#555]">
              Coming soon...
            </p>
          </div>
        </UserPageLayout>
      </HomeLayout>
    );
  }

  // Fallback for other roles
  return (
    <HomeLayout pageTitle="AI Chef">
      {content}
    </HomeLayout>
  );
}
