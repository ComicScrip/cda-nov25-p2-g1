import { hash } from "argon2";
import { AnalysisStatus, DishType, MealType, Status } from "../entities/enums";
import { Dish } from "../entities/Dish";
import { Meal } from "../entities/Meal";
import { Nutritional_Analysis } from "../entities/Nutritional_Analysis";
import { Recipe } from "../entities/Recipe";
import { User } from "../entities/User";
import { User_profile } from "../entities/User_Profile";
import { User_Recipe } from "../entities/User_Recipe";
import { Weight_Measure } from "../entities/Weight_Measure";
import db from "./index";

const JANE_EMAIL = "jane.doe@app.com";
const JANE_PASSWORD = "SuperP@ssW0rd!";
const BENEFITS_SEPARATOR = "\n##BENEFITS##\n";

type MealSeed = {
  name: string;
  consumedAt: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  score: number;
  photo: string;
  aiInsights: string[];
  coachComment: string;
  coachName: string;
};

type RecipeSeed = {
  title: string;
  source: "favori" | "coach";
  prepTimeMinutes: number;
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
  mealType: MealType;
};

const mealHistorySeeds: MealSeed[] = [
  {
    name: "Bowl quinoa & poulet",
    consumedAt: "2026-02-10T12:22:00Z",
    calories: 410,
    protein: 31,
    carbs: 38,
    fat: 14,
    fiber: 8,
    score: 89,
    photo: "/Repas_images_temporary/quinoapoulet.jpg",
    aiInsights: [
      "Bon ratio proteines / glucides pour le dejeuner.",
      "Fibres estimees correctes, legumes presents en quantite suffisante.",
      "Sodium modere, pas d alerte particuliere detectee.",
    ],
    coachComment:
      "Tres bon choix avant une apres-midi active. La prochaine fois, ajoute une source de bons lipides.",
    coachName: "Coach Lucie",
  },
  {
    name: "Salade cesar",
    consumedAt: "2026-02-10T19:48:00Z",
    calories: 390,
    protein: 24,
    carbs: 20,
    fat: 24,
    fiber: 4,
    score: 78,
    photo: "/Repas_images_temporary/saladecesar.webp",
    aiInsights: [
      "Proteines correctes mais sauce assez riche en matieres grasses.",
      "Apport en fibres moyen, quantite de verdure correcte.",
      "Repas rassasiant mais densite calorique un peu elevee.",
    ],
    coachComment:
      "Garde cette salade, mais demande la sauce a part. Tu controles mieux les quantites.",
    coachName: "Coach Lucie",
  },
  {
    name: "Saumon, riz complet et brocoli",
    consumedAt: "2026-02-11T12:06:00Z",
    calories: 505,
    protein: 35,
    carbs: 46,
    fat: 17,
    fiber: 6,
    score: 92,
    photo: "/Repas_images_temporary/saumonrizcomplet.webp",
    aiInsights: [
      "Excellent equilibre global avec une proteine de qualite.",
      "Bon apport en omega-3 lie au saumon.",
      "Quantite de glucides adaptee a une journee active.",
    ],
    coachComment: "Parfait. Ce type d assiette est exactement ce qu on vise sur la semaine.",
    coachName: "Coach Lucie",
  },
  {
    name: "Wrap dinde crudites",
    consumedAt: "2026-02-11T20:11:00Z",
    calories: 360,
    protein: 23,
    carbs: 34,
    fat: 11,
    fiber: 7,
    score: 84,
    photo: "/Repas_images_temporary/wrapdinde.jpg",
    aiInsights: [
      "Repas leger et bien reparti en macronutriments.",
      "Niveau calorique adapte a un diner.",
      "Attention a la sauce du wrap qui peut varier fortement.",
    ],
    coachComment:
      "Bonne option du soir. Si faim apres, complete avec un fruit plutot qu un snack sale.",
    coachName: "Coach Lucie",
  },
  {
    name: "Pates completes bolognaise",
    consumedAt: "2026-02-12T13:03:00Z",
    calories: 560,
    protein: 29,
    carbs: 66,
    fat: 18,
    fiber: 5,
    score: 74,
    photo: "/Repas_images_temporary/patebolo.jpg",
    aiInsights: [
      "Charge glucidique elevee, utile avant entrainement.",
      "Portion genereuse, potentielle surconsommation calorique.",
      "Proteines suffisantes mais legumes peu representes.",
    ],
    coachComment:
      "Rien d interdit, mais vise une portion de pates legerement plus petite et ajoute une salade.",
    coachName: "Coach Lucie",
  },
  {
    name: "Soupe legumes + tartine chevre",
    consumedAt: "2026-02-12T20:00:00Z",
    calories: 320,
    protein: 14,
    carbs: 32,
    fat: 12,
    fiber: 6,
    score: 80,
    photo: "/Repas_images_temporary/soupelegumetartine.webp",
    aiInsights: [
      "Repas leger, hydratant et adapte au diner.",
      "Apport en proteines un peu faible.",
      "Index glycemique global modere.",
    ],
    coachComment:
      "Tres bien pour un soir calme. Ajoute une portion de proteines maigres si tu as encore faim.",
    coachName: "Coach Lucie",
  },
  {
    name: "Omelette epinards & feta",
    consumedAt: "2026-02-13T12:35:00Z",
    calories: 430,
    protein: 28,
    carbs: 9,
    fat: 29,
    fiber: 4,
    score: 83,
    photo: "/Repas_images_temporary/recette-frittata-epinards-feta.jpg",
    aiInsights: [
      "Tres bonne densite en proteines.",
      "Glucides faibles, pense a ajouter une petite source feculente si besoin d energie.",
      "Lipides un peu hauts selon la portion de feta.",
    ],
    coachComment:
      "Belle assiette. Un morceau de pain complet en plus aurait rendu le repas encore plus complet.",
    coachName: "Coach Lucie",
  },
  {
    name: "Burger maison + patates roties",
    consumedAt: "2026-02-13T20:27:00Z",
    calories: 690,
    protein: 33,
    carbs: 58,
    fat: 35,
    fiber: 3,
    score: 66,
    photo: "/Repas_images_temporary/burgerpatate.jpg",
    aiInsights: [
      "Repas calorique et riche en matieres grasses.",
      "Proteines correctes, mais sodium eleve probable.",
      "Pertinent ponctuellement, a equilibrer sur la journee.",
    ],
    coachComment:
      "On garde ce repas plaisir, mais limite la sauce et augmente la part de legumes a cote.",
    coachName: "Coach Lucie",
  },
  {
    name: "Poke bowl tofu",
    consumedAt: "2026-02-14T12:18:00Z",
    calories: 470,
    protein: 25,
    carbs: 49,
    fat: 18,
    fiber: 9,
    score: 87,
    photo: "/Repas_images_temporary/pkebawltofu.webp",
    aiInsights: [
      "Bon repas complet avec apport vegetal interessant.",
      "Qualite lipidique correcte (graines, avocat).",
      "Portion coherente pour un dejeuner actif.",
    ],
    coachComment:
      "Tres bonne option. Pense juste a varier les sources de proteines vegetales sur la semaine.",
    coachName: "Coach Lucie",
  },
  {
    name: "Yaourt grec, granola et fruits",
    consumedAt: "2026-02-14T19:40:00Z",
    calories: 340,
    protein: 19,
    carbs: 37,
    fat: 12,
    fiber: 5,
    score: 82,
    photo: "/Repas_images_temporary/Recette-Yaourt-au-granola-framboises-et-myrtilles.webp",
    aiInsights: [
      "Repas rapide mais bien structure pour une soiree legere.",
      "Attention au sucre ajoute dans le granola.",
      "Bonne satiete grace aux proteines du yaourt grec.",
    ],
    coachComment:
      "Tres pratique quand tu manques de temps. Choisis un granola sans sucre ajoute autant que possible.",
    coachName: "Coach Lucie",
  },
];

