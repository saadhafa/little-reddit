import { Alert } from '@chakra-ui/react'

type StatusType = {
    status?:  "info" | "warning" | "success" | "error" | undefined;
}

interface AlertProps {
    status:StatusType
    Children:any;
  }
  
  const AlertComponent:React.FC<AlertProps> = ({status,Children}) => {
    return (
      <Alert status={status}>
      {Children}
    </Alert>
  
    )
  }


export default Alert