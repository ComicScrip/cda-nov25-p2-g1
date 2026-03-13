import {
  Arg,
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
import { MealType, Status } from "../entities/enums";
import { Recipe } from "../entities/Recipe";
import { User } from "../entities/User";
import { User_Recipe } from "../entities/User_Recipe";
import type { GraphQLContext } from "../types";

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
class CoachRecipesPageData {
  @Field(() => [RecipeData])
  recipes!: RecipeData[];

  @Field(() => Int)
  totalCount!: number;

  @Field(() => Int)
  coachCount!: number;

  @Field(() => Int)
  averageCalories!: number;
}

@InputType()
class CreateRecipeInput {
  @Field(() => String)
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  photoUrl?: string;

  @Field(() => String, { nullable: true })
  instructions?: string;

  @Field(() => Int, { nullable: true })
  preparationTime?: number;

  @Field(() => Int, { nullable: true })
  cookingTime?: number;

  @Field(() => Int, { nullable: true })
  servings?: number;

  @Field(() => String, { nullable: true })
  difficultyLevel?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  mealType?: string;

  @Field(() => String, { nullable: true })
  chefTips?: string;

  @Field(() => [String], { nullable: true })
  benefits?: string[];

  @Field(() => Float, { nullable: true })
  caloriesPerServing?: number;

  @Field(() => Float, { nullable: true })
  proteinsPerServing?: number;

  @Field(() => Float, { nullable: true })
  carbohydratesPerServing?: number;

  @Field(() => Float, { nullable: true })
  lipidsPerServing?: number;

  @Field(() => Float, { nullable: true })
  fiberPerServing?: number;
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapRecipeToRecipeData(recipe: Recipe): RecipeData {
  const fallbackPhoto = "/MyDietChef_image.webp";
  const source = recipe.status === Status.Publie ? "coach" : "favori";
  const photo = recipe.photoUrl?.trim() || fallbackPhoto;
  const prepSteps = (recipe.instructions ?? "")
    .split("\n")
    .map((step) => step.trim())
    .filter(Boolean);

  const benefits = Array.isArray(recipe.benefits)
    ? recipe.benefits.map((line) => line.trim()).filter(Boolean)
    : [];

  const fallbackBenefits = [
    `Apport proteique: ${toNumber(recipe.proteinsPerServing)} g par portion.`,
    `Fibres: ${toNumber(recipe.fiberPerServing)} g pour la satiete.`,
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
    calories: toNumber(recipe.caloriesPerServing),
    protein: toNumber(recipe.proteinsPerServing),
    carbs: toNumber(recipe.carbohydratesPerServing),
    fat: toNumber(recipe.lipidsPerServing),
    fiber: toNumber(recipe.fiberPerServing),
    description: recipe.description ?? "",
    prepSteps,
    benefits: benefits.length > 0 ? benefits : fallbackBenefits,
    coachNote: recipe.chefTips?.trim() ?? "",
  } as RecipeData;
}

@Resolver()
export default class CoachRecipeResolver {
  @Query(() => [RecipeData])
  @Authorized()
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
      .sort((a, b) => {
        const aIsCoach = a.status === Status.Publie ? 1 : 0;
        const bIsCoach = b.status === Status.Publie ? 1 : 0;
        if (aIsCoach !== bIsCoach) {
          return bIsCoach - aIsCoach;
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .map(mapRecipeToRecipeData);
  }

  @Query(() => CoachRecipesPageData, { nullable: true })
  @Authorized("coach", "admin")
  async coachRecipesPageData(
    @Ctx() context: GraphQLContext,
    @Arg("limit", () => Int, { nullable: true, defaultValue: 10 })
    limitArg?: number,
    @Arg("offset", () => Int, { nullable: true, defaultValue: 0 })
    offsetArg?: number,
  ): Promise<CoachRecipesPageData | null> {
    await getCurrentUser(context);

    const limit = Math.min(50, Math.max(1, Number(limitArg) || 10));
    const offset = Math.max(0, Number(offsetArg) || 0);

    const [totalCount, coachCount, averageResult, pageRecipes] =
      await Promise.all([
        Recipe.count(),
        Recipe.count({ where: { status: Status.Publie } }),
        Recipe.createQueryBuilder("r")
          .select("AVG(r.calories_per_serving)", "avg")
          .getRawOne<{ avg: string | null }>(),
        Recipe.find({
          order: { createdAt: "DESC" },
          take: limit,
          skip: offset,
        }),
      ]);

    const averageCalories = averageResult?.avg
      ? Math.round(Number(averageResult.avg))
      : 0;

    const recipes = pageRecipes.map(mapRecipeToRecipeData);

    return {
      recipes,
      totalCount,
      coachCount,
      averageCalories,
    };
  }

  @Mutation(() => Recipe, { nullable: true })
  @Authorized("coach", "admin")
  async createRecipe(
    @Ctx() context: GraphQLContext,
    @Arg("input", () => CreateRecipeInput, { validate: false })
    input: CreateRecipeInput,
  ): Promise<Recipe | null> {
    await getCurrentUser(context);

    const status =
      input.status === "publie"
        ? Status.Publie
        : input.status === "archive"
          ? Status.Archive
          : Status.Brouillon;

    const mealType =
      input.mealType === "petit_dejeuner"
        ? MealType.PetitDejeuner
        : input.mealType === "dejeuner"
          ? MealType.Dejeuner
          : input.mealType === "collation"
            ? MealType.Collation
            : input.mealType === "diner"
              ? MealType.Diner
              : undefined;

    const recipe = Recipe.create({
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      photoUrl: input.photoUrl?.trim() || undefined,
      instructions: input.instructions?.trim() || undefined,
      preparationTime: input.preparationTime ?? undefined,
      cookingTime: input.cookingTime ?? undefined,
      servings: input.servings ?? undefined,
      difficultyLevel: input.difficultyLevel?.trim() || undefined,
      status,
      mealType,
      chefTips: input.chefTips?.trim() || undefined,
      benefits:
        Array.isArray(input.benefits) && input.benefits.length > 0
          ? input.benefits.map((b) => String(b).trim()).filter(Boolean)
          : undefined,
      caloriesPerServing: input.caloriesPerServing ?? undefined,
      proteinsPerServing: input.proteinsPerServing ?? undefined,
      carbohydratesPerServing: input.carbohydratesPerServing ?? undefined,
      lipidsPerServing: input.lipidsPerServing ?? undefined,
      fiberPerServing: input.fiberPerServing ?? undefined,
    } as Parameters<typeof Recipe.create>[0]);

    const saved = await recipe.save();
    return saved as Recipe;
  }

  @Mutation(() => Boolean)
  @Authorized("coach", "admin")
  async assignRecipeToUser(
    @Ctx() context: GraphQLContext,
    @Arg("recipeId", () => String) recipeId: string,
    @Arg("userId", () => String) userId: string,
  ): Promise<boolean> {
    await getCurrentUser(context);

    const [recipe, user] = await Promise.all([
      Recipe.findOne({ where: { id: recipeId } }),
      User.findOne({ where: { id: userId } }),
    ]);

    if (!recipe || !user) {
      return false;
    }

    const existingLink = await User_Recipe.findOne({
      where: { recipe: { id: recipe.id }, user: { id: user.id } },
    });

    if (existingLink) {
      return true;
    }

    const link = User_Recipe.create({ recipe, user });
    await link.save();

    return true;
  }
}
