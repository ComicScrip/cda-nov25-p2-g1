import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { parseScannerAnalysisResponse } from "@/lib/scannerAnalysis";

export type MealAnalysisProvider = "openai" | "gemini";
type RequestedMealAnalysisProvider = MealAnalysisProvider | "auto";

type MealAnalysisRequestBody = {
  prompt?: unknown;
  imageUrl?: unknown;
  model?: unknown;
  provider?: unknown;
  openaiModel?: unknown;
  geminiModel?: unknown;
};

type ParsedAnalysis =
  ReturnType<typeof parseScannerAnalysisResponse> extends infer T ? Exclude<T, null> : never;

type ProviderAttemptError = {
  provider: MealAnalysisProvider;
  reason: "missing_api_key" | "budget_exceeded" | "call_failed";
  message: string;
};

type ProviderUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  runtimeUsedTokens: number;
  budgetTokens: number | null;
  remainingTokens: number | null;
};

type MealAnalysisSuccessResponse = {
  analysis: ParsedAnalysis;
  rawOutputText?: string;
  provider: MealAnalysisProvider;
  attemptedProviders: MealAnalysisProvider[];
  providerErrors?: ProviderAttemptError[];
  usage?: ProviderUsage;
};

type MealAnalysisErrorResponse = {
  error: string;
  details?: string;
  attemptedProviders?: MealAnalysisProvider[];
  providerErrors?: ProviderAttemptError[];
};

type ProviderCallResult = {
  analysis: ParsedAnalysis;
  rawOutputText: string;
  usage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
};

const DEFAULT_OPENAI_MODEL = "gpt-5.2";
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
export const DEFAULT_PROVIDER_ORDER: MealAnalysisProvider[] = ["openai", "gemini"];
const runtimeTokenUsage: Record<MealAnalysisProvider, number> = {
  openai: 0,
  gemini: 0,
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isSupportedImageInput = (value: string): boolean => {
  return (
    value.startsWith("data:image/") || value.startsWith("http://") || value.startsWith("https://")
  );
};

const isMealAnalysisProvider = (value: string): value is MealAnalysisProvider => {
  return value === "openai" || value === "gemini";
};

const parseRequestedProvider = (value: unknown): RequestedMealAnalysisProvider => {
  if (typeof value !== "string") {
    return "auto";
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "auto" || isMealAnalysisProvider(normalized)) {
    return normalized;
  }

  return "auto";
};

const parseString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const parsePositiveInteger = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.floor(parsed);
};

const getProviderBudget = (provider: MealAnalysisProvider): number | null => {
  const envValue =
    provider === "openai" ? process.env.OPENAI_TOKEN_BUDGET : process.env.GEMINI_TOKEN_BUDGET;
  return parsePositiveInteger(envValue);
};

export const getProviderRemainingTokens = (provider: MealAnalysisProvider): number | null => {
  const budget = getProviderBudget(provider);
  if (budget === null) {
    return null;
  }

  return Math.max(budget - runtimeTokenUsage[provider], 0);
};

export const resetRuntimeTokenUsage = (): void => {
  runtimeTokenUsage.openai = 0;
  runtimeTokenUsage.gemini = 0;
};

export const recordRuntimeTokenUsage = (
  provider: MealAnalysisProvider,
  totalTokens: number | undefined,
): void => {
  if (typeof totalTokens !== "number" || totalTokens <= 0) {
    return;
  }

  runtimeTokenUsage[provider] += totalTokens;
};

const buildProviderUsage = (
  provider: MealAnalysisProvider,
  usage: ProviderCallResult["usage"],
): ProviderUsage => {
  return {
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
    runtimeUsedTokens: runtimeTokenUsage[provider],
    budgetTokens: getProviderBudget(provider),
    remainingTokens: getProviderRemainingTokens(provider),
  };
};

const parseProviderOrder = (value: string | undefined): MealAnalysisProvider[] => {
  if (!value) {
    return DEFAULT_PROVIDER_ORDER;
  }

  const unique: MealAnalysisProvider[] = [];
  const rawValues = value.split(",").map((item) => item.trim().toLowerCase());

  for (const item of rawValues) {
    if (isMealAnalysisProvider(item) && !unique.includes(item)) {
      unique.push(item);
    }
  }

  for (const fallbackProvider of DEFAULT_PROVIDER_ORDER) {
    if (!unique.includes(fallbackProvider)) {
      unique.push(fallbackProvider);
    }
  }

  return unique;
};