const evolutionSeeds = [
  { measuredAt: "2026-01-05T08:30:00Z", weight: 84.2, calories: 2140, score: 70 },
  { measuredAt: "2026-01-12T08:30:00Z", weight: 83.6, calories: 2080, score: 73 },
  { measuredAt: "2026-01-19T08:30:00Z", weight: 82.9, calories: 2010, score: 77 },
  { measuredAt: "2026-01-26T08:30:00Z", weight: 82.2, calories: 1960, score: 81 },
  { measuredAt: "2026-02-02T08:30:00Z", weight: 81.6, calories: 1910, score: 85 },
  { measuredAt: "2026-02-09T08:30:00Z", weight: 80.9, calories: 1875, score: 88 },
];

const recipeSeeds: RecipeSeed[] = [
  {
    title: "Bowl quinoa, poulet et legumes verts",
    source: "favori",
    prepTimeMinutes: 20,
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
    mealType: MealType.Dejeuner,
  },
  {
    title: "Saumon, riz complet et brocoli",
    source: "coach",
    prepTimeMinutes: 25,
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
    mealType: MealType.Dejeuner,
  },
  {
    title: "Wrap dinde, crudites et sauce yaourt",
    source: "favori",
    prepTimeMinutes: 15,
    servings: 1,
    difficulty: "Facile",
    calories: 365,
    protein: 24,
    carbs: 35,
    fat: 11,
    fiber: 7,
    description:
      "Un repas rapide qui reste equilibre: ideal pour les soirs ou le temps manque.",
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
    mealType: MealType.Diner,
  },
  {
    title: "Omelette epinards et feta",
    source: "coach",
    prepTimeMinutes: 18,
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
    mealType: MealType.Diner,
  },
  {
    title: "Poke bowl tofu, avocat et graines",
    source: "coach",
    prepTimeMinutes: 20,
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
    mealType: MealType.Dejeuner,
  },
  {
    title: "Yaourt grec, granola et fruits rouges",
    source: "favori",
    prepTimeMinutes: 8,
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
    mealType: MealType.PetitDejeuner,
  },
];

