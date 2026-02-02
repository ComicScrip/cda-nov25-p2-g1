import { hash } from "argon2";
import { User, UserRole } from "../entities/User";
import db from "./index";

export async function clearDB() {
  const runner = db.createQueryRunner();
  const tableDroppings = db.entityMetadatas.map((entity) =>
    runner.query(`DROP TABLE IF EXISTS "${entity.tableName}" CASCADE`),
  );
  await Promise.all(tableDroppings);
  await db.synchronize();
}

async function main() {
  await db.initialize();
  await clearDB();

  await User.create({
    email: "dave.lopper@app.com",
    hashedPassword: await hash("SuperP@ssW0rd!"),
  }).save();

  await User.create({
    email: "jane.doe@app.com",
    hashedPassword: await hash("SuperP@ssW0rd!"),
  }).save();

  await User.create({
    email: "admin@app.com",
    hashedPassword: await hash("SuperP@ssW0rd!"),
    role: UserRole.Admin,
  }).save();

  await db.destroy();
  console.log("done !");
}

main();
