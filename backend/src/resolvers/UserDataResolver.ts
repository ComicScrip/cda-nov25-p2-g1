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
import { Between, In } from "typeorm";
import { getCurrentUser } from "../auth";
import db from "../db";
import { Dish } from "../entities/Dish";
import { AnalysisStatus, MealType, Status } from "../entities/enums";
import { Meal } from "../entities/Meal";
import { Nutritional_Analysis } from "../entities/Nutritional_Analysis";
import { Pathology } from "../entities/Pathology";
import { Scanner_Coach_Submission } from "../entities/Scanner_Coach_Submission";
import { User, UserRole } from "../entities/User";
import { User_profile } from "../entities/User_Profile";
import { Weight_Measure } from "../entities/Weight_Measure";
import type { GraphQLContext } from "../types";
import {
  calculateBodyMassIndex,
  normalizeHeightToCentimeters,
} from "../utils/bodyMetrics";
import {
  buildScannerAnalysisInsights,
  buildScannerAnalysisWarningsText,
  type ScannerAnalysisPayload,
  splitStoredInsights,
} from "../utils/scannerInsights";

// Helper: mappe les labels de type de repas (venant du scanner ou d'autres sources)
// vers les valeurs de l'enum MealType, en reprenant la logique du MealAnalysisResolver.
function mapMealTypeToEnum(mealType?: string): MealType | undefined {
  if (!mealType) return undefined;

  const normalized = mealType.toLowerCase().trim();
  const cleaned = normalized
    .replace(/^(type de repas|repas|meal type):\s*/i, "")
    .replace(/\s*$/, "");

  if (
    (cleaned.includes("petit") && cleaned.includes("déjeuner")) ||
    (cleaned.includes("petit") && cleaned.includes("dejeuner")) ||
    cleaned.includes("breakfast") ||
    cleaned === "petit_dejeuner" ||
    cleaned === "petit déjeuner" ||
    cleaned === "petit-dejeuner"
  ) {
    return MealType.PetitDejeuner;
  }

  if (
    (cleaned.includes("déjeuner") ||
      cleaned.includes("dejeuner") ||
      cleaned.includes("lunch")) &&
    !cleaned.includes("petit")
  ) {
    return MealType.Dejeuner;
  }

  if (
    cleaned.includes("collation") ||
    cleaned.includes("snack") ||
    cleaned === "collation" ||
    cleaned === "goûter" ||
    cleaned === "gouter"
  ) {
    return MealType.Collation;
  }

  if (
    cleaned.includes("dîner") ||
    cleaned.includes("diner") ||
    cleaned.includes("dinner") ||
    cleaned.includes("souper") ||
    cleaned === "diner" ||
    cleaned === "dîner" ||
    cleaned === "souper"
  ) {
    return MealType.Diner;
  }

  if (
    cleaned.includes("plat") ||
    cleaned.includes("entrée") ||
    cleaned.includes("entree") ||
    cleaned.includes("dessert")
  ) {
    return undefined;
  }

  return undefined;
}

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
class UserMealIngredientData {
  @Field(() => String)
  name!: string;

  @Field(() => Float, { nullable: true })
  quantity!: number | null;
}

@ObjectType()
class UserMealData {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  consumedAt!: string;

  @Field(() => Int)
  calories!: number;

  @Field(() => Int)
  protein!: number;

  @Field(() => Int)
  carbs!: number;

  @Field(() => Int)
  fat!: number;

  @Field(() => Int)
  aiScore!: number;

  @Field(() => String)
  photo!: string;

  @Field(() => [UserMealIngredientData])
  ingredients!: UserMealIngredientData[];

  @Field(() => [String])
  aiInsights!: string[];

  @Field(() => String)
  coachComment!: string;

  @Field(() => String)
  coachName!: string;
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
class CoachUserDetail {
  @Field()
  displayName!: string;

  @Field()
  email!: string;

  @Field(() => Float, { nullable: true })
  height!: number | null;

  @Field(() => Float, { nullable: true })
  currentWeight!: number | null;

  @Field(() => String, { nullable: true })
  goal!: string | null;

  @Field(() => [String])
  pathologies!: string[];

  @Field(() => Float, { nullable: true })
  imc!: number | null;

