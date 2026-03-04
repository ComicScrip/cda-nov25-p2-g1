import { faker } from "@faker-js/faker";
import { hash } from "argon2";
import type { EntityManager } from "typeorm";

import { Dish } from "../../entities/Dish";
import { Dish_Ingredient } from "../../entities/Dish_Ingredient";
import {
  AnalysisStatus,
  DishType,
  MealType,
  Status,
  Unit,
} from "../../entities/enums";
import { Ingredient } from "../../entities/Ingredient";
import { Meal } from "../../entities/Meal";
import { Nutritional_Analysis } from "../../entities/Nutritional_Analysis";
import { Pathology } from "../../entities/Pathology";
import { Recipe } from "../../entities/Recipe";
import { Recipe_Ingredient } from "../../entities/Recipe_Ingredient";
import { User, UserRole } from "../../entities/User";
import { User_profile } from "../../entities/User_Profile";
import { User_Recipe } from "../../entities/User_Recipe";
import { Weight_Measure } from "../../entities/Weight_Measure";

type SeedMassiveOptions = {
  usersCount: number; // 100
  days: number; // 90
  recipesCount: number; // ex: 250
  maxMealsPerDay: number; // ex: 4
};

const FIXED_COACH_EMAIL = "coach@app.com";
const FIXED_COACH_PASSWORD = "SuperP@ssW0rd!";

const DEFAULT_OPTS: SeedMassiveOptions = {
  usersCount: 100,
  days: 90,
  recipesCount: 250,
  maxMealsPerDay: 4,
};

const MEAL_TIME_SLOTS = [
  { mealType: MealType.PetitDejeuner, hour: 7, minute: 30 },
  { mealType: MealType.Dejeuner, hour: 12, minute: 30 },
  { mealType: MealType.Collation, hour: 16, minute: 0 },
  { mealType: MealType.Diner, hour: 19, minute: 30 },
] as const;

function unsplashFoodUrl(kind: "meal" | "dish" | "recipe") {
  // URL simple, “realistic food images” sans API key.
  // Le param "sig" aide à varier les images.
  const sig = faker.number.int({ min: 1, max: 10_000_000 });
  const query =
    kind === "recipe"
      ? "food,recipe"
      : kind === "meal"
        ? "food,meal"
        : "food,dish";
  return `https://source.unsplash.com/featured/800x800?${encodeURIComponent(query)}&sig=${sig}`;
}

