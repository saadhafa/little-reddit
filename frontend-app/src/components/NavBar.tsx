import { Box, Flex,Text } from '@chakra-ui/layout'
import { Link } from '@chakra-ui/react'
import React from 'react'

import  NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'
import { isServer } from '../util/isServer'



const NavBar:React.FC = () => {
const [{data,fetching}] = useMeQuery(
    {
        pause:isServer()
    
    })
const [{fetching:logoutFetching},logout] = useLogoutMutation()

let body = null 
    if(fetching){

     //TODO:  put loadder here    
    }
else if (!data?.me){
    body =  (
        <>
<NextLink href="/login">
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
              <Link isLoadding={logoutFetching} onClick={() => {
                  logout()
              }} ml={5} color="white">Logout</Link>
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