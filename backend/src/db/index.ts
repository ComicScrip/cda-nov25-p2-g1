import { DataSource } from "typeorm";
import { Dish } from "../entities/Dish";
import { Dish_Ingredient } from "../entities/Dish_Ingredient";
import { Ingredient } from "../entities/Ingredient";
import { Meal } from "../entities/Meal";
import { Nutritional_Analysis } from "../entities/Nutritional_Analysis";
import { Pathology } from "../entities/Pathology";
import { Recipe } from "../entities/Recipe";
import { Recipe_Ingredient } from "../entities/Recipe_Ingredient";
import { User } from "../entities/User";
import { User_profile } from "../entities/User_Profile";
import { User_Recipe } from "../entities/User_Recipe";
import { Weight_Measure } from "../entities/Weight_Measure";
import env from "../env";

export default new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  username: env.DB_USER,
  password: env.DB_PASS,
  port: env.DB_PORT,
  database: env.DB_NAME,
  entities: [
    User,
    User_profile,
    Weight_Measure,
    Pathology,
    Dish,
    Dish_Ingredient,
    Ingredient,
    Meal,
    Nutritional_Analysis,
    Recipe,
    Recipe_Ingredient,
    User_Recipe,
  ],
  synchronize: env.NODE_ENV !== "production",
  //logging: true
});
