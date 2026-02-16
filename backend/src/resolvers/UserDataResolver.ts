import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from "class-validator";
import {
  Arg,
  Args,
  ArgsType,
  Authorized,
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
import { Status } from "../entities/enums";
import { Meal } from "../entities/Meal";
import { Pathology } from "../entities/Pathology";
import { User_profile } from "../entities/User_Profile";
import { User_Recipe } from "../entities/User_Recipe";
import { Weight_Measure } from "../entities/Weight_Measure";
import type { GraphQLContext } from "../types";

const BENEFITS_SEPARATOR = "\n##BENEFITS##\n";

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
  @Field(() => String, { nullable: true })
  firstName?: string | null;

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

  @Field(() => Boolean)
  hasMoreMeals!: boolean;
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
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @Field(() => String, { nullable: true })
  gender?: string;

  @Field(() => Float, { nullable: true })
  height?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  currentWeight?: number;

  @Field(() => String, { nullable: true })
  goal?: string;

  @Field(() => [String])
  medicalTags!: string[];
}

@ArgsType()
class DashboardPaginationArgs {
  @Field(() => Int, { defaultValue: 10 })
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 10;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  offset = 0;
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toIsoWeekKey(date: Date): string {
  const tmp = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
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

function formatMealTypeLabel(mealType?: string): string | undefined {
  if (!mealType) return undefined;
  const normalized = mealType.trim().replaceAll("_", " ");
  if (!normalized) return undefined;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

type DishEntry = {
  consumedAt: Date;
  mealType?: string;
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
          const consumedAt =
            safeDate(meal.consumedAt) ??
            safeDate(dish.uploadedAt) ??
            new Date();
          const analysis = dish.analysis;
          return {
            consumedAt,
            mealType: meal.mealType,
            photoUrl: dish.photoUrl,
            calories: analysis?.calories ?? 0,
            proteins: analysis?.proteins ?? 0,
            carbs: analysis?.carbohydrates ?? 0,
            fats: analysis?.lipids ?? 0,
            score: analysis?.mealHealthScore ?? 0,
          };
        }),
      )
      .filter((dish) => dish.calories > 0);

