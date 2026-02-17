import { gql } from "@apollo/client/core";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import HomeLayout from "@/components/HomeLayout";

type MealHistoryEntry = {
  id: string;
  name: string;
  consumedAt: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  aiScore: number;
  photo: string;
  aiInsights: string[];
  coachComment: string;
  coachName: string;
};

type MealsQueryData = {
  userMealsData: MealHistoryEntry[];
};

const USER_MEALS_QUERY = gql`
  query UserMealsData {
    userMealsData {
      id
      name
      consumedAt
      calories
      protein
      carbs
      fat
      aiScore
      photo
      aiInsights
      coachComment
      coachName
    }
  }
`;

const navItems = [
  { label: "Dashboard", href: "/dashboard_user", active: false },
  { label: "Mes repas", href: "/repas_utilisateur", active: true },
  { label: "Mes recettes", href: "/recettes_user", active: false },
  { label: "Mon évolution", href: "/evolution_user", active: false },
  { label: "Mon Profile", href: "/user_profile", active: false },
];

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

export default function RepasUtilisateurPage() {
  const router = useRouter();
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);

  const { data, loading, error } = useQuery<MealsQueryData>(USER_MEALS_QUERY, {
    fetchPolicy: "cache-and-network",
  });

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

  return (
    <HomeLayout pageTitle="Mes repas">
      <section className="flex-1 bg-[#f3f7ee] py-6">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="overflow-hidden rounded-md border border-[#c9c9c9] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
              <aside className="border-r border-[#c1c1c1] bg-[#d8d8d8]">
                <nav className="p-4">
                  <ul className="space-y-3 text-sm text-[#3c3c3c]">
                    {navItems.map((item) => (
                      <li key={item.label}>
                        {item.href ? (
                          <Link
                            href={item.href}
                            className={`block w-full rounded-sm py-2 text-center shadow-[0_2px_4px_rgba(0,0,0,0.18)] ${
                              item.active
                                ? "bg-[#a680a8] text-white"
                                : "bg-[#f1f1f1] text-[#3c3c3c]"
                            }`}
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className="w-full rounded-sm bg-[#f1f1f1] py-2 shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
                          >
                            {item.label}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>

              <div className="bg-[#f5fbf1] px-5 py-6 md:px-8 lg:flex lg:min-h-0 lg:flex-col">
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
                    {mealHistory.length} repas enregistrés. Clique sur un repas pour voir les
                    indications de l&apos;IA et le commentaire de ton coach.
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                            onClick={() => setSelectedMealId(meal.id)}
                            className={`w-full overflow-hidden rounded-md border p-3 text-left transition ${
                              isSelected
                                ? "border-[#73916f] bg-[#ffffff] shadow-[0_3px_6px_rgba(0,0,0,0.12)]"
                                : "border-[#cdd6cb] bg-[#f9fcf7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                            }`}
                          >
                            <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[#5a6758]">
                              <span className="rounded-full bg-[#edf4ea] px-2 py-0.5 font-medium">
                                {formatMealDate(meal.consumedAt)}
                              </span>
                              <span className="font-semibold">
                                {formatMealTime(meal.consumedAt)}
                              </span>
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
                                  {meal.calories} kcal | P {meal.protein}g | G {meal.carbs}g | L{" "}
                                  {meal.fat}g
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <aside className="rounded-md border border-[#d3d8cf] bg-white p-4 shadow-[0_2px_5px_rgba(0,0,0,0.1)] md:p-5 lg:min-h-0 lg:overflow-y-auto">
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
                          <h2 className="text-sm font-semibold text-[#2e3a2d]">
                            {selectedMeal.name}
                          </h2>
                        </div>

                        <div className="mt-3 rounded-md bg-[#f7faf4] p-3 text-[11px] text-[#3b4a3a]">
                          <div>
                            <span className="font-semibold">Calories:</span> {selectedMeal.calories}{" "}
                            kcal
                          </div>
                          <div>
                            <span className="font-semibold">Protéines:</span> {selectedMeal.protein}{" "}
                            g
                          </div>
                          <div>
                            <span className="font-semibold">Glucides:</span> {selectedMeal.carbs} g
                          </div>
                          <div>
                            <span className="font-semibold">Lipides:</span> {selectedMeal.fat} g
                          </div>
                        </div>

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
                          <p className="mt-2 text-[10px] text-[#416741]">
                            {selectedMeal.coachName}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="rounded-md bg-[#eef4e8] p-3 text-[11px] text-[#445443]">
                        Aucun repas disponible pour le moment.
                      </div>
                    )}
                  </aside>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </HomeLayout>
  );
}
