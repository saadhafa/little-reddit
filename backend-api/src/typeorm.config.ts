import { Posts } from "./entities/Posts";
import { User } from './entities/User';
import {ConnectionOptions} from 'typeorm'

export default {
    type:'postgres',
    database:'reddit2',
    username:'mac',
    password:'root',
    synchronize:true,
    logging:true,
    entities:[User,Posts]
} as ConnectionOptions

