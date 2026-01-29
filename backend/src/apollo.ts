import { ApolloServer } from "@apollo/server";
import { fastifyApolloDrainPlugin } from "@as-integrations/fastify";
import type { FastifyInstance } from "fastify";
import { getSchema } from "./schema";
import type { GraphQLContext } from "./types";

export async function initApollo(fastify: FastifyInstance) {
  return new ApolloServer<GraphQLContext>({
    schema: await getSchema(),
    plugins: [fastifyApolloDrainPlugin(fastify)],
  });
}
