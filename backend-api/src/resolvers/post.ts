import { Posts } from '../entities/Posts';
import { Arg, Mutation, Query, Resolver } from "type-graphql";


@Resolver()
export class PostResolver{

  @Query(() => [Posts])
  posts(): Promise<Posts[]>{

    return Posts.find()

  }


  @Query(() => Posts,{nullable:true})
  post(@Arg("id") id:number) :Promise<Posts | undefined>{

    return Posts.findOne(id)

  }

  @Mutation(() => Posts)
  async createPost( @Arg('title',() => String) title:string) :Promise<Posts> {
    return Posts.create({title}).save()
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