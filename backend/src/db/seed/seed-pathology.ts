import { Pathology } from "../../entities/Pathology";

export async function seedPathologies() {
  const pathologies = await Promise.all([
    Pathology.create({ name: "Diabete" }).save(),
    Pathology.create({ name: "Hypertension" }).save(),
    Pathology.create({ name: "Allergie_gluten" }).save(),
  ]);

  return pathologies;
}
