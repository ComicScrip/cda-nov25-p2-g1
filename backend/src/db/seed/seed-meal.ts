import { MealType } from "../../entities/enums";
import { Meal } from "../../entities/Meal";
import type { User } from "../../entities/User";

export async function seedMeals(users: User[]) {
  const meals = [];

  const meal1 = await Meal.create({
    mealType: MealType.Dejeuner,
    consumedAt: new Date(),
    user: users[0],
  }).save();

  const meal2 = await Meal.create({
    mealType: MealType.Diner,
    consumedAt: new Date(),
    user: users[1],
  }).save();

  meals.push(meal1, meal2);

  return meals;
}
