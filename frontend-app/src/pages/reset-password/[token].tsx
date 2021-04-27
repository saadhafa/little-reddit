import { Alert, AlertIcon, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { NextPage, NextPageContext } from "next";
import { NextComponentType, withUrqlClient } from "next-urql";
import { route } from "next/dist/next-server/server/router";
import {useRouter} from "next/router";
import React, { useState } from "react";
import InputField from "../../components/InputFiled";
import Wrapper from "../../components/wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { CreateUrqlClient } from "../../util/createUrqlClient";
import { errorMap } from "../../util/errorMap";




const ResetPassword:NextPage<{token:string}> = ({token}) => {
    
    const router = useRouter()
    const [tokenErr,setTokenErr] = useState<string | null>(null)

    const [,changePassword] = useChangePasswordMutation()

    return (
        <>
        <Wrapper variant="small">
                        
    

        {
        
        tokenErr ?  
            <Alert status="error">
                <AlertIcon />
                tokenErr
            </Alert> 
        
            : null

        }

        <Formik initialValues={{newPassword:""}} onSubmit={async (values,{setErrors}) => {
            const response = await changePassword({newPassword:values.newPassword,token})
            console.log(response)

            if(response.data?.changePassword.errors){
                const errMap = errorMap(response.data?.changePassword.errors)
                if('token' in errMap){
                    console.log(errMap)
                }
                setErrors(errMap)
                return
            }
            if(response.data?.changePassword.user){
                router.push('/login')
            }
      
        } }>      
            {({isSubmitting}) => (
      
              <Form>
                <InputField name="newPassword" type="password" label="new password" placeholder="new password"  />
                <Button isLoading={isSubmitting}  mt={5} type="submit" colorScheme="teal">Change password</Button>
              </Form>
      
            )}
      
        </Formik>  
        </Wrapper>
        </>

    )

}

ResetPassword.getInitialProps = ({query}) =>{
    return {
    token: query.token  as string
    }
}


export default withUrqlClient(CreateUrqlClient,{ssr:false})(ResetPassword as unknown as NextComponentType)



