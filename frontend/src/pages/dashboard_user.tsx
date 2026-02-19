import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import HomeLayout from "@/components/HomeLayout";
import UserPageLayout from "@/components/UserPageLayout";
import { type UserDashboardDataQuery, useUserDashboardDataQuery } from "@/graphql/generated/schema";

const PAGE_SIZE = 10;

export default function DashboardPage() {
  const [offset, setOffset] = useState(0);
  const { data, loading, error } = useUserDashboardDataQuery({
    fetchPolicy: "cache-and-network",
    variables: { limit: PAGE_SIZE, offset },
  });

  const dashboard = data?.userDashboardData;
  const hasMoreMeals = Boolean(dashboard?.hasMoreMeals);
  const stats = [
    {
      value: String(dashboard?.daysOfUse ?? 0),
      label: "jours d'utilisation",
      bg: "bg-[#bfe8ea]",
    },
    {
      value: String(dashboard?.scannedMeals ?? 0),
      label: "repas scannes",
      bg: "bg-[#a7d9a1]",
    },
    {
      value: `${dashboard?.averageCalories ?? 0}`,
      label: "Calories moyennes",
      bg: "bg-[#e9b26b]",
    },
    {
      value: `${dashboard?.healthScore ?? 0}%`,
      label: "Score sante",
      bg: "bg-[#cfa0c8]",
    },
  ];

  type DashboardMeal = NonNullable<
    UserDashboardDataQuery["userDashboardData"]
  >["recentMeals"][number];
  const meals: DashboardMeal[] = dashboard?.recentMeals ?? [];

  return (
    <HomeLayout pageTitle="Dashboard">
      <UserPageLayout activeNav="dashboard">
        {loading && (
          <div className="rounded-md bg-[#eef4e8] px-3 py-2 text-xs text-[#3c3c3c]">
            Chargement de vos donnees...
          </div>
        )}

        {error && (
          <div className="rounded-md bg-[#f7e1e1] px-3 py-2 text-xs text-[#7b2222]">
            Donnees indisponibles. Verifie que vous etes bien connecte(e).
          </div>
        )}

        <div className="w-full">
          <div className="grid items-start gap-4 md:gap-6 xl:gap-8 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={`${stat.value}-${stat.label}`}
                  className={`${stat.bg} rounded-md px-3 py-2 text-center text-xs text-[#2c2c2c] shadow-[0_2px_4px_rgba(0,0,0,0.2)]`}
                >
                  <div className="text-sm font-semibold">{stat.value}</div>
                  <div className="text-[11px]">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="w-full rounded-md bg-[#d8d8d8] px-4 py-3 text-center shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
              <Image
                src="/cadrecrop.png"
                alt="Cadre de scan d'un repas"
                width={280}
                height={150}
                className="mx-auto h-auto w-full max-w-47.5 rounded-md"
              />
              <Link
                href="/scanner_repas"
                className="mt-3 inline-block rounded-md bg-[#36442d] px-6 py-2 text-xs font-semibold text-white shadow-[0_3px_6px_rgba(0,0,0,0.3)]"
              >
                Scanner un repas
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 mx-auto max-w-2xl text-center text-[#2c2c2c]">
          <h1 className="text-2xl font-bold md:text-3xl">
            Bienvenue dans ta tour de controle {dashboard?.firstName ?? "Utilisateur"}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs text-[#555]">
            Ici, vous avez un resume en chiffres de votre activite nutritionnelle
          </p>
        </div>

        <div className="mt-6 rounded-md border border-[#d5a76a] bg-linear-to-r from-[#f4d49a] to-[#eaa552] p-4 shadow-[0_3px_6px_rgba(0,0,0,0.2)]">
          <div className="flex items-start justify-between">
            <div className="text-sm font-semibold text-[#3a2a12]">
              Objectif calorique{" "}
              <span className="ml-2 font-normal">{dashboard?.targetCalories ?? 0} cal / j</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2bbf5c] text-xs font-bold text-white">
              {dashboard?.targetProgress ?? 0}%
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-4 text-xs text-[#3a2a12]">
            <div>
              <div>Protéines</div>
              <div className="font-semibold">
                {dashboard?.todayProtein ?? 0} g / {dashboard?.targetProtein ?? 0} g
              </div>
            </div>
            <div className="border-x border-[#c9935d] px-3">
              <div>Glucides</div>
              <div className="font-semibold">
                {dashboard?.todayCarbs ?? 0} g / {dashboard?.targetCarbs ?? 0} g
              </div>
            </div>
            <div>
              <div>Lipides</div>
              <div className="font-semibold">
                {dashboard?.todayFat ?? 0} g / {dashboard?.targetLipids ?? 0} g
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-md bg-[#89c689] p-4 text-[#1f3d1f] shadow-[0_3px_6px_rgba(0,0,0,0.2)]">
          <h2 className="text-sm font-semibold">Derniers repas de la journée</h2>
          <div className="mt-3 grid gap-3 text-[11px] sm:grid-cols-2">
            {meals.map((meal: DashboardMeal, index: number) => {
              const isSecondRow = index >= 2;
              const isRightColumn = index % 2 === 1;
              const dividerClasses = [
                "space-y-1",
                index > 0 ? "border-t border-[#1f3d1f]/25 pt-2" : "",
                isSecondRow
                  ? "sm:border-t sm:border-[#1f3d1f]/25 sm:pt-3"
                  : "sm:border-t-0 sm:pt-0",
                isRightColumn
                  ? "sm:border-l sm:border-[#1f3d1f]/25 sm:pl-3"
                  : "sm:border-l-0 sm:pl-0",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <Link
                  key={`${offset}-${index}-${meal.name}`}
                  href={{
                    pathname: "/repas_utilisateur",
                    query: {
                      mealName: meal.name,
                      calories: String(meal.calories),
                      protein: String(meal.protein),
                      carbs: String(meal.carbs),
                      fat: String(meal.fat),
                    },
                  }}
                  className={`${dividerClasses} block rounded-sm transition hover:bg-[#1f3d1f]/10`}
                >
                  <div className="font-semibold">{meal.name}</div>
                  <div>{meal.calories} kcal</div>
                  <div>
                    P: {meal.protein}g | G: {meal.carbs}g | L: {meal.fat}g
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setOffset((currentOffset) => Math.max(0, currentOffset - PAGE_SIZE))}
              disabled={offset === 0}
              className="rounded-md bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1f3d1f] shadow-[0_2px_4px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Repas précédents
            </button>
            <button
              type="button"
              onClick={() => setOffset((currentOffset) => currentOffset + PAGE_SIZE)}
              disabled={!hasMoreMeals}
              className="rounded-md bg-[#2596be] px-3 py-1.5 text-[11px] font-semibold text-white shadow-[0_2px_4px_rgba(0,0,0,0.22)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Repas suivants
            </button>
          </div>
        </div>
      </UserPageLayout>
    </HomeLayout>
  );
}