export const orderProvidersForAuto = (
  providers: MealAnalysisProvider[],
): MealAnalysisProvider[] => {
  const fallbackIndex = new Map<MealAnalysisProvider, number>(
    providers.map((provider, index) => [provider, index]),
  );

  return [...providers].sort((a, b) => {
    const remainingA = getProviderRemainingTokens(a);
    const remainingB = getProviderRemainingTokens(b);

    if (remainingA !== null && remainingB !== null) {
      if (remainingA === remainingB) {
        return (fallbackIndex.get(a) ?? 0) - (fallbackIndex.get(b) ?? 0);
      }

      return remainingB - remainingA;
    }

    if (remainingA !== null) {
      return -1;
    }

    if (remainingB !== null) {
      return 1;
    }

    return (fallbackIndex.get(a) ?? 0) - (fallbackIndex.get(b) ?? 0);
  });
};

const parseDataUrlImage = (value: string): { mimeType: string; data: string } | null => {
  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=_-]+)$/);
  if (!match) {
    return null;
  }

  return {
    mimeType: match[1],
    data: match[2],
  };
};

const extractErrorMessage = (payload: unknown): string | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const directMessage = payload.message;
  if (typeof directMessage === "string" && directMessage.trim()) {
    return directMessage.trim();
  }

  const nestedError = payload.error;
  if (
    isRecord(nestedError) &&
    typeof nestedError.message === "string" &&
    nestedError.message.trim()
  ) {
    return nestedError.message.trim();
  }

  return null;
};

const extractJsonCandidate = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBraceIndex = trimmed.indexOf("{");
  const lastBraceIndex = trimmed.lastIndexOf("}");

  if (firstBraceIndex >= 0 && lastBraceIndex > firstBraceIndex) {
    return trimmed.slice(firstBraceIndex, lastBraceIndex + 1);
  }

  return trimmed;
};

const parseAnalysisOrThrow = (rawOutputText: string): ParsedAnalysis => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(extractJsonCandidate(rawOutputText));
  } catch {
    throw new Error("Le modèle a répondu, mais pas en JSON valide.");
  }

  const analysis = parseScannerAnalysisResponse(parsed);
  if (!analysis) {
    throw new Error("Le JSON retourné par le modèle n'a pas le format attendu.");
  }

  return analysis;
};

const callOpenAIProvider = async ({
  apiKey,
  model,
  prompt,
  imageUrl,
}: {
  apiKey: string;
  model: string;
  prompt: string;
  imageUrl: string;
}): Promise<ProviderCallResult> => {
  const client = new OpenAI({ apiKey });

  const response = await client.responses.create({
    model,
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: prompt },
          { type: "input_image", image_url: imageUrl, detail: "auto" },
        ],
      },
    ],
  });

  const rawOutputText = response.output_text?.trim();
  if (!rawOutputText) {
    throw new Error("La réponse OpenAI ne contient pas de texte exploitable.");
  }

  const analysis = parseAnalysisOrThrow(rawOutputText);

  return {
    analysis,
    rawOutputText,
    usage: {
      inputTokens:
        typeof response.usage?.input_tokens === "number" ? response.usage.input_tokens : undefined,
      outputTokens:
        typeof response.usage?.output_tokens === "number"
          ? response.usage.output_tokens
          : undefined,
      totalTokens:
        typeof response.usage?.total_tokens === "number" ? response.usage.total_tokens : undefined,
    },
  };
};

const extractGeminiText = (payload: unknown): string => {
  if (!isRecord(payload)) {
    return "";
  }

  const candidates = payload.candidates;
  if (!Array.isArray(candidates)) {
    return "";
  }

  const chunks: string[] = [];

  for (const candidate of candidates) {
    if (!isRecord(candidate) || !isRecord(candidate.content)) {
      continue;
    }

    const parts = candidate.content.parts;
    if (!Array.isArray(parts)) {
      continue;
    }

    for (const part of parts) {
      if (isRecord(part) && typeof part.text === "string") {
        chunks.push(part.text);
      }
    }
  }

  return chunks.join("\n").trim();
};

