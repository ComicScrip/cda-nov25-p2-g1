import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Pathology } from "../entities/Pathology";
import { User_profile } from "../entities/User_Profile";
import { Weight_measure } from "../entities/Weight_measure";
import env from "../env";

export default new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  username: env.DB_USER,
  password: env.DB_PASS,
  port: env.DB_PORT,
  database: env.DB_NAME,
  entities: [User, User_profile, Weight_measure, Pathology],
  synchronize: env.NODE_ENV !== "production",
  //logging: true
});
