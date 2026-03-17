import { ChefHat, Clock, Loader2, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import HomeLayout from "@/components/HomeLayout";
import UserPageLayout from "@/components/UserPageLayout";
import { Button } from "@/components/ui/button";
import { useUserRecipeQuery } from "@/graphql/generated/schema";

const sourceLabel: Record<string, string> = {
  favori: "Favori",
  coach: "Conseillée par le coach",
};

const sourceBadgeStyles: Record<string, string> = {
  favori: "bg-[#e6efe2] text-[#3b5538]",
  coach: "bg-[#dce8f6] text-[#2e4e74]",
};

function getServingsLabel(servings: number): string {
  return `${servings} portion${servings > 1 ? "s" : ""}`;
}

export default function UserRecipeDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";

  const { data: recipeData, loading: recipeLoading } = useUserRecipeQuery({
    variables: { id },
    skip: !id,
  });

  const recipe = recipeData?.userRecipe ?? null;

  if (!id || recipeLoading) {
    return (
      <HomeLayout pageTitle="Détail recette" footerVariant="userSlim">
        <UserPageLayout activeNav="recipes" contentClassName="bg-[#f5fbf1] px-5 py-6">
          <div className="flex flex-1 items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-[#73916f]" />
          </div>
        </UserPageLayout>
      </HomeLayout>
    );
  }

  if (!recipe) {
    return (
      <HomeLayout pageTitle="Recette introuvable" footerVariant="userSlim">
        <UserPageLayout activeNav="recipes" contentClassName="bg-[#f5fbf1] px-5 py-6">
          <div className="max-w-lg">
            <p className="text-sm text-[#555]">Recette introuvable.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/user_recipe">Retour aux recettes</Link>
            </Button>
          </div>
        </UserPageLayout>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout pageTitle={recipe.title} footerVariant="userSlim">
      <UserPageLayout activeNav="recipes" contentClassName="bg-[#f5fbf1] px-5 py-6 md:px-8">
        <Button
          asChild
          variant="outline"
          className="mb-4 w-full border-[#73916f] bg-white text-[#2d5a27] hover:bg-[#eef4e8] sm:w-auto"
        >
          <Link href="/user_recipe" className="inline-flex items-center justify-center gap-2">
            ← Retour aux recettes
          </Link>
        </Button>

        <article className="max-w-lg rounded-md border border-[#d3d8cf] bg-white p-4 shadow-[0_2px_5px_rgba(0,0,0,0.1)] md:p-5">
          <div className="relative overflow-hidden rounded-md border border-[#d6ddd2]">
            <Image
              src={recipe.photo}
              alt={recipe.title}
              width={1200}
              height={650}
              sizes="100vw"
              className="h-44 w-full object-cover"
              unoptimized={recipe.photo.startsWith("data:") || recipe.photo.startsWith("blob:")}
            />
          </div>

          <div className="mt-3">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px]">
              <span
                className={`rounded-full px-2 py-0.5 font-medium ${sourceBadgeStyles[recipe.source] ?? sourceBadgeStyles.coach}`}
              >
                {sourceLabel[recipe.source] ?? recipe.source}
              </span>
              <span className="rounded-full bg-[#eef4e8] px-2 py-0.5 text-[#425242]">
                <Clock className="mr-1 inline h-3 w-3" />
                {recipe.prepTime}
              </span>
              <span className="rounded-full bg-[#eef4e8] px-2 py-0.5 text-[#425242]">
                <Users className="mr-1 inline h-3 w-3" />
                {getServingsLabel(recipe.servings)}
              </span>
            </div>
            <h1 className="text-lg font-semibold text-[#2e3a2d]">{recipe.title}</h1>
            <p className="mt-1 text-sm text-[#445443]">{recipe.description}</p>
          </div>

          {recipe.prepSteps.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[#3f5a3e]">
                Préparation
              </h2>
              <ol className="mt-2 space-y-2 text-[11px] text-[#445443]">
                {recipe.prepSteps.map((step, index) => (
                  <li key={`${index}-${step}`} className="rounded-md bg-[#eef4e8] px-2 py-1.5">
                    <span className="font-semibold">{index + 1}. </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="mt-4 rounded-md bg-[#f7faf4] p-3 text-[11px] text-[#3b4a3a]">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#3f5a3e]">
              Apports nutritionnels
            </h2>
            <div className="space-y-1">
              <div>
                <span className="font-semibold">Calories:</span> {recipe.calories} kcal
              </div>
              <div>
                <span className="font-semibold">Protéines:</span> {recipe.protein} g
              </div>
              <div>
                <span className="font-semibold">Glucides:</span> {recipe.carbs} g
              </div>
              <div>
                <span className="font-semibold">Lipides:</span> {recipe.fat} g
              </div>
              <div>
                <span className="font-semibold">Fibres:</span> {recipe.fiber} g
              </div>
            </div>
          </div>

          {recipe.benefits.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[#3f5a3e]">
                Bienfaits
              </h2>
              <ul className="mt-2 space-y-2 text-[11px] text-[#445443]">
                {recipe.benefits.map((benefit, index) => (
                  <li key={`${index}-${benefit}`} className="rounded-md bg-[#eef4e8] px-2 py-1.5">
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 rounded-md bg-[#dcefd9] p-3 text-[11px] text-[#274427]">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
              <ChefHat className="h-3 w-3" />
              Commentaire coach
            </h2>
            <p className="mt-2">{recipe.coachNote}</p>
          </div>
        </article>
      </UserPageLayout>
    </HomeLayout>
  );
}
