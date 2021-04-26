import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
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


  @Mutation(() => Boolean)
  forgotPassword(

  ){

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

  if(options.username.length <= 2 ){
    return {
      errors:[{
        field:'username',
        message:'invalid username'
      }]
    }
  }
  if(options.password.length <= 5 ){
    return {
      errors:[{
        field:'password',
        message:'invalid password to short'
      }]
    }
  }

  const hashedPassword = await hash(options.password)
  const user = em.create(User,{username:options.username,password: hashedPassword})

  try{
    await em.persistAndFlush(user)
  }catch(err){
    if(err.code === '23505'){
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
async login(@Arg('options') options:UserOptions, @Ctx() {em,req}:MyContext) :Promise<UserResponse>{
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