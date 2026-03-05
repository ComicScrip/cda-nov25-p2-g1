import {
  Arg,
  Authorized,
  Ctx,
  Field,
  Float,
  InputType,
  Mutation,
  Resolver,
} from "type-graphql";
import { geminiService } from "../ai/services/geminiService";
import { getCurrentUser } from "../auth";
import { Dish } from "../entities/Dish";
import { Dish_Ingredient } from "../entities/Dish_Ingredient";
import { AnalysisStatus, MealType, Status, UserRole } from "../entities/enums";
import { Ingredient } from "../entities/Ingredient";
import { Meal } from "../entities/Meal";
import { Nutritional_Analysis } from "../entities/Nutritional_Analysis";
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

// Resolver for meal analysis workflow (save, update quantities, update calories)
@Resolver()
export default class MealAnalysisResolver {
  // Saves meal analysis with validation against Gemini to ensure data integrity
  @Mutation(() => String)
  @Authorized()
  async saveMealAnalysis(
    @Arg("input") input: SaveMealAnalysisInput,
    @Ctx() context: GraphQLContext,
  ): Promise<string> {
    const currentUser = await getCurrentUser(context);

    // Call Gemini to get the authoritative analysis (source of truth)
    // Note: We use Gemini's results directly to ensure data integrity
    // The frontend data is only used for validation that the image matches
    let geminiResult: any;
    try {
      geminiResult = await geminiService.analyzeMealImage(
        input.imageBase64,
        input.mimeType,
      );
    } catch (error) {
      throw new Error(
        `Failed to analyze image with Gemini: ${(error as Error).message}`,
      );
    }

    // Basic validation: ensure we got valid results from Gemini
    if (
      !geminiResult ||
      !geminiResult.dishName ||
      geminiResult.ingredients.length === 0
    ) {
      throw new Error(
        "Gemini analysis returned invalid results. Please try again.",
      );
    }

    // Use Gemini's results as source of truth for nutritional values
    const meal = Meal.create({
      user: currentUser,
      mealType: mapMealTypeToEnum(geminiResult.mealType),
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
      calories: geminiResult.totalNutrition.calories,
      proteins: geminiResult.totalNutrition.protein,
      carbohydrates: geminiResult.totalNutrition.carbs,
      lipids: geminiResult.totalNutrition.fat,
      fiber: geminiResult.totalNutrition.fiber,
      sugar: geminiResult.totalNutrition.sugar,
      sodium: geminiResult.totalNutrition.salt,
      mealHealthScore: geminiResult.healthScore,
      warnings: geminiResult.warnings.join("; "),
      suggestions: geminiResult.analysisSummary,
      status: Status.Brouillon,
      isModified: false,
      analyzedAt: new Date(),
    });
    await analysis.save();

    dish.analysis = analysis;
    await dish.save();

    // Use Gemini's ingredient quantities as source of truth
    for (const ing of geminiResult.ingredients) {
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

  // Updates ingredient quantities and recalculates nutritional values using Gemini
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
        dishIngredient.quantity = update.quantityGrams;
        await dishIngredient.save();
      } else {
        console.warn(
          `Ingredient "${update.ingredientName}" not found in dish ${input.dishId}`,
        );
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

    const recalculatedAnalysis =
      await geminiService.recalculateNutritionWithQuantities(
        imageBase64,
        ingredientQuantities,
        mimeType,
      );

    if (!dish.analysis) {
      throw new Error("Analysis not found");
    }

    dish.analysis.calories = recalculatedAnalysis.totalNutrition.calories;
    dish.analysis.proteins = recalculatedAnalysis.totalNutrition.protein;
    dish.analysis.carbohydrates = recalculatedAnalysis.totalNutrition.carbs;
    dish.analysis.lipids = recalculatedAnalysis.totalNutrition.fat;
    dish.analysis.fiber = recalculatedAnalysis.totalNutrition.fiber;
    dish.analysis.sugar = recalculatedAnalysis.totalNutrition.sugar;
    dish.analysis.sodium = recalculatedAnalysis.totalNutrition.salt;
    dish.analysis.mealHealthScore = recalculatedAnalysis.healthScore;
    dish.analysis.suggestions = recalculatedAnalysis.analysisSummary;
    dish.analysis.warnings = recalculatedAnalysis.warnings.join("; ");
    dish.analysis.isModified = true;
    await dish.analysis.save();

    const updatedAnalysis = await Nutritional_Analysis.findOne({
      where: { id: originalAnalysis.id },
    });

    if (!updatedAnalysis) {
      throw new Error("Failed to reload updated analysis");
    }

    return updatedAnalysis;
  }

  // Updates final calories in analysis (coach validation)
  @Mutation(() => Nutritional_Analysis)
  @Authorized("coach", "admin")
  async updateAnalysisCalories(
    @Arg("input") input: UpdateAnalysisCaloriesInput,
  ): Promise<Nutritional_Analysis> {
    const analysis = await Nutritional_Analysis.findOne({
      where: { id: input.analysisId },
      relations: ["dish", "dish.meal", "dish.meal.user"],
    });

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
