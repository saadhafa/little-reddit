import { Posts } from "./entities/Posts";
import { User } from "./entities/User";
import { ConnectionOptions } from "typeorm";
import path from "path";
import { Updoot } from "./entities/Updoot";

export default {
  type: "postgres",
  database: "reddit2",
  username: "mac",
  password: "root",
  synchronize: true,
  logging: true,
  entities: [User, Posts, Updoot],
  migrations: [path.join(__dirname, "./migrations/*")],
} as ConnectionOptions;
