import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(__dirname, ".env.test");

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

process.env.NODE_ENV ??= "test";
process.env.JWT_SECRET ??= "test-secret-key-for-jwt-tests";
process.env.GRAPHQL_SERVER_PORT ??= "4000";
process.env.CORS_ALLOWED_ORIGINS ??= "http://localhost:3000";
process.env.DB_HOST ??= "localhost";
process.env.DB_PORT ??= "5432";
process.env.DB_USER ??= "postgres";
process.env.DB_PASS ??= "postgres";
process.env.DB_NAME ??= "postgres";
