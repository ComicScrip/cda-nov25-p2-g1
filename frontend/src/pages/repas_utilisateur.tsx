import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import HomeLayout from "@/components/HomeLayout";

type MealHistoryEntry = {
  id: number;
  name: string;
  scanDate: string;
  scanTime: string;
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

const navItems = [
  { label: "Dashboard", href: "/dashboard_user", active: false },
  { label: "Mes repas", href: "/repas_utilisateur", active: true },
  { label: "Mes recettes", href: "/recettes_user", active: false },
  { label: "Mon évolution", href: "/evolution_user", active: false },
  { label: "Mon Profile", href: "/user_profile", active: false },
];

const mealHistory: MealHistoryEntry[] = [
  {
    id: 1,
    name: "Bowl quinoa & poulet",
    scanDate: "Lundi 10 février 2026",
    scanTime: "12h22",
    calories: 410,
    protein: 31,
    carbs: 38,
    fat: 14,
    aiScore: 89,
    photo: "/Repas_images_temporary/quinoapoulet.jpg",
    aiInsights: [
      "Bon ratio protéines / glucides pour le déjeuner.",
      "Fibres estimées correctes, légumes présents en quantité suffisante.",
      "Sodium modéré, pas d'alerte particulière détectée.",
    ],
    coachComment:
      "Très bon choix avant une après-midi active. La prochaine fois, ajoute une source de bons lipides (avocat ou noix).",
    coachName: "Coach Lucie",
  },
  {
    id: 2,
    name: "Salade césar",
    scanDate: "Lundi 10 février 2026",
    scanTime: "19h48",
    calories: 390,
    protein: 24,
    carbs: 20,
    fat: 24,
    aiScore: 78,
    photo: "/Repas_images_temporary/saladecesar.webp",
    aiInsights: [
      "Protéines correctes mais sauce assez riche en matières grasses.",
      "Apport en fibres moyen, quantité de verdure correcte.",
      "Repas rassasiant mais densité calorique un peu élevée.",
    ],
    coachComment:
      "Garde cette salade, mais demande la sauce à part. Tu contrôles mieux les quantités.",
    coachName: "Coach Lucie",
  },
  {
    id: 3,
    name: "Saumon, riz complet et brocoli",
    scanDate: "Mardi 11 février 2026",
    scanTime: "12h06",
    calories: 505,
    protein: 35,
    carbs: 46,
    fat: 17,
    aiScore: 92,
    photo: "/Repas_images_temporary/saumonrizcomplet.webp",
    aiInsights: [
      "Excellent équilibre global avec une protéine de qualité.",
      "Bon apport en oméga-3 lié au saumon.",
      "Quantité de glucides adaptée à une journée active.",
    ],
    coachComment: "Parfait. Ce type d'assiette est exactement ce qu'on vise sur la semaine.",
    coachName: "Coach Lucie",
  },
  {
    id: 4,
    name: "Wrap dinde crudités",
    scanDate: "Mardi 11 février 2026",
    scanTime: "20h11",
    calories: 360,
    protein: 23,
    carbs: 34,
    fat: 11,
    aiScore: 84,
    photo: "/Repas_images_temporary/wrapdinde.jpg",
    aiInsights: [
      "Repas léger et bien réparti en macronutriments.",
      "Niveau calorique adapté à un dîner.",
      "Attention à la sauce du wrap qui peut varier fortement.",
    ],
    coachComment:
      "Bonne option du soir. Si faim après, complète avec un fruit plutôt qu'un snack salé.",
    coachName: "Coach Lucie",
  },
  {
    id: 5,
    name: "Pâtes complètes bolognaise",
    scanDate: "Mercredi 12 février 2026",
    scanTime: "13h03",
    calories: 560,
    protein: 29,
    carbs: 66,
    fat: 18,
    aiScore: 74,
    photo: "/Repas_images_temporary/patebolo.jpg",
    aiInsights: [
      "Charge glucidique élevée, utile avant entraînement.",
      "Portion généreuse, potentielle surconsommation calorique.",
      "Protéines suffisantes mais légumes peu représentés.",
    ],
    coachComment:
      "Rien d'interdit, mais vise une portion de pâtes légèrement plus petite et ajoute une salade.",
    coachName: "Coach Lucie",
  },
  {
    id: 6,
    name: "Soupe légumes + tartine chèvre",
    scanDate: "Mercredi 12 février 2026",
    scanTime: "20h00",
    calories: 320,
    protein: 14,
    carbs: 32,
    fat: 12,
    aiScore: 80,
    photo: "/Repas_images_temporary/soupelegumetartine.webp",
    aiInsights: [
      "Repas léger, hydratant et adapté au dîner.",
      "Apport en protéines un peu faible.",
      "Index glycémique global modéré.",
    ],
    coachComment:
      "Très bien pour un soir calme. Ajoute une portion de protéines maigres si tu as encore faim.",
    coachName: "Coach Lucie",
  },
  {
    id: 7,
    name: "Omelette épinards & feta",
    scanDate: "Jeudi 13 février 2026",
    scanTime: "12h35",
    calories: 430,
    protein: 28,
    carbs: 9,
    fat: 29,
    aiScore: 83,
    photo: "/Repas_images_temporary/recette-frittata-epinards-feta.jpg",
    aiInsights: [
      "Très bonne densité en protéines.",
      "Glucides faibles, pense à ajouter une petite source féculente si besoin d'énergie.",
      "Lipides un peu hauts selon la portion de feta.",
    ],
    coachComment:
      "Belle assiette. Un morceau de pain complet en plus aurait rendu le repas encore plus complet.",
    coachName: "Coach Lucie",
  },
  {
    id: 8,
    name: "Burger maison + patates rôties",
    scanDate: "Jeudi 13 février 2026",
    scanTime: "20h27",
    calories: 690,
    protein: 33,
    carbs: 58,
    fat: 35,
    aiScore: 66,
    photo: "/Repas_images_temporary/burgerpatate.jpg",
    aiInsights: [
      "Repas calorique et riche en matières grasses.",
      "Protéines correctes, mais sodium élevé probable.",
      "Pertinent ponctuellement, à équilibrer sur la journée.",
    ],
    coachComment:
      "On garde ce repas plaisir, mais limite la sauce et augmente la part de légumes à côté.",
    coachName: "Coach Lucie",
  },
  {
    id: 9,
    name: "Poké bowl tofu",
    scanDate: "Vendredi 14 février 2026",
    scanTime: "12h18",
    calories: 470,
    protein: 25,
    carbs: 49,
    fat: 18,
    aiScore: 87,
    photo: "/Repas_images_temporary/pkebawltofu.webp",
    aiInsights: [
      "Bon repas complet avec apport végétal intéressant.",
      "Qualité lipidique correcte (graines, avocat).",
      "Portion cohérente pour un déjeuner actif.",
    ],
    coachComment:
      "Très bonne option. Pense juste à varier les sources de protéines végétales sur la semaine.",
    coachName: "Coach Lucie",
  },
  {
    id: 10,
    name: "Yaourt grec, granola et fruits",
    scanDate: "Vendredi 14 février 2026",
    scanTime: "19h40",
    calories: 340,
    protein: 19,
    carbs: 37,
    fat: 12,
    aiScore: 82,
    photo: "/Repas_images_temporary/Recette-Yaourt-au-granola-framboises-et-myrtilles.webp",
    aiInsights: [
      "Repas rapide mais bien structuré pour une soirée légère.",
      "Attention au sucre ajouté dans le granola.",
      "Bonne satiété grâce aux protéines du yaourt grec.",
    ],
    coachComment:
      "Très pratique quand tu manques de temps. Choisis un granola sans sucre ajouté autant que possible.",
    coachName: "Coach Lucie",
  },
];

export default function RepasUtilisateurPage() {
  const [selectedMealId, setSelectedMealId] = useState(mealHistory[0].id);

  const selectedMeal = useMemo(
    () => mealHistory.find((meal) => meal.id === selectedMealId) ?? mealHistory[0],
    [selectedMealId],
  );

  const averageCalories = Math.round(
    mealHistory.reduce((sum, meal) => sum + meal.calories, 0) / mealHistory.length,
  );
  const averageScore = Math.round(
    mealHistory.reduce((sum, meal) => sum + meal.aiScore, 0) / mealHistory.length,
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
                            className={`block w-full rounded-sm py-2 text-center shadow-[0_2px_4px_rgba(0,0,0,0.18)] ${item.active
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

              <div className="bg-[#f5fbf1] px-5 py-6 md:px-8">
                <div className="max-w-4xl text-[#2c2c2c]">
                  <h1 className="text-lg font-semibold">Historique des repas scannés</h1>
                  <p className="mt-1 text-xs text-[#555]">
                    10 repas enregistrés. Clique sur un repas pour voir les indications de l&apos;IA
                    et le commentaire de ton coach.
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

                <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
                  <section className="rounded-md border border-[#d3d8cf] bg-[#eef4e8] p-4 md:p-5">
                    <h2 className="text-sm font-semibold text-[#2e3a2d]">Mes 10 derniers repas</h2>
                    <div className="mt-3 max-h-55 space-y-3 overflow-x-hidden overflow-y-auto pr-1 [scrollbar-gutter:stable]">
                      {mealHistory.map((meal) => {
                        const isSelected = meal.id === selectedMeal.id;
                        return (
                          <button
                            key={meal.id}
                            type="button"
                            onClick={() => setSelectedMealId(meal.id)}
                            className={`w-full overflow-hidden rounded-md border p-3 text-left transition ${isSelected
                                ? "border-[#73916f] bg-[#ffffff] shadow-[0_3px_6px_rgba(0,0,0,0.12)]"
                                : "border-[#cdd6cb] bg-[#f9fcf7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                              }`}
                          >
                            <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-[#5a6758]">
                              <span className="rounded-full bg-[#edf4ea] px-2 py-0.5 font-medium">
                                {meal.scanDate}
                              </span>
                              <span className="font-semibold">{meal.scanTime}</span>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-start">
                              <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-md border border-[#cfd5cc] sm:w-28">
                                <Image
                                  src={meal.photo}
                                  alt={meal.name}
                                  fill
                                  sizes="(min-width: 640px) 112px, 100vw"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 overflow-hidden">
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

                  <aside className="rounded-md border border-[#d3d8cf] bg-white p-4 shadow-[0_2px_5px_rgba(0,0,0,0.1)] md:p-5">
                    <div className="mb-3 rounded-md bg-[#eef4e8] px-3 py-2 text-[#3d4e3c]">
                      <p className="text-[10px] uppercase tracking-wide text-[#5a6758]">
                        Prise du repas
                      </p>
                      <p className="mt-1 text-xs font-semibold">
                        {selectedMeal.scanDate} à {selectedMeal.scanTime}
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
                        <span className="font-semibold">Calories:</span> {selectedMeal.calories}{" "}
                        kcal
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