  @Field(() => [EvolutionDataPoint])
  evolutionData!: EvolutionDataPoint[];

  @Field(() => [UserMealData])
  todayMeals!: UserMealData[];
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
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  height?: number;

  @Field(() => Float, { nullable: true })
  currentWeight?: number;

  @Field(() => String, { nullable: true })
  goal?: string;

  @Field(() => [String])
  medicalTags!: string[];
}

@ObjectType()
class CoachScannerSubmissionTestData {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  userId!: string;

  @Field(() => String, { nullable: true })
  userEmail?: string | null;

  @Field(() => String)
  createdAt!: string;

  @Field(() => String)
  payloadJson!: string;
}

@ObjectType()
class CoachUserMealTestData {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  userId!: string;

  @Field(() => String, { nullable: true })
  userEmail?: string | null;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  consumedAt!: string;

  @Field(() => Int)
  calories!: number;

  @Field(() => Int)
  protein!: number;

  @Field(() => Int)
  carbs!: number;

  @Field(() => Int)
  fat!: number;

  @Field(() => Int)
  aiScore!: number;

  @Field(() => String)
  photo!: string;

  @Field(() => [String])
  aiInsights!: string[];

  @Field(() => String)
  coachComment!: string;

  @Field(() => String)
  coachName!: string;
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

function parseCoachSuggestion(suggestion?: string): {
  coachName?: string;
  coachComment?: string;
} {
  if (!suggestion) {
    return {};
  }

  const normalized = suggestion.trim();
  if (!normalized) {
    return {};
  }

  const separatorIndex = normalized.indexOf(":");
  if (separatorIndex <= 0) {
    return { coachComment: normalized };
  }

  const coachName = normalized.slice(0, separatorIndex).trim();
  const coachComment = normalized.slice(separatorIndex + 1).trim();

  return {
    coachName: coachName || undefined,
    coachComment: coachComment || undefined,
  };
}

type ScannerSubmissionPayload = {
  draft?: { savedAt?: string | null } | null;
  analysis?: ScannerAnalysisPayload | null;
};

function buildScannerInsightsByConsumedAt(
  submissions: Scanner_Coach_Submission[],
): Map<string, string[]> {
  const scannerInsightsByConsumedAt = new Map<string, string[]>();

  for (const submission of submissions) {
    const payload = submission.payload as ScannerSubmissionPayload | undefined;
    const savedAt = payload?.draft?.savedAt;
    const consumedAt = savedAt ? safeDate(new Date(savedAt)) : null;

    if (!consumedAt) {
      continue;
    }

    const insights = buildScannerAnalysisInsights(payload?.analysis);
    if (insights.length === 0) {
      continue;
    }

    scannerInsightsByConsumedAt.set(consumedAt.toISOString(), insights);
  }

  return scannerInsightsByConsumedAt;
}

async function resolveVisibleUserIds(
  currentUser: User,
): Promise<string[] | null> {
  if (currentUser.role === UserRole.Admin) {
    return null;
  }

  if (currentUser.role === UserRole.Coach) {
    const coachedUsers = await User.find({
      where: {
        role: UserRole.Coachee,
        coach: { id: currentUser.id },
      },
    });

    return coachedUsers.map((user) => user.id);
  }

  return [currentUser.id];
}

/** Start and end of the current day (UTC) to filter meals "within the day". */
function getTodayBounds(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

/**
 * Returns the IDs corresponding to the last 4 meals of the day per user.
 * Uses a single SQL query (ROW_NUMBER) to limit memory usage.
 */
async function _getLast4MealIdsTodayByUserIds(
  userIds: string[],
): Promise<string[]> {
  if (userIds.length === 0) return [];
  const result = await db.query(
    `WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY consumed_at DESC NULLS LAST) AS rn
      FROM meal
      WHERE consumed_at::date = CURRENT_DATE AND user_id = ANY($1::uuid[])
    ) SELECT id FROM ranked WHERE rn <= 4`,
    [userIds],
  );
  const rows = Array.isArray(result)
    ? result
    : ((result as { rows?: { id: string }[] }).rows ?? []);
  return rows.map((r: { id: string }) => r.id);
}

/**
 * Returns the IDs of the last 4 meals per user over the last 3 days (for coach nutritional analysis).
 * Uses a single SQL query (ROW_NUMBER) to limit memory usage.
 */
async function getLast4MealIdsLast3DaysByUserIds(
  userIds: string[],
): Promise<string[]> {
  if (userIds.length === 0) return [];
  const result = await db.query(
    `WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY consumed_at DESC NULLS LAST) AS rn
      FROM meal
      WHERE consumed_at >= (CURRENT_DATE - INTERVAL '3 days') AND user_id = ANY($1::uuid[])
    ) SELECT id FROM ranked WHERE rn <= 4`,
    [userIds],
  );
  const rows = Array.isArray(result)
    ? result
    : ((result as { rows?: { id: string }[] }).rows ?? []);
  return rows.map((r: { id: string }) => r.id);
}

type DishEntryIngredient = {
  name: string;
  quantity: number | null;
};

type DishEntry = {
  id: string;
  consumedAt: Date;
  mealName?: string;
  mealType?: string;
  photoUrl?: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  score: number;
  aiInsights: string[];
  coachName?: string;
  coachComment?: string;
  ingredients: DishEntryIngredient[];
};

const MAX_LAST_MEALS_TODAY = 4;

@Resolver()
export default class UserDataResolver {
  /** Loads only the last 4 meals of the current day for a user (to limit memory usage). */
  private async loadUserDishEntriesForToday(
    userId: string,
    limit: number = MAX_LAST_MEALS_TODAY,
  ): Promise<DishEntry[]> {
    const { start, end } = getTodayBounds();
    const [meals, submissions] = await Promise.all([
      Meal.find({
        where: {
          user: { id: userId },
          consumedAt: Between(start, end),
        },
        relations: [
          "dishes",
          "dishes.analysis",
          "dishes.dish_ingredients",
          "dishes.dish_ingredients.ingredient",
        ],
        order: { consumedAt: "DESC" },
        take: limit,
      }),
      Scanner_Coach_Submission.find({
        where: {
          user: { id: userId },
          createdAt: Between(start, end),
        },
        order: { createdAt: "DESC" },
      }),
    ]);

    return this.mealsToDishEntries(
      meals,
      buildScannerInsightsByConsumedAt(submissions),
    );
  }

  private mealsToDishEntries(
    meals: Meal[],
    scannerInsightsByConsumedAt: Map<string, string[]> = new Map(),
  ): DishEntry[] {
    const dishEntries = meals
      .flatMap((meal) =>
        (meal.dishes ?? []).map((dish) => {
          const consumedAt =
            safeDate(meal.consumedAt) ??
            safeDate(dish.uploadedAt) ??
            new Date();
          const analysis = dish.analysis;
          const persistedInsights = splitStoredInsights(analysis?.warnings);
          const recoveredScannerInsights =
            scannerInsightsByConsumedAt.get(consumedAt.toISOString()) ?? [];
          const aiInsights =
            persistedInsights.length > 0
              ? persistedInsights
              : recoveredScannerInsights;
          const coachSuggestion = parseCoachSuggestion(analysis?.suggestions);
          const ingredients: DishEntryIngredient[] = (
            dish.dish_ingredients ?? []
          ).map((di) => ({
            name: di.ingredient?.name ?? "Inconnu",
            quantity: di.quantity != null ? Number(di.quantity) : null,
          }));

          return {
            id: dish.id,
            consumedAt,
            mealName: meal.name?.trim() || undefined,
            mealType: meal.mealType,
            photoUrl: dish.photoUrl,
            calories: analysis?.calories ?? 0,
            proteins: analysis?.proteins ?? 0,
            carbs: analysis?.carbohydrates ?? 0,
            fats: analysis?.lipids ?? 0,
            score: analysis?.mealHealthScore ?? 0,
            aiInsights,
            coachName: coachSuggestion.coachName,
            coachComment: coachSuggestion.coachComment,
            ingredients,
          };
        }),
      )
      .filter((dish) => dish.calories > 0);

    return dishEntries.sort(
      (a, b) => b.consumedAt.getTime() - a.consumedAt.getTime(),
    );
  }

  private async loadUserDishEntries(userId: string): Promise<DishEntry[]> {
    const [meals, submissions] = await Promise.all([
      Meal.find({
        where: { user: { id: userId } },
        relations: [
          "dishes",
          "dishes.analysis",
          "dishes.dish_ingredients",
          "dishes.dish_ingredients.ingredient",
        ],
        order: { consumedAt: "DESC" },
      }),
      Scanner_Coach_Submission.find({
        where: { user: { id: userId } },
        order: { createdAt: "DESC" },
      }),
    ]);

    return this.mealsToDishEntries(
      meals,
      buildScannerInsightsByConsumedAt(submissions),
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
      height: normalizeHeightToCentimeters(profile.height) ?? undefined,
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
    profile.height =
      normalizeHeightToCentimeters(data.height) ?? profile.height;
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
          weightMeasure as unknown as { user_profile: User_profile }
        ).user_profile = profile;
        await weightMeasure.save();
      }
    }

    return this.buildUserProfilePayload(currentUserId, currentUser.email);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async saveScannerCoachSubmission(
    @Arg("payloadJson", () => String)
    payloadJson: string,
    @Ctx() context: GraphQLContext,
  ): Promise<boolean> {
    const currentUser = await getCurrentUser(context);

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(payloadJson);
    } catch (_e) {
      return false;
    }

    if (!parsedPayload || typeof parsedPayload !== "object") {
      return false;
    }

    const submission = Scanner_Coach_Submission.create({
      payload: parsedPayload as Record<string, unknown>,
    });
    (submission as unknown as { user: { id: string } }).user = {
      id: currentUser.id,
    };

    await submission.save();

    // Create a meal (Meal + Dish + Nutritional_Analysis) for the coachee from this submission,
    // so that it appears in the /user_meals history and in the user statistics.
    try {
      const payload = parsedPayload as {
        draft?: { imageUrl?: string; savedAt?: string; source?: string };
        details?: { dishName?: string; mealMoment?: string };
        analysis?: {
          nutrition_estimee?: {
            calories_kcal?: { min: number; max: number };
            proteines_g?: { min: number; max: number };
            glucides_g?: { min: number; max: number };
            lipides_g?: { min: number; max: number };
            fibres_g?: { min: number; max: number };
          };
          score_sante_100?: number;
        } & ScannerAnalysisPayload;
      };

      const draft = payload.draft ?? {};
      const details = payload.details ?? {};
      const analysis = payload.analysis;
      const nut = analysis?.nutrition_estimee;

      const mid = (r: { min: number; max: number } | undefined): number =>
        r ? (r.min + r.max) / 2 : 0;

      const calories = nut ? mid(nut.calories_kcal) : 0;
      const proteins = nut ? mid(nut.proteines_g) : 0;
      const carbs = nut ? mid(nut.glucides_g) : 0;
      const lipids = nut ? mid(nut.lipides_g) : 0;
      const fibers = nut ? mid(nut.fibres_g) : 0;

      const meal = Meal.create({
        user: currentUser,
        name: (details.dishName ?? "").toString().trim() || "Plat scanné",
        mealType: mapMealTypeToEnum(details.mealMoment as string | undefined),
        consumedAt: draft.savedAt ? new Date(draft.savedAt) : new Date(),
      });
      await meal.save();

      const photoUrl =
        typeof draft.imageUrl === "string" && draft.imageUrl.trim().length > 0
          ? draft.imageUrl
          : undefined;

      const dish = Dish.create({
        meal,
        dishType: undefined,
        analysisStatus: AnalysisStatus.Complete,
        uploadedAt: new Date(),
        photoUrl,
      });
      await dish.save();

      const nutritionalAnalysis = Nutritional_Analysis.create({
        calories,
        proteins,
        carbohydrates: carbs,
        lipids,
        fiber: fibers,
        mealHealthScore: analysis?.score_sante_100 ?? undefined,
        warnings: buildScannerAnalysisWarningsText(analysis),
        suggestions:
          "Analyse IA assistée sauvegardée depuis la page de scan des repas.",
        status: Status.Brouillon,
        isModified: false,
        analyzedAt: new Date(),
      });
      await nutritionalAnalysis.save();

      dish.analysis = nutritionalAnalysis;
      await dish.save();
    } catch (_e) {
      // Do not fail the mutation if meal creation fails:
      // the coach submission remains available and can still be processed by the coach.
    }

    return true;
  }

