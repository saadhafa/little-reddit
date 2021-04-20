import { FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/react'
import { useField } from 'formik'
import React, { InputHTMLAttributes } from 'react'



type InputField = InputHTMLAttributes<HTMLInputElement> &  {
  name:string;
  label:string;
}


const InputField:React.FC<InputField> = ({label,size:_,...props}) =>{

  const [field,{error, }] = useField(props)
return (

  <FormControl isInvalid={!!error}>
  <FormLabel htmlFor={field.name}>{label}</FormLabel>
  <Input {...field} {...props} id={field.name} placeholder={props.placeholder} />
  {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
</FormControl>


)


}


export default InputField