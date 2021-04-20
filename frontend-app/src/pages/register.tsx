
import React from 'react'
import {Field, Form, Formik} from 'formik'
import { Button } from '@chakra-ui/react';
import Wrapper from '../components/wrapper';
import InputField from '../components/InputFiled';

interface RegisterProps {


}



 const Register:React.FC<RegisterProps> = ()=> {
  return(


    <Wrapper variant="small">
  <Formik initialValues={{username: '',password: ''}} onSubmit={(values) => console.log(values) }>


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