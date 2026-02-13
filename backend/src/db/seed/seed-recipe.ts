import { MealType, Status } from "../../entities/enums";
import { Recipe } from "../../entities/Recipe";

export async function seedRecipes() {
  const recipe = await Recipe.create({
    title: "Poulet Riz Healthy",
    description: "Recette simple et équilibrée",
    instructions: "Cuire le riz, griller le poulet, assembler.",
    preparationTime: 15,
    cookingTime: 20,
    servings: 2,
    difficultyLevel: "Facile",
    status: Status.Publie,
    mealType: MealType.Dejeuner,
    chefTips: "Ajouter des herbes fraîches",
    caloriesPerServing: 550,
    proteinsPerServing: 40,
    carbohydratesPerServing: 60,
    lipidsPerServing: 15,
    fiberPerServing: 6,
  }).save();

  return [recipe];
}
