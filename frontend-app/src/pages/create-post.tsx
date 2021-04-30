import { Button } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { CreateUrqlClient } from '../util/createUrqlClient';
import router from "next/router";
import React from "react";
import { Formik,Form } from "formik";
import InputField from "../components/InputFiled";
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import Layout from "../components/layout";
import { useIsAuth } from "../util/useIsAuth";

const createPots:React.FC<{}> = ({})=>{
    const [,createPost]= useCreatePostMutation()
    useIsAuth()
    console.log(router)

return (
    <Layout variant="small">

<Formik initialValues={{title:"", text:""}} onSubmit={async (values,{setErrors}) => {

        
        const {error} = await createPost({input:values})
        if(!error){
          router.push('/')
        }
} }>


{({}) => (
   


   
  <Form>
    <InputField name="title" label="titile" placeholder="title"  />
    <InputField textarea label="Post content"  name="text" placeholder="Text content" />
    <Button mb={4} mt={5} type="submit" colorScheme="teal">create post</Button>
  </Form>

)}


</Formik>  


</Layout>
)
}


export default withUrqlClient(CreateUrqlClient)(createPots)