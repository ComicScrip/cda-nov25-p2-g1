import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import HomeLayout from "@/components/HomeLayout";
import UserPageLayout from "@/components/UserPageLayout";
import { Button } from "@/components/ui/button";
import { useUserMealQuery } from "@/graphql/generated/schema";

const formatMealDate = (consumedAt: string): string => {
  const date = new Date(consumedAt);
  if (Number.isNaN(date.getTime())) return "Date inconnue";
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
  if (Number.isNaN(date.getTime())) return "--h--";
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h");
};

export default function UserMealDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : "";

  const { data, loading } = useUserMealQuery({
    variables: { id },
    skip: !id,
  });

  const meal = data?.userMeal ?? null;

  if (!id || loading) {
    return (
      <HomeLayout pageTitle="Détail repas" footerVariant="userSlim">
        <UserPageLayout activeNav="meals" contentClassName="bg-[#f5fbf1] px-5 py-6">
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#73916f] border-t-transparent" />
          </div>
        </UserPageLayout>
      </HomeLayout>
    );
  }

  if (!meal) {
    return (
      <HomeLayout pageTitle="Repas introuvable" footerVariant="userSlim">
        <UserPageLayout activeNav="meals" contentClassName="bg-[#f5fbf1] px-5 py-6">
          <div className="max-w-lg">
            <p className="text-sm text-[#555]">Repas introuvable.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/user_meals">Retour aux repas</Link>
            </Button>
          </div>
        </UserPageLayout>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout pageTitle={meal.name} footerVariant="userSlim">
      <UserPageLayout activeNav="meals" contentClassName="bg-[#f5fbf1] px-5 py-6 md:px-8">
        <Button
          asChild
          variant="outline"
          className="mb-4 w-full border-[#73916f] bg-white text-[#2d5a27] hover:bg-[#eef4e8] sm:w-auto"
        >
          <Link href="/user_meals" className="inline-flex items-center justify-center gap-2">
            ← Retour aux repas
          </Link>
        </Button>

        <article className="max-w-lg rounded-md border border-[#d3d8cf] bg-white p-4 shadow-[0_2px_5px_rgba(0,0,0,0.1)] md:p-5">
          <div className="mb-3 rounded-md bg-[#eef4e8] px-3 py-2 text-[#3d4e3c]">
            <p className="text-[10px] uppercase tracking-wide text-[#5a6758]">Prise du repas</p>
            <p className="mt-1 text-xs font-semibold">
              {formatMealDate(meal.consumedAt)} à {formatMealTime(meal.consumedAt)}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-md border border-[#d6ddd2]">
            <Image
              src={meal.photo}
              alt={meal.name}
              width={1200}
              height={650}
              sizes="100vw"
              className="h-44 w-full object-cover"
              unoptimized={meal.photo.startsWith("data:") || meal.photo.startsWith("blob:")}
            />
          </div>

          <div className="mt-3">
            <h1 className="text-sm font-semibold text-[#2e3a2d]">{meal.name}</h1>
          </div>

          <div className="mt-3 rounded-md bg-[#f7faf4] p-3 text-[11px] text-[#3b4a3a]">
            <div>
              <span className="font-semibold">Calories:</span> {meal.calories} kcal
            </div>
            <div>
              <span className="font-semibold">Protéines:</span> {meal.protein} g
            </div>
            <div>
              <span className="font-semibold">Glucides:</span> {meal.carbs} g
            </div>
            <div>
              <span className="font-semibold">Lipides:</span> {meal.fat} g
            </div>
          </div>

          {meal.ingredients.length > 0 && (
            <div className="mt-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[#3f5a3e]">
                Ingrédients et quantités
              </h2>
              <ul className="mt-2 space-y-1.5 text-[11px] text-[#445443]">
                {meal.ingredients.map((ing, idx) => (
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
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[#3f5a3e]">
              Indications IA
            </h2>
            <ul className="mt-2 space-y-2 text-[11px] text-[#445443]">
              {meal.aiInsights.map((insight) => (
                <li key={insight} className="rounded-md bg-[#eef4e8] px-2 py-1.5">
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded-md bg-[#dcefd9] p-3 text-[11px] text-[#274427]">
            <h2 className="text-xs font-semibold uppercase tracking-wide">Commentaire coach</h2>
            <p className="mt-2">{meal.coachComment}</p>
            <p className="mt-2 text-[10px] text-[#416741]">{meal.coachName}</p>
          </div>
        </article>
      </UserPageLayout>
    </HomeLayout>
  );
}
