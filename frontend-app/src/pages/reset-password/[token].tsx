import { Alert, AlertIcon, Button, Link } from "@chakra-ui/react";
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
import NextLink from 'next/link'




const ResetPassword:NextPage = () => {
    
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
                {tokenErr}        
                <NextLink href="/forgot-password">
                    <Link ml={2} color-="red">Go to forgot password</Link>
                </NextLink>
            </Alert> 
        
            : null

        }

        <Formik initialValues={{newPassword:""}} onSubmit={async (values,{setErrors}) => {
            const response = await changePassword({newPassword:values.newPassword,token:typeof router.query.token === 'string' ? router.query.token : ""})
 
            if(response.data?.changePassword.errors){
                const errMap = errorMap(response.data?.changePassword.errors)
                if('token' in errMap){
                    setTokenErr(errMap.token)
                }
                setErrors(errMap)
            }
            if(response.data?.changePassword.user){
                router.push('/login')
            }
      
        } }>      
            {({isSubmitting}) => (
      
              <Form>
                <InputField name="newPassword" type="password" label="new password" placeholder="new password"  />
                <Button mb={10} isLoading={isSubmitting}  mt={5} type="button" colorScheme="teal">Change password</Button>
              </Form>
      
            )}
      
        </Formik>
 
        </Wrapper>
        </>

    )

}



export default withUrqlClient(CreateUrqlClient,{ssr:false})(ResetPassword)



