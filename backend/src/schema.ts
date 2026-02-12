import { buildSchema } from "type-graphql";
import { authChecker } from "./auth";
import UserResolver from "./resolvers/UserResolver";

export async function getSchema() {
  return buildSchema({
    resolvers: [UserResolver],
    authChecker,
  });
}
