import { hash, verify } from "argon2";
import { GraphQLError } from "graphql";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { endSession, getCurrentUser, startSession } from "../auth";
import { LoginInput, SignupInput, User } from "../entities/User";
import type { GraphQLContext } from "../types";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Resolver()
export default class UserResolver {
  @Query(() => [User])
  async users() {
    return await User.find();
  }

  @Mutation(() => User)
  async signup(
    @Arg("data", () => SignupInput, { validate: true }) data: SignupInput,
  ) {
    const email = normalizeEmail(data.email);
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new GraphQLError("A user with this email already exists", {
        extensions: { code: "EMAIL_ALREADY_TAKEN", http: { status: 400 } },
      });
    }
    const hashedPassword = await hash(data.password);
    const newUser = User.create({ email, hashedPassword });
    return await newUser.save();
  }

  @Mutation(() => String)
  async login(
    @Arg("data", () => LoginInput, { validate: true }) data: LoginInput,
    @Ctx() context: GraphQLContext,
  ) {
    const email = normalizeEmail(data.email);
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new GraphQLError("Invalid email or password", {
        extensions: { code: "INVALID_CREDENTIALS", http: { status: 401 } },
      });
    }

    const isPasswordValid = await verify(user.hashedPassword, data.password);
    if (!isPasswordValid) {
      throw new GraphQLError("Invalid email or password", {
        extensions: { code: "INVALID_CREDENTIALS", http: { status: 401 } },
      });
    }

    return startSession(context, user);
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() context: GraphQLContext) {
    endSession(context);
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() context: GraphQLContext) {
    try {
      return await getCurrentUser(context);
    } catch (_e) {
      return null;
    }
  }
}
