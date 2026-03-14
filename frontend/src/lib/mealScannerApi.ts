import { parseScannerAnalysisResponse, type ScannerAnalysisResponse } from "@/lib/scannerAnalysis";

export type MealScannerProvider = "auto" | "openai" | "gemini" | "local_fallback";

type RequestMealScannerAnalysisParams = {
  prompt: string;
  imageUrl: string;
  model?: string;
  provider?: MealScannerProvider;
  openaiModel?: string;
  geminiModel?: string;
};

type RequestMealScannerAnalysisResult = {
  analysis: ScannerAnalysisResponse;
  rawOutputText?: string;
  provider?: Exclude<MealScannerProvider, "auto">;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export const requestMealScannerAnalysis = async ({
  prompt,
  imageUrl,
  model,
  provider,
  openaiModel,
  geminiModel,
}: RequestMealScannerAnalysisParams): Promise<RequestMealScannerAnalysisResult> => {
  const response = await fetch("/api/meal-analysis", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      imageUrl,
      model,
      provider,
      openaiModel,
      geminiModel,
    }),
  });

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (isRecord(payload) && typeof payload.error === "string") {
      const details = typeof payload.details === "string" ? payload.details : null;
      const message = details ? `${payload.error} (${details})` : payload.error;
      console.error("[mealScannerApi] provider error:", message, {
        attemptedProviders: Array.isArray(payload.attemptedProviders)
          ? payload.attemptedProviders
          : undefined,
        providerErrors: Array.isArray(payload.providerErrors) ? payload.providerErrors : undefined,
      });
      throw new Error(message);
    }

    console.error("[mealScannerApi] API error without JSON payload", { status: response.status });
    throw new Error(`Erreur API (${response.status})`);
  }

  if (!isRecord(payload)) {
    throw new Error("Réponse API invalide.");
  }

  const analysis = parseScannerAnalysisResponse(payload.analysis);
  if (!analysis) {
    throw new Error("Le format de la réponse IA est invalide.");
  }

  return {
    analysis,
    rawOutputText: typeof payload.rawOutputText === "string" ? payload.rawOutputText : undefined,
    provider:
      typeof payload.provider === "string" &&
      (payload.provider === "openai" ||
        payload.provider === "gemini" ||
        payload.provider === "local_fallback")
        ? payload.provider
        : undefined,
  };
};