    return dishEntries.sort(
      (a, b) => b.consumedAt.getTime() - a.consumedAt.getTime(),
    );
  }

  private async buildUserProfilePayload(
    userId: string,
    userEmail: string,
  ): Promise<UserProfileData> {
    const profile = await User_profile.findOne({
      where: { user: { id: userId } },
      relations: ["pathologies", "weight_measures"],
    });

    if (!profile) {
      return {
        firstName: userEmail.split("@")[0] ?? "Utilisateur",
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
        measuredAt: item.measured_at ?? new Date(0),
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
  async userProfileData(
    @Ctx() context: GraphQLContext,
  ): Promise<UserProfileData | null> {
    try {
      const currentUser = await getCurrentUser(context);
      return this.buildUserProfilePayload(currentUser.id, currentUser.email);
    } catch (_e) {
      return null;
    }
  }

  @Mutation(() => UserProfileData, { nullable: true })
  async updateUserProfileData(
    @Arg("data", () => UserProfileUpdateInput, { validate: true })
    data: UserProfileUpdateInput,
    @Ctx() context: GraphQLContext,
  ): Promise<UserProfileData | null> {
    const currentUser = await getCurrentUser(context).catch(() => null);
    if (!currentUser) {
      return null;
    }
    const currentUserId = currentUser.id;

    let profile = await User_profile.findOne({
      where: { user: { id: currentUserId } },
      relations: ["pathologies", "weight_measures"],
    });

    if (!profile) {
      profile = User_profile.create();
      (profile as unknown as { user: { id: string } }).user = {
        id: currentUserId,
      };
    }

    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();
    const parsedDate = data.dateOfBirth
      ? new Date(`${data.dateOfBirth}T00:00:00.000Z`)
      : undefined;

    profile.first_name =
      firstName || profile.first_name || currentUser.email.split("@")[0];
    profile.last_name = lastName || profile.last_name || "";
    profile.date_of_birth = parsedDate ?? profile.date_of_birth;
    profile.gender = data.gender?.trim() || profile.gender || "";
    profile.height = Number.isFinite(data.height)
      ? Number(data.height)
      : profile.height;
    profile.goal = data.goal?.trim() || profile.goal || "";

    const incomingTags = [
      ...new Set(data.medicalTags.map((item) => item.trim()).filter(Boolean)),
    ];

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

    if (data.currentWeight !== undefined) {
      const latestKnown = [...(profile.weight_measures ?? [])]
        .map((item) => ({
          measuredAt: item.measured_at ?? new Date(0),
          weight: toNumber(item.weight),
        }))
        .sort((a, b) => b.measuredAt.getTime() - a.measuredAt.getTime())[0];
      const nextWeight = data.currentWeight;

      if (!latestKnown || Math.abs(latestKnown.weight - nextWeight) > 0.01) {
        const weightMeasure = Weight_Measure.create({
          measured_at: new Date(),
          weight: nextWeight,
        });
        (
          weightMeasure as unknown as { user_profiles: User_profile }
        ).user_profiles = profile;
        await weightMeasure.save();
      }
    }

    return this.buildUserProfilePayload(currentUserId, currentUser.email);
  }

  @Query(() => DashboardData, { nullable: true })
  @Authorized()
  async userDashboardData(
    @Args(() => DashboardPaginationArgs, { validate: true })
    pagination: DashboardPaginationArgs,
    @Ctx() context: GraphQLContext,
  ): Promise<DashboardData | null> {
    const currentUser = await getCurrentUser(context);
    const currentUserId = currentUser.id;
    const { limit, offset } = pagination;

    const [profile, dishes] = await Promise.all([
      User_profile.findOne({ where: { user: { id: currentUserId } } }),
      this.loadUserDishEntries(currentUserId),
    ]);

    const paginatedDishes = dishes.slice(offset, offset + limit);
    const hasMoreMeals = offset + limit < dishes.length;
    const dailyTotals = new Map<string, number>();
    const latestRecordedDayKey = dishes[0]
      ? toDateKey(dishes[0].consumedAt)
      : null;
    let latestDayProtein = 0;
    let latestDayCarbs = 0;
    let latestDayFat = 0;
    let latestDayCalories = 0;

    for (const dish of dishes) {
      const dayKey = toDateKey(dish.consumedAt);
      dailyTotals.set(dayKey, (dailyTotals.get(dayKey) ?? 0) + dish.calories);
      if (latestRecordedDayKey && dayKey === latestRecordedDayKey) {
        latestDayProtein += dish.proteins;
        latestDayCarbs += dish.carbs;
        latestDayFat += dish.fats;
        latestDayCalories += dish.calories;
      }
    }

    const totalCalories = dishes.reduce((sum, dish) => sum + dish.calories, 0);
    const totalScore = dishes.reduce((sum, dish) => sum + dish.score, 0);
    const averageCalories =
      dailyTotals.size > 0 ? Math.round(totalCalories / dailyTotals.size) : 0;
    const healthScore =
      dishes.length > 0 ? Math.round(totalScore / dishes.length) : 0;
    const targetCalories = 2000;
    const targetProgress =
      targetCalories > 0
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round((latestDayCalories / targetCalories) * 100),
            ),
          )
        : 0;

    return {
      firstName: profile?.first_name?.trim() || null,
      daysOfUse: dailyTotals.size,
      healthScore,
      scannedMeals: dishes.length,
      averageCalories,
      targetCalories,
      targetProgress,
      targetProtein: 150,
      targetCarbs: 120,
      targetLipids: 40,
      todayProtein: Math.round(latestDayProtein),
      todayCarbs: Math.round(latestDayCarbs),
      todayFat: Math.round(latestDayFat),
      recentMeals: paginatedDishes.map((dish, index) => {
        const fallbackName = `Repas ${offset + index + 1}`;
        const name = formatMealTypeLabel(dish.mealType) ?? fallbackName;

        return {
          name,
          calories: Math.round(dish.calories),
          protein: Math.round(dish.proteins),
          carbs: Math.round(dish.carbs),
          fat: Math.round(dish.fats),
        };
      }),
      hasMoreMeals,
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

    const [userRecipes, dishes] = await Promise.all([
      User_Recipe.find({
        where: { user: { id: currentUserId } },
        relations: ["recipe"],
      }),
      this.loadUserDishEntries(currentUserId),
    ]);

    const dishesWithPhoto = dishes
      .map((dish) => ({
        photoUrl: dish.photoUrl?.trim(),
        mealType: dish.mealType,
      }))
      .filter((dish) => Boolean(dish.photoUrl));

    const fallbackPhoto =
      dishesWithPhoto[0]?.photoUrl ?? "/MyDietChef_image.webp";
    const mealTypePhotoMap = new Map<string, string>();

    for (const dish of dishesWithPhoto) {
      if (
        !dish.photoUrl ||
        !dish.mealType ||
        mealTypePhotoMap.has(dish.mealType)
      )
        continue;
      mealTypePhotoMap.set(dish.mealType, dish.photoUrl);
    }

    return userRecipes
      .map((link) => link.recipe)
      .filter((recipe): recipe is NonNullable<typeof recipe> => Boolean(recipe))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((recipe) => {
        const source = recipe.status === Status.Publie ? "coach" : "favori";
        const photo =
          (recipe.mealType
            ? mealTypePhotoMap.get(recipe.mealType)
            : undefined) ?? fallbackPhoto;
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
  async userEvolutionData(
    @Ctx() context: GraphQLContext,
  ): Promise<EvolutionDataPoint[]> {
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
        measuredAt: measure.measured_at ?? new Date(),
        weight: toNumber(measure.weight),
      }))
      .sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime());

    if (weights.length === 0) {
      return [];
    }

    const dishes = await this.loadUserDishEntries(currentUserId);
    const weeklyStats = new Map<
      string,
      { calories: number[]; scores: number[] }
    >();
    const dailyStats = new Map<
      string,
      { calories: number[]; scores: number[] }
    >();

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
        ? Math.round(
            dishes.reduce((sum, dish) => sum + dish.calories, 0) /
              dishes.length,
          )
        : 0;
    const globalScore =
      dishes.length > 0
        ? Math.round(
            dishes.reduce((sum, dish) => sum + dish.score, 0) / dishes.length,
          )
        : 0;

    return weights.map((weightPoint, index) => {
      const dayKey = toDateKey(weightPoint.measuredAt);
      const dayBucket = dailyStats.get(dayKey);
      const key = toIsoWeekKey(weightPoint.measuredAt);
      const bucket = weeklyStats.get(key);
      const calories =
        dayBucket && dayBucket.calories.length > 0
          ? Math.round(
              dayBucket.calories.reduce((sum, value) => sum + value, 0) /
                dayBucket.calories.length,
            )
          : bucket && bucket.calories.length > 0
            ? Math.round(
                bucket.calories.reduce((sum, value) => sum + value, 0) /
                  bucket.calories.length,
              )
            : globalCalories;
      const score =
        dayBucket && dayBucket.scores.length > 0
          ? Math.round(
              dayBucket.scores.reduce((sum, value) => sum + value, 0) /
                dayBucket.scores.length,
            )
          : bucket && bucket.scores.length > 0
            ? Math.round(
                bucket.scores.reduce((sum, value) => sum + value, 0) /
                  bucket.scores.length,
              )
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