  @Authorized()
  @Query(() => [CoachScannerSubmissionTestData])
  async coachScannerSubmissionsTestData(
    @Ctx() context: GraphQLContext,
    @Arg("userId", () => String, { nullable: true }) userId?: string,
    @Arg("limit", () => Int, { nullable: true }) limit?: number,
  ): Promise<CoachScannerSubmissionTestData[]> {
    const currentUser = await getCurrentUser(context);
    const visibleUserIds = await resolveVisibleUserIds(currentUser);
    const clampedLimit =
      typeof limit === "number" && Number.isFinite(limit)
        ? Math.min(Math.max(limit, 1), 200)
        : 120;

    if (visibleUserIds && visibleUserIds.length === 0) {
      return [];
    }

    if (userId && visibleUserIds && !visibleUserIds.includes(userId)) {
      return [];
    }

    const submissions = await Scanner_Coach_Submission.find({
      where: userId
        ? { user: { id: userId } }
        : visibleUserIds
          ? { user: { id: In(visibleUserIds) } }
          : undefined,
      relations: ["user"],
      order: { createdAt: "DESC" },
      take: clampedLimit,
    });

    return submissions.map((submission) => ({
      id: submission.id,
      userId: submission.user?.id ?? currentUser.id,
      userEmail: submission.user?.email ?? null,
      createdAt:
        submission.createdAt?.toISOString?.() ?? new Date().toISOString(),
      payloadJson: JSON.stringify(submission.payload ?? {}),
    }));
  }

