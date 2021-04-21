import { PostResolver } from './resolvers/post';
import { __PROD__ } from './constants';
import { MikroORM } from '@mikro-orm/core'
import express from 'express'
import mikroOrmConfig from './mikro-orm.config';
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import { HelloResolver } from './resolvers/hello';
import { UserResolver } from './resolvers/User';
import redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import cors from 'cors'


const main = async () =>{

  const RedisStore = connectRedis(session)
  const redisClient = redis.createClient()

  const app = express()
  const orm = await MikroORM.init(mikroOrmConfig)
  await orm.getMigrator().up();

  app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
  }))


  app.use(
    session({
      name:'qid',
      store: new RedisStore({ client: redisClient,disableTouch:true }),
      secret: 'ffsda4$fqwfe781234j)das',
      resave: false,
      saveUninitialized:false,
      cookie:{
        maxAge: (1000 * 60) * 60 * 24,
        httpOnly:true,
        secure:false,
        sameSite:'lax',
      }
    })
  )

  // insert for test
  // const post = orm.em.create(Posts,{title: "my first what ever"})
  // orm.em.persistAndFlush(post)

  const appoloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers:[HelloResolver,PostResolver,UserResolver],
      validate:false,

    }),
    context: ({req,res}) => ({em:orm.em,req,res})
  })

  appoloServer.applyMiddleware({app,cors:false})
  
  app.listen(3333,() => {
    console.log('server on Port localhost:3333')
  })


}


main().catch((err) =>{

  console.error(err)

})