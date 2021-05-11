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
} from "type-graphql";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/Auth";
import { getConnection, In } from "typeorm";
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

    const updoot = await Updoot.findOne({ where: { postId, userID: userId } });

    // already voted and wants to change vote
    if (updoot && updoot.value !== realValue) {
      console.log("i am in ", value);
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
        update  updoot set value = $1 where "postId" = $2 and "userID" = $3;

        `,
          [value, postId, userId]
        );

        await tm.query(
          `
          update posts
          set points = points + $1
          where id = $2
        `,
          [2 * realValue, postId]
        );
      });
    } else if (!updoot) {
      await getConnection().transaction(async (tm) => {
        await tm.query(`
        insert into updoot ("postId","userID",value) values(${postId},${userId},${realValue});
        `);

        await tm.query(`
        update posts set points = points + ${realValue} where id = ${postId};`);
      });
    }

    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const maxLimit = Math.min(50, limit) + 1;

    const queryArgs: any[] = [maxLimit, req.session.userId];

    if (cursor) {
      queryArgs.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
        select p.*,json_build_object(
          'username',u.username,
          'email',u.email
          ) creator,
          ${
            req.session.userId
              ? '(select value from updoot where "userID" = $2 and "postId" = p.id)  "voteStatus"'
              : '$2 as "voteStatus"'
          }
          from posts p
        inner join public.user u on u.id = p."creatorId"
        ${cursor ? `where p."createdAt" < $3 ` : ""} 
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
  post(@Arg("id", () => Int) id: number): Promise<Posts | undefined> {
    return Posts.findOne(id, { relations: ["creator"] });
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
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Posts | null> {
    const post = await getConnection()
      .createQueryBuilder()
      .update(Posts)
      .set({ title, text })
      .where(`id = :id and "creatorId" = :userId `, {
        id,
        userId: req.session.userId,
      })
      .returning("*")
      .execute();

    return post.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const post = await Posts.findOne({ id });
    if (!post) {
      return false;
    }

    if (post.creatorId !== req.session.userId) {
      throw new Error("not authenticated");
    }

    await Updoot.delete({ postId: id });
    await Posts.delete({ id });
    return true;
  }
}
