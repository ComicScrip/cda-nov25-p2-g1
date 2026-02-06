import { DataSource } from "typeorm";
import { User } from "../entities/User";
import env from "../env";

export default new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  username: env.DB_USER,
  password: env.DB_PASS,
  port: env.DB_PORT,
  database: env.DB_NAME,
  entities: [User],
  synchronize: env.NODE_ENV !== "production",
  //logging: true
});
