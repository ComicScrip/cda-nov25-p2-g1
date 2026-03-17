import { load } from "ts-dotenv";

export default load({
  GRAPHQL_SERVER_PORT: Number,
  JWT_SECRET: String,
  CORS_ALLOWED_ORIGINS: String,
  NODE_ENV: ["development" as const, "production" as const, "test" as const],
  DB_HOST: String,
  DB_PORT: Number,
  DB_USER: String,
  DB_PASS: String,
  DB_NAME: String,
  OPENAI_API_KEY: {
    type: String,
    optional: true,
  },
  OPENAI_MEAL_SCAN_MODEL: {
    type: String,
    optional: true,
  },
  GEMINI_API_KEY: String,
  TEST_DB_PORT: {
    type: Number,
    optional: true,
  },
});
