import { buildSchema } from "type-graphql";
import { authChecker } from "./auth";
import CoachDashboardResolver from "./resolvers/CoachDashboardResolver";
import UserDataResolver from "./resolvers/UserDataResolver";
import UserResolver from "./resolvers/UserResolver";

export async function getSchema() {
  return buildSchema({
    resolvers: [UserResolver, UserDataResolver, CoachDashboardResolver],
    authChecker,
  });
}
