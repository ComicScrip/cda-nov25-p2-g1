import { Unit } from "../../entities/enums";
import { Ingredient } from "../../entities/Ingredient";

export async function seedIngredients() {
  const ingredients = await Promise.all([
    Ingredient.create({ name: "Poulet", unit: Unit.G }).save(),
    Ingredient.create({ name: "Riz", unit: Unit.G }).save(),
    Ingredient.create({ name: "Brocoli", unit: Unit.G }).save(),
    Ingredient.create({ name: "Huile d'olive", unit: Unit.Ml }).save(),
    Ingredient.create({ name: "Oeuf", unit: Unit.Pcs }).save(),
  ]);

  return ingredients;
}
