import {
  Authorized,
  Ctx,
  Field,
  Float,
  Int,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { In } from "typeorm";
import { getCurrentUser } from "../auth";
import { Dish } from "../entities/Dish";
import { Status } from "../entities/enums";
import { Meal } from "../entities/Meal";
import { Recipe } from "../entities/Recipe";
import { User, UserRole } from "../entities/User";
import { User_profile } from "../entities/User_Profile";
import type { GraphQLContext } from "../types";

/**
 * Statistics data with count and evolution percentage
 */
@ObjectType()
class StatData {
  @Field(() => Int)
  count!: number;

  @Field(() => String)
  evolution!: string;
}

/**
 * Dashboard statistics containing all key metrics
 */
@ObjectType()
class CoachDashboardStats {
  @Field(() => StatData)
  users!: StatData;

  @Field(() => StatData)
  publishedRecipes!: StatData;

  @Field(() => StatData)
  scannedMeals!: StatData;

  @Field(() => StatData)
  averageScore!: StatData;
}

/**
 * Recent user data for dashboard display
 */
@ObjectType()
class RecentUserData {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  email!: string;

  @Field(() => Float)
  score!: number;

  @Field(() => Int)
  scannedMeals!: number;

  @Field(() => String, { nullable: true })
  lastMealAt?: string | null;
}

/**
 * Recent recipe data for dashboard display
 */
@ObjectType()
class RecentRecipeData {
  @Field(() => String)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => Float)
  calories!: number;

  @Field(() => Float)
  proteins!: number;

  @Field(() => Float)
  carbs!: number;

  @Field(() => Float)
  lipids!: number;
}

/**
 * Complete coach dashboard data
 */
@ObjectType()
class CoachDashboardData {
  @Field(() => CoachDashboardStats)
  stats!: CoachDashboardStats;

  @Field(() => [RecentUserData])
  recentUsers!: RecentUserData[];

  @Field(() => [RecentUserData])
  coachedUsers!: RecentUserData[];

  @Field(() => [RecentRecipeData])
  recentRecipes!: RecentRecipeData[];
}

/**
 * Helper function to calculate evolution percentage between two values
 */
