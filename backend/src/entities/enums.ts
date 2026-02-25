import { registerEnumType } from "type-graphql";

export enum DishType {
  Entree = "entree",
  Plat = "plat",
  Dessert = "dessert",
}

export enum AnalysisStatus {
  EnAttente = "en_attente",
  EnCours = "en_cours",
  Complete = "complete",
  Valide = "valide",
}

export enum Unit {
  G = "g",
  Ml = "ml",
  Pcs = "pcs",
}

export enum MealType {
  PetitDejeuner = "petit_dejeuner",
  Dejeuner = "dejeuner",
  Collation = "collation",
  Diner = "diner",
}

export enum Status {
  Brouillon = "brouillon",
  Publie = "publie",
  Archive = "archive",
}

export enum UserRole {
  Coach = "coach",
  Coachee = "coachee",
  Admin = "admin",
}

export enum Gender {
  Homme = "homme",
  Femme = "femme",
}

registerEnumType(DishType, {
  name: "DishType",
});

registerEnumType(AnalysisStatus, {
  name: "AnalysisStatus",
});

registerEnumType(Unit, {
  name: "Unit",
});

registerEnumType(MealType, {
  name: "MealType",
});

registerEnumType(Status, {
  name: "Status",
});

registerEnumType(UserRole, {
  name: "UserRoleEnum",
});

registerEnumType(Gender, {
  name: "Gender",
});
