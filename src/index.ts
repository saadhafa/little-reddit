import { PostResolver } from './resolvers/post';
import { __PROD__ } from './constants';
import { MikroORM } from '@mikro-orm/core'
import express from 'express'
import mikroOrmConfig from './mikro-orm.config';
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import { HelloResolver } from './resolvers/hello';


const main = async () =>{


  const app = express()
  const orm = await MikroORM.init(mikroOrmConfig)
  await orm.getMigrator().up();

  const appoloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers:[HelloResolver,PostResolver],
      validate:false,

    })
  })

  appoloServer.applyMiddleware({app})
  
  app.listen(3333,() => {
    console.log('server on Port localhost:3333')
  })


}


main().catch((err) =>{

  console.error(err)

})