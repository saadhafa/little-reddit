import { MyContext } from './../types';
import { Posts } from '../entities/Posts';
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";


@Resolver()
export class PostResolver{

  @Query(() => [Posts])
  posts( @Ctx() {em}:MyContext): Promise<Posts[]>{

    return em.find(Posts,{});

  }


  @Query(() => Posts,{nullable:true})
  post(@Arg("id",()=> Int) id:number , @Ctx() {em}:MyContext) :Promise<Posts | null>{

    return em.findOne(Posts,{id});

  }

  @Mutation(() => Posts)
  async createPost( @Arg('title',() => String) title:string, @Ctx() {em}:MyContext ) :Promise<Posts> {
    const post = em.create(Posts,{title})
    await em.persistAndFlush(post)
    return post
  }


  @Mutation(() => Posts,{nullable:true})
  async updatePost(@Arg('id',() => Int ) id:number, @Arg('title', () => String ) title:string, @Ctx() {em}:MyContext): Promise<Posts | null>{
    const post = await em.findOne(Posts,{id})
    if(!post){
      return null
    }

    if(typeof title !== 'undefined'){

      post.title = title

      await em.persistAndFlush(post) 

    }
    
    return post
  }

}