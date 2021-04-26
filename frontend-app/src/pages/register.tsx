
import React from 'react'
import {Field, Form, Formik} from 'formik'
import { Button } from '@chakra-ui/react';
import Wrapper from '../components/wrapper';
import InputField from '../components/InputFiled';
import { useRegisterMutation } from '../generated/graphql';
import { errorMap } from '../util/errorMap';
import {useRouter} from 'next/router';
import { CreateUrqlClient } from '../util/createUrqlClient';
import { withUrqlClient } from 'next-urql';

interface RegisterProps {


}




 const Register:React.FC<RegisterProps> = ()=> {
   const [,register] = useRegisterMutation()
    const router = useRouter()
  return(


    <Wrapper variant="small">
  <Formik initialValues={{username: "",password: ""}} onSubmit={async (values,{setErrors}) => {

      const response = await register(values)
      if(response.data?.register.errors){
        console.log(response)
        setErrors(errorMap(response.data?.register.errors))

      }else if(response.data?.register.user){
        console.log(response)
        // if user exists 
        console.log('worked ')
        router.push('/')
        //router.push('/')
      }

  } }>


      {({values,handleChange}) => (

        <Form>
          <InputField name="username" label="username" placeholder="username"  />
          <InputField name="password" label="password" placeholder="password" type="password"  />
          <Button mt={5} type="submit" colorScheme="teal">Register</Button>
        </Form>

      )}

  



  </Formik>  

  </Wrapper>  


  )
}

export default withUrqlClient(CreateUrqlClient)(Register)