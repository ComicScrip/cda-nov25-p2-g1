import { clearDB } from "../clear";
import db from "../index";
import { seedAnalysis } from "./seed-analysis";
import { seedDishes } from "./seed-dish";
import { seedIngredients } from "./seed-ingredient";
import { seedMeals } from "./seed-meal";
import { seedPathologies } from "./seed-pathology";
import { seedProfiles } from "./seed-profile";
import { seedRecipes } from "./seed-recipe";
import { seedUsers } from "./seed-user";
import { seedWeights } from "./seed-weight";

export async function runSeeds() {
  await db.initialize();
  await clearDB();

  console.log("Seeding users...");
  const users = await seedUsers();

  console.log("Seeding pathologies...");
  const pathologies = await seedPathologies();

  console.log("Seeding profiles...");
  const profiles = await seedProfiles(users, pathologies);

  console.log("Seeding ingredients...");
  await seedIngredients();

  console.log("Seeding meals...");
  const meals = await seedMeals(users);

  console.log("Seeding analysis...");
  const analysis = await seedAnalysis();

  console.log("Seeding dishes...");
  await seedDishes(meals, analysis);

  console.log("Seeding recipes...");
  await seedRecipes();

  console.log("Seeding weights...");
  await seedWeights(profiles);

  console.log("Seeding completed ✅");

  await db.destroy();
}
