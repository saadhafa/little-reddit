import { FormControl, FormLabel, Input, FormErrorMessage,Textarea } from '@chakra-ui/react'
import { useField } from 'formik'
import React, { InputHTMLAttributes } from 'react'



type InputField = InputHTMLAttributes<HTMLInputElement> &  {
  name:string;
  label:string;
  textarea?:boolean;
}



const InputField:React.FC<InputField> = ({textarea, label,size:_,...props}) =>{

  let InputOrTextarea:any = Input

  if(textarea){
    InputOrTextarea = Textarea
  }

  const [field,{error, }] = useField(props)
return (

  <FormControl isInvalid={!!error}>
  <FormLabel htmlFor={field.name}>{label}</FormLabel>
  <InputOrTextarea {...field} {...props} id={field.name} placeholder={props.placeholder} />
  {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
</FormControl>


)


}


export default InputField