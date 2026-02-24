export type ImageSource = "fichier" | "collage" | "url" | "camera";

export type ScannerMealDraft = {
  imageUrl: string;
  source: ImageSource;
  savedAt: string;
  fileName?: string;
};

export type ScannerMealDetails = {
  dishName: string;
  mealMoment: "" | "petit_dejeuner" | "dejeuner" | "diner" | "collation";
  estimatedPortions: string;
  ingredients: string;
  notes: string;
};

export type ScannerAnalysisRequest = {
  draft: ScannerMealDraft;
  details: ScannerMealDetails;
  requestedAt: string;
};

export const SCANNER_MEAL_DRAFT_KEY = "scannerMealDraftV1";
export const SCANNER_ANALYSIS_REQUEST_KEY = "scannerMealPendingAnalysisV1";
export const SCANNER_ANALYSIS_RESPONSE_KEY = "scannerMealMockAnalysisResponseV1";
