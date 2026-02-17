import { hash } from "argon2";
import { User, UserRole } from "../../entities/User";

export async function seedUsers() {
  const users = [];

  const dave = await User.create({
    email: "dave.lopper@app.com",
    hashedPassword: await hash("SuperP@ssW0rd!"),
    role: UserRole.Coachee,
  }).save();

  const jane = await User.create({
    email: "jane.doe@app.com",
    hashedPassword: await hash("SuperP@ssW0rd!"),
    role: UserRole.Coachee,
  }).save();

  const janette = await User.create({
    email: "janette.doe@app.com",
    hashedPassword: await hash("SuperP@ssW0rd!"),
    role: UserRole.Coachee,
  }).save();

  const admin = await User.create({
    email: "admin@app.com",
    hashedPassword: await hash("SuperP@ssW0rd!"),
    role: UserRole.Admin,
  }).save();

  users.push(dave, jane, admin, janette);

  return users;
}
