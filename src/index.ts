import { PostResolver } from './resolvers/post';
import { __PROD__ } from './constants';
import { MikroORM } from '@mikro-orm/core'
import express from 'express'
import mikroOrmConfig from './mikro-orm.config';
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import { HelloResolver } from './resolvers/hello';
// import { Posts } from './entities/Posts';


const main = async () =>{


  const app = express()
  const orm = await MikroORM.init(mikroOrmConfig)
  await orm.getMigrator().up();

  // insert for test
  // const post = orm.em.create(Posts,{title: "my first what ever"})
  // orm.em.persistAndFlush(post)

  const appoloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers:[HelloResolver,PostResolver],
      validate:false,

    }),
    context: () => ({em:orm.em})
  })

  appoloServer.applyMiddleware({app})
  
  app.listen(3333,() => {
    console.log('server on Port localhost:3333')
  })


}


main().catch((err) =>{

  console.error(err)

})