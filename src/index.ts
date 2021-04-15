import { __PROD__ } from './constants';
import { MikroORM } from '@mikro-orm/core'
import { Post } from './entities/Post';



const main = async () =>{

  const orm = await MikroORM.init({
    entities: [Post],
    dbName: 'lereddit',
    user: 'saadhafa',
    debug: !__PROD__,
    type: 'postgresql'

  })


}


main()