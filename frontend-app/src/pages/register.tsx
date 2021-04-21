
import React from 'react'
import {Field, Form, Formik} from 'formik'
import { Button } from '@chakra-ui/react';
import Wrapper from '../components/wrapper';
import InputField from '../components/InputFiled';
import { useMutation } from 'urql';

interface RegisterProps {


}

const REGISTER_MUT = `

mutation Register($username: String!, $password: String!){
	register(options:{username:$username,password:$password}){
    errors{
      field
      message
    }
    user{
      username
    }
  }
}

`;



 const Register:React.FC<RegisterProps> = ()=> {
   const [,register] = useMutation(REGISTER_MUT)
  return(


    <Wrapper variant="small">
  <Formik initialValues={{username: "",password: ""}} onSubmit={(values) => (register(values)) }>


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

export default Register