function toMealType(date: Date): MealType {
  return date.getUTCHours() < 16 ? MealType.Dejeuner : MealType.Diner;
}

async function upsertJaneUser() {
  let jane = await User.findOne({ where: { email: JANE_EMAIL } });
  const hashedPassword = await hash(JANE_PASSWORD);

  if (!jane) {
    jane = User.create({
      email: JANE_EMAIL,
      hashedPassword,
    });
  } else {
    jane.hashedPassword = hashedPassword;
  }

  await jane.save();
  return jane;
}

async function upsertJaneProfile(user: User) {
  let profile = await User_profile.findOne({ where: { user: { id: user.id } } });
  if (!profile) {
    profile = User_profile.create({
      first_name: "Jane",
      last_name: "Doe",
      date_of_birth: new Date("1990-06-12"),
      gender: "femme",
      height: 170,
      goal: "Manger sainement et garder une routine stable avec mon coach.",
      user,
    });
  } else {
    profile.first_name = "Jane";
    profile.last_name = "Doe";
    profile.date_of_birth = new Date("1990-06-12");
    profile.gender = "femme";
    profile.height = 170;
    profile.goal = "Manger sainement et garder une routine stable avec mon coach.";
    profile.user = user;
  }

  await profile.save();
  return profile;
}

async function clearJaneData(user: User, profile: User_profile) {
  const existingLinks = await User_Recipe.find({
    where: { user: { id: user.id } },
    relations: ["recipe"],
  });

  if (existingLinks.length > 0) {
    await User_Recipe.remove(existingLinks);
  }

  const existingRecipes = existingLinks
    .map((link) => link.recipe)
    .filter((recipe): recipe is Recipe => Boolean(recipe));
  if (existingRecipes.length > 0) {
    await Recipe.remove(existingRecipes);
  }

  const existingMeals = await Meal.find({
    where: { user: { id: user.id } },
    relations: ["dishes", "dishes.analysis"],
  });

  const existingDishes = existingMeals.flatMap((meal) => meal.dishes ?? []);
  const existingAnalyses = existingDishes
    .map((dish) => dish.analysis)
    .filter((analysis): analysis is Nutritional_Analysis => Boolean(analysis));

  if (existingDishes.length > 0) {
    await Dish.remove(existingDishes);
  }
  if (existingAnalyses.length > 0) {
    await Nutritional_Analysis.remove(existingAnalyses);
  }
  if (existingMeals.length > 0) {
    await Meal.remove(existingMeals);
  }

  const existingWeights = await Weight_Measure.find({
    where: { user_profiles: { id: profile.id } as never } as never,
  });
  if (existingWeights.length > 0) {
    await Weight_Measure.remove(existingWeights);
  }
}

