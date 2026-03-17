import "reflect-metadata";
import { fastifyApolloHandler } from "@as-integrations/fastify";
import { initApollo } from "./apollo";
import { initializeDatabase } from "./db/initialize";
import env from "./env";
import { initFastify } from "./fastify";

async function start() {
  await initializeDatabase();
  const fastify = await initFastify();
  const apollo = await initApollo(fastify);
  await apollo.start();

  fastify.all(
    "/",
    fastifyApolloHandler(apollo, {
      context: async (req, res) => ({ res, req }),
    }),
  );

  await fastify.listen({ port: env.GRAPHQL_SERVER_PORT, host: "0.0.0.0" });
  console.log(`✨ server ready ! http://localhost:${env.GRAPHQL_SERVER_PORT}`);
}

start();
