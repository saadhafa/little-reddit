import { PostResolver } from "./resolvers/post";
import { __PROD__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { UserResolver } from "./resolvers/User";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { createConnection } from "typeorm";
import typeOrmConfig from "./typeorm.config";
import "dotenv-safe/config";

const main = async () => {
  const RedisStore = connectRedis(session);
  const redisClient = new Redis(process.env.REDIS);

  const app = express();
  const con = await createConnection(typeOrmConfig);
  await con.runMigrations();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN as string,
      credentials: true,
    })
  );
  app.set("proxy", 1);

  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      secret: process.env.SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
    })
  );

  // insert for test
  // const post = orm.em.create(Posts,{title: "my first what ever"})
  // orm.em.persistAndFlush(post)

  const appoloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis: redisClient }),
  });

  appoloServer.applyMiddleware({ app, cors: false });

  app.listen(process.env.PORT, () => {
    console.log("server on Port localhost:3333");
  });
};

main().catch((err) => {
  console.error(err);
});
