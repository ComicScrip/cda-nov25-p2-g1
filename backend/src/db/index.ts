import { DataSource } from "typeorm";
import { Dish } from "../entities/Dish";
import { DishIngredient } from "../entities/DishIngredient";
import { Ingredient } from "../entities/Ingredient";
import { Meal } from "../entities/Meal";
import { NutritionalAnalysis } from "../entities/NutritionalAnalysis";
import { Recipe } from "../entities/Recipe";
import { RecipeIngredient } from "../entities/RecipeIngredient";
import { UserRecipe } from "../entities/UserRecipe";
import env from "../env";

export default new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  username: env.DB_USER,
  password: env.DB_PASS,
  port: env.DB_PORT,
  database: env.DB_NAME,
  entities: [
    Dish,
    DishIngredient,
    Ingredient,
    Meal,
    NutritionalAnalysis,
    Recipe,
    RecipeIngredient,
    UserRecipe,
  ],
  synchronize: env.NODE_ENV !== "production",
  //logging: true
});
