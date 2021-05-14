import { Posts } from "./entities/Posts";
import { User } from "./entities/User";
import { ConnectionOptions } from "typeorm";
import path from "path";
import { Updoot } from "./entities/Updoot";
import "dotenv-safe/config";

export default {
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: true,
  entities: [User, Posts, Updoot],
  migrations: [path.join(__dirname, "./migrations/*")],
} as ConnectionOptions;
