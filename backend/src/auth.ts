import jwt from "jsonwebtoken";
import type { AuthChecker } from "type-graphql";
import { User } from "./entities/User";
import env from "./env";
import { ForbiddenError, UnauthenticatedError } from "./errors";
import type { GraphQLContext } from "./types";

export interface JWTPayload {
  userId: number;
}

export async function createJWT(user: User): Promise<string> {
  const payload: JWTPayload = {
    userId: user.id,
  };

  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export const verifyJWT = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch (_error) {
    return null;
  }
};

const cookieName = "authToken";

export async function startSession(context: GraphQLContext, user: User) {
  const token = await createJWT(user);

  context.res.cookie(cookieName, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return token;
}

export async function endSession(context: GraphQLContext) {
  context.res.clearCookie(cookieName);
}

export async function getJWT(
  context: GraphQLContext,
): Promise<JWTPayload | null> {
  const token = context.req.cookies?.[cookieName];

  if (!token) return null;
  const payload = verifyJWT(token);

  if (!payload) return null;
  return payload;
}

export async function getCurrentUser(context: GraphQLContext): Promise<User> {
  const jwt = await getJWT(context);
  if (jwt === null) throw new UnauthenticatedError();
  const currentUser = await User.findOne({ where: { id: jwt.userId } });
  if (currentUser === null) throw new UnauthenticatedError();
  return currentUser;
}

export const authChecker: AuthChecker<GraphQLContext> = async (
  { context },
  roles,
) => {
  const currentUser = await getCurrentUser(context);
  if (roles.length !== 0 && !roles.includes(currentUser.role.toString()))
    throw new ForbiddenError();
  return true;
};
