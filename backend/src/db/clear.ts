import { Client } from "pg";
import env from "../env";
import { initializeDatabase } from "./initialize";
import db from "./index";

function getDatabasePort() {
  return env.NODE_ENV === "test" ? (env.TEST_DB_PORT ?? env.DB_PORT) : env.DB_PORT;
}

export async function clearDB() {
  if (db.isInitialized) {
    await db.destroy();
  }

  const client = new Client({
    host: env.DB_HOST,
    port: getDatabasePort(),
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
  });

  try {
    await client.connect();

    const { rows: tables } = await client.query<{ tablename: string }>(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `);

    for (const table of tables) {
      await client.query(`DROP TABLE IF EXISTS "${table.tablename}" CASCADE`);
    }

    const { rows: enums } = await client.query<{ typname: string }>(`
      SELECT t.typname
      FROM pg_type t
      INNER JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
        AND t.typtype = 'e'
    `);

    for (const enumType of enums) {
      await client.query(`DROP TYPE IF EXISTS "${enumType.typname}" CASCADE`);
    }

    const { rows: sequences } = await client.query<{ sequencename: string }>(`
      SELECT sequencename
      FROM pg_sequences
      WHERE schemaname = 'public'
    `);

    for (const sequence of sequences) {
      await client.query(`DROP SEQUENCE IF EXISTS "${sequence.sequencename}" CASCADE`);
    }
  } finally {
    await client.end();
  }

  await initializeDatabase();
}
