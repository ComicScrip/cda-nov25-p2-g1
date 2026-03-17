import { clearDB } from "./clear";
import db from "./index";

async function reset() {
  await clearDB();
  await db.destroy();
  console.log("Database reset completed ✅");
}

reset();
