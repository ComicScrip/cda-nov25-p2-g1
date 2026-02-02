import type { FastifyReply, FastifyRequest } from "fastify";
import { Field, InputType, Int } from "type-graphql";

@InputType()
export class ObjectId {
  @Field(() => Int)
  id: number;
}

export interface GraphQLContext {
  res: FastifyReply;
  req: FastifyRequest;
}
