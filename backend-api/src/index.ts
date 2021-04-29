import { PostResolver } from './resolvers/post';
import { __PROD__ } from './constants';
import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import { HelloResolver } from './resolvers/hello';
import { UserResolver } from './resolvers/User';
import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import cors from 'cors'
import {createConnection} from 'typeorm'
import { User } from './entities/User';
import { Posts } from './entities/Posts';


const main = async () =>{
  const RedisStore = connectRedis(session)
  const redisClient = new Redis()

  const app = express()


  const connect = await createConnection({
    type:'postgres',
    database:'reddit2',
    username:'mac',
    password:'root',
    synchronize:true,
    logging:true,
    entities:[User,Posts]
  })




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
    context: ({req,res}) => ({req,res,redis:redisClient})
  })

  appoloServer.applyMiddleware({app,cors:false})
  
  app.listen(3333,() => {
    console.log('server on Port localhost:3333')
  })


}


main().catch((err) =>{

  console.error(err)

})