import type { User_profile } from "../../entities/User_Profile";
import { Weight_Measure } from "../../entities/Weight_Measure";

export async function seedWeights(profiles: User_profile[]) {
  const weight1 = await Weight_Measure.create({
    measured_at: new Date(),
    weight: 82.5,
    user_profile: profiles[0],
  }).save();

  return [weight1];
}
