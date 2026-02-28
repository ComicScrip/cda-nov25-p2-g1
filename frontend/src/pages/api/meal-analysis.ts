import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { parseScannerAnalysisResponse } from "@/lib/scannerAnalysis";

type MealAnalysisRequestBody = {
  prompt?: unknown;
  imageUrl?: unknown;
  model?: unknown;
};

type MealAnalysisSuccessResponse = {
  analysis: ReturnType<typeof parseScannerAnalysisResponse> extends infer T
    ? Exclude<T, null>
    : never;
  rawOutputText?: string;
};

type MealAnalysisErrorResponse = {
  error: string;
  details?: string;
};

const DEFAULT_MODEL = "gpt-5.2";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isSupportedImageInput = (value: string): boolean => {
  return (
    value.startsWith("data:image/") || value.startsWith("http://") || value.startsWith("https://")
  );
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

  const apiKey = process.env.OPENAI_API_KEY ?? process.env.api_key;
  if (!apiKey) {
    res.status(500).json({ error: "OPENAI_API_KEY manquant dans le serveur Next (.env)." });
    return;
  }

  const body = req.body as MealAnalysisRequestBody;
  if (!isRecord(body)) {
    res.status(400).json({ error: "Body JSON invalide." });
    return;
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const model =
    typeof body.model === "string" && body.model.trim()
      ? body.model.trim()
      : process.env.OPENAI_MEAL_SCAN_MODEL || DEFAULT_MODEL;

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

  try {
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
      res.status(502).json({
        error: "La réponse OpenAI ne contient pas de texte exploitable.",
      });
      return;
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(extractJsonCandidate(rawOutputText));
    } catch {
      res.status(502).json({
        error: "Le modèle a répondu, mais pas en JSON valide.",
        details: rawOutputText.slice(0, 500),
      });
      return;
    }

    const analysis = parseScannerAnalysisResponse(parsed);
    if (!analysis) {
      res.status(502).json({
        error: "Le JSON retourné par le modèle n'a pas le format attendu.",
      });
      return;
    }

    res.status(200).json({
      analysis,
      rawOutputText,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur OpenAI inconnue";
    console.error("[meal-analysis] OpenAI error:", message);
    res.status(502).json({
      error: "Échec de l'appel OpenAI.",
      details: message,
    });
  }
}
