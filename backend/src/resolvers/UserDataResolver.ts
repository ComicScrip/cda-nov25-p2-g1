import {
  Arg,
  Ctx,
  Field,
  Float,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { getCurrentUser } from "../auth";
import { Pathology } from "../entities/Pathology";
import { Status } from "../entities/enums";
import { Meal } from "../entities/Meal";
import { User_profile } from "../entities/User_Profile";
import { User_Recipe } from "../entities/User_Recipe";
import { Weight_Measure } from "../entities/Weight_Measure";
import type { GraphQLContext } from "../types";

const BENEFITS_SEPARATOR = "\n##BENEFITS##\n";

const DISH_NAME_BY_PHOTO: Record<string, string> = {
  "/Repas_images_temporary/quinoapoulet.jpg": "Bowl quinoa & poulet",
  "/Repas_images_temporary/saladecesar.webp": "Salade cesar",
  "/Repas_images_temporary/saumonrizcomplet.webp": "Saumon, riz complet et brocoli",
  "/Repas_images_temporary/wrapdinde.jpg": "Wrap dinde crudites",
  "/Repas_images_temporary/patebolo.jpg": "Pates completes bolognaise",
  "/Repas_images_temporary/soupelegumetartine.webp": "Soupe legumes + tartine chevre",
  "/Repas_images_temporary/recette-frittata-epinards-feta.jpg": "Omelette epinards & feta",
  "/Repas_images_temporary/burgerpatate.jpg": "Burger maison + patates roties",
  "/Repas_images_temporary/pkebawltofu.webp": "Poke bowl tofu",
  "/Repas_images_temporary/Recette-Yaourt-au-granola-framboises-et-myrtilles.webp":
    "Yaourt grec, granola et fruits",
};

const RECIPE_PHOTO_BY_TITLE: Record<string, string> = {
  "Bowl quinoa, poulet et legumes verts": "/Repas_images_temporary/quinoapoulet.jpg",
  "Saumon, riz complet et brocoli": "/Repas_images_temporary/saumonrizcomplet.webp",
  "Wrap dinde, crudites et sauce yaourt": "/Repas_images_temporary/wrapdinde.jpg",
  "Omelette epinards et feta": "/Repas_images_temporary/recette-frittata-epinards-feta.jpg",
  "Poke bowl tofu, avocat et graines": "/Repas_images_temporary/pkebawltofu.webp",
  "Yaourt grec, granola et fruits rouges":
    "/Repas_images_temporary/Recette-Yaourt-au-granola-framboises-et-myrtilles.webp",
};

@ObjectType()
class DashboardMealData {
  @Field(() => String)
  name!: string;

  @Field(() => Int)
  calories!: number;

  @Field(() => Int)
  protein!: number;

  @Field(() => Int)
  carbs!: number;

  @Field(() => Int)
  fat!: number;
}

@ObjectType()
class DashboardData {
  @Field(() => String)
  firstName!: string;

  @Field(() => Int)
  daysOfUse!: number;

  @Field(() => Int)
  healthScore!: number;

  @Field(() => Int)
  scannedMeals!: number;

  @Field(() => Int)
  averageCalories!: number;

  @Field(() => Int)
  targetCalories!: number;

  @Field(() => Int)
  targetProgress!: number;

  @Field(() => Int)
  targetProtein!: number;

  @Field(() => Int)
  targetCarbs!: number;

  @Field(() => Int)
  targetLipids!: number;

  @Field(() => Int)
  todayProtein!: number;

  @Field(() => Int)
  todayCarbs!: number;

  @Field(() => Int)
  todayFat!: number;

  @Field(() => [DashboardMealData])
  recentMeals!: DashboardMealData[];
}

@ObjectType()
class RecipeData {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  source!: string;

  @Field(() => String)
  photo!: string;

  @Field(() => String)
  prepTime!: string;

  @Field(() => Int)
  servings!: number;

  @Field(() => String)
  difficulty!: string;

  @Field(() => Int)
  calories!: number;

  @Field(() => Int)
  protein!: number;

  @Field(() => Int)
  carbs!: number;

  @Field(() => Int)
  fat!: number;

  @Field(() => Int)
  fiber!: number;

  @Field(() => String)
  description!: string;

  @Field(() => [String])
  prepSteps!: string[];

  @Field(() => [String])
  benefits!: string[];

  @Field(() => String)
  coachNote!: string;
}

@ObjectType()
class EvolutionDataPoint {
  @Field(() => String)
  week!: string;

  @Field(() => Float)
  weight!: number;

  @Field(() => Int)
  calories!: number;

  @Field(() => Int)
  score!: number;
}

@ObjectType()
class UserProfileData {
  @Field(() => String)
  firstName!: string;

  @Field(() => String)
  lastName!: string;

  @Field(() => String, { nullable: true })
  dateOfBirth?: string;

  @Field(() => String, { nullable: true })
  gender?: string;

  @Field(() => Float, { nullable: true })
  height?: number;

  @Field(() => Float, { nullable: true })
  currentWeight?: number;

  @Field(() => String, { nullable: true })
  goal?: string;

  @Field(() => [String])
  medicalTags!: string[];
}

@InputType()
class UserProfileUpdateInput {
  @Field(() => String)
  firstName!: string;

  @Field(() => String)
  lastName!: string;

  @Field(() => String, { nullable: true })
  dateOfBirth?: string;

  @Field(() => String, { nullable: true })
  gender?: string;

  @Field(() => Float, { nullable: true })
  height?: number;

  @Field(() => Float, { nullable: true })
  currentWeight?: number;

  @Field(() => String, { nullable: true })
  goal?: string;

  @Field(() => [String])
  medicalTags!: string[];
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toIsoWeekKey(date: Date): string {
  const tmp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${weekNo}`;
}

function safeDate(dateLike?: Date): Date | null {
  if (!dateLike) return null;
  const date = new Date(dateLike);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(date?: Date): string | undefined {
  const safe = safeDate(date);
  return safe ? safe.toISOString().slice(0, 10) : undefined;
}

type DishEntry = {
  consumedAt: Date;
  photoUrl?: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  score: number;
};

@Resolver()
export default class UserDataResolver {
  private async loadUserDishEntries(userId: string): Promise<DishEntry[]> {
    const meals = await Meal.find({
      where: { user: { id: userId } },
      relations: ["dishes", "dishes.analysis"],
      order: { consumedAt: "DESC" },
    });

    const dishEntries = meals
      .flatMap((meal) =>
        (meal.dishes ?? []).map((dish) => {
          const consumedAt = safeDate(meal.consumedAt) ?? safeDate(dish.uploadedAt) ?? new Date();
          const analysis = dish.analysis;
          return {
            consumedAt,
            photoUrl: dish.photoUrl,
            calories: toNumber(analysis?.calories),
            proteins: toNumber(analysis?.proteins),
            carbs: toNumber(analysis?.carbohydrates),
            fats: toNumber(analysis?.lipids),
            score: toNumber(analysis?.mealHealthScore),
          };
        }),
      )
      .filter((dish) => dish.calories > 0);

    return dishEntries.sort((a, b) => b.consumedAt.getTime() - a.consumedAt.getTime());
  }

  private async buildUserProfilePayload(
    userId: string,
    fallbackEmail: string,
  ): Promise<UserProfileData> {
    const profile = await User_profile.findOne({
      where: { user: { id: userId } },
      relations: ["pathologies", "weight_measures"],
    });

    if (!profile) {
      return {
        firstName: fallbackEmail.split("@")[0] ?? "Utilisateur",
        lastName: "",
        dateOfBirth: undefined,
        gender: undefined,
        height: undefined,
        currentWeight: undefined,
        goal: undefined,
        medicalTags: [],
      };
    }

    const weights = [...(profile.weight_measures ?? [])]
      .map((item) => ({
        measuredAt: safeDate(item.measured_at) ?? new Date(0),
        weight: toNumber(item.weight),
      }))
      .sort((a, b) => b.measuredAt.getTime() - a.measuredAt.getTime());

    return {
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      dateOfBirth: toIsoDate(profile.date_of_birth),
      gender: profile.gender ?? undefined,
      height: profile.height ?? undefined,
      currentWeight: weights[0]?.weight ?? undefined,
      goal: profile.goal ?? undefined,
      medicalTags: (profile.pathologies ?? []).map((item) => item.name),
    };
  }

  @Query(() => UserProfileData, { nullable: true })
  async userProfileData(@Ctx() context: GraphQLContext): Promise<UserProfileData | null> {
    try {
      const currentUser = await getCurrentUser(context);
      return this.buildUserProfilePayload(currentUser.id, currentUser.email);
    } catch (_e) {
      return null;
    }
  }

  @Mutation(() => UserProfileData, { nullable: true })
  async updateUserProfileData(
    @Arg("data", () => UserProfileUpdateInput) data: UserProfileUpdateInput,
    @Ctx() context: GraphQLContext,
  ): Promise<UserProfileData | null> {
    let currentUserId = "";
    let fallbackEmail = "";
    try {
      const currentUser = await getCurrentUser(context);
      currentUserId = currentUser.id;
      fallbackEmail = currentUser.email;
    } catch (_e) {
      return null;
    }

    let profile = await User_profile.findOne({
      where: { user: { id: currentUserId } },
      relations: ["pathologies", "weight_measures"],
    });

    if (!profile) {
      profile = User_profile.create();
      (profile as unknown as { user: { id: string } }).user = { id: currentUserId };
    }

    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();
    const dateOfBirth = data.dateOfBirth?.trim();
    const parsedDate = dateOfBirth ? new Date(`${dateOfBirth}T00:00:00.000Z`) : null;

    profile.first_name = firstName || profile.first_name || fallbackEmail.split("@")[0] || "Utilisateur";
    profile.last_name = lastName || profile.last_name || "";
    profile.date_of_birth = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : profile.date_of_birth;
    profile.gender = data.gender?.trim() || profile.gender || "";
    profile.height = Number.isFinite(data.height) ? Number(data.height) : profile.height;
    profile.goal = data.goal?.trim() || profile.goal || "";

    const incomingTags = [...new Set(data.medicalTags.map((item) => item.trim()).filter(Boolean))];

    if (incomingTags.length > 0) {
      const existingPathologies = await Pathology.find({
        where: incomingTags.map((name) => ({ name })),
      });
      const knownNames = new Set(existingPathologies.map((item) => item.name));
      const missingNames = incomingTags.filter((name) => !knownNames.has(name));
      const createdPathologies: Pathology[] = [];

      for (const name of missingNames) {
        const pathology = Pathology.create({ name });
        await pathology.save();
        createdPathologies.push(pathology);
      }

      profile.pathologies = [...existingPathologies, ...createdPathologies];
    } else {
      profile.pathologies = [];
    }

    await profile.save();

    if (Number.isFinite(data.currentWeight) && Number(data.currentWeight) > 0) {
      const latestKnown = [...(profile.weight_measures ?? [])]
        .map((item) => ({ measuredAt: safeDate(item.measured_at) ?? new Date(0), weight: toNumber(item.weight) }))
        .sort((a, b) => b.measuredAt.getTime() - a.measuredAt.getTime())[0];
      const nextWeight = Number(data.currentWeight);

      if (!latestKnown || Math.abs(latestKnown.weight - nextWeight) > 0.01) {
        const weightMeasure = Weight_Measure.create({
          measured_at: new Date(),
          weight: nextWeight,
        });
        (weightMeasure as unknown as { user_profiles: User_profile }).user_profiles = profile;
        await weightMeasure.save();
      }
    }

    return this.buildUserProfilePayload(currentUserId, fallbackEmail);
  }

  @Query(() => DashboardData, { nullable: true })
  async userDashboardData(@Ctx() context: GraphQLContext): Promise<DashboardData | null> {
    let currentUserId = "";
    let fallbackFirstName = "";

    try {
      const currentUser = await getCurrentUser(context);
      currentUserId = currentUser.id;
      fallbackFirstName = currentUser.email.split("@")[0] ?? "Utilisateur";
    } catch (_e) {
      return null;
    }

    const [profile, dishes] = await Promise.all([
      User_profile.findOne({ where: { user: { id: currentUserId } } }),
      this.loadUserDishEntries(currentUserId),
    ]);

    const latestTenDishes = dishes.slice(0, 10);
    const dailyTotals = new Map<string, number>();
    const todayKey = latestTenDishes[0] ? toDateKey(latestTenDishes[0].consumedAt) : null;
    let todayProtein = 0;
    let todayCarbs = 0;
    let todayFat = 0;
    let todayCalories = 0;

    for (const dish of latestTenDishes) {
      const dayKey = toDateKey(dish.consumedAt);
      dailyTotals.set(dayKey, (dailyTotals.get(dayKey) ?? 0) + dish.calories);
      if (todayKey && dayKey === todayKey) {
        todayProtein += dish.proteins;
        todayCarbs += dish.carbs;
        todayFat += dish.fats;
        todayCalories += dish.calories;
      }
    }

    const totalCalories = latestTenDishes.reduce((sum, dish) => sum + dish.calories, 0);
    const totalScore = latestTenDishes.reduce((sum, dish) => sum + dish.score, 0);
    const averageCalories =
      dailyTotals.size > 0 ? Math.round(totalCalories / dailyTotals.size) : 0;
    const healthScore =
      latestTenDishes.length > 0 ? Math.round(totalScore / latestTenDishes.length) : 0;
    const targetCalories = 2000;
    const targetProgress =
      targetCalories > 0 ? Math.max(0, Math.min(100, Math.round((todayCalories / targetCalories) * 100))) : 0;

    return {
      firstName: profile?.first_name ?? fallbackFirstName,
      daysOfUse: dailyTotals.size,
      healthScore,
      scannedMeals: latestTenDishes.length,
      averageCalories,
      targetCalories,
      targetProgress,
      targetProtein: 150,
      targetCarbs: 120,
      targetLipids: 40,
      todayProtein: Math.round(todayProtein),
      todayCarbs: Math.round(todayCarbs),
      todayFat: Math.round(todayFat),
      recentMeals: latestTenDishes.slice(0, 4).map((dish, index) => ({
        name: dish.photoUrl
          ? DISH_NAME_BY_PHOTO[dish.photoUrl] ?? `Repas ${index + 1}`
          : `Repas ${index + 1}`,
        calories: Math.round(dish.calories),
        protein: Math.round(dish.proteins),
        carbs: Math.round(dish.carbs),
        fat: Math.round(dish.fats),
      })),
    };
  }

  @Query(() => [RecipeData])
  async userRecipesData(@Ctx() context: GraphQLContext): Promise<RecipeData[]> {
    let currentUserId = "";
    try {
      const currentUser = await getCurrentUser(context);
      currentUserId = currentUser.id;
    } catch (_e) {
      return [];
    }

    const userRecipes = await User_Recipe.find({
      where: { user: { id: currentUserId } },
      relations: ["recipe"],
    });

    return userRecipes
      .map((link) => link.recipe)
      .filter((recipe): recipe is NonNullable<typeof recipe> => Boolean(recipe))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((recipe) => {
        const source = recipe.status === Status.Publie ? "coach" : "favori";
        const photo =
          RECIPE_PHOTO_BY_TITLE[recipe.title] ?? "/Repas_images_temporary/quinoapoulet.jpg";
        const prepSteps = (recipe.instructions ?? "")
          .split("\n")
          .map((step) => step.trim())
          .filter(Boolean);

        const tips = recipe.chefTips ?? "";
        const [coachNoteRaw, benefitsRaw] = tips.includes(BENEFITS_SEPARATOR)
          ? tips.split(BENEFITS_SEPARATOR)
          : [tips, ""];

        const benefits = benefitsRaw
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        const fallbackBenefits = [
          `Apport proteique: ${Math.round(toNumber(recipe.proteinsPerServing))} g par portion.`,
          `Fibres: ${Math.round(toNumber(recipe.fiberPerServing))} g pour la satiete.`,
          "Recette equilibree pour soutenir la regularite alimentaire.",
        ];

        return {
          id: recipe.id,
          title: recipe.title,
          source,
          photo,
          prepTime: `${recipe.preparationTime ?? 0} min`,
          servings: recipe.servings ?? 1,
          difficulty: recipe.difficultyLevel ?? "Facile",
          calories: Math.round(toNumber(recipe.caloriesPerServing)),
          protein: Math.round(toNumber(recipe.proteinsPerServing)),
          carbs: Math.round(toNumber(recipe.carbohydratesPerServing)),
          fat: Math.round(toNumber(recipe.lipidsPerServing)),
          fiber: Math.round(toNumber(recipe.fiberPerServing)),
          description: recipe.description ?? "",
          prepSteps,
          benefits: benefits.length > 0 ? benefits : fallbackBenefits,
          coachNote: coachNoteRaw.trim(),
        };
      });
  }

  @Query(() => [EvolutionDataPoint])
  async userEvolutionData(@Ctx() context: GraphQLContext): Promise<EvolutionDataPoint[]> {
    let currentUserId = "";
    try {
      const currentUser = await getCurrentUser(context);
      currentUserId = currentUser.id;
    } catch (_e) {
      return [];
    }

    const profile = await User_profile.findOne({
      where: { user: { id: currentUserId } },
      relations: ["weight_measures"],
    });

    const weights = [...(profile?.weight_measures ?? [])]
      .map((measure) => ({
        measuredAt: safeDate(measure.measured_at) ?? new Date(),
        weight: toNumber(measure.weight),
      }))
      .sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime());

    if (weights.length === 0) {
      return [];
    }

    const dishes = await this.loadUserDishEntries(currentUserId);
    const weeklyStats = new Map<string, { calories: number[]; scores: number[] }>();
    const dailyStats = new Map<string, { calories: number[]; scores: number[] }>();

    for (const dish of dishes) {
      const key = toIsoWeekKey(dish.consumedAt);
      const bucket = weeklyStats.get(key) ?? { calories: [], scores: [] };
      bucket.calories.push(dish.calories);
      bucket.scores.push(dish.score);
      weeklyStats.set(key, bucket);

      const dayKey = toDateKey(dish.consumedAt);
      const dayBucket = dailyStats.get(dayKey) ?? { calories: [], scores: [] };
      dayBucket.calories.push(dish.calories);
      dayBucket.scores.push(dish.score);
      dailyStats.set(dayKey, dayBucket);
    }

    const globalCalories =
      dishes.length > 0
        ? Math.round(dishes.reduce((sum, dish) => sum + dish.calories, 0) / dishes.length)
        : 0;
    const globalScore =
      dishes.length > 0 ? Math.round(dishes.reduce((sum, dish) => sum + dish.score, 0) / dishes.length) : 0;

    return weights.map((weightPoint, index) => {
      const dayKey = toDateKey(weightPoint.measuredAt);
      const dayBucket = dailyStats.get(dayKey);
      const key = toIsoWeekKey(weightPoint.measuredAt);
      const bucket = weeklyStats.get(key);
      const calories =
        dayBucket && dayBucket.calories.length > 0
          ? Math.round(
              dayBucket.calories.reduce((sum, value) => sum + value, 0) / dayBucket.calories.length,
            )
          : bucket && bucket.calories.length > 0
          ? Math.round(bucket.calories.reduce((sum, value) => sum + value, 0) / bucket.calories.length)
          : globalCalories;
      const score =
        dayBucket && dayBucket.scores.length > 0
          ? Math.round(
              dayBucket.scores.reduce((sum, value) => sum + value, 0) / dayBucket.scores.length,
            )
          : bucket && bucket.scores.length > 0
          ? Math.round(bucket.scores.reduce((sum, value) => sum + value, 0) / bucket.scores.length)
          : globalScore;

      return {
        week: `S${index + 1}`,
        weight: Number(weightPoint.weight.toFixed(1)),
        calories,
        score,
      };
    });
  }
}
