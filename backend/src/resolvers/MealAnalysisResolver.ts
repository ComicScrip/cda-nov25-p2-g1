import {
  Arg,
  Authorized,
  Ctx,
  Field,
  Float,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import {
  analyzeMealImageWithFallback,
  recalculateNutritionWithFallback,
} from "../ai/services/mealVisionService";
import { getCurrentUser } from "../auth";
import { Dish } from "../entities/Dish";
import { Dish_Ingredient } from "../entities/Dish_Ingredient";
import { AnalysisStatus, MealType, Status, UserRole } from "../entities/enums";
import { Ingredient } from "../entities/Ingredient";
import { Meal } from "../entities/Meal";
import { Nutritional_Analysis } from "../entities/Nutritional_Analysis";
import { Scanner_Coach_Submission } from "../entities/Scanner_Coach_Submission";
import type { User } from "../entities/User";
import type { GraphQLContext } from "../types";

// Maps French meal type strings from Gemini to MealType enum values
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

// Input type for ingredient with quantity and nutritional values
@InputType()
class IngredientQuantityInput {
  @Field()
  name!: string;

  @Field(() => Float, { nullable: true })
  estimatedQuantityGrams?: number;

  @Field(() => Float, { nullable: true })
  calories?: number;

  @Field(() => Float, { nullable: true })
  protein?: number;

  @Field(() => Float, { nullable: true })
  carbs?: number;

  @Field(() => Float, { nullable: true })
  fat?: number;
}

// Input type for aggregated nutritional values
@InputType()
class NutritionalTotalsInput {
  @Field(() => Float, { nullable: true })
  calories?: number;

  @Field(() => Float, { nullable: true })
  protein?: number;

  @Field(() => Float, { nullable: true })
  carbs?: number;

  @Field(() => Float, { nullable: true })
  fat?: number;

  @Field(() => Float, { nullable: true })
  fiber?: number;

  @Field(() => Float, { nullable: true })
  sugar?: number;

  @Field(() => Float, { nullable: true })
  salt?: number;
}

// Input type for saving meal analysis (accepts analysis data for validation)
@InputType()
class SaveMealAnalysisInput {
  @Field()
  imageBase64!: string;

  @Field({ nullable: true })
  mimeType?: string;

  @Field()
  dishName!: string;

  @Field(() => [IngredientQuantityInput])
  ingredients!: IngredientQuantityInput[];

  @Field(() => NutritionalTotalsInput)
  totalNutrition!: NutritionalTotalsInput;

  @Field()
  analysisSummary!: string;

  @Field(() => Float)
  healthScore!: number;

  @Field(() => [String])
  warnings!: string[];

  @Field({ nullable: true })
  mealType?: string;
}

// Input type for updating ingredient quantities
@InputType()
class UpdateIngredientQuantitiesInput {
  @Field()
  dishId!: string;

  @Field(() => [IngredientQuantityUpdateInput])
  ingredients!: IngredientQuantityUpdateInput[];
}

// Input type for updating a single ingredient quantity by name
@InputType()
class IngredientQuantityUpdateInput {
  @Field()
  ingredientName!: string;

  @Field(() => Float)
  quantityGrams!: number;
}

// Input type for updating final calories in analysis
@InputType()
class UpdateAnalysisCaloriesInput {
  @Field()
  analysisId!: string;

  @Field(() => Float)
  calories!: number;
}

// Input type for updating dish name
@InputType()
class UpdateDishNameInput {
  @Field()
  dishId!: string;

  @Field()
  dishName!: string;
}

// Input: create a dish in the database from a scanner submission and save the calories (coach)
@InputType()
class CreateDishFromScannerSubmissionInput {
  @Field()
  submissionId!: string;

  @Field(() => Float)
  calories!: number;
}

// Result type for coach loading a coachee's dish analysis (same shape as analysis result + ids)
@ObjectType()
class CoachDishIngredientType {
  @Field()
  name!: string;

  @Field(() => Float, { nullable: true })
  estimatedQuantityGrams?: number;

  @Field(() => Float, { nullable: true })
  calories?: number;

  @Field(() => Float, { nullable: true })
  protein?: number;

  @Field(() => Float, { nullable: true })
  carbs?: number;

  @Field(() => Float, { nullable: true })
  fat?: number;
}

@ObjectType()
class CoachDishTotalsType {
  @Field(() => Float, { nullable: true })
  calories?: number;

  @Field(() => Float, { nullable: true })
  protein?: number;

  @Field(() => Float, { nullable: true })
  carbs?: number;

  @Field(() => Float, { nullable: true })
  fat?: number;

  @Field(() => Float, { nullable: true })
  fiber?: number;

  @Field(() => Float, { nullable: true })
  sugar?: number;

  @Field(() => Float, { nullable: true })
  salt?: number;
}

@ObjectType()
class CoachDishAnalysisResult {
  @Field()
  dishId!: string;

  @Field()
  analysisId!: string;

  @Field()
  dishName!: string;

  @Field(() => [CoachDishIngredientType])
  ingredients!: CoachDishIngredientType[];

  @Field(() => CoachDishTotalsType)
  totalNutrition!: CoachDishTotalsType;

  @Field()
  analysisSummary!: string;

  @Field(() => Float)
  healthScore!: number;

  @Field(() => [String])
  warnings!: string[];

  @Field({ nullable: true })
  mealType?: string;

  @Field({ nullable: true })
  photoUrl?: string;
}

// Resolver for meal analysis workflow (save, update quantities, update calories)
@Resolver()
export default class MealAnalysisResolver {
  // Coach loads a coachee's saved dish analysis to view and optionally update final calories.
  @Query(() => CoachDishAnalysisResult, { nullable: true })
  @Authorized("coach", "admin")
  async coachGetDishAnalysis(
    @Ctx() context: GraphQLContext,
    @Arg("dishId") dishId: string,
  ): Promise<CoachDishAnalysisResult | null> {
    await getCurrentUser(context);

    const dish = await Dish.findOne({
      where: { id: dishId },
      relations: [
        "meal",
        "meal.user",
        "analysis",
        "dish_ingredients",
        "dish_ingredients.ingredient",
      ],
    });

    if (!dish?.analysis || !dish.meal?.user) return null;
    if (dish.meal.user.role !== UserRole.Coachee) return null;

    const a = dish.analysis;
    const meal = dish.meal;
    const dishName = meal.name?.trim() || "Plat";

    const ingredients = (dish.dish_ingredients ?? []).map((di) => ({
      name: di.ingredient?.name ?? "Ingrédient",
      estimatedQuantityGrams: di.quantity ?? undefined,
      calories: undefined,
      protein: undefined,
      carbs: undefined,
      fat: undefined,
    }));

    const warnings = (a.warnings ?? "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      dishId: dish.id,
      analysisId: a.id,
      dishName,
      ingredients,
      totalNutrition: {
        calories: a.calories ?? undefined,
        protein: a.proteins ?? undefined,
        carbs: a.carbohydrates ?? undefined,
        fat: a.lipids ?? undefined,
        fiber: a.fiber ?? undefined,
        sugar: a.sugar ?? undefined,
        salt: a.sodium ?? undefined,
      },
      analysisSummary: a.suggestions ?? "",
      healthScore: Number(a.mealHealthScore ?? 0),
      warnings,
      mealType: meal.mealType ?? undefined,
      photoUrl: dish.photoUrl ?? undefined,
    };
  }

  // Saves meal analysis with validation against the configured AI providers.
  @Mutation(() => String)
  @Authorized()
  async saveMealAnalysis(
    @Arg("input") input: SaveMealAnalysisInput,
    @Ctx() context: GraphQLContext,
  ): Promise<string> {
    const currentUser = await getCurrentUser(context);

    let aiResult: any;
    try {
      aiResult = await analyzeMealImageWithFallback(
        input.imageBase64,
        input.mimeType,
      );
    } catch (error) {
      throw new Error(
        `Failed to analyze image with configured AI providers: ${(error as Error).message}`,
      );
    }

    if (!aiResult || !aiResult.dishName || aiResult.ingredients.length === 0) {
      throw new Error(
        "Meal analysis returned invalid results. Please try again.",
      );
    }

    const meal = Meal.create({
      user: currentUser,
      mealType: mapMealTypeToEnum(aiResult.mealType),
      consumedAt: new Date(),
    });
    await meal.save();

    const dish = Dish.create({
      meal,
      dishType: undefined,
      analysisStatus: AnalysisStatus.Complete,
      uploadedAt: new Date(),
      photoUrl: `data:${input.mimeType || "image/jpeg"};base64,${input.imageBase64}`,
    });
    await dish.save();

    const analysis = Nutritional_Analysis.create({
      calories: aiResult.totalNutrition.calories,
      proteins: aiResult.totalNutrition.protein,
      carbohydrates: aiResult.totalNutrition.carbs,
      lipids: aiResult.totalNutrition.fat,
      fiber: aiResult.totalNutrition.fiber,
      sugar: aiResult.totalNutrition.sugar,
      sodium: aiResult.totalNutrition.salt,
      mealHealthScore: aiResult.healthScore,
      warnings: aiResult.warnings.join("; "),
      suggestions: aiResult.analysisSummary,
      status: Status.Brouillon,
      isModified: false,
      analyzedAt: new Date(),
    });
    await analysis.save();

    dish.analysis = analysis;
    await dish.save();

    for (const ing of aiResult.ingredients) {
      let ingredient = await Ingredient.findOne({
        where: { name: ing.name },
      });

      if (!ingredient) {
        ingredient = Ingredient.create({
          name: ing.name,
          unit: "g" as any,
        });
        await ingredient.save();
      }

      const dishIngredient = Dish_Ingredient.create({
        dish,
        ingredient,
        quantity: ing.estimatedQuantityGrams,
      });
      await dishIngredient.save();
    }

    return dish.id;
  }

  // Updates ingredient quantities and recalculates nutritional values using the configured AI providers.
  @Mutation(() => Nutritional_Analysis)
  @Authorized()
  async updateIngredientQuantities(
    @Arg("input") input: UpdateIngredientQuantitiesInput,
    @Ctx() context: GraphQLContext,
  ): Promise<Nutritional_Analysis> {
    const currentUser = await getCurrentUser(context);

    const dish = await Dish.findOne({
      where: { id: input.dishId },
      relations: [
        "meal",
        "meal.user",
        "analysis",
        "dish_ingredients",
        "dish_ingredients.ingredient",
      ],
    });

    if (!dish || !dish.meal) {
      throw new Error("Dish not found");
    }

    if (dish.meal.user?.id !== currentUser.id) {
      throw new Error("You can only modify your own meals");
    }

    const originalAnalysis = dish.analysis;
    if (!originalAnalysis) {
      throw new Error("Original analysis not found");
    }

    for (const update of input.ingredients) {
      const normalizedUpdateName = update.ingredientName.toLowerCase().trim();
      const dishIngredient = dish.dish_ingredients?.find((di) => {
        const normalizedIngredientName = di.ingredient.name
          .toLowerCase()
          .trim();
        return normalizedIngredientName === normalizedUpdateName;
      });

      if (dishIngredient) {
        // Update quantity for an existing ingredient.
        dishIngredient.quantity = update.quantityGrams;
        await dishIngredient.save();
      } else if (update.quantityGrams > 0) {
        // New ingredient: create Ingredient + Dish_Ingredient
        let ingredient = await Ingredient.findOne({
          where: { name: update.ingredientName },
        });
        if (!ingredient) {
          ingredient = Ingredient.create({
            name: update.ingredientName,
            unit: "g" as any,
          });
          await ingredient.save();
        }

        const newDishIngredient = Dish_Ingredient.create({
          dish,
          ingredient,
          quantity: update.quantityGrams,
        });
        await newDishIngredient.save();

        // Keep in memory for the recalculation below.
        dish.dish_ingredients = [...(dish.dish_ingredients ?? []), newDishIngredient];
      } else {
        // quantityGrams <= 0 for an unknown ingredient: ignore.
        // This allows us to effectively "remove" a previous ingredient
        // by setting it to 0 when renaming (handled on the frontend).
      }
    }

    const updatedDish = await Dish.findOne({
      where: { id: input.dishId },
      relations: ["dish_ingredients", "dish_ingredients.ingredient"],
    });

    if (!updatedDish?.dish_ingredients) {
      throw new Error("Dish ingredients not found");
    }

    const ingredientQuantities = updatedDish.dish_ingredients.map((di) => ({
      name: di.ingredient.name,
      quantityGrams: di.quantity ?? 0,
    }));

    if (!dish.photoUrl) {
      throw new Error("Dish photo is required for recalculation");
    }

    let imageBase64: string;
    let mimeType = "image/jpeg";

    if (dish.photoUrl.startsWith("data:")) {
      const match = dish.photoUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        imageBase64 = match[2];
      } else {
        throw new Error("Invalid image data URL format");
      }
    } else {
      imageBase64 = dish.photoUrl;
    }

    const recalculatedAnalysis = await recalculateNutritionWithFallback(
      imageBase64,
      ingredientQuantities,
      mimeType,
    );

    if (!dish.analysis) {
      throw new Error("Analysis not found");
    }

    const { totalNutrition, healthScore, analysisSummary, warnings } =
      recalculatedAnalysis;
    Object.assign(dish.analysis, {
      calories: totalNutrition.calories,
      proteins: totalNutrition.protein,
      carbohydrates: totalNutrition.carbs,
      lipids: totalNutrition.fat,
      fiber: totalNutrition.fiber,
      sugar: totalNutrition.sugar,
      sodium: totalNutrition.salt,
      mealHealthScore: healthScore,
      suggestions: analysisSummary,
      warnings: warnings.join("; "),
      isModified: true,
    });
    await dish.analysis.save();

    const updatedAnalysis = await Nutritional_Analysis.findOne({
      where: { id: originalAnalysis.id },
    });

    if (!updatedAnalysis) {
      throw new Error("Failed to reload updated analysis");
    }

    return updatedAnalysis;
  }

  // Updates final calories in analysis (coach validation).
  // analysisId can be either the Nutritional_Analysis id or the Dish id (for frontend compatibility).
  @Mutation(() => Nutritional_Analysis)
  @Authorized("coach", "admin")
  async updateAnalysisCalories(
    @Arg("input") input: UpdateAnalysisCaloriesInput,
  ): Promise<Nutritional_Analysis> {
    let analysis = await Nutritional_Analysis.findOne({
      where: { id: input.analysisId },
      relations: ["dish", "dish.meal", "dish.meal.user"],
    });

    if (!analysis) {
      const dish = await Dish.findOne({
        where: { id: input.analysisId },
        relations: ["analysis", "meal", "meal.user"],
      });
      if (dish?.analysis) analysis = dish.analysis;
    }

    if (!analysis) {
      throw new Error("Analysis not found");
    }

    analysis.calories = input.calories;
    analysis.isModified = true;
    analysis.validatedAt = new Date();
    analysis.status = Status.Publie;
    await analysis.save();

    return analysis;
  }

  // Creates a dish (Meal + Dish + Nutritional_Analysis) from a scanner submission and stores the calories (coach).
  // Returns the dish id (dishId) so that the frontend can later use updateAnalysisCalories if needed.
  @Mutation(() => String)
  @Authorized("coach", "admin")
  async createDishFromScannerSubmission(
    @Arg("input") input: CreateDishFromScannerSubmissionInput,
    @Ctx() context: GraphQLContext,
  ): Promise<string> {
    const currentUser = await getCurrentUser(context);

    const submission = await Scanner_Coach_Submission.findOne({
      where: { id: input.submissionId },
      relations: ["user", "user.coach"],
    });

    if (!submission?.user) {
      throw new Error("Soumission introuvable.");
    }

    const coachee = submission.user as User & { coach?: User | null };
    if (
      currentUser.role === UserRole.Coach &&
      coachee.coach?.id !== currentUser.id
    ) {
      throw new Error("Vous ne pouvez pas créer un repas pour ce coaché.");
    }

    const payload = submission.payload as Record<string, unknown> | undefined;
    const draft = payload?.draft as { imageUrl?: string } | undefined;
    const details = payload?.details as
      | { dishName?: string; mealMoment?: string }
      | undefined;
    const analysisPayload = payload?.analysis as
      | {
          nutrition_estimee?: {
            calories_kcal?: { min: number; max: number };
            proteines_g?: { min: number; max: number };
            glucides_g?: { min: number; max: number };
            lipides_g?: { min: number; max: number };
            fibres_g?: { min: number; max: number };
          };
        }
      | undefined;

    const mid = (r: { min: number; max: number } | undefined): number =>
      r ? (r.min + r.max) / 2 : 0;
    const nut = analysisPayload?.nutrition_estimee;

    const meal = Meal.create({
      user: submission.user,
      name: (details?.dishName as string)?.trim() || "Plat scanné",
      mealType: mapMealTypeToEnum(details?.mealMoment),
      consumedAt: new Date(),
    });
    await meal.save();

    const photoUrl =
      (typeof draft?.imageUrl === "string" && draft.imageUrl) || undefined;

    const dish = Dish.create({
      meal,
      dishType: undefined,
      analysisStatus: AnalysisStatus.Complete,
      uploadedAt: new Date(),
      photoUrl: photoUrl ?? undefined,
    });
    await dish.save();

    const nutritionalAnalysis = Nutritional_Analysis.create({
      calories: input.calories,
      proteins: nut ? mid(nut.proteines_g) : undefined,
      carbohydrates: nut ? mid(nut.glucides_g) : undefined,
      lipids: nut ? mid(nut.lipides_g) : undefined,
      fiber: nut ? mid(nut.fibres_g) : undefined,
      mealHealthScore: undefined,
      warnings: undefined,
      suggestions: "Créé à partir d'une soumission scanner (analyse IA).",
      status: Status.Publie,
      isModified: true,
      validatedAt: new Date(),
      analyzedAt: new Date(),
    });
    await nutritionalAnalysis.save();

    dish.analysis = nutritionalAnalysis;
    await dish.save();

    return dish.id;
  }

  // Updates the dish name (meal name) for coachees
  @Mutation(() => String)
  @Authorized(UserRole.Coachee)
  async updateDishName(
    @Arg("input") input: UpdateDishNameInput,
    @Ctx() context: GraphQLContext,
  ): Promise<string> {
    const currentUser = await getCurrentUser(context);

    // Find dish and verify ownership
    const dish = await Dish.findOne({
      where: { id: input.dishId },
      relations: ["meal", "meal.user"],
    });

    if (!dish || !dish.meal) {
      throw new Error("Dish not found");
    }

    if (dish.meal.user?.id !== currentUser.id) {
      throw new Error("You can only modify your own meals");
    }

    dish.meal.name = input.dishName;
    await dish.meal.save();

    return input.dishName;
  }
}
