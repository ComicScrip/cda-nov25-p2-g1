import { buildSchema } from "type-graphql";
import { authChecker } from "./auth";
import UserDataResolver from "./resolvers/UserDataResolver";
import UserResolver from "./resolvers/UserResolver";

export async function getSchema() {
  return buildSchema({
    resolvers: [UserResolver, UserDataResolver],
    authChecker,
  });
}
