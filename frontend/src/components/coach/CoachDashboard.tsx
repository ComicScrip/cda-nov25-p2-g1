import { BookOpen, ChefHat, Loader2, TrendingUp, User, Users, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCoachDashboardDataQuery, useProfileQuery } from "@/graphql/generated/schema";

export default function CoachDashboard() {
  const { data: profileData, loading: profileLoading } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
  } = useCoachDashboardDataQuery({
    fetchPolicy: "cache-and-network",
  });
  const user = profileData?.me;

  if (!user || profileLoading || dashboardLoading) {
    return (
      <section className="flex-1 bg-[#f3f7ee] py-6">
        <div className="mx-auto w-full max-w-5xl px-4">
          <div className="rounded-md bg-[#eef4e8] px-3 py-2 text-xs text-[#3c3c3c]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement de vos données...
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Handle error state
  if (dashboardError) {
    return (
      <section className="flex-1 bg-[#f3f7ee] py-6">
        <div className="mx-auto w-full max-w-5xl px-4">
          <div className="rounded-md bg-[#f7e1e1] px-3 py-2 text-xs text-[#7b2222]">
            Données indisponibles. Vérifiez que vous êtes bien connecté(e).
          </div>
        </div>
      </section>
    );
  }

  // Use dashboard data or default values
  const stats = dashboardData?.coachDashboardData?.stats || {
    users: { count: 0, evolution: "0%" },
    publishedRecipes: { count: 0, evolution: "0%" },
    scannedMeals: { count: 0, evolution: "0%" },
    averageScore: { count: 0, evolution: "0%" },
  };

  const recentUsers = dashboardData?.coachDashboardData?.recentUsers || [];
  const recentRecipes = dashboardData?.coachDashboardData?.recentRecipes || [];

  const getUserName = (email: string) => {
    const name = email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <section className="flex-1 bg-[#f3f7ee] py-6">
      <div className="mx-auto w-full max-w-[95%] px-4">
        <div className="overflow-hidden rounded-md border border-[#c9c9c9] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
          <div className="bg-[#f5fbf1] px-5 py-6 md:px-8">
            {/* Welcome message */}
            <div className="mb-6 max-w-2xl text-[#2c2c2c]">
              <h1 className="text-lg font-semibold">
                Bienvenue dans ta tour de contrôle {getUserName(user.email)}
              </h1>
              <p className="mt-1 text-xs text-[#555]">
                Ici, vous avez l'espace d'administration de vos coachés
              </p>
            </div>

            {/* 4 Stats cards in 2x2 grid */}
            <div className="grid w-full max-w-md grid-cols-2 gap-2.5 md:gap-3 mb-6">
              {/* Users card */}
              <Card className="bg-[#bfe8ea] border-0 shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                <CardHeader className="p-2.5 md:p-3 space-y-0">
                  <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1.5 text-[#2c2c2c]">
                    <Users className="h-4 w-4 md:h-5 md:w-5" />
                    Utilisateurs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2.5 md:p-3 pt-1">
                  <div className="text-base md:text-lg font-bold text-[#2c2c2c]">
                    {stats.users.count}
                  </div>
                  <CardDescription className="text-xs md:text-sm flex items-center gap-1 mt-1 text-[#2c2c2c]">
                    <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    {stats.users.evolution}
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Published recipes card */}
              <Card className="bg-[#cfa0c8] border-0 shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                <CardHeader className="p-2.5 md:p-3 space-y-0">
                  <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1.5 text-[#2c2c2c]">
                    <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                    Recettes publiées
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2.5 md:p-3 pt-1">
                  <div className="text-base md:text-lg font-bold text-[#2c2c2c]">
                    {stats.publishedRecipes.count}
                  </div>
                  <CardDescription className="text-xs md:text-sm flex items-center gap-1 mt-1 text-[#2c2c2c]">
                    <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    {stats.publishedRecipes.evolution}
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Scanned meals card */}
              <Card className="bg-[#a7d9a1] border-0 shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                <CardHeader className="p-2.5 md:p-3 space-y-0">
                  <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1.5 text-[#2c2c2c]">
                    <UtensilsCrossed className="h-4 w-4 md:h-5 md:w-5" />
                    Repas scannés
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2.5 md:p-3 pt-1">
                  <div className="text-base md:text-lg font-bold text-[#2c2c2c]">
                    {stats.scannedMeals.count}
                  </div>
                  <CardDescription className="text-xs md:text-sm flex items-center gap-1 mt-1 text-[#2c2c2c]">
                    <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    {stats.scannedMeals.evolution}
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Average score card */}
              <Card className="bg-[#e9b26b] border-0 shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                <CardHeader className="p-2.5 md:p-3 space-y-0">
                  <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1.5 text-[#2c2c2c]">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                    Score moyen
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2.5 md:p-3 pt-1">
                  <div className="text-base md:text-lg font-bold text-[#2c2c2c]">
                    {stats.averageScore.count}
                  </div>
                  <CardDescription className="text-xs md:text-sm flex items-center gap-1 mt-1 text-[#2c2c2c]">
                    <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    {stats.averageScore.evolution}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Two large cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Recent users card */}
              <Card className="bg-[#89c689] border-0 shadow-[0_3px_6px_rgba(0,0,0,0.2)]">
                <CardHeader className="p-5 md:p-6">
                  <CardTitle className="text-base md:text-lg font-semibold text-[#1f3d1f] flex items-center gap-2.5">
                    <User className="h-6 w-6 md:h-7 md:w-7" />
                    Derniers utilisateurs
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm text-[#1f3d1f] opacity-90 mt-1">
                    Les trois derniers utilisateurs
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 md:p-6 pt-0 space-y-3">
                  {recentUsers.length > 0 ? (
                    recentUsers.map(
                      (
                        userItem: {
                          name: string;
                          email: string;
                          score: number;
                        },
                        index: number,
                      ) => (
                        <Card key={index} className="bg-white/90 border-0 backdrop-blur-sm">
                          <CardContent className="p-4 md:p-5">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-semibold text-[#2c2c2c] text-sm md:text-base">
                                  {userItem.name}
                                </div>
                                <CardDescription className="text-xs md:text-sm text-[#555] mt-1">
                                  {userItem.email}
                                </CardDescription>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-[#1f3d1f]" />
                                <span className="font-bold text-[#2c2c2c] text-sm md:text-base">
                                  {Math.round(userItem.score)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ),
                    )
                  ) : (
                    <Card className="bg-white/90 border-0 backdrop-blur-sm">
                      <CardContent className="p-4 md:p-5">
                        <CardDescription className="text-xs md:text-sm text-[#555] text-center">
                          Aucun utilisateur récent
                        </CardDescription>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              {/* Recent recipes card */}
              <Card className="bg-[#89c689] border-0 shadow-[0_3px_6px_rgba(0,0,0,0.2)]">
                <CardHeader className="p-5 md:p-6">
                  <CardTitle className="text-base md:text-lg font-semibold text-[#1f3d1f] flex items-center gap-2.5">
                    <ChefHat className="h-6 w-6 md:h-7 md:w-7" />
                    Recettes récentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 md:p-6 pt-0 space-y-3">
                  {recentRecipes.length > 0 ? (
                    recentRecipes.map(
                      (
                        recipe: {
                          name: string;
                          calories: number;
                          proteins: number;
                          carbs: number;
                          lipids: number;
                        },
                        index: number,
                      ) => (
                        <Card key={index} className="bg-white/90 border-0 backdrop-blur-sm">
                          <CardContent className="p-4 md:p-5">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-semibold text-[#2c2c2c] text-sm md:text-base">
                                {recipe.name}
                              </div>
                              <div className="font-bold text-[#2c2c2c] text-sm md:text-base">
                                {Math.round(recipe.calories)} kcal
                              </div>
                            </div>
                            <CardDescription className="text-xs md:text-sm text-[#555] mt-1">
                              P: {Math.round(recipe.proteins)}g | G: {Math.round(recipe.carbs)}g |
                              L: {Math.round(recipe.lipids)}g
                            </CardDescription>
                          </CardContent>
                        </Card>
                      ),
                    )
                  ) : (
                    <Card className="bg-white/90 border-0 backdrop-blur-sm">
                      <CardContent className="p-4 md:p-5">
                        <CardDescription className="text-xs md:text-sm text-[#555] text-center">
                          Aucune recette récente
                        </CardDescription>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
