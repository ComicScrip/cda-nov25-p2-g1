import { BookOpen, ChefHat, Clock, Loader2, Plus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import CoachLayout from "@/components/coach/CoachLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecipeData } from "@/graphql/generated/schema";
import {
  UserRole,
  useAssignRecipeToUserMutation,
  useCoachRecipesPageDataLazyQuery,
  useCoachRecipesPageDataQuery,
  useCoachUserQuery,
  useProfileQuery,
} from "@/graphql/generated/schema";

function getSourceLabel(source: string): string {
  return source === "coach" ? "Conseillée par le coach" : "Favori";
}

const RECIPES_PER_PAGE = 10;

function getServingsLabel(servings: number): string {
  return `${servings} portion${servings > 1 ? "s" : ""}`;
}

export default function CoachRecipes() {
  const router = useRouter();
  const { data: profileData, loading: profileLoading } = useProfileQuery({
    fetchPolicy: "cache-and-network",
  });

  const { data: coachUsersData } = useCoachUserQuery();
  const [assignRecipeToUser, { loading: assigning }] = useAssignRecipeToUserMutation();

  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [allRecipes, setAllRecipes] = useState<RecipeData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const listScrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);

  const { data, loading: initialLoading } = useCoachRecipesPageDataQuery({
    fetchPolicy: "network-only",
    variables: { limit: RECIPES_PER_PAGE, offset: 0 },
  });

  const [loadMore, { loading: loadMoreLoading }] = useCoachRecipesPageDataLazyQuery();

  const coachCount = data?.coachRecipesPageData?.coachCount ?? 0;
  const averageCalories = data?.coachRecipesPageData?.averageCalories ?? 0;

  useEffect(() => {
    const pageData = data?.coachRecipesPageData;
    if (pageData) {
      setAllRecipes(pageData.recipes);
      setTotalCount(pageData.totalCount);
    }
  }, [data]);

  useEffect(() => {
    if (!profileLoading && !profileData?.me) {
      router.push("/login");
    } else if (
      !profileLoading &&
      profileData?.me?.role !== UserRole.Coach &&
      profileData?.me?.role !== UserRole.Admin
    ) {
      router.push("/");
    }
  }, [profileData, profileLoading, router]);

  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    const scrollRoot = listScrollContainerRef.current ?? null;
    if (!sentinel || totalCount === 0 || allRecipes.length >= totalCount) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          !entry?.isIntersecting ||
          loadMoreLoading ||
          isLoadingMoreRef.current ||
          allRecipes.length >= totalCount
        )
          return;
        isLoadingMoreRef.current = true;
        const currentLength = allRecipes.length;
        loadMore({
          variables: {
            limit: RECIPES_PER_PAGE,
            offset: currentLength,
          },
        })
          .then((result) => {
            const nextRecipes = result.data?.coachRecipesPageData?.recipes ?? [];
            if (nextRecipes.length === 0) return;
            setAllRecipes((prev) => {
              const existingIds = new Set(prev.map((r) => r.id));
              const newOnes = nextRecipes.filter((r) => !existingIds.has(r.id));
              if (newOnes.length === 0) return prev;
              const merged = [...prev, ...newOnes];
              return merged.slice(0, totalCount);
            });
          })
          .finally(() => {
            isLoadingMoreRef.current = false;
          });
      },
      { root: scrollRoot, rootMargin: "200px", threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [allRecipes.length, totalCount, loadMoreLoading, loadMore]);

  const recipes = allRecipes;

  const selectedRecipe = useMemo(() => {
    if (!selectedRecipeId && recipes.length > 0) {
      return recipes[0];
    }
    return recipes.find((recipe) => recipe.id === selectedRecipeId) ?? recipes[0];
  }, [selectedRecipeId, recipes]);

  const coachees =
    coachUsersData?.coachUsers?.map((user) => ({
      id: user.userId,
      name: user.displayName || user.email,
    })) ?? [];

  // Loader plein écran uniquement au premier chargement des recettes
  if (profileLoading || (initialLoading && allRecipes.length === 0)) {
    return (
      <CoachLayout pageTitle="Recettes">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </CoachLayout>
    );
  }

  if (
    !profileData?.me ||
    (profileData.me.role !== UserRole.Coach && profileData.me.role !== UserRole.Admin)
  ) {
    return null;
  }

  return (
    <CoachLayout pageTitle="Recettes">
      <section className="flex-1 bg-[#f3f7ee] py-6">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="overflow-hidden rounded-md border border-[#c9c9c9] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
            <div className="bg-[#f5fbf1] px-5 py-6 md:px-8 lg:flex lg:min-h-0 lg:flex-col">
              <div className="max-w-4xl text-[#2c2c2c]">
                <h1 className="text-lg font-semibold">Recettes proposées par le coach</h1>
                <p className="mt-1 text-sm text-[#555]">
                  Retrouve ici toutes les recettes proposées par le coach avec préparation
                  détaillée, apports nutritionnels et bienfaits.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Card className="bg-[#bfe8ea] border-0 text-[#2c2c2c] shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" aria-hidden="true" />
                      <div className="text-sm font-semibold">{totalCount}</div>
                    </div>
                    <div className="text-xs mt-1">recettes disponibles</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#e9b26b] border-0 text-[#2c2c2c] shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-4 w-4" aria-hidden="true" />
                      <div className="text-sm font-semibold">{coachCount}</div>
                    </div>
                    <div className="text-xs mt-1">recettes proposées</div>
                  </CardContent>
                </Card>
              </div>

              {recipes.length === 0 ? (
                <Card className="mt-6 border-[#d3d8cf] bg-[#eef4e8] shadow-none">
                  <CardContent className="p-4 md:p-5">
                    <p className="text-sm text-[#2e3a2d]">Aucune recette générée pour le moment.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="mt-6 grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[1.35fr_1fr]">
                  <Card className="order-2 border-[#d3d8cf] bg-[#eef4e8] shadow-none lg:order-1 lg:flex lg:min-h-0 lg:flex-col">
                    <CardHeader className="p-4 md:p-5 pb-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle className="text-sm font-semibold text-[#2e3a2d] flex items-center gap-2">
                          <BookOpen className="h-4 w-4" aria-hidden="true" />
                          Liste des recettes
                          {totalCount > 0 && (
                            <span className="font-normal text-[#5a6758]">
                              ({recipes.length} / {totalCount})
                            </span>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            asChild
                            className="bg-[#2d5a27]! hover:bg-[#234a20]! text-white"
                          >
                            <Link href="/coach/recipes/new">
                              <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
                              Nouvelle recette
                            </Link>
                          </Button>
                          <span className="rounded-full bg-white px-2 py-1 text-xs text-[#4d5a4b] shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
                            {averageCalories} kcal en moyenne
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-5 pt-0 lg:flex-1 lg:flex lg:flex-col lg:min-h-0">
                      <div
                        ref={listScrollContainerRef}
                        className="mt-3 space-y-3 overflow-x-hidden overflow-y-auto pr-1 [scrollbar-gutter:stable] min-h-[280px] max-h-[65vh] lg:min-h-0 lg:flex-1"
                      >
                        {recipes.map((recipe) => {
                          const isSelected = recipe.id === selectedRecipe?.id;
                          return (
                            <button
                              key={recipe.id}
                              type="button"
                              onClick={() => {
                                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                                  router.push(`/coach/recipes/${recipe.id}`);
                                } else {
                                  setSelectedRecipeId(recipe.id);
                                }
                              }}
                              className={`w-full cursor-pointer overflow-hidden rounded-md border p-3 text-left transition ${
                                isSelected
                                  ? "border-[#73916f] bg-[#ffffff] shadow-[0_3px_6px_rgba(0,0,0,0.12)]"
                                  : "border-[#cdd6cb] bg-[#f9fcf7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                              }`}
                            >
                              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-[#5a6758]">
                                <span className="rounded-full px-2 py-0.5 font-medium text-xs bg-[#dce8f6] text-[#2e4e74]">
                                  {getSourceLabel(recipe.source)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" aria-hidden="true" />
                                  {recipe.prepTime}
                                </span>
                                <span>|</span>
                                <span>{recipe.difficulty}</span>
                              </div>
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-start">
                                <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-md border border-[#cfd5cc] sm:w-28">
                                  <Image
                                    src={recipe.photo}
                                    alt=""
                                    fill
                                    sizes="(min-width: 640px) 112px, 100vw"
                                    className="object-cover"
                                    loading="lazy"
                                    unoptimized={
                                      recipe.photo.startsWith("data:") ||
                                      recipe.photo.startsWith("blob:")
                                    }
                                    aria-hidden="true"
                                  />
                                </div>
                                <div className="min-w-0 overflow-hidden">
                                  <div className="truncate text-sm font-semibold text-[#2b3a2a]">
                                    {recipe.title}
                                  </div>
                                  <div className="mt-1 text-xs text-[#4a5a49]">
                                    {recipe.calories} kcal | P {recipe.protein}g | G {recipe.carbs}g
                                    | L {recipe.fat}g
                                  </div>
                                  <p className="mt-2 line-clamp-2 text-xs text-[#556454]">
                                    {recipe.description}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                        {/* Sentinel pour le chargement infini : quand il entre en vue en bas de la liste, on charge les 10 suivantes */}
                        {recipes.length < totalCount && (
                          <div
                            ref={loadMoreSentinelRef}
                            className="flex justify-center py-4"
                            aria-hidden
                          >
                            {loadMoreLoading && (
                              <Loader2 className="h-6 w-6 animate-spin text-[#73916f]" />
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {selectedRecipe && (
                    <Card className="order-1 hidden border-[#d3d8cf] bg-white shadow-[0_2px_5px_rgba(0,0,0,0.1)] lg:order-2 lg:block lg:min-h-0 lg:overflow-y-auto">
                      <CardContent className="space-y-4 p-4 md:p-5">
                        <div className="relative overflow-hidden rounded-md border border-[#d6ddd2]">
                          <Image
                            src={selectedRecipe.photo}
                            alt=""
                            width={1200}
                            height={650}
                            sizes="(min-width: 1024px) 360px, 100vw"
                            className="h-44 w-full object-cover"
                            loading="eager"
                            priority
                            unoptimized={
                              selectedRecipe.photo.startsWith("data:") ||
                              selectedRecipe.photo.startsWith("blob:")
                            }
                            aria-hidden="true"
                          />
                        </div>

                        <div className="mt-3">
                          <div className="mb-2 flex items-center gap-2 text-xs">
                            <span className="rounded-full px-2 py-0.5 font-medium text-xs bg-[#dce8f6] text-[#2e4e74]">
                              {getSourceLabel(selectedRecipe.source)}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4e8] px-2 py-0.5 text-xs text-[#425242]">
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              {selectedRecipe.prepTime}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4e8] px-2 py-0.5 text-xs text-[#425242]">
                              <Users className="h-3 w-3" aria-hidden="true" />
                              {getServingsLabel(selectedRecipe.servings)}
                            </span>
                          </div>
                          <h2 className="text-sm font-semibold text-[#2e3a2d]">
                            {selectedRecipe.title}
                          </h2>
                          <p className="mt-1 text-xs text-[#445443]">
                            {selectedRecipe.description}
                          </p>
                        </div>

                        {selectedRecipe.prepSteps.length > 0 && (
                          <div className="mt-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#3f5a3e]">
                              Préparation
                            </h3>
                            <ol className="mt-2 space-y-2 text-xs text-[#445443]">
                              {selectedRecipe.prepSteps.map((step, index) => (
                                <li
                                  key={`${index}-${step}`}
                                  className="rounded-md bg-[#eef4e8] px-2 py-1.5"
                                >
                                  <span className="font-semibold">{index + 1}. </span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        <div className="mt-4 rounded-md bg-[#f7faf4] p-3 text-xs text-[#3b4a3a]">
                          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#3f5a3e]">
                            Apports nutritionnels
                          </h3>
                          <div>
                            <span className="font-semibold">Calories:</span>{" "}
                            {selectedRecipe.calories} kcal
                          </div>
                          <div>
                            <span className="font-semibold">Protéines:</span>{" "}
                            {selectedRecipe.protein} g
                          </div>
                          <div>
                            <span className="font-semibold">Glucides:</span> {selectedRecipe.carbs}{" "}
                            g
                          </div>
                          <div>
                            <span className="font-semibold">Lipides:</span> {selectedRecipe.fat} g
                          </div>
                          <div>
                            <span className="font-semibold">Fibres:</span> {selectedRecipe.fiber} g
                          </div>
                        </div>

                        {selectedRecipe.benefits.length > 0 && (
                          <div className="mt-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#3f5a3e]">
                              Bienfaits
                            </h3>
                            <ul className="mt-2 space-y-2 text-xs text-[#445443]">
                              {selectedRecipe.benefits.map((benefit, index) => (
                                <li
                                  key={`${index}-${benefit}`}
                                  className="rounded-md bg-[#eef4e8] px-2 py-1.5"
                                >
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="mt-4 rounded-md bg-[#dcefd9] p-3 text-xs text-[#274427]">
                          <h3 className="text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
                            <ChefHat className="h-3 w-3" aria-hidden="true" />
                            Commentaire coach
                          </h3>
                          <p className="mt-2">{selectedRecipe.coachNote}</p>
                        </div>

                        {coachees.length > 0 && (
                          <div className="mt-2 rounded-md bg-[#f0f4ec] p-3 text-xs text-[#274427] space-y-2">
                            <h3 className="text-sm font-semibold flex items-center justify-between gap-2">
                              <span>Assigner cette recette à un coachee</span>
                            </h3>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                              <div className="grid max-h-32 w-full grid-cols-1 gap-1 overflow-y-auto rounded-md border border-[#cdd6cb] bg-white px-2 py-1 text-xs shadow-sm">
                                {coachees.map((user) => {
                                  const checked = selectedUserIds.includes(user.id);
                                  return (
                                    <label
                                      key={user.id}
                                      className="flex cursor-pointer items-center gap-2 text-[#2e3a2d]"
                                    >
                                      <input
                                        type="checkbox"
                                        className="h-3 w-3 rounded border-[#cdd6cb] text-[#73916f] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#73916f]"
                                        checked={checked}
                                        onChange={(e) => {
                                          setSelectedUserIds((prev) => {
                                            if (e.target.checked) {
                                              return prev.includes(user.id)
                                                ? prev
                                                : [...prev, user.id];
                                            }
                                            return prev.filter((id) => id !== user.id);
                                          });
                                        }}
                                      />
                                      <span className="truncate">{user.name}</span>
                                    </label>
                                  );
                                })}
                                {coachees.length === 0 && (
                                  <span className="text-[#7a8a78]">Aucun coachee disponible</span>
                                )}
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                disabled={selectedUserIds.length === 0 || assigning}
                                className="bg-[#2d5a27] text-white hover:bg-[#234a20]"
                                onClick={async () => {
                                  if (selectedUserIds.length === 0 || !selectedRecipe?.id) return;
                                  try {
                                    await Promise.all(
                                      selectedUserIds.map((userId) =>
                                        assignRecipeToUser({
                                          variables: {
                                            recipeId: selectedRecipe.id,
                                            userId,
                                          },
                                        }),
                                      ),
                                    );
                                    setSelectedUserIds([]);
                                  } catch {
                                    // noop for now
                                  }
                                }}
                              >
                                {assigning ? (
                                  <>
                                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                    Assignation…
                                  </>
                                ) : (
                                  "Assigner"
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </CoachLayout>
  );
}
