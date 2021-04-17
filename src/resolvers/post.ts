import { MyContext } from './../types';
import { Post } from './../entities/Post';
import { Ctx, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver{

  @Query(() => [Post])
  posts( @Ctx() {em}:MyContext ){

    return em.find(Post,{});
    
  }

}