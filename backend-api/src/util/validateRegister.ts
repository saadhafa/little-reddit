import { UserOptions } from "src/resolvers/UserOptions";

export const validateRegister = (options:UserOptions) => {

    if(options.username.length <= 2 ){
        return [{
            field:'username',
            message:'invalid username'
          }]
        
      }
      if(options.password.length <= 5 ){
        return [{
            field:'password',
            message:'invalid password to short'
          }]
        
      }

      if(options.email.length <= 5 ){
        return [{
            field:'email',
            message:'invalid Email adresse'
          }]
        
      }

      
    
      if(!options.email.includes('@')){
        return [{
            field:"email",
            message:"please enter a valid email"
          }]
        
      }

      if(options.username.includes('@')){
        return [{
            field:"username",
            message:"Invalid Username"
          }]
        
      }


      return null
}