const callGeminiProvider = async ({
  apiKey,
  model,
  prompt,
  imageUrl,
}: {
  apiKey: string;
  model: string;
  prompt: string;
  imageUrl: string;
}): Promise<ProviderCallResult> => {
  const parsedImage = parseDataUrlImage(imageUrl);
  if (!parsedImage) {
    throw new Error("Gemini nécessite un data URL base64 (data:image/...) pour analyser l'image.");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: parsedImage.mimeType,
                data: parsedImage.data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
      },
    }),
  });

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const providerMessage = extractErrorMessage(payload);
    throw new Error(providerMessage ?? `Gemini API a répondu avec le code ${response.status}.`);
  }

  const rawOutputText = extractGeminiText(payload);
  if (!rawOutputText) {
    throw new Error("La réponse Gemini ne contient pas de texte exploitable.");
  }

  const analysis = parseAnalysisOrThrow(rawOutputText);

  const usageMetadata =
    isRecord(payload) && isRecord(payload.usageMetadata) ? payload.usageMetadata : null;

  return {
    analysis,
    rawOutputText,
    usage: {
      inputTokens:
        usageMetadata && typeof usageMetadata.promptTokenCount === "number"
          ? usageMetadata.promptTokenCount
          : undefined,
      outputTokens:
        usageMetadata && typeof usageMetadata.candidatesTokenCount === "number"
          ? usageMetadata.candidatesTokenCount
          : undefined,
      totalTokens:
        usageMetadata && typeof usageMetadata.totalTokenCount === "number"
          ? usageMetadata.totalTokenCount
          : undefined,
    },
  };
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MealAnalysisSuccessResponse | MealAnalysisErrorResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Méthode non autorisée. Utilise POST." });
    return;
  }

  const body = req.body as MealAnalysisRequestBody;
  if (!isRecord(body)) {
    res.status(400).json({ error: "Body JSON invalide." });
    return;
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const requestedProvider = parseRequestedProvider(body.provider);
  const openaiModel =
    parseString(body.openaiModel) ??
    parseString(body.model) ??
    process.env.OPENAI_MEAL_SCAN_MODEL ??
    DEFAULT_OPENAI_MODEL;
  const geminiModel =
    parseString(body.geminiModel) ?? process.env.GEMINI_MEAL_SCAN_MODEL ?? DEFAULT_GEMINI_MODEL;

  if (!prompt) {
    res.status(400).json({ error: "Le champ 'prompt' est requis." });
    return;
  }

  if (!imageUrl) {
    res.status(400).json({ error: "Le champ 'imageUrl' est requis." });
    return;
  }

  if (!isSupportedImageInput(imageUrl)) {
    res.status(400).json({
      error: "Le champ 'imageUrl' doit être une URL http(s) ou un data URL (data:image/...).",
    });
    return;
  }

  const defaultAutoOrder = parseProviderOrder(process.env.MEAL_ANALYSIS_PROVIDER_ORDER);
  const providersToTry =
    requestedProvider === "auto" ? orderProvidersForAuto(defaultAutoOrder) : [requestedProvider];

  const providerErrors: ProviderAttemptError[] = [];
  const attemptedProviders: MealAnalysisProvider[] = [];

  for (const provider of providersToTry) {
    attemptedProviders.push(provider);

    const budgetTokens = getProviderBudget(provider);
    const remainingTokens = getProviderRemainingTokens(provider);
    if (budgetTokens !== null && remainingTokens !== null && remainingTokens <= 0) {
      providerErrors.push({
        provider,
        reason: "budget_exceeded",
        message: `Budget de tokens épuisé pour ${provider}.`,
      });
      continue;
    }

    const providerApiKey =
      provider === "openai"
        ? (process.env.OPENAI_API_KEY ?? process.env.api_key)
        : process.env.GEMINI_API_KEY;

    if (!providerApiKey) {
      providerErrors.push({
        provider,
        reason: "missing_api_key",
        message:
          provider === "openai"
            ? "OPENAI_API_KEY manquant dans le serveur Next (.env)."
            : "GEMINI_API_KEY manquant dans le serveur Next (.env).",
      });
      continue;
    }

    try {
      const result =
        provider === "openai"
          ? await callOpenAIProvider({
              apiKey: providerApiKey,
              model: openaiModel,
              prompt,
              imageUrl,
            })
          : await callGeminiProvider({
              apiKey: providerApiKey,
              model: geminiModel,
              prompt,
              imageUrl,
            });

      recordRuntimeTokenUsage(provider, result.usage.totalTokens);

      res.status(200).json({
        analysis: result.analysis,
        rawOutputText: result.rawOutputText,
        provider,
        attemptedProviders,
        providerErrors: providerErrors.length > 0 ? providerErrors : undefined,
        usage: buildProviderUsage(provider, result.usage),
      });
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : `Erreur ${provider} inconnue`;
      console.error(`[meal-analysis] ${provider} error:`, message);
      providerErrors.push({
        provider,
        reason: "call_failed",
        message,
      });
    }
  }

  const allMissingKeys =
    providerErrors.length > 0 &&
    providerErrors.every((providerError) => providerError.reason === "missing_api_key");
  const allBudgetExceeded =
    providerErrors.length > 0 &&
    providerErrors.every((providerError) => providerError.reason === "budget_exceeded");

  if (allMissingKeys) {
    res.status(500).json({
      error: "Aucune clé API IA disponible (OpenAI/Gemini).",
      attemptedProviders,
      providerErrors,
    });
    return;
  }

  if (allBudgetExceeded) {
    res.status(429).json({
      error: "Tous les providers IA ont épuisé leur budget de tokens.",
      attemptedProviders,
      providerErrors,
    });
    return;
  }

  res.status(502).json({
    error: "Échec de l'appel IA sur tous les providers disponibles.",
    attemptedProviders,
    providerErrors,
  });
}