function randEnum<T extends Record<string, string>>(e: T): T[keyof T] {
  return faker.helpers.arrayElement(Object.values(e)) as T[keyof T];
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getSeedAnchorDate() {
  const anchor = new Date();
  anchor.setHours(0, 0, 0, 0);
  anchor.setDate(anchor.getDate() - 1);
  return anchor;
}

function buildMealDate(baseDate: Date, hour: number, minute: number) {
  const mealDate = new Date(baseDate);
  mealDate.setHours(hour, minute, 0, 0);
  return mealDate;
}

function normalizeEmailPart(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .replace(/\.{2,}/g, ".");
}

function buildCoherentUserEmail(
  firstName: string,
  lastName: string,
  usedEmails: Set<string>,
) {
  const normalizedFirstName = normalizeEmailPart(firstName) || "user";
  const normalizedLastName = normalizeEmailPart(lastName) || "profile";

  let email = "";

  do {
    const suffix = faker.number.int({ min: 10, max: 99 });
    email = `${normalizedFirstName}.${normalizedLastName}${suffix}@app.com`;
  } while (email === FIXED_COACH_EMAIL || usedEmails.has(email));

  usedEmails.add(email);
  return email;
}

async function seedWeightMeasures(
  manager: EntityManager,
  profile: User_profile,
  days: number,
) {
  const measures: Weight_Measure[] = [];
  const startWeight = faker.number.float({
    min: 55,
    max: 110,
    fractionDigits: 1,
  });
  const trend = faker.helpers.arrayElement(["loss", "gain", "stable"]) as
    | "loss"
    | "gain"
    | "stable";
  const weeklyDelta =
    trend === "loss"
      ? faker.number.float({ min: -0.6, max: -0.1, fractionDigits: 2 })
      : trend === "gain"
        ? faker.number.float({ min: 0.1, max: 0.6, fractionDigits: 2 })
        : faker.number.float({ min: -0.1, max: 0.1, fractionDigits: 2 });

  let current = startWeight;

  for (let d = days; d >= 0; d--) {
    const date = faker.date.recent({ days });
    const shouldMeasure = faker.number.int({ min: 1, max: 7 }) <= 2;
    if (!shouldMeasure) continue;

    current =
      current +
      weeklyDelta / 7 +
      faker.number.float({ min: -0.15, max: 0.15, fractionDigits: 2 });
    current = clamp(Number(current.toFixed(1)), 40, 160);

    measures.push(
      Weight_Measure.create({
        measured_at: date as any,
        weight: current as any,
        user_profile: profile as any,
      } as any),
    );
  }

  const chunkSize = 300;
  for (let j = 0; j < measures.length; j += chunkSize) {
    await manager.save(measures.slice(j, j + chunkSize));
  }
}

async function enforceSingleCoachSeed(
  manager: EntityManager,
  coachUser: User,
) {
  await manager.query(
    `
      UPDATE users
      SET role = $2,
          coach_id = $1
      WHERE id <> $1
        AND role = $3
    `,
    [coachUser.id, UserRole.Coachee, UserRole.Coach],
  );

  await manager.query(
    `
      UPDATE users
      SET coach_id = $1
      WHERE id <> $1
        AND role = $2
        AND (coach_id IS NULL OR coach_id <> $1)
    `,
    [coachUser.id, UserRole.Coachee],
  );

  const roleRows = (await manager.query(
    `
      SELECT role, COUNT(*)::text AS count
      FROM users
      GROUP BY role
    `,
  )) as Array<{ role: UserRole; count: string }>;

  const coachCount = Number(
    roleRows.find((row) => row.role === UserRole.Coach)?.count ?? "0",
  );

  if (coachCount !== 1) {
    throw new Error(
      `seed:massive must create exactly one coach, found ${coachCount}`,
    );
  }
}

/**
 * Génère une analyse nutritionnelle cohérente (ordre de grandeur plausible).
 * calories ≈ 4*(prot+carbs) + 9*lipids + bonus
 */
function generateNutrition() {
  const proteins = faker.number.int({ min: 10, max: 60 });
  const carbohydrates = faker.number.int({ min: 20, max: 130 });
  const lipids = faker.number.int({ min: 5, max: 50 });
  const fiber = faker.number.int({ min: 0, max: 18 });
  const sugar = faker.number.int({ min: 0, max: 30 });
  const sodium = Number(
    faker.number.float({ min: 0.2, max: 2.2, fractionDigits: 2 }),
  );
  const baseCalories = 4 * (proteins + carbohydrates) + 9 * lipids;
  const calories = clamp(
    Math.round(baseCalories + faker.number.int({ min: -80, max: 120 })),
    180,
    1200,
  );

  // Health score simple : pénalise sucres/sodium, bonus fibre/protéines (approx)
  const scoreRaw = 75 + fiber * 1.0 + proteins * 0.2 - sugar * 0.6 - sodium * 8;
  const mealHealthScore = clamp(Math.round(scoreRaw), 35, 95);

  return {
    calories,
    proteins,
    carbohydrates,
    lipids,
    fiber,
    sugar,
    sodium,
    confidenceScore: Number(
      faker.number.float({ min: 0.72, max: 0.99, fractionDigits: 2 }),
    ),
    mealHealthScore,
    rating: clamp(Math.round(mealHealthScore / 20), 1, 5),
    status: Status.Publie,
    warnings: mealHealthScore < 55 ? "High sugar/sodium detected" : null,
    suggestions:
      mealHealthScore < 55 ? "Reduce salt/sugar; add vegetables" : null,
  };
}

async function seedReferenceData(manager: EntityManager) {
  // Pathologies
  const pathologyNames = [
    "Diabetes",
    "Hypertension",
    "Gluten intolerance",
    "Lactose intolerance",
    "Hypercholesterolemia",
    "Obesity",
    "Gout",
  ];

  const pathologies = await Promise.all(
    pathologyNames.map((name) => manager.save(Pathology.create({ name }))),
  );

  // Ingredients
  const ingredientsPayload = [
    { name: "Chicken breast", unit: Unit.G },
    { name: "Rice", unit: Unit.G },
    { name: "Broccoli", unit: Unit.G },
    { name: "Olive oil", unit: Unit.Ml },
    { name: "Egg", unit: Unit.Pcs },
    { name: "Tomato", unit: Unit.G },
    { name: "Salmon", unit: Unit.G },
    { name: "Pasta", unit: Unit.G },
    { name: "Cheese", unit: Unit.G },
    { name: "Yogurt", unit: Unit.G },
    { name: "Apple", unit: Unit.G },
    { name: "Banana", unit: Unit.G },
    { name: "Oats", unit: Unit.G },
    { name: "Avocado", unit: Unit.G },
    { name: "Potato", unit: Unit.G },
    { name: "Carrot", unit: Unit.G },
  ];

  const ingredients = await Promise.all(
    ingredientsPayload.map((i) => manager.save(Ingredient.create(i))),
  );

  return { pathologies, ingredients };
}

async function seedRecipes(
  manager: EntityManager,
  ingredients: Ingredient[],
  count: number,
) {
  const recipes: Recipe[] = [];
  const recipeIngredients: Recipe_Ingredient[] = [];

  for (let i = 0; i < count; i++) {
    const title = faker.helpers.arrayElement([
      "Healthy Bowl",
      "Protein Plate",
      "Mediterranean Salad",
      "Grilled Chicken & Veggies",
      "Salmon & Rice",
      "Veggie Pasta",
      "Overnight Oats",
      "Avocado Toast",
    ]);

    const recipe = await manager.save(
      Recipe.create({
        title: `${title} #${i + 1}`,
        description: faker.lorem.sentence(),
        instructions: faker.lorem.paragraph(),
        preparationTime: faker.number.int({ min: 5, max: 30 }),
        cookingTime: faker.number.int({ min: 5, max: 45 }),
        servings: faker.number.int({ min: 1, max: 6 }),
        difficultyLevel: faker.helpers.arrayElement(["Easy", "Medium", "Hard"]),
        status: Status.Publie,
        mealType: randEnum(MealType),
        chefTips: faker.lorem.sentence(),
        photoUrl: unsplashFoodUrl("recipe") as any, // si tu ajoutes un champ photoUrl à Recipe plus tard
      }) as any,
    );
    recipes.push(recipe);

    const ingredientCount = faker.number.int({ min: 8, max: 14 });
    const picked = faker.helpers.arrayElements(ingredients, ingredientCount);

    for (const ing of picked) {
      recipeIngredients.push(
        Recipe_Ingredient.create({
          recipe,
          ingredient: ing,
          quantity: faker.number.int({ min: 10, max: 250 }),
          unit: ing.unit ?? randEnum(Unit),
        }),
      );
    }
  }

  // batch insert des pivots recettes
  // (TypeORM insert accepte des objets simples ; ici on reste sur save par chunks)
  const chunkSize = 500;
  for (let i = 0; i < recipeIngredients.length; i += chunkSize) {
    await manager.save(recipeIngredients.slice(i, i + chunkSize));
  }

  return recipes;
}

async function seedUsersProfilesWeights(
  manager: EntityManager,
  pathologies: Pathology[],
  days: number,
  count: number,
) {
  const users: User[] = [];
  const profiles: User_profile[] = [];
  const totalUsers = Math.max(1, count);
  const usedEmails = new Set<string>([FIXED_COACH_EMAIL]);

  const hashedCoachPassword = await hash(FIXED_COACH_PASSWORD);
  const coachLastLoginAt = faker.date.recent({ days: 10 });

  await manager.upsert(
    User,
    {
      email: FIXED_COACH_EMAIL,
      hashedPassword: hashedCoachPassword,
      role: UserRole.Coach,
      last_login_at: coachLastLoginAt,
      coach: null,
    },
    ["email"],
  );

  const coachUser = await manager.findOneByOrFail(User, {
    email: FIXED_COACH_EMAIL,
  });
  users.push(coachUser);

  let coachProfile =
    (await manager.findOne(User_profile, {
      where: { user: { id: coachUser.id } },
      relations: {
        user: true,
        pathologies: true,
      },
    })) ?? null;

  if (!coachProfile) {
    coachProfile = await manager.save(
      User_profile.create({
        first_name: "Coach",
        last_name: "Demo",
        date_of_birth: new Date("1988-06-12") as any,
        gender: "femme" as any,
        height: 1.72 as any,
        goal: "Accompagner les utilisateurs MyDietChef au quotidien." as any,
        user: coachUser,
        pathologies: [],
      } as any),
    );
  } else {
    coachProfile.first_name = "Coach";
    coachProfile.last_name = "Demo";
    coachProfile.date_of_birth = new Date("1988-06-12") as any;
    coachProfile.gender = "femme" as any;
    coachProfile.height = 1.72 as any;
    coachProfile.goal =
      "Accompagner les utilisateurs MyDietChef au quotidien." as any;
    coachProfile.user = coachUser;
    coachProfile.pathologies = [];
    coachProfile = await manager.save(coachProfile);
  }
  const ensuredCoachProfile = coachProfile as User_profile;
  profiles.push(ensuredCoachProfile);
  await seedWeightMeasures(manager, ensuredCoachProfile, days);

  for (let i = 1; i < totalUsers; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = buildCoherentUserEmail(firstName, lastName, usedEmails);
    const role = UserRole.Coachee;

    const user = await manager.save(
      User.create({
        email,
        hashedPassword: await hash("SuperP@ssW0rd!"),
        role,
        coach: role === UserRole.Coachee ? coachUser : null,
        last_login_at: faker.date.recent({ days: 10 }),
      }),
    );
    users.push(user);

    const profile = await manager.save(
      User_profile.create({
        first_name: firstName,
        last_name: lastName,
        date_of_birth: faker.date.birthdate({
          min: 1950,
          max: 2007,
          mode: "year",
        }) as any,
        gender: faker.helpers.arrayElement(["homme", "femme"]) as any,
        height: faker.number.float({
          min: 1.5,
          max: 2.0,
          fractionDigits: 2,
        }) as any,
        goal: faker.helpers.arrayElement([
          "Weight loss",
          "Muscle gain",
          "Maintenance",
        ]) as any,
        user,
        pathologies: faker.helpers.arrayElements(
          pathologies,
          faker.number.int({ min: 0, max: 2 }),
        ),
      } as any),
    );
    profiles.push(profile);
    await seedWeightMeasures(manager, profile, days);
  }

  await enforceSingleCoachSeed(manager, coachUser);

  return { users, profiles };
}

async function seedUserRecipes(
  manager: EntityManager,
  users: User[],
  recipes: Recipe[],
) {
  const links: User_Recipe[] = [];

  for (const user of users) {
    const favCount = faker.number.int({ min: 5, max: 25 });
    const picked = faker.helpers.arrayElements(recipes, favCount);
    for (const recipe of picked) {
      links.push(User_Recipe.create({ user, recipe }));
    }
  }

  const chunkSize = 500;
  for (let i = 0; i < links.length; i += chunkSize) {
    await manager.save(links.slice(i, i + chunkSize));
  }
}

async function seedMealsDishesAnalyses(
  manager: EntityManager,
  users: User[],
  ingredients: Ingredient[],
  days: number,
  maxMealsPerDay: number,
) {
  const seedAnchorDate = getSeedAnchorDate();
  const mealsPerDay = Math.min(maxMealsPerDay, MEAL_TIME_SLOTS.length);
  const timeSlots = MEAL_TIME_SLOTS.slice(0, mealsPerDay);

  for (const user of users) {
    for (let dayOffset = 0; dayOffset < days; dayOffset++) {
      const dayDate = new Date(seedAnchorDate);
      dayDate.setDate(seedAnchorDate.getDate() - dayOffset);

      for (const slot of timeSlots) {
        const consumedAt = buildMealDate(dayDate, slot.hour, slot.minute);

        const meal = await manager.save(
          Meal.create({
            mealType: slot.mealType,
            consumedAt,
            user,
            photoUrl: unsplashFoodUrl("meal") as any, // si tu ajoutes un champ photoUrl à Meal plus tard
          } as any),
        );

        const dishesCount = faker.number.int({ min: 1, max: 3 });

        for (let d = 0; d < dishesCount; d++) {
          const nut = generateNutrition();

          const analysis = await manager.save(
            Nutritional_Analysis.create({
              ...nut,
              analyzedAt: consumedAt as any,
              validatedAt: faker.datatype.boolean()
                ? new Date(
                    consumedAt.getTime() +
                      faker.number.int({ min: 15, max: 120 }) * 60 * 1000,
                  )
                : null,
            } as any),
          );

          const dish = await manager.save(
            Dish.create({
              photoUrl: unsplashFoodUrl("dish"),
              dishType: randEnum(DishType),
              analysisStatus: AnalysisStatus.Complete,
              uploadedAt: consumedAt,
              meal,
              analysis,
            }),
          );

          // Dish ingredients (pivot)
          const diCount = faker.number.int({ min: 3, max: 10 });
          const picked: Ingredient[] = faker.helpers.arrayElements(
            ingredients,
            diCount,
          );

          const pivots = picked.map((ing: Ingredient) =>
            Dish_Ingredient.create({
              dish,
              ingredient: ing,
              quantity: faker.number.int({ min: 10, max: 200 }),
            }),
          );

          await manager.save(pivots);
        }
      }
    }
  }
}

export async function seedMassiveDataset(
  manager: EntityManager,
  opts: Partial<SeedMassiveOptions> = {},
) {
  const o = { ...DEFAULT_OPTS, ...opts };

  const { pathologies, ingredients } = await seedReferenceData(manager);

  const recipes = await seedRecipes(manager, ingredients, o.recipesCount);

  const { users } = await seedUsersProfilesWeights(
    manager,
    pathologies,
    o.days,
    o.usersCount,
  );

  await seedUserRecipes(manager, users, recipes);

  await seedMealsDishesAnalyses(
    manager,
    users,
    ingredients,
    o.days,
    o.maxMealsPerDay,
  );
}