  @Authorized()
  @Query(() => [CoachUserMealTestData])
  async coachUserMealsTestData(
    @Ctx() context: GraphQLContext,
    @Arg("userId", () => String, { nullable: true }) userId?: string,
    @Arg("limit", () => Int, { nullable: true }) _limit?: number,
  ): Promise<CoachUserMealTestData[]> {
    const currentUser = await getCurrentUser(context);
    const visibleUserIds = await resolveVisibleUserIds(currentUser);

    if (visibleUserIds && visibleUserIds.length === 0) {
      return [];
    }

    if (userId && visibleUserIds && !visibleUserIds.includes(userId)) {
      return [];
    }

    const userIdsToLoad = userId ? [userId] : (visibleUserIds ?? []);
    const mealIds = await getLast4MealIdsLast3DaysByUserIds(userIdsToLoad);
    if (mealIds.length === 0) return [];

    const meals = await Meal.find({
      where: { id: In(mealIds) },
      relations: ["user", "dishes", "dishes.analysis"],
      order: { consumedAt: "DESC" },
    });

    const fallbackPhoto = "/MyDietChef_image.webp";

    return meals
      .flatMap((meal) =>
        (meal.dishes ?? []).map((dish, index) => {
          const analysis = dish.analysis;
          const consumedAt =
            safeDate(meal.consumedAt) ??
            safeDate(dish.uploadedAt) ??
            new Date();
          const coachSuggestion = parseCoachSuggestion(analysis?.suggestions);
          const aiInsights = splitStoredInsights(analysis?.warnings);
          const fallbackName = `Repas ${index + 1}`;
          const name =
            meal.name?.trim() ||
            formatMealTypeLabel(meal.mealType) ||
            fallbackName;

          return {
            id: dish.id,
            userId: meal.user?.id ?? currentUser.id,
            userEmail: meal.user?.email ?? null,
            name,
            consumedAt: consumedAt.toISOString(),
            calories: Math.round(analysis?.calories ?? 0),
            protein: Math.round(analysis?.proteins ?? 0),
            carbs: Math.round(analysis?.carbohydrates ?? 0),
            fat: Math.round(analysis?.lipids ?? 0),
            aiScore: Math.round(analysis?.mealHealthScore ?? 0),
            photo: dish.photoUrl?.trim() || fallbackPhoto,
            aiInsights:
              aiInsights.length > 0
                ? aiInsights
                : ["Aucune indication IA disponible pour ce repas."],
            coachComment:
              coachSuggestion.coachComment?.trim() ||
              "Continue sur cette dynamique pour garder des repas equilibres.",
            coachName: coachSuggestion.coachName?.trim() || "Coach",
          };
        }),
      )
      .sort(
        (a, b) =>
          new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime(),
      );
  }

