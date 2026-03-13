import env from "../../env";
import type { NutritionalAnalysisResult } from "./geminiService";
import { hasUsableApiKey, normalizeApiKey } from "./providerUtils";

type IngredientQuantityInput = {
  name: string;
  quantityGrams: number;
};

function buildImageDataUrl(imageBase64: string, mimeType: string): string {
  return `data:${mimeType};base64,${imageBase64}`;
}

function extractJsonCandidate(value: string): string {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return "";
  }

  const fencedMatch = trimmedValue.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBraceIndex = trimmedValue.indexOf("{");
  const lastBraceIndex = trimmedValue.lastIndexOf("}");

  if (firstBraceIndex >= 0 && lastBraceIndex > firstBraceIndex) {
    return trimmedValue.slice(firstBraceIndex, lastBraceIndex + 1);
  }

  return trimmedValue;
}

function parseAnalysisOrThrow(
  rawOutputText: string,
): NutritionalAnalysisResult {
  let parsed: NutritionalAnalysisResult;

  try {
    parsed = JSON.parse(
      extractJsonCandidate(rawOutputText),
    ) as NutritionalAnalysisResult;
  } catch (error) {
    throw new Error(
      `OpenAI response was not valid JSON: ${(error as Error).message}. Raw text preview: ${rawOutputText.slice(0, 200)}`,
    );
  }

  return {
    dishName: parsed.dishName ?? "Plat non identifie",
    ingredients: parsed.ingredients ?? [],
    totalNutrition: parsed.totalNutrition ?? {},
    analysisSummary: parsed.analysisSummary ?? "",
    healthScore:
      typeof parsed.healthScore === "number" ? parsed.healthScore : 0,
    warnings: parsed.warnings ?? [],
    mealType: parsed.mealType,
  };
}

interface OpenAIResponsesApiResponse {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<
      | {
          type?: "output_text";
          text?: string;
        }
      | {
          type?: "refusal";
          refusal?: string;
        }
    >;
  }>;
}

function extractOpenAIOutputText(payload: OpenAIResponsesApiResponse): string {
  const directOutputText = payload.output_text?.trim();
  if (directOutputText) {
    return directOutputText;
  }

  const textChunks: string[] = [];
  const refusalChunks: string[] = [];

  for (const outputItem of payload.output ?? []) {
    for (const contentPart of outputItem.content ?? []) {
      if (
        contentPart.type === "output_text" &&
        typeof contentPart.text === "string"
      ) {
        const trimmedText = contentPart.text.trim();
        if (trimmedText) {
          textChunks.push(trimmedText);
        }
      }

      if (
        contentPart.type === "refusal" &&
        typeof contentPart.refusal === "string"
      ) {
        const trimmedRefusal = contentPart.refusal.trim();
        if (trimmedRefusal) {
          refusalChunks.push(trimmedRefusal);
        }
      }
    }
  }

  if (textChunks.length > 0) {
    return textChunks.join("\n");
  }

  if (refusalChunks.length > 0) {
    throw new Error(`OpenAI refused the request: ${refusalChunks.join(" ")}`);
  }

  return "";
}

export class OpenAINutritionService {
  private readonly apiKey: string | undefined;
  private readonly modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    this.apiKey = normalizeApiKey(apiKey ?? env.OPENAI_API_KEY);
    this.modelName = modelName ?? env.OPENAI_MEAL_SCAN_MODEL ?? "gpt-5.2";
  }

  canAttempt(): boolean {
    return hasUsableApiKey(this.apiKey);
  }

  private getApiKey(): string {
    if (!this.apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not set. Please configure it in your environment.",
      );
    }

    return this.apiKey;
  }

  private async createJsonResponse(
    prompt: string,
    imageBase64: string,
    mimeType: string,
  ): Promise<NutritionalAnalysisResult> {
    const apiKey = this.getApiKey();
    const body = {
      model: this.modelName,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            {
              type: "input_image",
              image_url: buildImageDataUrl(imageBase64, mimeType),
              detail: "auto",
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

      response = await fetchFn("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw new Error(
        `Failed to call OpenAI API: ${(error as Error).message ?? "Unknown error"}`,
      );
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `OpenAI API returned HTTP ${response.status}: ${
          text || "no response body"
        }`,
      );
    }

    let json: OpenAIResponsesApiResponse;
    try {
      json = (await response.json()) as OpenAIResponsesApiResponse;
    } catch (error) {
      throw new Error(
        `Failed to parse OpenAI response as JSON: ${(error as Error).message}`,
      );
    }

    const rawOutputText = extractOpenAIOutputText(json);
    if (!rawOutputText) {
      throw new Error(
        "OpenAI response did not contain any text content to parse.",
      );
    }

    return parseAnalysisOrThrow(rawOutputText);
  }

  async analyzeMealImage(
    imageBase64: string,
    mimeType = "image/jpeg",
  ): Promise<NutritionalAnalysisResult> {
    const prompt =
      "You are a meticulous nutrition expert. " +
      "Given a photo of a meal, identify the dish name, the visible ingredients, estimate their quantities, " +
      "compute total nutritional values (calories, protein, carbs, fat, fiber, sugar, salt when possible), " +
      "and provide a short health analysis. " +
      "IMPORTANT: All text responses (dishName, ingredient names, analysisSummary, warnings, mealType) must be in French. " +
      "Respond ONLY with valid JSON matching this TypeScript interface (no extra text): " +
      '{ "dishName": string, "ingredients": {"name": string, "estimatedQuantityGrams"?: number, "confidence"?: number, "calories"?: number, "protein"?: number, "carbs"?: number, "fat"?: number }[], "totalNutrition": {"calories"?: number, "protein"?: number, "carbs"?: number, "fat"?: number, "fiber"?: number, "sugar"?: number, "salt"?: number }, "analysisSummary": string, "healthScore": number, "warnings": string[], "mealType"?: string }.';

    return this.createJsonResponse(prompt, imageBase64, mimeType);
  }

  async recalculateNutritionWithQuantities(
    imageBase64: string,
    ingredientQuantities: IngredientQuantityInput[],
    mimeType = "image/jpeg",
  ): Promise<NutritionalAnalysisResult> {
    const ingredientsList = ingredientQuantities
      .map(
        (ingredient) => `- ${ingredient.name}: ${ingredient.quantityGrams} g`,
      )
      .join("\n");

    const prompt =
      "You are a meticulous nutrition expert. " +
      "Given a photo of a meal and the updated quantities of ingredients in grams, " +
      "recalculate the nutritional values based on these specific quantities. " +
      "IMPORTANT: All text responses (dishName, ingredient names, analysisSummary, warnings, mealType) must be in French. " +
      "Respond ONLY with valid JSON matching this TypeScript interface (no extra text): " +
      '{ "dishName": string, "ingredients": {"name": string, "estimatedQuantityGrams": number, "confidence"?: number, "calories"?: number, "protein"?: number, "carbs"?: number, "fat"?: number }[], "totalNutrition": {"calories"?: number, "protein"?: number, "carbs"?: number, "fat"?: number, "fiber"?: number, "sugar"?: number, "salt"?: number }, "analysisSummary": string, "healthScore": number, "warnings": string[], "mealType"?: string }.\n\n' +
      "Updated ingredient quantities:\n" +
      ingredientsList;

    return this.createJsonResponse(prompt, imageBase64, mimeType);
  }
}

export const openaiNutritionService = new OpenAINutritionService();
