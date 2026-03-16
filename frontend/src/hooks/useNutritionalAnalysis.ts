import { useCallback, useState } from "react";
import {
  type AnalyzeMealImageMutation,
  useAnalyzeMealImageMutation,
  useCoachGetDishAnalysisLazyQuery,
  useSaveMealAnalysisMutation,
  useUpdateAnalysisCaloriesMutation,
  useUpdateDishNameMutation,
  useUpdateIngredientQuantitiesMutation,
  useCreateDishFromScannerSubmissionMutation,
} from "@/graphql/generated/schema";
import type { ScannerAnalysisResponse } from "@/lib/scannerAnalysis";
import { compressImage, validateImageFile } from "@/utils/imageCompression";

type AnalysisResult = AnalyzeMealImageMutation["analyzeMealImage"];

/** Payload saved by "Save and send to coach" (scanner) */
export type ScannerCoachPayload = {
  draft?: { imageUrl?: string; source?: string; savedAt?: string };
  details?: { dishName?: string; mealMoment?: string; [key: string]: unknown };
  analysis?: ScannerAnalysisResponse;
  [key: string]: unknown;
};

function mid(range: { min: number; max: number }): number {
  return (range.min + range.max) / 2;
}

/** Converts the scanner payload into the format expected by the analysis UI (Analyse IA). */
export function mapScannerPayloadToAnalysisResult(payload: ScannerCoachPayload): AnalysisResult {
  const analysis = payload.analysis;
  const details = payload.details ?? {};
  const dishName =
    (details.dishName as string)?.trim() || analysis?.plats_probables?.[0] || "Plat scanné";
  const nut = analysis?.nutrition_estimee;
  const ingredients = (analysis?.ingredients_visibles ?? []).map((name) => ({
    name: String(name),
    estimatedQuantityGrams: undefined,
    calories: undefined,
    protein: undefined,
    carbs: undefined,
    fat: undefined,
  }));
  const totalNutrition = {
    calories: nut ? Math.round(mid(nut.calories_kcal)) : 0,
    protein: nut ? mid(nut.proteines_g) : 0,
    carbs: nut ? mid(nut.glucides_g) : 0,
    fat: nut ? mid(nut.lipides_g) : 0,
    fiber: nut ? mid(nut.fibres_g) : 0,
    sugar: undefined,
    salt: undefined,
  };
  const summaryParts = [
    ...(analysis?.incertitudes ?? []),
    ...(analysis?.questions_suivi ?? []),
    ...(analysis?.avertissement_pathologies ?? []),
  ].filter(Boolean);
  return {
    dishName,
    ingredients,
    totalNutrition,
    analysisSummary:
      summaryParts.length > 0 ? summaryParts.join("\n") : "Analyse issue du scan (page repas).",
    healthScore: analysis?.score_sante_100 ?? 0,
    warnings: analysis?.avertissement_pathologies ?? [],
    mealType: (details.mealMoment as string) || undefined,
  };
}

