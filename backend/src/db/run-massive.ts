import { clearDB } from "./clear";
import db from "./index";
import { seedMassiveDataset } from "./seed/seed-massive";

async function run() {
  await db.initialize();
  await clearDB();

  await db.transaction(async (manager) => {
    await seedMassiveDataset(manager, {
      usersCount: 100,
      days: 90,
      recipesCount: 250,
      maxMealsPerDay: 5,
    });
  });

  await db.destroy();
  console.log("Massive seed done ✅");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
