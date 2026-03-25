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
import { Status, UserRole } from "../entities/enums";
import { Meal } from "../entities/Meal";
import { Recipe } from "../entities/Recipe";
import { User } from "../entities/User";
import { User_profile } from "../entities/User_Profile";
import type { Weight_Measure } from "../entities/Weight_Measure";
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
  userId!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  email!: string;

  @Field(() => Float)
  score!: number;

  @Field(() => Float, { nullable: true })
  currentWeight?: number;

  @Field(() => String, { nullable: true })
  goal?: string;

  @Field(() => Int, { nullable: true })
  targetDailyCalories?: number;
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

  @Field(() => String)
  photo!: string;

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

    const coacheeWhere =
      currentUser.role === UserRole.Coach
        ? { role: UserRole.Coachee, coach: { id: currentUser.id } }
        : { role: UserRole.Coachee };

    // Get all coachees visible to the current coach/admin
    const allCoachees = await User.find({
      where: coacheeWhere,
    });
    const coacheeIds = allCoachees.map((user) => user.id);

    // Get coachees created in last 30 days and previous 30 days for evolution
    const recentCoachees = allCoachees.filter(
      (user) => user.createdAt >= thirtyDaysAgo,
    );
    const previousCoachees = allCoachees.filter(
      (user) =>
        user.createdAt >= sixtyDaysAgo && user.createdAt < thirtyDaysAgo,
    );

    // Get all recipes, then keep published ones for publication stats
    const allRecipes = await Recipe.find();
    const allPublishedRecipes = allRecipes.filter(
      (recipe) => recipe.status === Status.Publie,
    );

    // Get recipes published in last 30 days and previous 30 days
    const recentRecipes = allPublishedRecipes.filter(
      (recipe) => recipe.createdAt >= thirtyDaysAgo,
    );
    const previousRecipes = allPublishedRecipes.filter(
      (recipe) =>
        recipe.createdAt >= sixtyDaysAgo && recipe.createdAt < thirtyDaysAgo,
    );

    // Get all meals with dishes and analysis for visible coachees only
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

    const lastMealAtByUserId = new Map<string, number>();
    const scoreBucketsByUserId = new Map<string, number[]>();

    for (const meal of allMeals) {
      const userId = meal.user?.id;
      if (!userId) {
        continue;
      }

      const consumedAt =
        meal.consumedAt instanceof Date ? meal.consumedAt.getTime() : 0;
      if (consumedAt > (lastMealAtByUserId.get(userId) ?? 0)) {
        lastMealAtByUserId.set(userId, consumedAt);
      }

      const scoreBucket = scoreBucketsByUserId.get(userId) ?? [];
      for (const dish of meal.dishes ?? []) {
        const score = dish.analysis?.mealHealthScore ?? 0;
        if (score > 0) {
          scoreBucket.push(score);
        }
      }
      scoreBucketsByUserId.set(userId, scoreBucket);
    }

    // Get recent active users (last 3 by most recent meal, fallback to login then creation date)
    const recentUsersList = [...allCoachees]
      .sort((a, b) => {
        const aMealTime = lastMealAtByUserId.get(a.id) ?? 0;
        const bMealTime = lastMealAtByUserId.get(b.id) ?? 0;
        if (aMealTime !== bMealTime) {
          return bMealTime - aMealTime;
        }

        const aFallbackTime = (a.last_login_at ?? a.createdAt).getTime();
        const bFallbackTime = (b.last_login_at ?? b.createdAt).getTime();
        return bFallbackTime - aFallbackTime;
      })
      .slice(0, 3);

    const recentUsersData: RecentUserData[] = await Promise.all(
      recentUsersList.map(async (user) => {
        const profile = await User_profile.findOne({
          where: { user: { id: user.id } },
          relations: ["weight_measures"],
        });

        const userScores = scoreBucketsByUserId.get(user.id) ?? [];

        const userAverageScore =
          userScores.length > 0
            ? userScores.reduce((sum, score) => sum + score, 0) /
              userScores.length
            : 0;

        const weights = (profile?.weight_measures ?? []) as Weight_Measure[];
        const sortedWeights = weights
          .filter((w) => w.measured_at != null)
          .sort((a, b) => {
            const aTime = a.measured_at ? new Date(a.measured_at).getTime() : 0;
            const bTime = b.measured_at ? new Date(b.measured_at).getTime() : 0;
            return bTime - aTime;
          });
        const currentWeight =
          sortedWeights.length > 0
            ? Number(sortedWeights[0].weight)
            : undefined;

        return {
          userId: user.id,
          name: getUserDisplayName(user, profile),
          email: user.email,
          score: userAverageScore,
          currentWeight,
          goal: profile?.goal?.trim() || undefined,
          targetDailyCalories: 2000,
        };
      }),
    );

    // Get recent recipes (last 3 created recipes)
    const recentRecipesList = allRecipes
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3);

    const fallbackPhoto = "/MyDietChef_image.webp";

    const recentRecipesData: RecentRecipeData[] = recentRecipesList.map(
      (recipe) => ({
        id: recipe.id,
        name: recipe.title,
        photo: recipe.photoUrl?.trim() || fallbackPhoto,
        calories: recipe.caloriesPerServing ?? 0,
        proteins: recipe.proteinsPerServing ?? 0,
        carbs: recipe.carbohydratesPerServing ?? 0,
        lipids: recipe.lipidsPerServing ?? 0,
      }),
    );

    return {
      stats,
      recentUsers: recentUsersData,
      recentRecipes: recentRecipesData,
    };
  }
}
