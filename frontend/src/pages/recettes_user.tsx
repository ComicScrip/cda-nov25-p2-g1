import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import HomeLayout from "@/components/HomeLayout";
import UserPageLayout from "@/components/UserPageLayout";

type RecipeSource = "favori" | "coach";

type RecipeEntry = {
  id: string;
  title: string;
  source: RecipeSource;
  photo: string;
  prepTime: string;
  servings: number;
  difficulty: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  description: string;
  prepSteps: string[];
  benefits: string[];
  coachNote: string;
};

type RecipesQueryData = {
  userRecipesData: RecipeEntry[];
};

const USER_RECIPES_QUERY = gql`
  query UserRecipesData {
    userRecipesData {
      id
      title
      source
      photo
      prepTime
      servings
      difficulty
      calories
      protein
      carbs
      fat
      fiber
      description
      prepSteps
      benefits
      coachNote
    }
  }
`;

const sourceLabel: Record<RecipeSource, string> = {
  favori: "Favori",
  coach: "Conseillee par le coach",
};

const sourceBadgeStyles: Record<RecipeSource, string> = {
  favori: "bg-[#e6efe2] text-[#3b5538]",
  coach: "bg-[#dce8f6] text-[#2e4e74]",
};

export default function RecettesUserPage() {
  const { data, loading, error } = useQuery<RecipesQueryData>(USER_RECIPES_QUERY, {
    fetchPolicy: "cache-and-network",
  });
  const recipes = data?.userRecipesData ?? [];
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  useEffect(() => {
    if (recipes.length === 0) return;
    if (!selectedRecipeId || !recipes.some((recipe) => recipe.id === selectedRecipeId)) {
      setSelectedRecipeId(recipes[0].id);
    }
  }, [recipes, selectedRecipeId]);

  const selectedRecipe = useMemo(
    () => recipes.find((recipe) => recipe.id === selectedRecipeId) ?? recipes[0] ?? null,
    [recipes, selectedRecipeId],
  );

  const favoriteCount = recipes.filter((recipe) => recipe.source === "favori").length;
  const coachCount = recipes.filter((recipe) => recipe.source === "coach").length;
  const averageCalories = Math.round(
    recipes.length > 0
      ? recipes.reduce((sum, recipe) => sum + recipe.calories, 0) / recipes.length
      : 0,
  );

  return (
    <HomeLayout pageTitle="Mes recettes">
      <UserPageLayout
        activeNav="recipes"
        maxWidthClassName="max-w-6xl"
        contentClassName="bg-[#f5fbf1] px-5 py-6 md:px-8 lg:flex lg:min-h-0 lg:flex-col"
      >
        {loading && (
          <div className="rounded-md bg-[#eef4e8] px-3 py-2 text-xs text-[#3c3c3c]">
            Chargement de vos recettes...
          </div>
        )}

        {error && (
          <div className="rounded-md bg-[#f7e1e1] px-3 py-2 text-xs text-[#7b2222]">
            Donnees indisponibles. Verifie que vous etes bien connecte(e).
          </div>
        )}

        <div className="max-w-4xl text-[#2c2c2c]">
          <h1 className="text-lg font-semibold">Mes recettes</h1>
          <p className="mt-1 text-xs text-[#555]">
            Retrouve ici tes recettes favorites et celles recommandees par ton coach, avec
            preparation detaillee, apports nutritionnels et bienfaits.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md bg-[#bfe8ea] px-3 py-2 text-xs text-[#2c2c2c] shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
            <div className="text-sm font-semibold">{recipes.length}</div>
            <div className="text-[11px]">recettes disponibles</div>
          </div>
          <div className="rounded-md bg-[#a7d9a1] px-3 py-2 text-xs text-[#2c2c2c] shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
            <div className="text-sm font-semibold">{favoriteCount}</div>
            <div className="text-[11px]">recettes favorites</div>
          </div>
          <div className="rounded-md bg-[#e9b26b] px-3 py-2 text-xs text-[#2c2c2c] shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
            <div className="text-sm font-semibold">{coachCount}</div>
            <div className="text-[11px]">recettes conseillees coach</div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[1.35fr_1fr]">
          <section className="rounded-md border border-[#d3d8cf] bg-[#eef4e8] p-4 md:p-5 lg:flex lg:min-h-0 lg:flex-col">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-[#2e3a2d]">Liste des recettes</h2>
              <span className="rounded-full bg-white px-2 py-1 text-[10px] text-[#4d5a4b] shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
                {averageCalories} kcal en moyenne
              </span>
            </div>
            <div className="mt-3 space-y-3 overflow-x-hidden overflow-y-auto pr-1 [scrollbar-gutter:stable] lg:min-h-0 lg:flex-1">
              {recipes.map((recipe) => {
                const isSelected = recipe.id === selectedRecipe?.id;
                return (
                  <button
                    key={recipe.id}
                    type="button"
                    onClick={() => setSelectedRecipeId(recipe.id)}
                    className={`w-full overflow-hidden rounded-md border p-3 text-left transition ${
                      isSelected
                        ? "border-[#73916f] bg-[#ffffff] shadow-[0_3px_6px_rgba(0,0,0,0.12)]"
                        : "border-[#cdd6cb] bg-[#f9fcf7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-[#5a6758]">
                      <span
                        className={`rounded-full px-2 py-0.5 font-medium ${sourceBadgeStyles[recipe.source]}`}
                      >
                        {sourceLabel[recipe.source]}
                      </span>
                      <span>{recipe.prepTime}</span>
                      <span>|</span>
                      <span>{recipe.difficulty}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-start">
                      <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-md border border-[#cfd5cc] sm:w-28">
                        <Image
                          src={recipe.photo}
                          alt={recipe.title}
                          fill
                          sizes="(min-width: 640px) 112px, 100vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 overflow-hidden">
                        <div className="truncate text-sm font-semibold text-[#2b3a2a]">
                          {recipe.title}
                        </div>
                        <div className="mt-1 text-[11px] text-[#4a5a49]">
                          {recipe.calories} kcal | P {recipe.protein}g | G {recipe.carbs}g | L{" "}
                          {recipe.fat}g
                        </div>
                        <p className="mt-2 line-clamp-2 text-[11px] text-[#556454]">
                          {recipe.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="rounded-md border border-[#d3d8cf] bg-white p-4 shadow-[0_2px_5px_rgba(0,0,0,0.1)] md:p-5 lg:min-h-0 lg:overflow-y-auto">
            {selectedRecipe ? (
              <>
                <div className="relative overflow-hidden rounded-md border border-[#d6ddd2]">
                  <Image
                    src={selectedRecipe.photo}
                    alt={selectedRecipe.title}
                    width={1200}
                    height={650}
                    sizes="(min-width: 1024px) 360px, 100vw"
                    className="h-44 w-full object-cover"
                  />
                </div>

                <div className="mt-3">
                  <div className="mb-2 flex items-center gap-2 text-[10px]">
                    <span
                      className={`rounded-full px-2 py-0.5 font-medium ${sourceBadgeStyles[selectedRecipe.source]}`}
                    >
                      {sourceLabel[selectedRecipe.source]}
                    </span>
                    <span className="rounded-full bg-[#eef4e8] px-2 py-0.5 text-[#425242]">
                      {selectedRecipe.prepTime}
                    </span>
                    <span className="rounded-full bg-[#eef4e8] px-2 py-0.5 text-[#425242]">
                      {selectedRecipe.servings} portion
                      {selectedRecipe.servings > 1 ? "s" : ""}
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-[#2e3a2d]">{selectedRecipe.title}</h2>
                  <p className="mt-1 text-[11px] text-[#445443]">{selectedRecipe.description}</p>
                </div>

                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#3f5a3e]">
                    Preparation
                  </h3>
                  <ol className="mt-2 space-y-2 text-[11px] text-[#445443]">
                    {selectedRecipe.prepSteps.map((step, index) => (
                      <li key={step} className="rounded-md bg-[#eef4e8] px-2 py-1.5">
                        <span className="font-semibold">{index + 1}. </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-4 rounded-md bg-[#f7faf4] p-3 text-[11px] text-[#3b4a3a]">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#3f5a3e]">
                    Apports nutritionnels
                  </h3>
                  <div>
                    <span className="font-semibold">Calories:</span> {selectedRecipe.calories} kcal
                  </div>
                  <div>
                    <span className="font-semibold">Proteines:</span> {selectedRecipe.protein} g
                  </div>
                  <div>
                    <span className="font-semibold">Glucides:</span> {selectedRecipe.carbs} g
                  </div>
                  <div>
                    <span className="font-semibold">Lipides:</span> {selectedRecipe.fat} g
                  </div>
                  <div>
                    <span className="font-semibold">Fibres:</span> {selectedRecipe.fiber} g
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#3f5a3e]">
                    Bienfaits
                  </h3>
                  <ul className="mt-2 space-y-2 text-[11px] text-[#445443]">
                    {selectedRecipe.benefits.map((benefit) => (
                      <li key={benefit} className="rounded-md bg-[#eef4e8] px-2 py-1.5">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 rounded-md bg-[#dcefd9] p-3 text-[11px] text-[#274427]">
                  <h3 className="text-xs font-semibold uppercase tracking-wide">
                    Commentaire coach
                  </h3>
                  <p className="mt-2">{selectedRecipe.coachNote}</p>
                </div>
              </>
            ) : (
              <p className="text-xs text-[#4d5a4b]">Aucune recette disponible pour le moment.</p>
            )}
          </aside>
        </div>
      </UserPageLayout>
    </HomeLayout>
  );
}
