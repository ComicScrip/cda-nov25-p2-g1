import { geminiService, type NutritionalAnalysisResult } from "./geminiService";
import { openaiNutritionService } from "./openaiNutritionService";
import { isInvalidApiKeyError } from "./providerUtils";

type IngredientQuantityInput = {
  name: string;
  quantityGrams: number;
};

type MealVisionProvider = "gemini" | "openai";

const runtimeUnavailableProviders: Partial<Record<MealVisionProvider, true>> =
  {};

function providerName(provider: MealVisionProvider): string {
  return provider === "gemini" ? "Gemini" : "OpenAI";
}

function getProviderCandidates(): MealVisionProvider[] {
  const providers: MealVisionProvider[] = [];

  if (!runtimeUnavailableProviders.gemini && geminiService.canAttempt()) {
    providers.push("gemini");
  }

  if (
    !runtimeUnavailableProviders.openai &&
    openaiNutritionService.canAttempt()
  ) {
    providers.push("openai");
  }

  return providers;
}

async function runWithFallback<T>(
  runner: (provider: MealVisionProvider) => Promise<T>,
): Promise<T> {
  const providerCandidates = getProviderCandidates();
  if (providerCandidates.length === 0) {
    throw new Error("No AI provider is configured for meal analysis.");
  }

  const providerErrors: string[] = [];

  for (const provider of providerCandidates) {
    try {
      return await runner(provider);
    } catch (error) {
      if (isInvalidApiKeyError(error)) {
        runtimeUnavailableProviders[provider] = true;
      }

      providerErrors.push(
        `${providerName(provider)}: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  throw new Error(providerErrors.join(" | "));
}

export async function analyzeMealImageWithFallback(
  imageBase64: string,
  mimeType = "image/jpeg",
): Promise<NutritionalAnalysisResult> {
  return runWithFallback(async (provider) => {
    if (provider === "gemini") {
      return geminiService.analyzeMealImage(imageBase64, mimeType);
    }

    return openaiNutritionService.analyzeMealImage(imageBase64, mimeType);
  });
}

export async function recalculateNutritionWithFallback(
  imageBase64: string,
  ingredientQuantities: IngredientQuantityInput[],
  mimeType = "image/jpeg",
): Promise<NutritionalAnalysisResult> {
  return runWithFallback(async (provider) => {
    if (provider === "gemini") {
      return geminiService.recalculateNutritionWithQuantities(
        imageBase64,
        ingredientQuantities,
        mimeType,
      );
    }

    return openaiNutritionService.recalculateNutritionWithQuantities(
      imageBase64,
      ingredientQuantities,
      mimeType,
    );
  });
}