  @Query(() => DashboardData, { nullable: true })
  @Authorized()
  async userDashboardData(
    @Args(() => DashboardPaginationArgs, { validate: true })
    pagination: DashboardPaginationArgs,
    @Arg("userId", () => String, { nullable: true }) userId: string | undefined,
    @Ctx() context: GraphQLContext,
  ): Promise<DashboardData | null> {
    const currentUser = await getCurrentUser(context);
    const { limit, offset } = pagination;
    const requestedUserId = userId?.trim() || currentUser.id;
    const visibleUserIds = await resolveVisibleUserIds(currentUser);

    if (visibleUserIds && !visibleUserIds.includes(requestedUserId)) {
      return null;
    }

    const [profile, dishes] = await Promise.all([
      User_profile.findOne({ where: { user: { id: requestedUserId } } }),
      this.loadUserDishEntries(requestedUserId),
    ]);

    const paginatedDishes = dishes.slice(offset, offset + limit);
    const hasMoreMeals = offset + limit < dishes.length;
    const dailyTotals = new Map<string, number>();
    const todayKey = toDateKey(new Date());
    let todayCalories = 0;
    let todayProtein = 0;
    let todayCarbs = 0;
    let todayFat = 0;

    for (const dish of dishes) {
      const dayKey = toDateKey(dish.consumedAt);
      dailyTotals.set(dayKey, (dailyTotals.get(dayKey) ?? 0) + dish.calories);
      if (dayKey === todayKey) {
        todayCalories += dish.calories;
        todayProtein += dish.proteins;
        todayCarbs += dish.carbs;
        todayFat += dish.fats;
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
        ? Math.round((todayCalories / targetCalories) * 100)
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
      todayProtein: Math.round(todayProtein),
      todayCarbs: Math.round(todayCarbs),
      todayFat: Math.round(todayFat),
      recentMeals: paginatedDishes.map((dish, index) => {
        const fallbackName = `Repas ${offset + index + 1}`;
        const name =
          dish.mealName?.trim() ||
          formatMealTypeLabel(dish.mealType) ||
          fallbackName;

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

  @Query(() => [UserMealData])
  @Authorized()
  async userMealsData(@Ctx() context: GraphQLContext): Promise<UserMealData[]> {
    const currentUser = await getCurrentUser(context);
    const dishes = await this.loadUserDishEntries(currentUser.id);
    const fallbackPhoto = "/MyDietChef_image.webp";
    const mealHistory = dishes.slice(0, 10);

    return mealHistory.map((dish, index) => {
      const fallbackName = `Repas ${index + 1}`;
      const name =
        dish.mealName?.trim() ||
        formatMealTypeLabel(dish.mealType) ||
        fallbackName;
      const aiInsights =
        dish.aiInsights.length > 0
          ? dish.aiInsights
          : ["Aucune indication IA disponible pour ce repas."];

      return {
        id: dish.id,
        name,
        consumedAt: dish.consumedAt.toISOString(),
        calories: Math.round(dish.calories),
        protein: Math.round(dish.proteins),
        carbs: Math.round(dish.carbs),
        fat: Math.round(dish.fats),
        aiScore: Math.round(dish.score),
        photo: dish.photoUrl?.trim() || fallbackPhoto,
        ingredients: dish.ingredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity,
        })),
        aiInsights,
        coachComment:
          dish.coachComment?.trim() ||
          "Continue sur cette dynamique pour garder des repas equilibres.",
        coachName: dish.coachName?.trim() || "Coach",
      };
    });
  }

  @Query(() => UserMealData, { nullable: true })
  @Authorized()
  async userMeal(
    @Ctx() context: GraphQLContext,
    @Arg("id", () => String) id: string,
  ): Promise<UserMealData | null> {
    const currentUser = await getCurrentUser(context);
    const dishes = await this.loadUserDishEntries(currentUser.id);
    const dish = dishes.find((d) => d.id === id);
    if (!dish) return null;

    const fallbackPhoto = "/MyDietChef_image.webp";
    const name =
      dish.mealName?.trim() || formatMealTypeLabel(dish.mealType) || "Repas";
    const aiInsights =
      dish.aiInsights.length > 0
        ? dish.aiInsights
        : ["Aucune indication IA disponible pour ce repas."];

    return {
      id: dish.id,
      name,
      consumedAt: dish.consumedAt.toISOString(),
      calories: Math.round(dish.calories),
      protein: Math.round(dish.proteins),
      carbs: Math.round(dish.carbs),
      fat: Math.round(dish.fats),
      aiScore: Math.round(dish.score),
      photo: dish.photoUrl?.trim() || fallbackPhoto,
      ingredients: dish.ingredients.map((ing) => ({
        name: ing.name,
        quantity: ing.quantity,
      })),
      aiInsights,
      coachComment:
        dish.coachComment?.trim() ||
        "Continue sur cette dynamique pour garder des repas equilibres.",
      coachName: dish.coachName?.trim() || "Coach",
    };
  }

  private async buildEvolutionDataForUser(
    userId: string,
  ): Promise<EvolutionDataPoint[]> {
    const profile = await User_profile.findOne({
      where: { user: { id: userId } },
      relations: ["weight_measures"],
    });

    const weights = [...(profile?.weight_measures ?? [])]
      .filter((measure): measure is Weight_Measure & { measured_at: Date } =>
        Boolean(measure.measured_at),
      )
      .sort((a, b) => a.measured_at.getTime() - b.measured_at.getTime());

    if (weights.length === 0) return [];

    const dishes = await this.loadUserDishEntries(userId);
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
      const dayKey = toDateKey(weightPoint.measured_at);
      const dayBucket = dailyStats.get(dayKey);
      const key = toIsoWeekKey(weightPoint.measured_at);
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

  @Authorized()
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
    return this.buildEvolutionDataForUser(currentUserId);
  }

  @Authorized(UserRole.Coach, UserRole.Admin)
  @Query(() => CoachUserDetail, { nullable: true })
  async coachUserDetail(
    @Ctx() context: GraphQLContext,
    @Arg("userId") userId: string,
  ): Promise<CoachUserDetail | null> {
    await getCurrentUser(context);

    const user = await User.findOne({
      where: { id: userId, role: UserRole.Coachee },
      relations: ["profile", "profile.pathologies", "profile.weight_measures"],
    });
    if (!user?.profile) return null;

    const profile = user.profile;
    const weights = [...(profile.weight_measures ?? [])]
      .filter((measure): measure is Weight_Measure & { measured_at: Date } =>
        Boolean(measure.measured_at),
      )
      .sort((a, b) => a.measured_at.getTime() - b.measured_at.getTime());

    const currentWeight =
      weights.length > 0 ? weights[weights.length - 1].weight : null;
    const height = normalizeHeightToCentimeters(profile.height);
    const imc = calculateBodyMassIndex(currentWeight, profile.height);

    const evolutionData = await this.buildEvolutionDataForUser(userId);

    const dishes = await this.loadUserDishEntriesForToday(
      userId,
      MAX_LAST_MEALS_TODAY,
    );
    const fallbackPhoto = "/MyDietChef_image.webp";
    const todayMeals = dishes.map((dish, index) => {
      const fallbackName = `Repas ${index + 1}`;
      const name =
        dish.mealName?.trim() ||
        formatMealTypeLabel(dish.mealType) ||
        fallbackName;
      const aiInsights =
        dish.aiInsights.length > 0
          ? dish.aiInsights
          : ["Aucune indication IA disponible pour ce repas."];
      return {
        id: dish.id,
        name,
        consumedAt: dish.consumedAt.toISOString(),
        calories: Math.round(dish.calories),
        protein: Math.round(dish.proteins),
        carbs: Math.round(dish.carbs),
        fat: Math.round(dish.fats),
        aiScore: Math.round(dish.score),
        photo: dish.photoUrl?.trim() || fallbackPhoto,
        ingredients: dish.ingredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity,
        })),
        aiInsights,
        coachComment:
          dish.coachComment?.trim() ||
          "Continue sur cette dynamique pour garder des repas équilibrés.",
        coachName: dish.coachName?.trim() || "Coach",
      };
    });

    const displayName =
      [profile.first_name ?? "", profile.last_name ?? ""]
        .filter(Boolean)
        .join(" ")
        .trim() || user.email;

    return {
      displayName,
      email: user.email,
      height,
      currentWeight,
      goal: profile.goal ?? null,
      pathologies: (profile.pathologies ?? []).map((p) => p.name),
      imc,
      evolutionData,
      todayMeals,
    };
  }
}
