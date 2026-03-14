export type NutritionRange = {
  min: number;
  max: number;
};

export type ScannerAnalysisResponse = {
  plats_probables: string[];
  ingredients_visibles: string[];
  portion_estimee: string;
  nutrition_estimee: {
    calories_kcal: NutritionRange;
    proteines_g: NutritionRange;
    glucides_g: NutritionRange;
    lipides_g: NutritionRange;
    fibres_g: NutritionRange;
  };
  score_sante_100: number;
  confiance_100: number;
  incertitudes: string[];
  questions_suivi: string[];
  avertissement_pathologies: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isFiniteNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
};

const isNutritionRange = (value: unknown): value is NutritionRange => {
  if (!isRecord(value)) {
    return false;
  }

  return isFiniteNumber(value.min) && isFiniteNumber(value.max);
};

export const isScannerAnalysisResponse = (value: unknown): value is ScannerAnalysisResponse => {
  if (!isRecord(value)) {
    return false;
  }

  const nutrition = value.nutrition_estimee;
  if (!isRecord(nutrition)) {
    return false;
  }

  return (
    isStringArray(value.plats_probables) &&
    isStringArray(value.ingredients_visibles) &&
    typeof value.portion_estimee === "string" &&
    isNutritionRange(nutrition.calories_kcal) &&
    isNutritionRange(nutrition.proteines_g) &&
    isNutritionRange(nutrition.glucides_g) &&
    isNutritionRange(nutrition.lipides_g) &&
    isNutritionRange(nutrition.fibres_g) &&
    isFiniteNumber(value.score_sante_100) &&
    isFiniteNumber(value.confiance_100) &&
    isStringArray(value.incertitudes) &&
    isStringArray(value.questions_suivi) &&
    isStringArray(value.avertissement_pathologies)
  );
};

export const parseScannerAnalysisResponse = (value: unknown): ScannerAnalysisResponse | null => {
  return isScannerAnalysisResponse(value) ? value : null;
};
