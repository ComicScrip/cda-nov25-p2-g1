/**
 * Configuration Jest unique pour le backend.
 * La configuration de la base de données de tests doit s'exécuter avant tout
 * import des modules applicatifs (env, db) pour que NODE_ENV et TEST_DB_PORT
 * soient pris en compte.
 */

// ========== 1. Environnement et base de données dédiée aux tests ==========
process.env.NODE_ENV = "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-secret-key-for-jwt-tests";

// Base de données de tests (port 5433 pour isoler dev/test)
// Démarrer la DB test : npm run testDB (docker-compose.integration-tests.yml)
process.env.DB_HOST = process.env.DB_HOST || "localhost";
process.env.DB_PORT = process.env.DB_PORT || "5432";
process.env.TEST_DB_PORT = process.env.TEST_DB_PORT || "5433";
process.env.DB_USER = process.env.DB_USER || "postgres";
process.env.DB_PASS = process.env.DB_PASS || "postgres";
process.env.DB_NAME = process.env.DB_NAME || "postgres";

process.env.GRAPHQL_SERVER_PORT =
  process.env.GRAPHQL_SERVER_PORT || "4000";
process.env.CORS_ALLOWED_ORIGINS =
  process.env.CORS_ALLOWED_ORIGINS || "http://localhost:3000";

// ========== 2. Setup serveur et DB (imports après la config ci-dessus) ==========
const { default: db, test_clearDB } = require("./src/db");
const { initApollo } = require("./src/apollo");
const { initFastify } = require("./src/fastify");
const { print } = require("graphql");

let testServer: { start: () => Promise<void>; executeOperation: (...args: unknown[]) => Promise<unknown> };

beforeAll(async () => {
  await db.initialize();
  const fastify = await initFastify();
  testServer = await initApollo(fastify);
  await testServer.start();
});

beforeEach(async () => {
  await test_clearDB();
});

afterAll(async () => {
  if (db.isInitialized) {
    await db.destroy();
  }
});

export async function execute(
  operation: { kind: string },
  variables?: Record<string, unknown>,
  contextValue: Record<string, unknown> = {},
) {
  return await testServer.executeOperation(
    { query: print(operation), variables },
    { contextValue },
  );
}
