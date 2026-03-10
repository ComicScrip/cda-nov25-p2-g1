import { buildSchema } from "type-graphql";
import { authChecker } from "./auth";
import CoachDashboardResolver from "./resolvers/CoachDashboardResolver";
import UserDataResolver from "./resolvers/UserDataResolver";
import UserResolver from "./resolvers/UserResolver";
import { CoachDashoardUser } from "./resolvers/CoachDashboardUser";

export async function getSchema() {
  return buildSchema({
    resolvers: [UserResolver, CoachDashoardUser, UserDataResolver, CoachDashboardResolver],
    authChecker,
  });
}
