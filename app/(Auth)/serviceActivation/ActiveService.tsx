// app/(Auth)/components/ActiveService.tsx

import { CaptchaHandler } from "@/app/components/(captcha)/Captcha_CMP"
import FlyoutLayout from "@/app/components/(Flyouts)/FlyoutLayout"
import { Ref, useActionState, useCallback, useRef, useState } from "react"
import { ActiveServiceAction, ActiveServiceState } from "./ActiveServiceAction"

export interface ActiveServiceHandlerRef{
  openMe?:()=>void,
  closeMe?:()=>void,
  ToggleShow:()=>void
}

export default function ActiveService({ref }: {ref?:Ref<ActiveServiceHandlerRef>}){
     const[isOpen , setIsOpen]=useState(false)
      const [captchaId, setCaptchaId] = useState("")
       const [userCaptchaInput, setUserCaptchaInput] = useState("")
        const handleCapchCMP_methodes=useRef<CaptchaHandler>(null)
        
     const closeMe=()=>{
    
    setIsOpen(!isOpen);
    
  }

  const [state, formAction, isPending] = useActionState<ActiveServiceState, FormData>(ActiveServiceAction, null )
  
    const handleCaptchaIdChange = useCallback((id: string) => {
      setCaptchaId(id)
    }, [])
  
    const handleUserCaptchaInput = useCallback((input: string) => {
      setUserCaptchaInput(input)
    }, [])

    
    return(
          <FlyoutLayout onCloseMe={closeMe} isOpen={isOpen}>

          </FlyoutLayout>
    )
}