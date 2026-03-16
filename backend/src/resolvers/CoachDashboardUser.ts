import {
  Arg,
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
import { UserRole } from "../entities/enums";
import { Meal } from "../entities/Meal";
import { User } from "../entities/User";
import type { GraphQLContext } from "../types";

const DEFAULT_PAGE_SIZE = 15;

@ObjectType()
export class CoachUsersPage {
  @Field(() => [CoachUser])
  users!: CoachUser[];

  @Field(() => Int)
  totalCount!: number;
}

@ObjectType()
export class CoachUser {
  @Field(() => String)
  userId!: string;

  @Field()
  email!: string;

  @Field()
  displayName!: string;

  @Field(() => String)
  role!: string;

  @Field(() => Float, { nullable: true })
  initialWeight!: number | null;

  @Field(() => Float, { nullable: true })
  currentWeight!: number | null;

  @Field(() => String, { nullable: true })
  goalLabel!: string | null;

  @Field(() => Float, { nullable: true })
  caloricGoal!: number | null;

  @Field(() => Int)
  mealsCount!: number;

  @Field(() => Int, { nullable: true })
  scoreRounded!: number | null;

  @Field()
  createdAt!: string;
}

/** Récupère le nombre de repas par user_id (une seule requête, évite de charger tous les repas en mémoire). */
async function getMealsCountByUserId(
  userIds: string[],
): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();
  const rows = await Meal.createQueryBuilder("m")
    .select("m.user_id", "userId")
    .addSelect("COUNT(*)", "count")
    .where("m.user_id IN (:...ids)", { ids: userIds })
    .groupBy("m.user_id")
    .getRawMany<{ userId: string; count: string }>();
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.userId, Number(r.count));
  return map;
}

function mapUsersToCoachUsers(
  users: User[],
  mealsCountByUserId: Map<string, number>,
): CoachUser[] {
  return users.map((user) => {
    const profile = user.profile;

    let initialWeight: number | null = null;
    let currentWeight: number | null = null;

    if (profile?.weight_measures?.length) {
      const sorted = [...profile.weight_measures].sort(
        (a, b) =>
          new Date(a.measured_at ?? 0).getTime() -
          new Date(b.measured_at ?? 0).getTime(),
      );

      initialWeight = sorted[0]?.weight ?? null;
      currentWeight = sorted[sorted.length - 1]?.weight ?? null;
    }

    const mealsCount = mealsCountByUserId.get(user.id) ?? 0;
    const FIXED_MEAL_SCORE = 80;
    const score = mealsCount > 0 ? FIXED_MEAL_SCORE : 0;
    const FIXED_CALORIC_GOAL = 2000;
    return {
      userId: user.id,
      email: user.email,
      displayName: `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`,
      role: user.role,
      initialWeight,
      currentWeight,
      goalLabel: profile?.goal ?? null,
      caloricGoal: FIXED_CALORIC_GOAL,
      mealsCount,
      scoreRounded: Math.round(score),
      createdAt: user.createdAt.toISOString(),
    };
  });
}

@Resolver()
export class CoachDashoardUser {
  @Authorized(UserRole.Coach, UserRole.Admin)
  @Query(() => [CoachUser])
  async coachUsers(@Ctx() ctx: GraphQLContext): Promise<CoachUser[]> {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) throw new Error("Unauthorized");

    const where =
      currentUser.role === UserRole.Coach
        ? { role: UserRole.Coachee, coach: { id: currentUser.id } }
        : { role: UserRole.Coachee };

    const users = await User.find({
      where,
      relations: {
        profile: { weight_measures: true },
        ...(currentUser.role === UserRole.Coach ? { coach: true } : {}),
      },
    });
    const mealsCountByUserId = await getMealsCountByUserId(
      users.map((u) => u.id),
    );
    return mapUsersToCoachUsers(users, mealsCountByUserId);
  }

  /** Coachees who have most recently scanned a meal (for progressive display). */
  @Authorized(UserRole.Coach, UserRole.Admin)
  @Query(() => [CoachUser])
  async coachUsersRecentScanners(
    @Ctx() ctx: GraphQLContext,
    @Arg("limit", () => Int, { nullable: true, defaultValue: 10 })
    limit: number = 10,
  ): Promise<CoachUser[]> {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) throw new Error("Unauthorized");

    const qb = Meal.createQueryBuilder("meal")
      .innerJoin("meal.user", "u")
      .where("u.role = :role", { role: UserRole.Coachee });
    if (currentUser.role === UserRole.Coach) {
      qb.andWhere("u.coach_id = :coachId", { coachId: currentUser.id });
    }
    const raw = await qb
      .select("u.id", "id")
      .addSelect("MAX(meal.consumed_at)", "last")
      .groupBy("u.id")
      .orderBy("last", "DESC")
      .limit(limit)
      .getRawMany<{ id: string }>();

    const ids = raw.map((r) => r.id);
    if (ids.length === 0) return [];

    const users = await User.find({
      where: { id: In(ids) },
      relations: {
        profile: { weight_measures: true },
        ...(currentUser.role === UserRole.Coach ? { coach: true } : {}),
      },
    });
    users.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    const mealsCountByUserId = await getMealsCountByUserId(
      users.map((u) => u.id),
    );
    return mapUsersToCoachUsers(users, mealsCountByUserId);
  }

  @Authorized(UserRole.Coach, UserRole.Admin)
  @Query(() => CoachUsersPage)
  async coachUsersPage(
    @Ctx() ctx: GraphQLContext,
    @Arg("limit", () => Int, {
      nullable: true,
      defaultValue: DEFAULT_PAGE_SIZE,
    })
    limit: number = DEFAULT_PAGE_SIZE,
    @Arg("offset", () => Int, { nullable: true, defaultValue: 0 })
    offset: number = 0,
  ): Promise<CoachUsersPage> {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) throw new Error("Unauthorized");

    const where =
      currentUser.role === UserRole.Coach
        ? { role: UserRole.Coachee, coach: { id: currentUser.id } }
        : { role: UserRole.Coachee };

    const [users, totalCount] = await User.findAndCount({
      where,
      relations: {
        profile: { weight_measures: true },
        ...(currentUser.role === UserRole.Coach ? { coach: true } : {}),
      },
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });
    const mealsCountByUserId = await getMealsCountByUserId(
      users.map((u) => u.id),
    );
    return {
      users: mapUsersToCoachUsers(users, mealsCountByUserId),
      totalCount,
    };
  }
}
