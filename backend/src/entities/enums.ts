export const PathologyName = {
  Diabete: "diabete",
  Hypertension: "hypertension",
  Obesite: "obesite",
  Allergie: "allergie",
} as const;

export type PathologyName = (typeof PathologyName)[keyof typeof PathologyName];

export const DishType = {
  Entree: "entree",
  Plat: "plat",
  Dessert: "dessert",
} as const;

export type DishType = (typeof DishType)[keyof typeof DishType];

export const AnalysisStatus = {
  EnAttente: "en_attente",
  EnCours: "en_cours",
  Complete: "complete",
  Valide: "valide",
} as const;

export type AnalysisStatus =
  (typeof AnalysisStatus)[keyof typeof AnalysisStatus];

export const Unit = {
  G: "g",
  Ml: "ml",
  Pcs: "pcs",
} as const;

export type Unit = (typeof Unit)[keyof typeof Unit];

export const MealType = {
  PetitDejeuner: "petit_dejeuner",
  Dejeuner: "dejeuner",
  Collation: "collation",
  Diner: "diner",
} as const;

export type MealType = (typeof MealType)[keyof typeof MealType];

export const Status = {
  Brouillon: "brouillon",
  Publie: "publie",
  Archive: "archive",
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export const UserRole = {
  Coach: "coach",
  Coachee: "coachee",
  Admin: "admin",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Gender = {
  Homme: "homme",
  Femme: "femme",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export const Goal = {
  PertePoids: "perte_poids",
  PriseMasse: "prise_masse",
  Maintien: "maintien",
} as const;

export type Goal = (typeof Goal)[keyof typeof Goal];
