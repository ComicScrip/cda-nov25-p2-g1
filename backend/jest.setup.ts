import type { ApolloServer } from "@apollo/server";
import { type ASTNode, print } from "graphql";
import { initApollo } from "./src/apollo";
import db, { test_clearDB } from "./src/db";
import { initFastify } from "./src/fastify";
import type { GraphQLContext } from "./src/types";

let testServer: ApolloServer<GraphQLContext>;

beforeAll(async () => {
  await db.initialize();
  const fastify = await initFastify();
  testServer = await initApollo(fastify);
  await testServer.start();
});

beforeEach(async () => {
  await test_clearDB();
});

afterAll(async () => {
  await db.destroy();
});

export async function execute(
  operation: ASTNode,
  variables?: any,
  contextValue: any = {},
) {
  return await testServer.executeOperation(
    { query: print(operation), variables },
    { contextValue },
  );
}
