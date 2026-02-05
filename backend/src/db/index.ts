import { DataSource } from "typeorm";
import { Dish } from "../entities/Dish";
import { DishIngredient } from "../entities/DishIngredient";
import { Ingredient } from "../entities/Ingredient";
import { Meal } from "../entities/Meal";
import { NutritionalAnalysis } from "../entities/NutritionalAnalysis";
import { Pathology } from "../entities/Pathology";
import { Recipe } from "../entities/Recipe";
import { RecipeIngredient } from "../entities/RecipeIngredient";
import { User } from "../entities/User";
import { User_profile } from "../entities/User_profile";
import { UserRecipe } from "../entities/UserRecipe";
import { Weight_measure } from "../entities/Weight_measure";
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
    Pathology,
    Recipe,
    RecipeIngredient,
    User,
    User_profile,
    UserRecipe,
    Weight_measure,
  ],
  synchronize: env.NODE_ENV !== "production",
  //logging: true
});
