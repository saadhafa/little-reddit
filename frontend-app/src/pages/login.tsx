
import React from 'react'
import {Form, Formik} from 'formik'
import { Button,Link } from '@chakra-ui/react';
import Wrapper from '../components/wrapper';
import InputField from '../components/InputFiled';
import { useLoginMutation } from '../generated/graphql';
import { errorMap } from '../util/errorMap';
import {useRouter} from 'next/router'
import { withUrqlClient } from 'next-urql';
import { CreateUrqlClient } from '../util/createUrqlClient';
import NextLink from 'next/link';






 const Login:React.FC<{}> = ()=> {
   const [,login] = useLoginMutation()
    const router = useRouter()
  return(


    <Wrapper variant="small">
  <Formik initialValues={{usernameOrEmail: "",password: ""}} onSubmit={async (values,{setErrors}) => {

      const response = await login(values)
      if(response.data?.login.errors){
        console.log(response)
        setErrors(errorMap(response.data?.login.errors))

      }else if(response.data?.login.user){
        // if user exists 
        router.push('/')
      }

  } }>


      {({values,handleChange}) => (

        <Form>
          <InputField name="usernameOrEmail" label="username or email" placeholder="username or email"  />
          <InputField name="password" label="password" placeholder="password" type="password"  />
          <Button mb={4} mt={5} type="submit" colorScheme="teal">Login</Button>
        </Form>

      )}


  </Formik>  
  <NextLink href="/forgot-password">
  <Link>Forgot password</Link>
</NextLink>
  </Wrapper>  


  )
}

export default withUrqlClient(CreateUrqlClient)(Login)