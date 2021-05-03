import { Posts } from '../entities/Posts';
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, Query, Resolver,Root,UseMiddleware,ObjectType } from "type-graphql";
import { MyContext } from 'src/types';
import { isAuth } from '../middleware/Auth';
import {getConnection} from 'typeorm'






@InputType()
class PostInput {

  @Field()
  title!:string

  @Field()
  text!:string

}


@ObjectType()
class PaginatedPosts{

  @Field(()=>[Posts])
  Posts:Posts[]

  @Field()
  hasMore:boolean

}


@Resolver(Posts)
export class PostResolver{


  @FieldResolver(() => String)
  textSnipped(
    @Root() root:Posts
  ){
    return root.text.slice(0,50)
  }


  @Query(() => PaginatedPosts)
  async posts(

    @Arg('limit', () => Int) limit:number,
    @Arg('cursor', () => String, {nullable:true}) cursor:string | null,

  ): Promise<PaginatedPosts>{

    const maxLimit = Math.min(50,limit) + 1

    const query =  getConnection().getRepository(Posts)
    .createQueryBuilder("p")
    .take(maxLimit)
    .orderBy('"createdAt"','DESC')

    
    if(cursor){
      const parsedCursor = new Date(parseInt(cursor))
       query.where('"createdAt" < :cursor', { cursor: parsedCursor })
    }
    
      const posts =  await query.getMany()

      return {Posts:posts.slice(0,maxLimit -1 ),hasMore: posts.length === maxLimit}

  }


  @Query(() => Posts,{nullable:true})
  post(@Arg("id") id:number) :Promise<Posts | undefined>{

    return Posts.findOne(id)

  }

  @Mutation(() => Posts)
  @UseMiddleware(isAuth)
  async createPost(@Arg('input') input:PostInput, @Ctx() {req}:MyContext) :Promise<Posts> {
    return Posts.create({
      ...input,
      creatorId:req.session.userId
    }).save()
  }


  @Mutation(() => Posts,{nullable:true})
  async updatePost(@Arg('id') id:number, @Arg('title', () => String ) title:string): Promise<Posts | null>{
    const post = await Posts.findOne(id)
    if(!post){
      return null
    }

    if(typeof title !== 'undefined'){

      await Posts.update({id}, {title})
    }
    
    return post
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id:number):Promise<Boolean>{

    await Posts.delete(id)
    return true
  }
}