async function seedMeals(user: User) {
  for (const mealSeed of mealHistorySeeds) {
    const consumedAt = new Date(mealSeed.consumedAt);

    const meal = Meal.create({
      mealType: toMealType(consumedAt),
      consumedAt,
      user,
    });
    await meal.save();

    const analysis = Nutritional_Analysis.create({
      calories: mealSeed.calories,
      proteins: mealSeed.protein,
      carbohydrates: mealSeed.carbs,
      lipids: mealSeed.fat,
      fiber: mealSeed.fiber,
      mealHealthScore: mealSeed.score,
      rating: Number((mealSeed.score / 20).toFixed(1)),
      warnings: mealSeed.aiInsights.join("\n"),
      suggestions: `${mealSeed.coachName}: ${mealSeed.coachComment}`,
      status: Status.Publie,
      analyzedAt: consumedAt,
      validatedAt: consumedAt,
    });
    await analysis.save();

    const dish = Dish.create({
      photoUrl: mealSeed.photo,
      dishType: DishType.Plat,
      analysisStatus: AnalysisStatus.Valide,
      uploadedAt: consumedAt,
      meal,
      analysis,
    });
    await dish.save();
  }
}

async function seedEvolutionData(user: User, profile: User_profile) {
  for (const evolutionSeed of evolutionSeeds) {
    const measuredAt = new Date(evolutionSeed.measuredAt);

    const weightMeasure = Weight_Measure.create({
      measured_at: measuredAt,
      weight: evolutionSeed.weight,
    });
    (weightMeasure as unknown as { user_profiles: User_profile }).user_profiles = profile;
    await weightMeasure.save();

    const meal = Meal.create({
      mealType: MealType.Dejeuner,
      consumedAt: measuredAt,
      user,
    });
    await meal.save();

    const analysis = Nutritional_Analysis.create({
      calories: evolutionSeed.calories,
      proteins: 150,
      carbohydrates: 120,
      lipids: 40,
      fiber: 20,
      mealHealthScore: evolutionSeed.score,
      rating: Number((evolutionSeed.score / 20).toFixed(1)),
      warnings: "Point hebdomadaire pour suivi de progression.",
      suggestions: "Donnees utilisees pour le graphique d evolution.",
      status: Status.Publie,
      analyzedAt: measuredAt,
      validatedAt: measuredAt,
    });
    await analysis.save();

    const dish = Dish.create({
      photoUrl: "/Repas_images_temporary/quinoapoulet.jpg",
      dishType: DishType.Plat,
      analysisStatus: AnalysisStatus.Valide,
      uploadedAt: measuredAt,
      meal,
      analysis,
    });
    await dish.save();
  }
}

async function seedRecipes(user: User) {
  for (const recipeSeed of recipeSeeds) {
    const recipe = Recipe.create({
      title: recipeSeed.title,
      description: recipeSeed.description,
      instructions: recipeSeed.prepSteps.join("\n"),
      preparationTime: recipeSeed.prepTimeMinutes,
      cookingTime: 10,
      servings: recipeSeed.servings,
      difficultyLevel: recipeSeed.difficulty,
      status: recipeSeed.source === "coach" ? Status.Publie : Status.Brouillon,
      mealType: recipeSeed.mealType,
      chefTips: `${recipeSeed.coachNote}${BENEFITS_SEPARATOR}${recipeSeed.benefits.join("\n")}`,
      caloriesPerServing: recipeSeed.calories,
      proteinsPerServing: recipeSeed.protein,
      carbohydratesPerServing: recipeSeed.carbs,
      lipidsPerServing: recipeSeed.fat,
      fiberPerServing: recipeSeed.fiber,
    });
    await recipe.save();

    await User_Recipe.create({
      user,
      recipe,
    }).save();
  }
}

async function main() {
  await db.initialize();
  await db.synchronize();

  const jane = await upsertJaneUser();
  const profile = await upsertJaneProfile(jane);

  await clearJaneData(jane, profile);
  await seedMeals(jane);
  await seedEvolutionData(jane, profile);
  await seedRecipes(jane);

  await db.destroy();
  console.log("Jane DB seed complete.");
}

main().catch(async (error) => {
  console.error("Jane DB seed failed:", error);
  if (db.isInitialized) {
    await db.destroy();
  }
  process.exit(1);
});
