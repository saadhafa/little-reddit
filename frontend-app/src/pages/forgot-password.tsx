import { Alert, AlertIcon, Button } from "@chakra-ui/react"
import { Form, Formik } from "formik"
import router from "next/router"
import React, { Children, useState } from "react"
import InputField from "../components/InputFiled"
import Wrapper from "../components/wrapper"
import { errorMap } from "../util/errorMap"
import { useForgotPasswordMutation } from '../generated/graphql';
import { withUrqlClient } from "next-urql"
import { CreateUrqlClient } from "../util/createUrqlClient"





const forGotPassword:React.FC = ()  =>{ 
    const [,forgotPassword] = useForgotPasswordMutation()
    const [complete,setComplete] = useState(false) 
return (





    <Wrapper variant="small">
      { complete ?   <Alert status="success"><AlertIcon />An Email was send to The mail Box </Alert>   :null}
    <Formik initialValues={{email:""}} onSubmit={async (values,{setErrors}) => {

         await forgotPassword(values)
         setComplete(true)
  
    } }>
  
  
        {({}) => (
          
          <Form>
            <InputField type="email" name="email" label="Email" placeholder="Entre your email "  />
            <Button mb={4} mt={5} colorScheme="teal">Forgot password</Button>
          </Form>
  
        )}
  
  
    </Formik>  
    </Wrapper>  

)
}

export default  withUrqlClient(CreateUrqlClient)(forGotPassword)
