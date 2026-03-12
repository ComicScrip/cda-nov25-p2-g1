import { buildSchema } from "type-graphql";
import { authChecker } from "./auth";
import CoachDashboardResolver from "./resolvers/CoachDashboardResolver";
import { CoachDashoardUser } from "./resolvers/CoachDashboardUser";
import CoachRecipeResolver from "./resolvers/CoachRecipeResolver";
import MealAnalysisResolver from "./resolvers/MealAnalysisResolver";
import NutritionalAnalystResolver from "./resolvers/NutritionalAnalystResolver";
import UserDataResolver from "./resolvers/UserDataResolver";
import UserResolver from "./resolvers/UserResolver";

export async function getSchema() {
  return buildSchema({
    resolvers: [
      UserResolver,
      UserDataResolver,
      NutritionalAnalystResolver,
      MealAnalysisResolver,
      CoachDashboardResolver,
      CoachRecipeResolver,
      CoachDashoardUser,
    ],
    authChecker,
  });
}
