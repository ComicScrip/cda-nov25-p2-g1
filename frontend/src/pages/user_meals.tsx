import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import HomeLayout from "@/components/HomeLayout";
import UserPageLayout from "@/components/UserPageLayout";
import { useUserMealsDataQuery } from "@/graphql/generated/schema";

const getFirstQueryValue = (value: string | string[] | undefined): string | undefined => {
  return Array.isArray(value) ? value[0] : value;
};

const getNumericQueryValue = (value: string | string[] | undefined): number | null => {
  const parsed = Number(getFirstQueryValue(value));
  return Number.isFinite(parsed) ? parsed : null;
};

const formatMealDate = (consumedAt: string): string => {
  const date = new Date(consumedAt);
  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  const label = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return label.charAt(0).toUpperCase() + label.slice(1);
};

const formatMealTime = (consumedAt: string): string => {
  const date = new Date(consumedAt);
  if (Number.isNaN(date.getTime())) {
    return "--h--";
  }

  return date
    .toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(":", "h");
};

const isSameLocalDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export default function RepasUtilisateurPage() {
  const router = useRouter();
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  // Si le backend ne supporte pas encore "ingredients", on réessaie sans pour afficher les repas
  const [omitIngredients, setOmitIngredients] = useState(false);

  const { data, loading, error } = useUserMealsDataQuery({
    fetchPolicy: "cache-and-network",
    variables: { includeIngredients: !omitIngredients },
  });

  useEffect(() => {
    if (error && !omitIngredients) {
      setOmitIngredients(true);
    }
  }, [error, omitIngredients]);

  const mealHistory = data?.userMealsData ?? [];

  useEffect(() => {
    setSelectedMealId((currentSelectedMealId) => {
      if (mealHistory.length === 0) {
        return null;
      }

      if (currentSelectedMealId && mealHistory.some((meal) => meal.id === currentSelectedMealId)) {
        return currentSelectedMealId;
      }

      return mealHistory[0].id;
    });
  }, [mealHistory]);

  useEffect(() => {
    if (!router.isReady || mealHistory.length === 0) {
      return;
    }

    const mealName = getFirstQueryValue(router.query.mealName)?.trim().toLocaleLowerCase();
    if (!mealName) {
      return;
    }

    const calories = getNumericQueryValue(router.query.calories);
    const protein = getNumericQueryValue(router.query.protein);
    const carbs = getNumericQueryValue(router.query.carbs);
    const fat = getNumericQueryValue(router.query.fat);

    const matchedMeal = mealHistory.find((meal) => {
      const hasSameName = meal.name.toLocaleLowerCase() === mealName;
      const hasSameCalories = calories === null || meal.calories === calories;
      const hasSameProtein = protein === null || meal.protein === protein;
      const hasSameCarbs = carbs === null || meal.carbs === carbs;
      const hasSameFat = fat === null || meal.fat === fat;

      return hasSameName && hasSameCalories && hasSameProtein && hasSameCarbs && hasSameFat;
    });

    if (matchedMeal) {
      setSelectedMealId((currentSelectedMealId) => {
        return currentSelectedMealId === matchedMeal.id ? currentSelectedMealId : matchedMeal.id;
      });
    }
  }, [
    router.isReady,
    router.query.mealName,
    router.query.calories,
    router.query.protein,
    router.query.carbs,
    router.query.fat,
    mealHistory,
  ]);

  const selectedMeal = useMemo(() => {
    if (mealHistory.length === 0) {
      return null;
    }

    return mealHistory.find((meal) => meal.id === selectedMealId) ?? mealHistory[0];
  }, [mealHistory, selectedMealId]);

  const averageCalories = Math.round(
    mealHistory.length > 0
      ? mealHistory.reduce((sum, meal) => sum + meal.calories, 0) / mealHistory.length
      : 0,
  );

  const averageScore = Math.round(
    mealHistory.length > 0
      ? mealHistory.reduce((sum, meal) => sum + meal.aiScore, 0) / mealHistory.length
      : 0,
  );

  const targetCalories = 2000;
  const today = new Date();
  const totalScannedCalories = mealHistory.reduce((sum, meal) => {
    const d = new Date(meal.consumedAt);
    if (Number.isNaN(d.getTime())) return sum;
    return isSameLocalDay(d, today) ? sum + meal.calories : sum;
  }, 0);
  const displayedProgress =
    targetCalories > 0 ? Math.round((totalScannedCalories / targetCalories) * 100) : 0;
  const clampedProgress = Math.max(0, Math.min(displayedProgress, 100));

  const getProgressBarColor = (value: number) => {
    if (value > 100) return "from-[#b91c1c] to-[#7f1d1d]"; // rouge foncé
    if (value >= 70) return "from-[#22c55e] to-[#15803d]"; // vert
    if (value >= 45) return "from-[#fb923c] to-[#c05621]"; // orange
    return "from-[#3b82f6] to-[#1d4ed8]"; // bleu
  };

  const progressBarGradient = getProgressBarColor(displayedProgress);

  return (
    <HomeLayout pageTitle="Mes repas" footerVariant="userSlim">
      <UserPageLayout
        activeNav="meals"
        contentClassName="bg-[#f5fbf1] px-5 py-6 md:px-8 lg:flex lg:min-h-0 lg:flex-col"
      >
        {loading && (
          <div className="rounded-md bg-[#eef4e8] px-3 py-2 text-xs text-[#3c3c3c]">
            Chargement de vos repas...
          </div>
        )}

        {error && (
          <div className="rounded-md bg-[#f7e1e1] px-3 py-2 text-xs text-[#7b2222]">
            Donnees indisponibles. Verifie que vous etes bien connecte(e).
          </div>
        )}

        <div className="max-w-4xl text-[#2c2c2c]">
          <h1 className="text-lg font-semibold">Historique des repas scannés</h1>
          <p className="mt-1 text-xs text-[#555]">
            {mealHistory.length} repas enregistrés. Clique sur un repas pour voir les indications de
            l&apos;IA et le commentaire de ton coach.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="rounded-md bg-[#bfe8ea] px-3 py-2 text-xs text-[#2c2c2c] shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
            <div className="text-sm font-semibold">{mealHistory.length}</div>
            <div className="text-[11px]">repas scannés</div>
          </div>
          <div className="rounded-md bg-[#a7d9a1] px-3 py-2 text-xs text-[#2c2c2c] shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
            <div className="text-sm font-semibold">{averageCalories} kcal</div>
            <div className="text-[11px]">calories moyennes</div>
          </div>
          <div className="rounded-md bg-[#e9b26b] px-3 py-2 text-xs text-[#2c2c2c] shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
            <div className="text-sm font-semibold">{averageScore}%</div>
            <div className="text-[11px]">score IA moyen</div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-[#e0f2fe] to-[#eff6ff] px-4 py-3 text-xs text-[#1f2937] shadow-[0_4px_10px_rgba(15,23,42,0.18)] border border-[#bfdbfe]/70">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold tracking-wide text-[#0f172a] uppercase">
                  Objectif global
                </span>
                <span className="text-[10px] text-[#4b5563]">
                  {totalScannedCalories} kcal / {targetCalories} kcal aujourd&apos;hui
                </span>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-[#0f172a] shadow-[0_1px_3px_rgba(15,23,42,0.12)]">
                <span>Progression</span>
                <span className="rounded-full bg-[#0f172a] px-2 py-0.5 text-[10px] font-bold text-white">
                  {displayedProgress}%
                </span>
              </div>
            </div>
            <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-[#e5edf7] border border-[#cbd5e1]">
              <div
                className={`h-full bg-gradient-to-r ${progressBarGradient} transition-all duration-500 ease-out`}
                style={{
                  width: `${Math.min(clampedProgress, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[1.35fr_1fr]">
          <section className="rounded-md border border-[#d3d8cf] bg-[#eef4e8] p-4 md:p-5 lg:flex lg:min-h-0 lg:flex-col">
            <h2 className="text-sm font-semibold text-[#2e3a2d]">Mes 10 derniers repas</h2>
            <div className="mt-3 space-y-3 overflow-x-hidden overflow-y-auto pr-1 [scrollbar-gutter:stable] lg:min-h-0 lg:flex-1">
              {mealHistory.map((meal) => {
                const isSelected = meal.id === selectedMeal?.id;
                return (
                  <button
                    key={meal.id}
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined" && window.innerWidth < 1024) {
                        router.push(`/user_meals/${meal.id}`);
                      } else {
                        setSelectedMealId(meal.id);
                      }
                    }}
                    className={`w-full cursor-pointer overflow-hidden rounded-md border p-3 text-left transition ${
                      isSelected
                        ? "border-[#73916f] bg-[#ffffff] shadow-[0_3px_6px_rgba(0,0,0,0.12)]"
                        : "border-[#cdd6cb] bg-[#f9fcf7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[#5a6758]">
                      <span className="rounded-full bg-[#edf4ea] px-2 py-0.5 font-medium">
                        {formatMealDate(meal.consumedAt)}
                      </span>
                      <span className="font-semibold">{formatMealTime(meal.consumedAt)}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md border border-[#cfd5cc] sm:w-28">
                        <Image
                          src={meal.photo}
                          alt={meal.name}
                          fill
                          sizes="(min-width: 640px) 112px, 100vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate text-sm font-semibold text-[#2b3a2a]">
                            {meal.name}
                          </div>
                          <span className="shrink-0 whitespace-nowrap rounded-full bg-[#e6efe2] px-2 py-0.5 text-[10px] text-[#3b5538]">
                            Score IA {meal.aiScore}%
                          </span>
                        </div>
                        <div className="mt-2 text-[11px] text-[#41543f]">
                          {meal.calories} kcal | P {meal.protein}g | G {meal.carbs}g | L {meal.fat}g
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="hidden rounded-md border border-[#d3d8cf] bg-white p-4 shadow-[0_2px_5px_rgba(0,0,0,0.1)] md:p-5 lg:block lg:min-h-0 lg:overflow-y-auto">
            {selectedMeal ? (
              <>
                <div className="mb-3 rounded-md bg-[#eef4e8] px-3 py-2 text-[#3d4e3c]">
                  <p className="text-[10px] uppercase tracking-wide text-[#5a6758]">
                    Prise du repas
                  </p>
                  <p className="mt-1 text-xs font-semibold">
                    {formatMealDate(selectedMeal.consumedAt)} à{" "}
                    {formatMealTime(selectedMeal.consumedAt)}
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-md border border-[#d6ddd2]">
                  <Image
                    src={selectedMeal.photo}
                    alt={selectedMeal.name}
                    width={1200}
                    height={650}
                    sizes="(min-width: 1024px) 360px, 100vw"
                    className="h-44 w-full object-cover"
                  />
                </div>

                <div className="mt-3">
                  <h2 className="text-sm font-semibold text-[#2e3a2d]">{selectedMeal.name}</h2>
                </div>

                <div className="mt-3 rounded-md bg-[#f7faf4] p-3 text-[11px] text-[#3b4a3a]">
                  <div>
                    <span className="font-semibold">Calories:</span> {selectedMeal.calories} kcal
                  </div>
                  <div>
                    <span className="font-semibold">Protéines:</span> {selectedMeal.protein} g
                  </div>
                  <div>
                    <span className="font-semibold">Glucides:</span> {selectedMeal.carbs} g
                  </div>
                  <div>
                    <span className="font-semibold">Lipides:</span> {selectedMeal.fat} g
                  </div>
                </div>

                {(selectedMeal.ingredients?.length ?? 0) > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[#3f5a3e]">
                      Ingrédients et quantités
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-[11px] text-[#445443]">
                      {(selectedMeal.ingredients ?? []).map((ing, idx) => (
                        <li
                          key={`${ing.name}-${idx}`}
                          className="flex justify-between gap-2 rounded-md bg-[#eef4e8] px-2 py-1.5"
                        >
                          <span className="font-medium text-[#2e3a2d]">{ing.name}</span>
                          <span className="shrink-0 text-[#5a6758]">
                            {ing.quantity != null ? `${ing.quantity}` : "—"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#3f5a3e]">
                    Indications IA
                  </h3>
                  <ul className="mt-2 space-y-2 text-[11px] text-[#445443]">
                    {selectedMeal.aiInsights.map((insight) => (
                      <li key={insight} className="rounded-md bg-[#eef4e8] px-2 py-1.5">
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 rounded-md bg-[#dcefd9] p-3 text-[11px] text-[#274427]">
                  <h3 className="text-xs font-semibold uppercase tracking-wide">
                    Commentaire coach
                  </h3>
                  <p className="mt-2">{selectedMeal.coachComment}</p>
                  <p className="mt-2 text-[10px] text-[#416741]">{selectedMeal.coachName}</p>
                </div>
              </>
            ) : (
              <div className="rounded-md bg-[#eef4e8] p-3 text-[11px] text-[#445443]">
                Aucun repas disponible pour le moment.
              </div>
            )}
          </aside>
        </div>
      </UserPageLayout>
    </HomeLayout>
  );
}
