import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import HomeLayout from "@/components/HomeLayout";

type RecipeSource = "favori" | "coach";

type RecipeEntry = {
  id: number;
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

const navItems = [
  { label: "Dashboard", href: "/dashboard_user", active: false },
  { label: "Mes repas", href: "/repas_utilisateur", active: false },
  { label: "Mes recettes", href: "/recettes_user", active: true },
  { label: "Mon evolution", href: "/evolution_user", active: false },
  { label: "Mon Profile", href: "/user_profile", active: false },
];

const recipes: RecipeEntry[] = [
  {
    id: 1,
    title: "Bowl quinoa, poulet et legumes verts",
    source: "favori",
    photo: "/Repas_images_temporary/quinoapoulet.jpg",
    prepTime: "20 min",
    servings: 1,
    difficulty: "Facile",
    calories: 430,
    protein: 32,
    carbs: 40,
    fat: 14,
    fiber: 8,
    description:
      "Un bol complet pour le midi, avec une bonne base de proteines et de glucides a digestion progressive.",
    prepSteps: [
      "Rincer puis cuire 70 g de quinoa dans 2 volumes d eau pendant 12 minutes.",
      "Poeler 130 g de blanc de poulet avec un filet d huile d olive et une pincee de paprika.",
      "Ajouter brocoli et courgette en morceaux, cuire 6 a 8 minutes pour garder du croquant.",
      "Assembler dans un bol avec le quinoa, arroser de jus de citron et parsemer de graines de sesame.",
    ],
    benefits: [
      "Soutient la recuperation musculaire grace a un bon apport proteique.",
      "Favorise la satiete avec les fibres du quinoa et des legumes.",
      "Aide a stabiliser l energie sur l apres-midi.",
    ],
    coachNote:
      "Excellent choix les jours d entrainement. Tu peux ajouter un quart d avocat pour enrichir en bons lipides.",
  },
  {
    id: 2,
    title: "Saumon, riz complet et brocoli",
    source: "coach",
    photo: "/Repas_images_temporary/saumonrizcomplet.webp",
    prepTime: "25 min",
    servings: 1,
    difficulty: "Intermediaire",
    calories: 510,
    protein: 35,
    carbs: 46,
    fat: 17,
    fiber: 6,
    description:
      "Recette conseillee par ton coach pour les jours actifs: omega-3, glucides complexes et legumes riches en micronutriments.",
    prepSteps: [
      "Cuire 80 g de riz complet selon les indications du paquet.",
      "Assaisonner un pave de saumon (150 g) avec citron, aneth, sel modere et poivre.",
      "Cuire le saumon au four 12 a 14 minutes a 190 degres.",
      "Cuire le brocoli vapeur 6 minutes puis dresser avec le riz et le saumon.",
    ],
    benefits: [
      "Contribue a la sante cardiovasculaire grace aux omega-3.",
      "Favorise le maintien de la masse musculaire.",
      "Bonne densite nutritionnelle pour limiter les fringales.",
    ],
    coachNote:
      "Recette prioritaire 2 fois par semaine. Si tu as faim apres, ajoute une portion de crudites.",
  },
  {
    id: 3,
    title: "Wrap dinde, crudites et sauce yaourt",
    source: "favori",
    photo: "/Repas_images_temporary/wrapdinde.jpg",
    prepTime: "15 min",
    servings: 1,
    difficulty: "Facile",
    calories: 365,
    protein: 24,
    carbs: 35,
    fat: 11,
    fiber: 7,
    description: "Un repas rapide qui reste equilibre: ideal pour les soirs ou le temps manque.",
    prepSteps: [
      "Melanger yaourt nature, moutarde douce, citron et ciboulette pour la sauce.",
      "Garnir une galette complete avec 120 g de dinde, carotte rapee, concombre et salade.",
      "Ajouter 2 cuilleres de sauce, rouler serre puis toaster 2 minutes a la poele.",
      "Couper en deux et servir avec une portion de tomate cerise.",
    ],
    benefits: [
      "Permet de garder un apport calorique controle le soir.",
      "Apporte des proteines maigres et des fibres.",
      "Facile a preparer, donc plus simple a tenir dans la duree.",
    ],
    coachNote:
      "Bonne base. Pense a varier avec poulet ou tofu une semaine sur deux pour diversifier tes apports.",
  },
  {
    id: 4,
    title: "Omelette epinards et feta",
    source: "coach",
    photo: "/Repas_images_temporary/recette-frittata-epinards-feta.jpg",
    prepTime: "18 min",
    servings: 1,
    difficulty: "Facile",
    calories: 425,
    protein: 28,
    carbs: 10,
    fat: 29,
    fiber: 4,
    description:
      "Proposee par ton coach pour un repas riche en proteines, avec un index glycemique bas.",
    prepSteps: [
      "Battre 3 oeufs avec poivre, herbes seches et une pincee de sel.",
      "Faire revenir les epinards 3 minutes dans une poele antiadhesive.",
      "Verser les oeufs battus, ajouter 35 g de feta emiettee, cuire a feu doux 5 minutes.",
      "Finir 2 minutes au four position grill pour une texture plus ferme.",
    ],
    benefits: [
      "Participe a la construction musculaire via les proteines des oeufs.",
      "Apporte du fer et des folates grace aux epinards.",
      "Recette rassasiante avec faible charge glucidique.",
    ],
    coachNote:
      "Parfaite pour un diner leger. Ajoute une tranche de pain complet si tu as besoin de plus d energie.",
  },
  {
    id: 5,
    title: "Poke bowl tofu, avocat et graines",
    source: "coach",
    photo: "/Repas_images_temporary/pkebawltofu.webp",
    prepTime: "20 min",
    servings: 1,
    difficulty: "Intermediaire",
    calories: 470,
    protein: 25,
    carbs: 49,
    fat: 18,
    fiber: 9,
    description:
      "Alternative vegetale recommandee pour equilibrer ta semaine et augmenter la diversite des sources de proteines.",
    prepSteps: [
      "Cuire 80 g de riz et laisser tiedir.",
      "Poeler 120 g de tofu ferme avec sauce soja reduite en sel et gingembre.",
      "Ajouter concombre, carotte, avocat et edamame dans un bol.",
      "Terminer avec graines de sesame et une vinaigrette citronnee.",
    ],
    benefits: [
      "Aide a varier les proteines en integrant une option vegetale.",
      "Apporte de bons acides gras via avocat et graines.",
      "Repas complet riche en fibres pour la digestion.",
    ],
    coachNote:
      "Tres bon choix pour les jours sans viande. Verifie juste la quantite de sauce soja pour le sodium.",
  },
  {
    id: 6,
    title: "Yaourt grec, granola et fruits rouges",
    source: "favori",
    photo: "/Repas_images_temporary/Recette-Yaourt-au-granola-framboises-et-myrtilles.webp",
    prepTime: "8 min",
    servings: 1,
    difficulty: "Tres facile",
    calories: 335,
    protein: 20,
    carbs: 36,
    fat: 11,
    fiber: 5,
    description:
      "Recette express pour un petit-dejeuner ou un diner leger, avec une bonne densite nutritionnelle.",
    prepSteps: [
      "Deposer 200 g de yaourt grec nature dans un bol.",
      "Ajouter 35 g de granola peu sucre et une poignee de fruits rouges.",
      "Completer avec 1 cuillere de graines de chia pour les fibres.",
      "Servir immediatement pour garder le croquant du granola.",
    ],
    benefits: [
      "Apporte des proteines rapides a preparer pour limiter le grignotage.",
      "Contribue au confort digestif avec un bon apport en fibres.",
      "Bonne option quand le temps de cuisine est limite.",
    ],
    coachNote:
      "Option pratique. Favorise un granola sans sucres ajoutes et garde la portion mesuree.",
  },
];

const sourceLabel: Record<RecipeSource, string> = {
  favori: "Favori",
  coach: "Conseillee par le coach",
};

const sourceBadgeStyles: Record<RecipeSource, string> = {
  favori: "bg-[#e6efe2] text-[#3b5538]",
  coach: "bg-[#dce8f6] text-[#2e4e74]",
};

export default function RecettesUserPage() {
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0].id);

  const selectedRecipe = useMemo(
    () => recipes.find((recipe) => recipe.id === selectedRecipeId) ?? recipes[0],
    [selectedRecipeId],
  );

  const favoriteCount = recipes.filter((recipe) => recipe.source === "favori").length;
  const coachCount = recipes.filter((recipe) => recipe.source === "coach").length;
  const averageCalories = Math.round(
    recipes.reduce((sum, recipe) => sum + recipe.calories, 0) / recipes.length,
  );

  return (
    <HomeLayout pageTitle="Mes recettes">
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
                        const isSelected = recipe.id === selectedRecipe.id;
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
                                  {recipe.calories} kcal | P {recipe.protein}g | G {recipe.carbs}g |
                                  L {recipe.fat}g
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
                      <h2 className="text-sm font-semibold text-[#2e3a2d]">
                        {selectedRecipe.title}
                      </h2>
                      <p className="mt-1 text-[11px] text-[#445443]">
                        {selectedRecipe.description}
                      </p>
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
                        <span className="font-semibold">Calories:</span> {selectedRecipe.calories}{" "}
                        kcal
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
