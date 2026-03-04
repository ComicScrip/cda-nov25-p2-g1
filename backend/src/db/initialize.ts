import { hash } from "argon2";
import { Client } from "pg";
import { User, UserRole } from "../entities/User";
import { User_profile } from "../entities/User_Profile";
import env from "../env";
import db from "./index";

const FIXED_COACH_EMAIL = "coach@app.com";
const FIXED_COACH_PASSWORD = "SuperP@ssW0rd!";

function getDatabasePort() {
  return env.NODE_ENV === "test"
    ? (env.TEST_DB_PORT ?? env.DB_PORT)
    : env.DB_PORT;
}

async function cleanupLegacyScannerCoachSubmissions() {
  const client = new Client({
    host: env.DB_HOST,
    port: getDatabasePort(),
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
  });

  await client.connect();

  try {
    const { rows } = await client.query<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('users', 'scanner_coach_submission')
    `);

    const tables = new Set(rows.map((row) => row.table_name));
    if (!tables.has("users") || !tables.has("scanner_coach_submission")) {
      return;
    }

    const result = await client.query(`
      DELETE FROM scanner_coach_submission submission
      WHERE NOT EXISTS (
        SELECT 1
        FROM users
        WHERE users.id = submission.user_id
      )
    `);

    if ((result.rowCount ?? 0) > 0) {
      console.warn(
        `Removed ${result.rowCount} orphan scanner_coach_submission row(s) before schema sync.`,
      );
    }
  } finally {
    await client.end();
  }
}

async function ensureDefaultCoachAssignment() {
  if (env.NODE_ENV === "production") {
    return;
  }

  const hashedPassword = await hash(FIXED_COACH_PASSWORD);
  let coach = await User.findOne({
    where: { email: FIXED_COACH_EMAIL },
  });

  if (!coach) {
    coach = await User.create({
      email: FIXED_COACH_EMAIL,
      hashedPassword,
      role: UserRole.Coach,
      last_login_at: new Date(),
    }).save();
  } else {
    coach.hashedPassword = hashedPassword;
    coach.role = UserRole.Coach;
    coach.last_login_at = new Date();
    await coach.save();
  }

  const existingProfile = await User_profile.findOne({
    where: { user: { id: coach.id } },
  });

  if (!existingProfile) {
    await User_profile.create({
      first_name: "Coach",
      last_name: "Demo",
      date_of_birth: new Date("1988-06-12"),
      gender: "femme",
      height: 172,
      goal: "Accompagner les utilisateurs MyDietChef au quotidien.",
      user: coach,
      pathologies: [],
    }).save();
  }

  await db.query(
    `
      UPDATE users
      SET coach_id = $1
      WHERE role = $2
        AND id <> $1
        AND (coach_id IS NULL OR coach_id <> $1)
    `,
    [coach.id, UserRole.Coachee],
  );
}

export async function initializeDatabase() {
  if (db.isInitialized) {
    return db;
  }

  await cleanupLegacyScannerCoachSubmissions();
  await db.initialize();
  await ensureDefaultCoachAssignment();

  return db;
}
