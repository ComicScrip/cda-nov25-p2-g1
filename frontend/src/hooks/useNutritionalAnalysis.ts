import { useState, useCallback } from "react";
import {
  type AnalyzeMealImageMutation,
  useAnalyzeMealImageMutation,
  useSaveMealAnalysisMutation,
  useUpdateIngredientQuantitiesMutation,
  useUpdateAnalysisCaloriesMutation,
  useUpdateDishNameMutation,
} from "@/graphql/generated/schema";
import { compressImage, validateImageFile } from "@/utils/imageCompression";

type AnalysisResult = AnalyzeMealImageMutation["analyzeMealImage"];

export function useNutritionalAnalysis() {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [savedDishId, setSavedDishId] = useState<string | null>(null);
  const [editingQuantities, setEditingQuantities] = useState(false);
  const [editingCalories, setEditingCalories] = useState(false);
  const [editedQuantities, setEditedQuantities] = useState<
    Record<string, number>
  >({});
  const [editedCalories, setEditedCalories] = useState<number | null>(null);
  const [editingDishName, setEditingDishName] = useState(false);
  const [editedDishName, setEditedDishName] = useState<string>("");

  const [analyzeMealImage, { loading: analyzing, error: analyzeError }] =
    useAnalyzeMealImageMutation();
  const [saveMealAnalysis, { loading: saving }] =
    useSaveMealAnalysisMutation();
  const [updateQuantities, { loading: updatingQuantities }] =
    useUpdateIngredientQuantitiesMutation();
  const [updateCalories, { loading: updatingCalories }] =
    useUpdateAnalysisCaloriesMutation();
  const [updateDishName, { loading: updatingDishName }] =
    useUpdateDishNameMutation();

  const handleFileChange = useCallback(
    async (file: File | null) => {
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
    },
    [],
  );

  const handleAnalyze = useCallback(async () => {
    if (!fileBase64) return;

    setAnalysis(null);
    setSavedDishId(null);
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
      // Convert edited quantities to the format expected by the mutation
      const ingredients = analysis.ingredients
        .map((ing, index) => {
          const key = `${ing.name}-${index}`;
          const quantity = editedQuantities[key];
          if (quantity !== undefined && quantity !== null && quantity > 0) {
            return {
              ingredientName: ing.name,
              quantityGrams: quantity,
            };
          }
          return null;
        })
        .filter((ing) => ing !== null) as Array<{
        ingredientName: string;
        quantityGrams: number;
      }>;

      if (ingredients.length === 0) {
        return {
          success: false,
          message: "Veuillez modifier au moins une quantité avant de sauvegarder.",
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
        // Update local analysis with new values from the server
        const updatedAnalysis = {
          ...analysis,
          ingredients: analysis.ingredients.map((ing, index) => {
            const key = `${ing.name}-${index}`;
            const newQuantity = editedQuantities[key];
            return {
              ...ing,
              estimatedQuantityGrams:
                newQuantity !== undefined && newQuantity !== null
                  ? newQuantity
                  : ing.estimatedQuantityGrams,
            };
          }),
          totalNutrition: {
            calories:
              data.updateIngredientQuantities.calories ??
              analysis.totalNutrition.calories,
            protein:
              data.updateIngredientQuantities.proteins ??
              analysis.totalNutrition.protein,
            carbs:
              data.updateIngredientQuantities.carbohydrates ??
              analysis.totalNutrition.carbs,
            fat:
              data.updateIngredientQuantities.lipids ??
              analysis.totalNutrition.fat,
            fiber:
              data.updateIngredientQuantities.fiber ??
              analysis.totalNutrition.fiber,
            sugar:
              data.updateIngredientQuantities.sugar ??
              analysis.totalNutrition.sugar,
            salt:
              data.updateIngredientQuantities.sodium ??
              analysis.totalNutrition.salt,
          },
        };
        setAnalysis(updatedAnalysis);
        setEditedQuantities({});
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
  }, [savedDishId, analysis, editedQuantities, updateQuantities]);

  const handleUpdateCalories = useCallback(async () => {
    if (!savedDishId || editedCalories === null) return;

    try {
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
              calories:
                data.updateAnalysisCalories.calories ?? editedCalories,
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
  }, [savedDishId, editedCalories, analysis, updateCalories]);

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

  return {
    // State
    filePreview,
    fileBase64,
    fileError,
    analysis,
    savedDishId,
    editingQuantities,
    editingCalories,
    editingDishName,
    editedQuantities,
    editedCalories,
    editedDishName,
    // Loading states
    analyzing,
    saving,
    updatingQuantities,
    updatingCalories,
    updatingDishName,
    analyzeError,
    // Actions
    handleFileChange,
    handleAnalyze,
    handleSaveAnalysis,
    handleUpdateQuantities,
    handleUpdateCalories,
    handleUpdateDishName,
    // State setters
    setEditingQuantities,
    setEditingCalories,
    setEditingDishName,
    setEditedQuantities,
    setEditedCalories,
    setEditedDishName,
    // Helpers
    startEditingQuantities,
    startEditingDishName,
  };
}
