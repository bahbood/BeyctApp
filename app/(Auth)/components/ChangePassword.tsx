// app/(Auth)/components/ChangePassword.tsx

// app/(Auth)/components/LogIn.tsx
'use client'

import { useActionState, useState, useEffect, useRef, useImperativeHandle, Ref } from "react"
import { useRouter } from "next/navigation"
import FlyoutLayout from "@/app/components/(Flyouts)/FlyoutLayout"
import { flyoutPageEnum, useFlyoutPage } from "@/app/components/(Flyouts)/(Provider)/FlyoutPageContextProvider"
import CaptchaCMP, { CaptchaHandler } from "@/app/components/(captcha)/Captcha_CMP"
import SplitInput from "@/app/components/(captcha)/Split_InputCMP"
import { ChangePasswordAction, ChangePasswordState } from "./action/changePasswordAction"

export interface ChangePasswordHandlerRef {
  openMe: () => void,
  closeMe: () => void,
  ToggleShow: () => void
}

export default function ChangePassword({ ref }: { ref?: Ref<ChangePasswordHandlerRef> }) {

   const { CloseMe_and_Open, messageBox_show } = useFlyoutPage()
  const { setUser } = useFlyoutPage()
  const [isOpen, setIsOpen] = useState(false)

  useImperativeHandle(ref, () => ({
    openMe: () => { setIsOpen(true) },
    closeMe: () => { setIsOpen(false) },
    ToggleShow: () => { setIsOpen(!isOpen) }
  }))

  const captchaRef = useRef<CaptchaHandler>(null)
  const [state, formAction, isPending] = useActionState<ChangePasswordState, FormData>(ChangePasswordAction, null)

  const router = useRouter()
  useEffect(() => {
    if (state?.success === true ) {
      
      router.refresh()
      setIsOpen(false)
    }
  }, [state, router, setUser])

  const messageBoxShowRef = useRef(messageBox_show)
  useEffect(() => {
    messageBoxShowRef.current = messageBox_show
  })

  useEffect(() => {
    if (state?.success === false)  {
        let errorMessage:string[] =[];
        state.errors?.Old_PassWord && ( errorMessage.push(state.errors?.Old_PassWord))
        state.errors?.New_PassWord && ( errorMessage.push(state.errors?.New_PassWord))
        state.errors?.userCaptcha && ( errorMessage.push(state.errors?.userCaptcha))
        state.errors?.publicError && ( errorMessage.push(state.errors?.publicError))
     
        messageBoxShowRef.current("خطا", errorMessage, "error")
    }
  }, [state])

  const closeMe=()=>{
    
    setIsOpen(!isOpen);
    
  }

  return (
    <>
    <FlyoutLayout onCloseMe={closeMe} isOpen={isOpen}>
              <div id="content" className="flex flex-col w-full h-full  items-center gap-2 portrait:px-3 ">
                  <div className="flex w-full  justify-around items-center relative shrink-0">
                      <h4>فرم  تغییر گذرواژه</h4>
                  </div>

                  <hr className="w-[99%] text-gray-200 shrink-0" />
                  
                  <div id="form" className="flex flex-col w-full flex-1 min-h-0 items-center overflow-y-auto ">
                        <form action={formAction} className="flex flex-col   items-center landscape:w-xs portrait:w-full text-slate-800 gap-2">
                          {/* Old_PassWord ----------- */}
                          <div className="flex flex-col w-[95%] sm:w-[85%] gap-1">
                              <div className="flex w-full items-center gap-1">
                                  <label className="text-right text-[10px] pr-2"> گذر واژه قدیم  :</label>
                                  {state?.errors?.Old_PassWord && (
                                      <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
                                  )}
                              </div>
                              <input id="Old_PassWord" name="Old_PassWord" type="text" placeholder="Old_PassWord" dir="ltr"
                                  required autoFocus 
                                  className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
                                  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&])[a-zA-Z0-9@#$%^&]{5,}$"
                              //   پسوورد -- پترن پسورود حداقل 5 حرف حتما 	حداقل شامل  1 حرف کوچک -- حداقل 1 حرف بزرگ و  حداقل یک نشانه از @#$%^& باشد
                              />
                          </div>
                          {/* New_PassWord ------------ */}
                          <div className="flex flex-col w-[95%] sm:w-[85%] gap-1">
                              <div className="flex w-full items-center gap-1 ">
                                  <label className="text-right text-[10px] pr-2">گذر واژه جدید  :</label>
                                  {state?.errors?.New_PassWord && (
                                      <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
                                  )}
                              </div>
                              <input id="New_PassWord" name="New_PassWord" type="New_PassWord"  placeholder="New_PassWord" dir="ltr"
                                  required
                                  className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
                                  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&])[a-zA-Z0-9@#$%^&]{5,}$"
                              //   پسوورد -- پترن پسورود حداقل 5 حرف حتما 	حداقل شامل  1 حرف کوچک -- حداقل 1 حرف بزرگ و  حداقل یک نشانه از @#$%^& باشد
                              />
                          </div>
                          {/* captcha ---------- */}
                          <div className="flex flex-col w-[95%] sm:w-[85%] gap-1 mt-2">
                              <div className="flex w-full items-center gap-1">
                                  <label className="text-right text-[10px] pr-2">کد امنیتی :</label>
                                  {state?.errors?.userCaptcha && (
                                      <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
                                  )}
                              </div>

                              <div className="flex flex-col w-full gap-2">
                                  <CaptchaCMP className="w-full flex" name="captchaId" ref={captchaRef} />
                                  {/* <Captcha_InputCMP name="userCaptchaInput" /> */}
                                  <SplitInput name="userCaptchaInput" />
                              </div>
                          </div>
                                   
                         
                          {/* submit button ---------- */}
                          <div className="flex w-[95%] sm:w-[85%] gap-2 mt-1 text-sm">
                              <button
                                  type="submit"
                                  className="block bg-sky-600 text-white w-full rounded-md px-3 pt-2 pb-2 text-center outline-0 disabled:opacity-50"
                                  disabled={isPending}
                              >
                                  {isPending ? " در حال ذخیره  . . ." : "تغییر گذرواژه"}
                              </button>
                          </div>

                          {/* register button ---------- */}
                          <div className="flex flex-col w-[95%] sm:w-[85%] gap-2 mt-2 justify-center">
                              <p className="w-full mt-5 text-center text-sm/6">
                                  عضو سایت نیستید ؟{' '}
                                  <button
                                      type="button"
                                      className="text-xs font-extrabold text-sky-600 hover:text-sky-400 hover:cursor-pointer"
                                    onClick={()=>{ CloseMe_and_Open(flyoutPageEnum.register) }}
                                  >
                                      ثبت نام
                                  </button>
                              </p>
                          
                              <p className="w-full mt-3 text-center text-sm/6">
                                 گذرواژه را فراموش کرده اید ؟{' '}
                                  <button type="button" className="text-xs font-extrabold text-sky-600 hover:text-sky-400 hover:cursor-pointer"
                                    onClick={()=>{ CloseMe_and_Open(flyoutPageEnum.resetPassword) }}
                                  >
                                      بازیابی گذرواژه 
                                  </button>
                              </p>
                          </div>


                      </form>
                  </div>

              </div>
   </FlyoutLayout>
  
   </>
  )
}