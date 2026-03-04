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

function getUserScoreSummary(userMeals: Meal[]) {
  const userDishes = userMeals.flatMap((meal) => meal.dishes ?? []);
  const userScores = userDishes
    .map((dish) => dish.analysis?.mealHealthScore ?? 0)
    .filter((score) => score > 0);

  const score =
    userScores.length > 0
      ? userScores.reduce((sum, value) => sum + value, 0) / userScores.length
      : 0;

  const lastMealAt = userMeals
    .map((meal) => {
      const consumedAt = meal.consumedAt instanceof Date
        ? meal.consumedAt
        : meal.consumedAt
          ? new Date(meal.consumedAt)
          : null;
      return consumedAt && !Number.isNaN(consumedAt.getTime()) ? consumedAt : null;
    })
    .filter((date): date is Date => date !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return {
    score,
    scannedMeals: userDishes.length,
    lastMealAt: lastMealAt?.toISOString() ?? null,
  };
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

    const allMeals =
      coacheeIds.length > 0
        ? await Meal.find({
            where: { user: { id: In(coacheeIds) } },
            relations: ["user", "dishes", "dishes.analysis"],
          })
        : [];
    const allDishes = allMeals.flatMap((meal) => meal.dishes ?? []);
    const dishesWithAnalysis = allDishes.filter((dish) => dish.analysis);

    // Get dishes scanned in last 30 days and previous 30 days
    const recentDishes = dishesWithAnalysis.filter(
      (dish) => dish.uploadedAt && new Date(dish.uploadedAt) >= thirtyDaysAgo,
    );
    const previousDishes = dishesWithAnalysis.filter(
      (dish) =>
        dish.uploadedAt &&
        new Date(dish.uploadedAt) >= sixtyDaysAgo &&
        new Date(dish.uploadedAt) < thirtyDaysAgo,
    );

    // Calculate average scores
    const allScores = dishesWithAnalysis
      .map((dish) => dish.analysis?.mealHealthScore ?? 0)
      .filter((score) => score > 0);

    const recentScores = recentDishes
      .map((dish) => dish.analysis?.mealHealthScore ?? 0)
      .filter((score) => score > 0);

    const previousScores = previousDishes
      .map((dish) => dish.analysis?.mealHealthScore ?? 0)
      .filter((score) => score > 0);

    const currentAverageScore =
      allScores.length > 0
        ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
        : 0;

    const recentAverageScore =
      recentScores.length > 0
        ? recentScores.reduce((sum, score) => sum + score, 0) /
          recentScores.length
        : 0;

    const previousAverageScore =
      previousScores.length > 0
        ? previousScores.reduce((sum, score) => sum + score, 0) /
          previousScores.length
        : 0;

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
        count: dishesWithAnalysis.length,
        evolution: calculateEvolution(
          recentDishes.length,
          previousDishes.length,
        ),
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
    const mealsByUserId = new Map<string, Meal[]>();

    for (const meal of allMeals) {
      const userId = meal.user?.id;
      if (!userId) continue;
      const userMeals = mealsByUserId.get(userId);
      if (userMeals) {
        userMeals.push(meal);
      } else {
        mealsByUserId.set(userId, [meal]);
      }
    }

    const coachedUsersData: RecentUserData[] = allCoachees.map((user) => {
      const profile = profileByUserId.get(user.id) ?? null;
      const summary = getUserScoreSummary(mealsByUserId.get(user.id) ?? []);

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
      .slice(0, 3);

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
