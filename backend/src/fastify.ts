import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import Fastify from "fastify";
import env from "./env";

function expandLoopbackOrigin(origin: string) {
  try {
    const url = new URL(origin);
    const variants = new Set([origin]);

    if (url.hostname === "localhost") {
      variants.add(
        `${url.protocol}//127.0.0.1${url.port ? `:${url.port}` : ""}`,
      );
    }

    if (url.hostname === "127.0.0.1") {
      variants.add(
        `${url.protocol}//localhost${url.port ? `:${url.port}` : ""}`,
      );
    }

    return [...variants];
  } catch {
    return [origin];
  }
}

export async function initFastify() {
  const fastify = Fastify();
  const origins = env.CORS_ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .flatMap(expandLoopbackOrigin);

  await fastify.register(fastifyCors, {
    origin: origins,
    credentials: true,
  });
  await fastify.register(fastifyCookie);
  return fastify;
}