function calculateEvolution(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? "+100%" : "0%";
  }
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${Math.round(change)}%`;
}

/**
 * Helper function to get user display name from profile or email
 */
function getUserDisplayName(user: User, profile: User_profile | null): string {
  if (profile?.first_name && profile?.last_name) {
    return `${profile.first_name} ${profile.last_name}`.trim();
  }
  if (profile?.first_name) {
    return profile.first_name;
  }
  // Fallback to email username
  const emailUsername = user.email.split("@")[0];
  return emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
}

function parseNumericValue(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function parseIsoDateValue(value: unknown): string | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

/**
 * Resolver for coach dashboard data
 * Provides statistics and recent activity for coaches
 */
@Resolver()
export default class CoachDashboardResolver {
  /**
   * Get coach dashboard data including statistics and recent activity
   * Only accessible by users with Coach or Admin role
   */
  @Query(() => CoachDashboardData, { nullable: true })
  @Authorized("coach", "admin")
  async coachDashboardData(
    @Ctx() context: GraphQLContext,
  ): Promise<CoachDashboardData | null> {
    const currentUser = await getCurrentUser(context);

    // Calculate date ranges for evolution comparison
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const coacheeQuery = User.createQueryBuilder("user").where(
      "user.role = :role",
      { role: UserRole.Coachee },
    );

    if (currentUser.role === UserRole.Coach) {
      coacheeQuery.andWhere("user.coach_id = :coachId", {
        coachId: currentUser.id,
      });
    }

    const allCoachees = await coacheeQuery.getMany();
    const coacheeIds = allCoachees.map((user) => user.id);

    // Get coachees created in last 30 days and previous 30 days for evolution
    const recentCoachees = allCoachees.filter(
      (user) => user.createdAt >= thirtyDaysAgo,
    );
    const previousCoachees = allCoachees.filter(
      (user) =>
        user.createdAt >= sixtyDaysAgo && user.createdAt < thirtyDaysAgo,
    );

    // Get all published recipes
    const allPublishedRecipes = await Recipe.find({
      where: { status: Status.Publie },
    });

    // Get recipes published in last 30 days and previous 30 days
    const recentRecipes = allPublishedRecipes.filter(
      (recipe) => recipe.createdAt >= thirtyDaysAgo,
    );
    const previousRecipes = allPublishedRecipes.filter(
      (recipe) =>
        recipe.createdAt >= sixtyDaysAgo && recipe.createdAt < thirtyDaysAgo,
    );

    const dishStatsRaw =
      coacheeIds.length > 0
        ? await Dish.createQueryBuilder("dish")
            .innerJoin("dish.meal", "meal")
            .innerJoin("meal.user", "user")
            .leftJoin("dish.analysis", "analysis")
            .select(
              "COUNT(CASE WHEN analysis.id IS NOT NULL THEN 1 END)",
              "totalAnalyzedDishes",
            )
            .addSelect(
              "COUNT(CASE WHEN analysis.id IS NOT NULL AND dish.uploaded_at >= :thirtyDaysAgo THEN 1 END)",
              "recentAnalyzedDishes",
            )
            .addSelect(
              "COUNT(CASE WHEN analysis.id IS NOT NULL AND dish.uploaded_at >= :sixtyDaysAgo AND dish.uploaded_at < :thirtyDaysAgo THEN 1 END)",
              "previousAnalyzedDishes",
            )
            .addSelect(
              "AVG(CASE WHEN analysis.meal_health_score > 0 THEN analysis.meal_health_score END)",
              "averageScore",
            )
            .addSelect(
              "AVG(CASE WHEN analysis.meal_health_score > 0 AND dish.uploaded_at >= :thirtyDaysAgo THEN analysis.meal_health_score END)",
              "recentAverageScore",
            )
            .addSelect(
              "AVG(CASE WHEN analysis.meal_health_score > 0 AND dish.uploaded_at >= :sixtyDaysAgo AND dish.uploaded_at < :thirtyDaysAgo THEN analysis.meal_health_score END)",
              "previousAverageScore",
            )
            .where("user.id IN (:...coacheeIds)", { coacheeIds })
            .setParameters({ thirtyDaysAgo, sixtyDaysAgo })
            .getRawOne()
        : null;

    const userMealSummaryRows =
      coacheeIds.length > 0
        ? await Meal.createQueryBuilder("meal")
            .innerJoin("meal.user", "user")
            .leftJoin("meal.dishes", "dish")
            .leftJoin("dish.analysis", "analysis")
            .select("user.id", "userId")
            .addSelect("COUNT(dish.id)", "scannedMeals")
            .addSelect("MAX(meal.consumed_at)", "lastMealAt")
            .addSelect(
              "AVG(CASE WHEN analysis.meal_health_score > 0 THEN analysis.meal_health_score END)",
              "averageScore",
            )
            .where("user.id IN (:...coacheeIds)", { coacheeIds })
            .groupBy("user.id")
            .getRawMany()
        : [];

    const dishesWithAnalysisCount = Math.round(
      parseNumericValue(dishStatsRaw?.totalAnalyzedDishes),
    );
    const recentDishesCount = Math.round(
      parseNumericValue(dishStatsRaw?.recentAnalyzedDishes),
    );
    const previousDishesCount = Math.round(
      parseNumericValue(dishStatsRaw?.previousAnalyzedDishes),
    );
    const currentAverageScore = parseNumericValue(dishStatsRaw?.averageScore);
    const recentAverageScore = parseNumericValue(
      dishStatsRaw?.recentAverageScore,
    );
    const previousAverageScore = parseNumericValue(
      dishStatsRaw?.previousAverageScore,
    );

    // Build stats object
    const stats: CoachDashboardStats = {
      users: {
        count: allCoachees.length,
        evolution: calculateEvolution(
          recentCoachees.length,
          previousCoachees.length,
        ),
      },
      publishedRecipes: {
        count: allPublishedRecipes.length,
        evolution: calculateEvolution(
          recentRecipes.length,
          previousRecipes.length,
        ),
      },
      scannedMeals: {
        count: dishesWithAnalysisCount,
        evolution: calculateEvolution(recentDishesCount, previousDishesCount),
      },
      averageScore: {
        count: Math.round(currentAverageScore),
        evolution: calculateEvolution(recentAverageScore, previousAverageScore),
      },
    };

    // Get recent users (last 3) with their average scores
    const profiles =
      coacheeIds.length > 0
        ? await User_profile.find({
            where: { user: { id: In(coacheeIds) } },
            relations: ["user"],
          })
        : [];

    const profileByUserId = new Map(
      profiles.map((profile) => [profile.user.id, profile]),
    );
    const summaryByUserId = new Map(
      userMealSummaryRows.map((row) => [
        String(row.userId),
        {
          score: parseNumericValue(row.averageScore),
          scannedMeals: Math.round(parseNumericValue(row.scannedMeals)),
          lastMealAt: parseIsoDateValue(row.lastMealAt),
        },
      ]),
    );

    const coachedUsersData: RecentUserData[] = allCoachees.map((user) => {
      const profile = profileByUserId.get(user.id) ?? null;
      const summary = summaryByUserId.get(user.id) ?? {
        score: 0,
        scannedMeals: 0,
        lastMealAt: null,
      };

      return {
        id: user.id,
        name: getUserDisplayName(user, profile),
        email: user.email,
        score: summary.score,
        scannedMeals: summary.scannedMeals,
        lastMealAt: summary.lastMealAt,
      };
    });

    const recentUsersData = coachedUsersData
      .slice()
      .sort((a, b) => {
        const aTime = a.lastMealAt ? new Date(a.lastMealAt).getTime() : 0;
        const bTime = b.lastMealAt ? new Date(b.lastMealAt).getTime() : 0;
        if (aTime !== bTime) {
          return bTime - aTime;
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, 10);

    // Get recent recipes (last 3 published recipes)
    const recentRecipesList = allPublishedRecipes
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3);

    const recentRecipesData: RecentRecipeData[] = recentRecipesList.map(
      (recipe) => ({
        id: recipe.id,
        name: recipe.title,
        calories: recipe.caloriesPerServing ?? 0,
        proteins: recipe.proteinsPerServing ?? 0,
        carbs: recipe.carbohydratesPerServing ?? 0,
        lipids: recipe.lipidsPerServing ?? 0,
      }),
    );

    return {
      stats,
      recentUsers: recentUsersData,
      coachedUsers: coachedUsersData
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name)),
      recentRecipes: recentRecipesData,
    };
  }
}
