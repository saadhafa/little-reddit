import { Posts } from "../entities/Posts";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
  ObjectType,
  Args,
} from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/Auth";
import { getConnection } from "typeorm";
import { Updoot } from "../entities/Updoot";

@InputType()
class PostInput {
  @Field()
  title!: string;

  @Field()
  text!: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Posts])
  Posts: Posts[];

  @Field()
  hasMore: boolean;
}

@Resolver(Posts)
export class PostResolver {
  @FieldResolver(() => String)
  textSnipped(@Root() root: Posts) {
    return root.text.slice(0, 50);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session;

    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;

    await getConnection().query(
      `
      START TRANSACTION;
      insert into updoot ("postId","userID",value) values(${postId},${userId},${realValue});
      update posts set points = points + ${realValue} where id = ${postId};
      COMMIT;
    `
    );

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const maxLimit = Math.min(50, limit) + 1;

    const queryArgs: any[] = [maxLimit];

    if (cursor) {
      queryArgs.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
        select p.*,json_build_object(
          'username',u.username,
          'email',u.email
          ) creator 
          from posts p
        inner join public.user u on u.id = p."creatorId"
        ${cursor ? `where p."createdAt" < $2 ` : ""} 
        order by p."createdAt" DESC
        limit $1
     `,
      queryArgs
    );

    return {
      Posts: posts.slice(0, maxLimit - 1),
      hasMore: posts.length === maxLimit,
    };
  }

  @Query(() => Posts, { nullable: true })
  post(@Arg("id") id: number): Promise<Posts | undefined> {
    return Posts.findOne(id);
  }

  @Mutation(() => Posts)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Posts> {
    return Posts.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Posts, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String) title: string
  ): Promise<Posts | null> {
    const post = await Posts.findOne(id);
    if (!post) {
      return null;
    }

    if (typeof title !== "undefined") {
      await Posts.update({ id }, { title });
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<Boolean> {
    await Posts.delete(id);
    return true;
  }
}