export function useNutritionalAnalysis() {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [savedDishId, setSavedDishId] = useState<string | null>(null);
  const [scannerSubmissionId, setScannerSubmissionId] = useState<string | null>(null);
  const [editingQuantities, setEditingQuantities] = useState(false);
  const [editedQuantities, setEditedQuantities] = useState<Record<string, number>>({});
  const [editedIngredientNames, setEditedIngredientNames] = useState<Record<string, string>>({});
  const [extraIngredients, setExtraIngredients] = useState<
    Array<{ id: string; name: string; quantityGrams: number }>
  >([]);
  const [editingCalories, setEditingCalories] = useState(false);
  const [editedCalories, setEditedCalories] = useState<number | null>(null);
  const [editingDishName, setEditingDishName] = useState(false);
  const [editedDishName, setEditedDishName] = useState<string>("");

  const [analyzeMealImage, { loading: analyzing, error: analyzeError }] =
    useAnalyzeMealImageMutation();
  const [saveMealAnalysis, { loading: saving }] = useSaveMealAnalysisMutation();
  const [updateQuantities, { loading: updatingQuantities }] =
    useUpdateIngredientQuantitiesMutation();
  const [updateCalories, { loading: updatingCalories }] = useUpdateAnalysisCaloriesMutation();
  const [createDishFromScanner, { loading: creatingDishFromScanner }] =
    useCreateDishFromScannerSubmissionMutation();
  const [updateDishName, { loading: updatingDishName }] = useUpdateDishNameMutation();
  const [fetchCoachDishAnalysis, { loading: loadingCoachDish }] =
    useCoachGetDishAnalysisLazyQuery();

  const handleFileChange = useCallback(async (file: File | null) => {
    if (!file) return;

    // Clear previous errors and analysis when changing image
    setFileError(null);
    setAnalysis(null);
    setSavedDishId(null);

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      setFileError(validationError);
      return;
    }

    try {
      // Compress image before storing
      const { base64, mimeType } = await compressImage(file);

      // Create preview data URL
      const previewDataUrl = `data:${mimeType};base64,${base64}`;
      setFilePreview(previewDataUrl);
      setFileMime(mimeType);
      setFileBase64(base64);
      setFileError(null);
    } catch (error) {
      console.error("Error compressing image:", error);
      setFileError(
        "Erreur lors du traitement de l'image. Veuillez réessayer avec une autre image.",
      );
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!fileBase64) return;

    setAnalysis(null);
    setSavedDishId(null);
    setEditedQuantities({});
    setEditedIngredientNames({});
    setExtraIngredients([]);
    try {
      const { data } = await analyzeMealImage({
        variables: {
          input: {
            imageBase64: fileBase64,
            mimeType: fileMime ?? undefined,
          },
        },
      });

      if (data?.analyzeMealImage) {
        setAnalysis(data.analyzeMealImage);
      }
    } catch (err) {
      console.error("Failed to analyze meal image:", err);
    }
  }, [fileBase64, fileMime, analyzeMealImage]);

  const handleSaveAnalysis = useCallback(async () => {
    if (!analysis || !fileBase64) return;

    try {
      const { data } = await saveMealAnalysis({
        variables: {
          input: {
            imageBase64: fileBase64,
            mimeType: fileMime ?? undefined,
            dishName: analysis.dishName,
            ingredients: analysis.ingredients.map((ing) => ({
              name: ing.name,
              estimatedQuantityGrams: ing.estimatedQuantityGrams,
              calories: ing.calories,
              protein: ing.protein,
              carbs: ing.carbs,
              fat: ing.fat,
            })),
            totalNutrition: {
              calories: analysis.totalNutrition.calories,
              protein: analysis.totalNutrition.protein,
              carbs: analysis.totalNutrition.carbs,
              fat: analysis.totalNutrition.fat,
              fiber: analysis.totalNutrition.fiber,
              sugar: analysis.totalNutrition.sugar,
              salt: analysis.totalNutrition.salt,
            },
            analysisSummary: analysis.analysisSummary,
            healthScore: analysis.healthScore,
            warnings: analysis.warnings,
            mealType: analysis.mealType,
          },
        },
      });

      if (data?.saveMealAnalysis) {
        setSavedDishId(data.saveMealAnalysis);
        return { success: true, message: "Analyse sauvegardée avec succès !" };
      }
    } catch (err) {
      console.error("Failed to save analysis:", err);
      return {
        success: false,
        message: "Erreur lors de la sauvegarde de l'analyse.",
      };
    }
  }, [analysis, fileBase64, fileMime, saveMealAnalysis]);

  const handleUpdateQuantities = useCallback(async () => {
    if (!savedDishId || !analysis) return;

    try {
      // Build the full list of ingredients (existing + newly added)
      const ingredients: Array<{ ingredientName: string; quantityGrams: number }> = [];

      analysis.ingredients.forEach((ing, index) => {
        const key = `${ing.name}-${index}`;
        const baseQuantity = editedQuantities[key] ?? ing.estimatedQuantityGrams ?? 0;
        const editedName = editedIngredientNames[key]?.trim();

        if (!editedName || editedName === ing.name) {
          if (baseQuantity > 0) {
            ingredients.push({
              ingredientName: ing.name,
              quantityGrams: baseQuantity,
            });
          }
        } else {
          // Renaming: set the old ingredient to 0 and add the new one with the chosen quantity
          ingredients.push({
            ingredientName: ing.name,
            quantityGrams: 0,
          });
          if (baseQuantity > 0) {
            ingredients.push({
              ingredientName: editedName,
              quantityGrams: baseQuantity,
            });
          }
        }
      });

      for (const extra of extraIngredients) {
        const name = extra.name.trim();
        if (name && extra.quantityGrams > 0) {
          ingredients.push({
            ingredientName: name,
            quantityGrams: extra.quantityGrams,
          });
        }
      }

      if (ingredients.length === 0) {
        return {
          success: false,
          message:
            "Veuillez modifier au moins un ingrédient (nom ou quantité) avant de sauvegarder.",
        };
      }

      const { data } = await updateQuantities({
        variables: {
          input: {
            dishId: savedDishId,
            ingredients,
          },
        },
      });

      if (data?.updateIngredientQuantities) {
        // Update local analysis with the new names / quantities and the recalculated nutrition
        const updatedAnalysis = {
          ...analysis,
          ingredients: [
            ...analysis.ingredients.map((ing, index) => {
              const key = `${ing.name}-${index}`;
              const newQuantity = editedQuantities[key];
              const newName = editedIngredientNames[key]?.trim();
              const finalName = newName && newName.length > 0 ? newName : ing.name;
              return {
                ...ing,
                name: finalName,
                estimatedQuantityGrams:
                  newQuantity !== undefined && newQuantity !== null
                    ? newQuantity
                    : ing.estimatedQuantityGrams,
              };
            }),
            ...extraIngredients
              .filter((extra) => extra.name.trim() && extra.quantityGrams > 0)
              .map((extra) => ({
                name: extra.name.trim(),
                estimatedQuantityGrams: extra.quantityGrams,
                calories: undefined,
                protein: undefined,
                carbs: undefined,
                fat: undefined,
              })),
          ],
          totalNutrition: {
            calories: data.updateIngredientQuantities.calories ?? analysis.totalNutrition.calories,
            protein: data.updateIngredientQuantities.proteins ?? analysis.totalNutrition.protein,
            carbs: data.updateIngredientQuantities.carbohydrates ?? analysis.totalNutrition.carbs,
            fat: data.updateIngredientQuantities.lipids ?? analysis.totalNutrition.fat,
            fiber: data.updateIngredientQuantities.fiber ?? analysis.totalNutrition.fiber,
            sugar: data.updateIngredientQuantities.sugar ?? analysis.totalNutrition.sugar,
            salt: data.updateIngredientQuantities.sodium ?? analysis.totalNutrition.salt,
          },
        };
        setAnalysis(updatedAnalysis);
        setEditedQuantities({});
        setEditedIngredientNames({});
        setExtraIngredients([]);
        setEditingQuantities(false);
        return {
          success: true,
          message: "Quantités mises à jour et valeurs recalculées !",
        };
      }
    } catch (err) {
      console.error("Failed to update quantities:", err);
      return {
        success: false,
        message: "Erreur lors de la mise à jour des quantités.",
      };
    }
  }, [
    savedDishId,
    analysis,
    editedQuantities,
    editedIngredientNames,
    extraIngredients,
    updateQuantities,
  ]);

  const handleUpdateCalories = useCallback(async () => {
    if (editedCalories === null) return;

    try {
      if (scannerSubmissionId) {
        const { data } = await createDishFromScanner({
          variables: {
            input: {
              submissionId: scannerSubmissionId,
              calories: editedCalories,
            },
          },
        });
        const dishId = data?.createDishFromScannerSubmission;
        if (dishId) {
          setSavedDishId(dishId);
          setScannerSubmissionId(null);
          if (analysis) {
            setAnalysis({
              ...analysis,
              totalNutrition: {
                ...analysis.totalNutrition,
                calories: editedCalories,
              },
            });
          }
          setEditingCalories(false);
          return {
            success: true,
            message:
              "Repas créé en base et calories enregistrées. Vous pouvez modifier à nouveau les calories si besoin.",
          };
        }
        return {
          success: false,
          message: "Erreur lors de la création du repas à partir de la soumission.",
        };
      }

      if (!savedDishId) return;

      const { data } = await updateCalories({
        variables: {
          input: {
            analysisId: savedDishId,
            calories: editedCalories,
          },
        },
      });

      if (data?.updateAnalysisCalories) {
        if (analysis) {
          setAnalysis({
            ...analysis,
            totalNutrition: {
              ...analysis.totalNutrition,
              calories: data.updateAnalysisCalories.calories ?? editedCalories,
            },
          });
        }
        setEditingCalories(false);
        return {
          success: true,
          message: "Calories mises à jour et sauvegardées !",
        };
      }
    } catch (err) {
      console.error("Failed to update calories:", err);
      return {
        success: false,
        message: "Erreur lors de la mise à jour des calories.",
      };
    }
  }, [
    savedDishId,
    scannerSubmissionId,
    editedCalories,
    analysis,
    updateCalories,
    createDishFromScanner,
  ]);

  const handleUpdateDishName = useCallback(async () => {
    if (!savedDishId || !editedDishName.trim()) return;

    try {
      const { data } = await updateDishName({
        variables: {
          input: {
            dishId: savedDishId,
            dishName: editedDishName.trim(),
          },
        },
      });

      if (data?.updateDishName) {
        if (analysis) {
          setAnalysis({
            ...analysis,
            dishName: data.updateDishName,
          });
        }
        setEditingDishName(false);
        return {
          success: true,
          message: "Nom du plat mis à jour !",
        };
      }
    } catch (err) {
      console.error("Failed to update dish name:", err);
      return {
        success: false,
        message: "Erreur lors de la mise à jour du nom du plat.",
      };
    }
  }, [savedDishId, editedDishName, analysis, updateDishName]);

  const startEditingQuantities = useCallback(() => {
    if (!analysis) return;
    const initial: Record<string, number> = {};
    analysis.ingredients.forEach((ing, idx) => {
      const key = `${ing.name}-${idx}`;
      initial[key] = ing.estimatedQuantityGrams ?? 0;
    });
    setEditedQuantities(initial);
    setEditingQuantities(true);
  }, [analysis]);

  const startEditingDishName = useCallback(() => {
    if (!analysis) return;
    setEditedDishName(analysis.dishName);
    setEditingDishName(true);
  }, [analysis]);

  const loadCoachDishAnalysis = useCallback(
    async (dishId: string): Promise<{ success: boolean; message: string }> => {
      try {
        const { data } = await fetchCoachDishAnalysis({ variables: { dishId } });
        const d = data?.coachGetDishAnalysis;
        if (!d) return { success: false, message: "Analyse introuvable." };

        const mapped: AnalysisResult = {
          dishName: d.dishName,
          ingredients: d.ingredients.map((ing) => ({
            name: ing.name,
            estimatedQuantityGrams: ing.estimatedQuantityGrams ?? undefined,
            calories: ing.calories ?? undefined,
            protein: ing.protein ?? undefined,
            carbs: ing.carbs ?? undefined,
            fat: ing.fat ?? undefined,
          })),
          totalNutrition: {
            calories: d.totalNutrition.calories ?? undefined,
            protein: d.totalNutrition.protein ?? undefined,
            carbs: d.totalNutrition.carbs ?? undefined,
            fat: d.totalNutrition.fat ?? undefined,
            fiber: d.totalNutrition.fiber ?? undefined,
            sugar: d.totalNutrition.sugar ?? undefined,
            salt: d.totalNutrition.salt ?? undefined,
          },
          analysisSummary: d.analysisSummary,
          healthScore: d.healthScore,
          warnings: d.warnings,
          mealType: d.mealType ?? undefined,
        };
        setAnalysis(mapped);
        setSavedDishId(d.dishId);
        setScannerSubmissionId(null);
        setFilePreview(
          d.photoUrl ||
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f1f5ee' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='12'%3EPlat chargé%3C/text%3E%3C/svg%3E",
        );
        setFileError(null);
        return { success: true, message: "Analyse chargée. Vous pouvez modifier les calories." };
      } catch (err) {
        console.error("Failed to load coach dish analysis:", err);
        return {
          success: false,
          message: "Impossible de charger l'analyse. Vérifiez vos droits.",
        };
      }
    },
    [fetchCoachDishAnalysis],
  );

  const loadFromScannerPayload = useCallback(
    (payload: ScannerCoachPayload, submissionId?: string) => {
      const mapped = mapScannerPayloadToAnalysisResult(payload);
      setAnalysis(mapped);
      setSavedDishId(null);
      setScannerSubmissionId(submissionId ?? null);
      const imageUrl = typeof payload.draft?.imageUrl === "string" ? payload.draft.imageUrl : null;
      setFilePreview(
        imageUrl ||
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f1f5ee' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='12'%3ESoumission scanner%3C/text%3E%3C/svg%3E",
      );
      setFileBase64(null);
      setFileMime(null);
      setFileError(null);
    },
    [],
  );

  return {
    // State
    filePreview,
    fileBase64,
    fileError,
    analysis,
    savedDishId,
    scannerSubmissionId,
    editingQuantities,
    editedQuantities,
    editedIngredientNames,
    extraIngredients,
    editingCalories,
    editingDishName,
    editedCalories,
    editedDishName,
    // Loading states
    analyzing,
    saving,
    updatingQuantities,
    updatingCalories,
    creatingDishFromScanner,
    updatingDishName,
    loadingCoachDish,
    analyzeError,
    // Actions
    handleFileChange,
    loadCoachDishAnalysis,
    handleAnalyze,
    handleSaveAnalysis,
    handleUpdateQuantities,
    handleUpdateCalories,
    handleUpdateDishName,
    loadFromScannerPayload,
    // State setters
    setEditingQuantities,
    setEditingCalories,
    setEditingDishName,
    setEditedQuantities,
    setEditedIngredientNames,
    setExtraIngredients,
    setEditedCalories,
    setEditedDishName,
    // Helpers
    startEditingQuantities,
    startEditingDishName,
  };
}
