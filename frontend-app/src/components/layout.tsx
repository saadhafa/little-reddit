import { Box, Flex,Text } from '@chakra-ui/layout'
import { Link } from '@chakra-ui/react'
import React, { Children } from 'react'
import { withUrqlClient } from 'next-urql'
import { CreateUrqlClient } from '../util/createUrqlClient'
import NavBar from './NavBar'
import Wrapper from './wrapper'
import { variant } from '../util/typeVariant'



interface Props {
    variant?: variant
}

const Layout:React.FC<Props> = ({children}) => {

    return <>
        <NavBar/>
    <Wrapper variant="small">

        {[children]}
    </Wrapper>
    




    </>

}



export default  Layout