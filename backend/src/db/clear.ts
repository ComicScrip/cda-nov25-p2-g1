import db from "./index";

export async function clearDB() {
  const runner = db.createQueryRunner();

  try {
    await runner.connect();

    const tableDroppings = db.entityMetadatas.map((entity) =>
      runner.query(`DROP TABLE IF EXISTS "${entity.tableName}" CASCADE`),
    );

    await Promise.all(tableDroppings);
    await db.synchronize();
  } finally {
    await runner.release();
  }
}
