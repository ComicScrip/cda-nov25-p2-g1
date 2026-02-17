import type { Pathology } from "../../entities/Pathology";
import type { User } from "../../entities/User";
import { User_profile } from "../../entities/User_Profile";

export async function seedProfiles(users: User[], pathologies: Pathology[]) {
  const profiles = [];

  const profile = await User_profile.create({
    first_name: "Dave",
    last_name: "Lopper",
    gender: "homme",
    height: 180,
    goal: "Perte de poids",
    user: users[0],
    pathologies: [pathologies[0]],
  }).save();

  profiles.push(profile);

  return profiles;
}
