

import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import  { hash, verify } from 'argon2'
import { User } from "../entities/User";


@InputType()
class UserOptions{

  @Field()
  username:string;

  @Field()
  password:string;


}


@ObjectType()
class FieldError {

  @Field()
  field:string

  @Field()
  message:string

}


@ObjectType()
class UserResponse{

  @Field(() => [FieldError], {nullable:true})
  errors?:FieldError[]

  @Field(() => User,{nullable:true})
  user?:User

}

@Resolver()
export class UserResolver{


@Mutation(() => User)
async register(@Arg('options') options:UserOptions, @Ctx() {em}:MyContext){
  const hashedPassword = await hash(options.password)
  const user = em.create(User,{username:options.username,password: hashedPassword})
  await em.persistAndFlush(user)
  return user
}


@Mutation(() => UserResponse)
async login(@Arg('options') options:UserOptions, @Ctx() {em}:MyContext) :Promise<UserResponse>{
  const user = await  em.findOne(User,{username:options.username.toLowerCase()})

  if(!user){
    return {
      errors:[{
        field:'username',
        message:'invalid username'
      }]
    }
  }

  const password = await verify(user.password,options.password)
  if(!password){
    return {
      errors:[{
        field:'password',
        message:'invalid password'
      }]
    }
  }

  return {
    user
  }


}


}