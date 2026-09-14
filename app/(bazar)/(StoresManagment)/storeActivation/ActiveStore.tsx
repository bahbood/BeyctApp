// app/(Auth)/components/ActiveStore.tsx

import { CaptchaHandler } from "@/app/components/(captcha)/Captcha_CMP"
import FlyoutLayout from "@/app/components/(Flyouts)/FlyoutLayout"
import { Ref, useActionState, useCallback, useRef, useState } from "react"
import { ActiveStoreAction, ActiveStoreState } from "./ActiveStoreAction"
export const dynamic = 'force-dynamic'

export interface ActiveStoreHandlerRef{
  openMe?:()=>void,
  closeMe?:()=>void,
  ToggleShow:()=>void
}

export default function ActiveStore({ref }: {ref?:Ref<ActiveStoreHandlerRef>}){
     const[isOpen , setIsOpen]=useState(false)
      const [captchaId, setCaptchaId] = useState("")
       const [userCaptchaInput, setUserCaptchaInput] = useState("")
        const handleCapchCMP_methodes=useRef<CaptchaHandler>(null)
        
     const closeMe=()=>{
    
    setIsOpen(!isOpen);
    
  }

  const [state, formAction, isPending] = useActionState<ActiveStoreState, FormData>( ActiveStoreAction, null )
  
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