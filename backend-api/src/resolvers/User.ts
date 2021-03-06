import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  FieldResolver,
  Root,
} from "type-graphql";
import { hash, verify } from "argon2";
import { User } from "../entities/User";
import { UserOptions } from "./UserOptions";
import { validateRegister } from "../util/validateRegister";
import { v4 as uuid } from "uuid";
import { sendEmail } from "../util/sendEmail";
import { RESET_PASSWORD_PREFIX } from "../constants";
import { getConnection } from "typeorm";

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if (req.session.userId === user.id) {
      return user.email;
    }

    return "";
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 5) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "invalid Password",
          },
        ],
      };
    }

    const key = RESET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "Expired Session",
          },
        ],
      };
    }

    const userIdArg = parseInt(userId);
    const user = await User.findOne(userIdArg);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "User does not exist",
          },
        ],
      };
    }

    await User.update({ id: userIdArg }, { password: await hash(newPassword) });

    await redis.del(key);

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return true;
    }

    const token = uuid();
    await redis.set(
      RESET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60
    );
    // one hour
    await sendEmail(
      email,
      `<a href="http://localhost:3000/reset-password/${token}">Reset Password</a>`
    );
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    //TODO: return user response and handle error with try and catch

    return await User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UserOptions,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }

    const hashedPassword = await hash(options.password);
    let user;

    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          password: hashedPassword,
          email: options.email,
        })
        .returning("*")
        .execute();

      user = result.raw[0];
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "username already exist",
            },
          ],
        };
      }
    }

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail.toLowerCase() } }
        : { where: { username: usernameOrEmail.toLowerCase() } }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "Invalid username or password",
          },
        ],
      };
    }

    const passwordHashed = await verify(user.password, password);
    if (!passwordHashed) {
      return {
        errors: [
          {
            field: "password",
            message: "invalid password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    // return new Promise((resolve) =>
    //   req.session.destroy((err) => {
    //     res.clearCookie("qid");
    //     if (err) {
    //       console.log(err);
    //       resolve(false);
    //     }
    //     return resolve(true);
    //   })
    // );
    res.clearCookie("qid");
    req.session.userId = undefined;

    return true;
  }
}
