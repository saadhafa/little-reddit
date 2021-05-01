import { withUrqlClient } from "next-urql"
import Layout from "../components/layout"
import NavBar from "../components/NavBar"
import { usePostsQuery } from "../generated/graphql"
import { CreateUrqlClient } from "../util/createUrqlClient"
import {Stack,Box,Text,Heading} from '@chakra-ui/react'


 
 
 
 const Index = () => {
     const [{data}] = usePostsQuery({
         variables:{
             limit:10 as never
         }
     })
    return (
        <Layout variant="regular">
        
        
        <Heading p="10">LittleReddit</Heading>

        <Stack>
        {!data ? null : data.posts.map((p) => (
                <Box key={p.id} p={5} shadow="md" borderWidth="1px">
                <Heading fontSize="xl">{p.title}</Heading>
                <Text mt={4}>{p.textSnipped}</Text>
              </Box>
        ))}
        </Stack>
        </Layout>
    )



 }

 export default withUrqlClient(CreateUrqlClient,{ssr:true})(Index);