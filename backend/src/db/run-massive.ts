import { User } from "../entities/User";
import { clearDB } from "./clear";
import db from "./index";
import { seedMassiveDataset } from "./seed/seed-massive";

async function logSeededUsersByRole() {
  const rows = await db
    .getRepository(User)
    .createQueryBuilder("user")
    .select("user.role", "role")
    .addSelect("COUNT(*)", "count")
    .groupBy("user.role")
    .orderBy("user.role", "ASC")
    .getRawMany<{ role: string; count: string }>();

  const summary = rows
    .map((row) => `${row.role}: ${Number(row.count)}`)
    .join(", ");

  console.log(`Users seeded by role -> ${summary}`);
}

async function run() {
  await db.initialize();
  await clearDB();

  await db.transaction(async (manager) => {
    await seedMassiveDataset(manager, {
      usersCount: 100,
      days: 90,
      recipesCount: 250,
      maxMealsPerDay: 4,
    });
  });

  await logSeededUsersByRole();

  await db.destroy();
  console.log("Massive seed done ✅");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
