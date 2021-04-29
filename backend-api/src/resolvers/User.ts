import { MyContext } from "src/types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import  { hash, verify } from 'argon2'
import { User } from "../entities/User";
import { UserOptions } from "./UserOptions";
import { validateRegister } from '../util/validateRegister'
import {v4 as uuid} from 'uuid'
import { sendEmail } from "../util/sendEmail";
import { RESET_PASSWORD_PREFIX } from "../constants";



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

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token:string,@Arg('newPassword') newPassword:string, @Ctx() {em,redis}:MyContext
  ):Promise<UserResponse>{

    if(newPassword.length <= 5){
      return {
        errors: [{
          field:'newPassword',
          message:"invalid Password"
          
        }]
      }
    }

    const key = RESET_PASSWORD_PREFIX + token
    const userId = await redis.get(key)

    if(!userId){
      return {
        errors:[{
          field:"token",
          message:"Expired Session"
        }]
      }
    }

    const user = await em.findOne(User,{id: parseInt(userId)})

    if(!user){
      return {
        errors:[{
          field:"token",
          message:"User does not exist"
        }]
      }
    }


    user.password = await hash(newPassword)
    await em.persistAndFlush(user)
    await redis.del(key)

    return {user}

  }


  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email:string,
    @Ctx() {em,redis}:MyContext
  )
  {
    const user = await em.findOne(User,{email})

    if (!user){
      return true
    }

    const token = uuid();
    await redis.set(RESET_PASSWORD_PREFIX + token ,user.id, 'ex',1000 * 60 * 60)
    // one hour
    await sendEmail(email,
      `<a href="http://localhost:3000/reset-password/${token}">Reset Password</a>`
      )
      return true
  }



  @Query(()=> User,{nullable:true})
  async me(
    @Ctx() {em,req}:MyContext
  ):Promise<User | null>{

    if(!req.session.userId){
      return null
    }


    //TODO: return user response and handle error with try and catch


    const user = await em.findOne(User,{id:req.session.userId})

    return user
  }




@Mutation(() => UserResponse)
async register(@Arg('options') options:UserOptions, @Ctx() {em,req}:MyContext):Promise<UserResponse>{

  const errors = validateRegister(options)

  if(errors){
    return {errors}
  }

  const hashedPassword = await hash(options.password)
  const user = em.create(User,{username:options.username,password: hashedPassword,email:options.email})

  try{
    await em.persistAndFlush(user)
  }catch(err){
    if(err.code === '23505'){
      console.log(err)
      return {
        errors:[{
          field:"username",
          message:"username already exist"
        }]
      }
    }
  }


  req.session.userId = user.id


  
  return {user}
}


@Mutation(() => UserResponse)
async login(@Arg('usernameOrEmail') usernameOrEmail:string,@Arg('password') password:string , @Ctx() {em,req}:MyContext) :Promise<UserResponse>{
  const user = await  em.findOne(User, usernameOrEmail.includes('@') ? {email:usernameOrEmail.toLowerCase()} : {username:usernameOrEmail.toLowerCase()} )

  if(!user){
    return {
      errors:[{
        field:'usernameOrEmail',
        message:'Invalid username or password'
      }]
    }
  }

  const passwordHashed = await verify(user.password,password)
  if(!passwordHashed){
    return {
      errors:[{
        field:'password',
        message:'invalid password'
      }]
    }
  }

  req.session.userId = user.id

  return {
    user
  }


}


@Mutation(() => Boolean)
logout(

  @Ctx() {req,res}:MyContext

){

  return new Promise(resolve => req.session.destroy((err)=>{
    res.clearCookie('qid')
    if(err){
      console.log(err)
      resolve(false)
    }
    return resolve(true)
  }))


}


}