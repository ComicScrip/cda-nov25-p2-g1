import env from "../../env";

// Represents a single ingredient with its estimated nutritional values
export interface IngredientEstimate {
  name: string;
  estimatedQuantityGrams?: number;
  confidence?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

// Aggregated nutritional values for the entire meal
export interface NutritionalTotals {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  salt?: number;
}

// Complete nutritional analysis result from Gemini
export interface NutritionalAnalysisResult {
  dishName: string;
  ingredients: IngredientEstimate[];
  totalNutrition: NutritionalTotals;
  analysisSummary: string;
  healthScore: number;
  warnings: string[];
  mealType?: string;
}

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

// Service wrapper for Gemini API to analyze meal images and extract nutritional data
export class GeminiService {
  private readonly apiKey: string | undefined;
  private readonly modelName: string;
  private readonly apiVersion: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.GEMINI_API_KEY;
    this.modelName = "gemini-2.5-flash";
    this.apiVersion = "v1beta";
  }

  // Analyzes a dish image and returns structured nutritional analysis
  async analyzeMealImage(
    imageBase64: string,
    mimeType = "image/jpeg",
  ): Promise<NutritionalAnalysisResult> {
    if (!this.apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Please configure it in your environment.",
      );
    }

    const endpoint = `https://generativelanguage.googleapis.com/${this.apiVersion}/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const systemPrompt =
      "You are a meticulous nutrition expert. " +
      "Given a photo of a meal, you must identify the dish name, identify the visible ingredients, estimate their quantities, " +
      "compute total nutritional values (calories, protein, carbs, fat, fiber, sugar, salt if possible), " +
      "and provide a short health analysis. " +
      "IMPORTANT: All text responses (dishName, ingredient names, analysisSummary, warnings, mealType) must be in French. " +
      "Respond ONLY with valid JSON matching this TypeScript interface (no extra text): " +
      "{ \"dishName\": string, " +
      "\"ingredients\": {\"name\": string, \"estimatedQuantityGrams\"?: number, \"confidence\"?: number, \"calories\"?: number, \"protein\"?: number, \"carbs\"?: number, \"fat\"?: number }[], " +
      "\"totalNutrition\": {\"calories\"?: number, \"protein\"?: number, \"carbs\"?: number, \"fat\"?: number, \"fiber\"?: number, \"sugar\"?: number, \"salt\"?: number }, " +
      "\"analysisSummary\": string, \"healthScore\": number, \"warnings\": string[], \"mealType\"?: string }.";

    const body = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
    };

    let response: Response;
    try {
      const fetchFn: typeof fetch = (globalThis as any).fetch;
      if (typeof fetchFn !== "function") {
        throw new Error("Global fetch is not available in this runtime.");
      }

      response = await fetchFn(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw new Error(
        `Failed to call Gemini API: ${(error as Error).message ?? "Unknown error"}`,
      );
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Gemini API returned HTTP ${response.status}: ${
          text || "no response body"
        }`,
      );
    }

    let json: GeminiGenerateContentResponse;
    try {
      json = (await response.json()) as GeminiGenerateContentResponse;
    } catch (error) {
      throw new Error(
        `Failed to parse Gemini response as JSON: ${(error as Error).message}`,
      );
    }

    const rawText =
      json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (!rawText) {
      throw new Error(
        "Gemini response did not contain any text content to parse.",
      );
    }

    let jsonText = rawText;
    const jsonBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
      jsonText = jsonBlockMatch[1].trim();
    } else {
      const jsonStart = rawText.indexOf("{");
      const jsonEnd = rawText.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonText = rawText.substring(jsonStart, jsonEnd + 1);
      }
    }

    let parsed: NutritionalAnalysisResult;
    try {
      parsed = JSON.parse(jsonText) as NutritionalAnalysisResult;
    } catch (error) {
      throw new Error(
        `Gemini response was not valid JSON: ${(error as Error).message}. Raw text preview: ${rawText.substring(0, 200)}`,
      );
    }

    return {
      dishName: parsed.dishName ?? "Plat non identifié",
      ingredients: parsed.ingredients ?? [],
      totalNutrition: parsed.totalNutrition ?? {},
      analysisSummary: parsed.analysisSummary ?? "",
      healthScore:
        typeof parsed.healthScore === "number" ? parsed.healthScore : 0,
      warnings: parsed.warnings ?? [],
      mealType: parsed.mealType,
    };
  }

  // Recalculates nutritional values based on updated ingredient quantities using the original image
  async recalculateNutritionWithQuantities(
    imageBase64: string,
    ingredientQuantities: Array<{ name: string; quantityGrams: number }>,
    mimeType = "image/jpeg",
  ): Promise<NutritionalAnalysisResult> {
    if (!this.apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Please configure it in your environment.",
      );
    }

    const endpoint = `https://generativelanguage.googleapis.com/${this.apiVersion}/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const ingredientsList = ingredientQuantities
      .map((ing) => `- ${ing.name}: ${ing.quantityGrams} g`)
      .join("\n");

    const systemPrompt =
      "You are a meticulous nutrition expert. " +
      "Given a photo of a meal and the updated quantities of ingredients (in grams), " +
      "you must recalculate the total nutritional values (calories, protein, carbs, fat, fiber, sugar, salt) " +
      "based on these specific quantities. " +
      "IMPORTANT: All text responses (dishName, ingredient names, analysisSummary, warnings, mealType) must be in French. " +
      "Respond ONLY with valid JSON matching this TypeScript interface (no extra text): " +
      "{ \"dishName\": string, " +
      "\"ingredients\": {\"name\": string, \"estimatedQuantityGrams\": number, \"confidence\"?: number, \"calories\"?: number, \"protein\"?: number, \"carbs\"?: number, \"fat\"?: number }[], " +
      "\"totalNutrition\": {\"calories\"?: number, \"protein\"?: number, \"carbs\"?: number, \"fat\"?: number, \"fiber\"?: number, \"sugar\"?: number, \"salt\"?: number }, " +
      "\"analysisSummary\": string, \"healthScore\": number, \"warnings\": string[], \"mealType\"?: string }.\n\n" +
      "Updated ingredient quantities:\n" +
      ingredientsList;

    const body = {
      contents: [
        {
          parts: [
            { text: systemPrompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
    };

    let response: Response;
    try {
      const fetchFn: typeof fetch = (globalThis as any).fetch;
      if (typeof fetchFn !== "function") {
        throw new Error("Global fetch is not available in this runtime.");
      }

      response = await fetchFn(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw new Error(
        `Failed to call Gemini API: ${(error as Error).message ?? "Unknown error"}`,
      );
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Gemini API returned HTTP ${response.status}: ${
          text || "no response body"
        }`,
      );
    }

    let json: GeminiGenerateContentResponse;
    try {
      json = (await response.json()) as GeminiGenerateContentResponse;
    } catch (error) {
      throw new Error(
        `Failed to parse Gemini response as JSON: ${(error as Error).message}`,
      );
    }

    const rawText =
      json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (!rawText) {
      throw new Error(
        "Gemini response did not contain any text content to parse.",
      );
    }

    let parsed: NutritionalAnalysisResult;
    try {
      const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : rawText;

      parsed = JSON.parse(jsonString) as NutritionalAnalysisResult;
    } catch (error) {
      const preview = rawText.substring(0, 200);
      throw new Error(
        `Gemini response was not valid JSON: ${(error as Error).message}. Raw text starts with: "${preview}..."`,
      );
    }

    return {
      dishName: parsed.dishName ?? "Plat non identifié",
      ingredients: parsed.ingredients ?? [],
      totalNutrition: parsed.totalNutrition ?? {},
      analysisSummary: parsed.analysisSummary ?? "",
      healthScore:
        typeof parsed.healthScore === "number" ? parsed.healthScore : 0,
      warnings: parsed.warnings ?? [],
      mealType: parsed.mealType,
    };
  }
}

// Shared Gemini service instance
export const geminiService = new GeminiService(env.GEMINI_API_KEY);

