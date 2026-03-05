import {
  Arg,
  Authorized,
  Field,
  Float,
  InputType,
  ObjectType,
  Mutation,
  Resolver,
} from "type-graphql";
import {
  type IngredientEstimate,
  type NutritionalAnalysisResult,
  type NutritionalTotals,
  geminiService,
} from "../ai/services/geminiService";

// GraphQL type for a single ingredient estimate
@ObjectType()
class IngredientEstimateType implements IngredientEstimate {
  @Field()
  name!: string;

  @Field(() => Float, { nullable: true })
  estimatedQuantityGrams?: number;

  @Field(() => Float, { nullable: true })
  confidence?: number;

  @Field(() => Float, { nullable: true })
  calories?: number;

  @Field(() => Float, { nullable: true })
  protein?: number;

  @Field(() => Float, { nullable: true })
  carbs?: number;

  @Field(() => Float, { nullable: true })
  fat?: number;
}

// GraphQL type for aggregated nutritional values of the dish
@ObjectType()
class NutritionalTotalsType implements NutritionalTotals {
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

// GraphQL type for the complete nutritional analysis result
@ObjectType()
class NutritionalAnalysisType implements NutritionalAnalysisResult {
  @Field()
  dishName!: string;

  @Field(() => [IngredientEstimateType])
  ingredients!: IngredientEstimateType[];

  @Field(() => NutritionalTotalsType)
  totalNutrition!: NutritionalTotalsType;

  @Field()
  analysisSummary!: string;

  @Field(() => Float)
  healthScore!: number;

  @Field(() => [String])
  warnings!: string[];

  @Field({ nullable: true })
  mealType?: string;
}

// Input type for meal image analysis (base64 string without data URL prefix)
@InputType()
class AnalyzeMealImageInput {
  @Field()
  imageBase64!: string;

  @Field({ nullable: true })
  mimeType?: string;
}

// Resolver for exposing Gemini image analysis to GraphQL API
@Resolver()
export default class NutritionalAnalystResolver {
  // Analyzes a meal photo and returns structured nutritional information
  @Mutation(() => NutritionalAnalysisType)
  @Authorized()
  async analyzeMealImage(
    @Arg("input") input: AnalyzeMealImageInput,
  ): Promise<NutritionalAnalysisType> {
    const result = await geminiService.analyzeMealImage(
      input.imageBase64,
      input.mimeType,
    );

    return {
      dishName: result.dishName,
      ingredients: result.ingredients.map(
        (ing) =>
          ({
            name: ing.name,
            estimatedQuantityGrams: ing.estimatedQuantityGrams,
            confidence: ing.confidence,
            calories: ing.calories,
            protein: ing.protein,
            carbs: ing.carbs,
            fat: ing.fat,
          }) as IngredientEstimateType,
      ),
      totalNutrition: {
        calories: result.totalNutrition.calories,
        protein: result.totalNutrition.protein,
        carbs: result.totalNutrition.carbs,
        fat: result.totalNutrition.fat,
        fiber: result.totalNutrition.fiber,
        sugar: result.totalNutrition.sugar,
        salt: result.totalNutrition.salt,
      } as NutritionalTotalsType,
      analysisSummary: result.analysisSummary,
      healthScore: result.healthScore,
      warnings: result.warnings,
      mealType: result.mealType,
    };
  }
}

