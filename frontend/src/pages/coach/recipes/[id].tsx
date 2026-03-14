import { ChefHat, Clock, Loader2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import CoachLayout from "@/components/coach/CoachLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  UserRole,
  useCoachRecipeQuery,
  useProfileQuery,
} from "@/graphql/generated/schema";

function getSourceLabel(source: string): string {
  return source === "coach" ? "Conseillée par le coach" : "Favori";
}

function getServingsLabel(servings: number): string {
  return `${servings} portion${servings > 1 ? "s" : ""}`;
}

export default function CoachRecipeDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";

  const { data: profileData, loading: profileLoading } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });
  const { data: recipeData, loading: recipeLoading } = useCoachRecipeQuery({
    variables: { id },
    skip: !id,
  });

  const recipe = recipeData?.coachRecipe ?? null;

  useEffect(() => {
    if (!profileLoading && !profileData?.me) {
      router.replace("/login");
      return;
    }
    if (
      !profileLoading &&
      profileData?.me &&
      profileData.me.role !== UserRole.Coach &&
      profileData.me.role !== UserRole.Admin
    ) {
      router.replace("/");
    }
  }, [profileData, profileLoading, router]);

  if (
    !profileData?.me ||
    (profileData.me.role !== UserRole.Coach && profileData.me.role !== UserRole.Admin)
  ) {
    return null;
  }

  if (!id || recipeLoading) {
    return (
      <CoachLayout pageTitle="Détail recette">
        <div className="flex flex-1 items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-[#73916f]" />
        </div>
      </CoachLayout>
    );
  }

  if (!recipe) {
    return (
      <CoachLayout pageTitle="Recette introuvable">
        <section className="flex-1 bg-[#f3f7ee] p-6">
          <div className="mx-auto max-w-lg">
            <p className="text-sm text-[#555]">Recette introuvable.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/coach/recipes">Retour aux recettes</Link>
            </Button>
          </div>
        </section>
      </CoachLayout>
    );
  }

  return (
    <CoachLayout pageTitle={recipe.title}>
      <section className="flex-1 bg-[#f3f7ee] py-4 md:py-6">
        <div className="mx-auto w-full max-w-lg px-4">
          <Button
            asChild
            variant="outline"
            className="mb-4 w-full border-[#73916f] bg-white text-[#2d5a27] hover:bg-[#eef4e8] sm:w-auto"
          >
            <Link href="/coach/recipes" className="inline-flex items-center justify-center gap-2">
              ← Retour aux recettes
            </Link>
          </Button>

          <Card className="border-[#d3d8cf] bg-white shadow-[0_2px_5px_rgba(0,0,0,0.1)]">
            <CardContent className="space-y-4 p-4 md:p-5">
              <div className="relative overflow-hidden rounded-md border border-[#d6ddd2]">
                <Image
                  src={recipe.photo}
                  alt=""
                  width={1200}
                  height={650}
                  sizes="100vw"
                  className="h-44 w-full object-cover"
                  unoptimized={
                    recipe.photo.startsWith("data:") || recipe.photo.startsWith("blob:")
                  }
                />
              </div>

              <div className="mt-3">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-[#dce8f6] px-2 py-0.5 font-medium text-[#2e4e74]">
                    {getSourceLabel(recipe.source)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4e8] px-2 py-0.5 text-[#425242]">
                    <Clock className="h-3 w-3" />
                    {recipe.prepTime}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4e8] px-2 py-0.5 text-[#425242]">
                    <Users className="h-3 w-3" />
                    {getServingsLabel(recipe.servings)}
                  </span>
                </div>
                <h1 className="text-lg font-semibold text-[#2e3a2d]">{recipe.title}</h1>
                <p className="mt-1 text-sm text-[#445443]">{recipe.description}</p>
              </div>

              {recipe.prepSteps.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[#3f5a3e]">
                    Préparation
                  </h2>
                  <ol className="mt-2 space-y-2 text-sm text-[#445443]">
                    {recipe.prepSteps.map((step, index) => (
                      <li
                        key={`${index}-${step}`}
                        className="rounded-md bg-[#eef4e8] px-3 py-2"
                      >
                        <span className="font-semibold">{index + 1}. </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="rounded-md bg-[#f7faf4] p-3 text-sm text-[#3b4a3a]">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#3f5a3e]">
                  Apports nutritionnels
                </h2>
                <div className="space-y-1">
                  <div><span className="font-semibold">Calories:</span> {recipe.calories} kcal</div>
                  <div><span className="font-semibold">Protéines:</span> {recipe.protein} g</div>
                  <div><span className="font-semibold">Glucides:</span> {recipe.carbs} g</div>
                  <div><span className="font-semibold">Lipides:</span> {recipe.fat} g</div>
                  <div><span className="font-semibold">Fibres:</span> {recipe.fiber} g</div>
                </div>
              </div>

              {recipe.benefits.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[#3f5a3e]">
                    Bienfaits
                  </h2>
                  <ul className="mt-2 space-y-2 text-sm text-[#445443]">
                    {recipe.benefits.map((benefit, index) => (
                      <li
                        key={`${index}-${benefit}`}
                        className="rounded-md bg-[#eef4e8] px-3 py-2"
                      >
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-md bg-[#dcefd9] p-3 text-sm text-[#274427]">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
                  <ChefHat className="h-4 w-4" />
                  Commentaire coach
                </h2>
                <p className="mt-2">{recipe.coachNote}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </CoachLayout>
  );
}
