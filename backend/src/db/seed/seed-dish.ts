import { Dish } from "../../entities/Dish";
import { AnalysisStatus, DishType } from "../../entities/enums";
import type { Meal } from "../../entities/Meal";
import type { Nutritional_Analysis } from "../../entities/Nutritional_Analysis";

export async function seedDishes(
  meals: Meal[],
  analysis: Nutritional_Analysis,
) {
  const dish = await Dish.create({
    photoUrl: "https://picsum.photos/200",
    dishType: DishType.Plat,
    analysisStatus: AnalysisStatus.Complete,
    uploadedAt: new Date(),
    meal: meals[0],
    analysis: analysis,
  }).save();

  return [dish];
}
