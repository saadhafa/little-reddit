import { Box, Flex,Text } from '@chakra-ui/layout'
import { Link } from '@chakra-ui/react'
import React from 'react'

import  NextLink from 'next/link'
import { useMeQuery } from '../generated/graphql'










const NavBar:React.FC = () => {
const [{data,fetching}] = useMeQuery()

let body = null 
    if(fetching){

     //TODO:  put loadder here    
    }
else if (!data?.me){
    console.log(data)
    body =  (
        <>
<NextLink href="/login">∏
        <Link ml={4} color="white">Login</Link>
        </NextLink>
        <NextLink href="/register">
        <Link ml={4} color="white">register</Link>
        </NextLink>
        </>
    )   
}else{
    body = (
        <Flex alignItems="center">
              <Text ml={4} color="white">{data.me.username}</Text>
              <Link ml={5} color="white">Logout</Link>
        </Flex>
    )
}


    return(
    <Flex bg="tomato">
        <Box p={4}>
       {body}
        </Box>
    </Flex>
    )
}


export default NavBar