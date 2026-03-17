import { Status } from "../../entities/enums";
import { Nutritional_Analysis } from "../../entities/Nutritional_Analysis";

export async function seedAnalysis() {
  const analysis = await Nutritional_Analysis.create({
    calories: 650,
    proteins: 45,
    carbohydrates: 70,
    lipids: 20,
    fiber: 8,
    sugar: 5,
    sodium: 0.9,
    confidenceScore: 0.92,
    mealHealthScore: 78,
    rating: 4,
    status: Status.Publie,
    warnings: "Teneur en sodium légèrement élevée",
    suggestions: "Réduire le sel ajouté",
  }).save();

  return analysis;
}
