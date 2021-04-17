import { MikroORM } from '@mikro-orm/core';
import  path  from 'path';
import { __PROD__ } from "./constants";
import { Posts } from "./entities/Posts";

export default {

 migrations:{
   path: path.join(__dirname , "./migrations"),
   pattern: /^[\w-]+\d+\.[tj]s$/, 
},
  entities: [Posts],
  dbName: 'lireddit',
  user: 'saadhafa',
  password: 'root',
  debug: !__PROD__,
  type: 'postgresql'

} as Parameters<typeof MikroORM.init>[0];

