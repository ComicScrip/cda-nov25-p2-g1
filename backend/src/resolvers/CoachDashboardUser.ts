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
import { getCurrentUser } from "../auth";
import { UserRole } from "../entities/enums";
import { User } from "../entities/User";
import type { GraphQLContext } from "../types";

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

@Resolver()
export class CoachDashoardUser {
  @Authorized(UserRole.Coach, UserRole.Admin)
  @Query(() => [CoachUser])
  async coachUsers(@Ctx() ctx: GraphQLContext): Promise<CoachUser[]> {
    const currentUser = await getCurrentUser(ctx);

    if (!currentUser) {
      throw new Error("Unauthorized");
    }

    const users = await User.find({
      where: {
        role: UserRole.Coachee,
      },
      relations: {
        profile: {
          weight_measures: true,
        },
        meals: true,
      },
    });

    const result: CoachUser[] = users.map((user) => {
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

      const meals = user.meals ?? [];
      const mealsCount = user.meals?.length ?? 0;
      const FIXED_MEAL_SCORE = 80;
      const score =
        mealsCount > 0
          ? meals.reduce((sum: number) => {
              return sum + FIXED_MEAL_SCORE;
            }, 0) / mealsCount
          : 0;
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

    return result;
  }
}
