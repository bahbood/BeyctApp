// app/(Auth)/components/ResetPassword.tsx

// app/(Auth)/components/LogIn.tsx
'use client'

import { useActionState, useState, useEffect, useRef, useImperativeHandle, Ref } from "react"
import { useRouter } from "next/navigation"
import FlyoutLayout from "@/app/components/(Flyouts)/FlyoutLayout"
import { flyoutPageEnum, useFlyoutPage } from "@/app/components/(Flyouts)/(Provider)/FlyoutPageContextProvider"
import CaptchaCMP, { CaptchaHandler } from "@/app/components/(captcha)/Captcha_CMP"
import SplitInput from "@/app/components/(captcha)/Split_InputCMP"
import { ResetPasswordAction, ResetPasswordState } from "./action/ResetPasswordAction"

export interface ResetPasswordHandlerRef {
  openMe: () => void,
  closeMe: () => void,
  ToggleShow: () => void
}

export default function ResetPassword({ ref }: { ref?: Ref<ResetPasswordHandlerRef> }) {

   const { CloseMe_and_Open, messageBox_show } = useFlyoutPage()
  const { setUser } = useFlyoutPage()
  const [isOpen, setIsOpen] = useState(false)

  useImperativeHandle(ref, () => ({
    openMe: () => { setIsOpen(true) },
    closeMe: () => { setIsOpen(false) },
    ToggleShow: () => { setIsOpen(!isOpen) }
  }))

  const captchaRef = useRef<CaptchaHandler>(null)
  const [state, formAction, isPending] = useActionState<ResetPasswordState, FormData>(ResetPasswordAction, null)

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
        state.errors?.userName && ( errorMessage.push(state.errors?.userName))
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
                      <h4>فرم بازیابی گذرواژه</h4>
                  </div>

                  <hr className="w-[99%] text-gray-200 shrink-0" />
                  
                  <div id="form" className="flex flex-col w-full flex-1 min-h-0 items-center overflow-y-auto ">
                        <form action={formAction} className="flex flex-col   items-center landscape:w-xs portrait:w-full text-slate-800 gap-2">
                          {/* userName ----------- */}
                          <div className="flex flex-col w-[95%] sm:w-[85%] gap-1">
                              <div className="flex w-full items-center gap-1">
                                  <label className="text-right text-[10px] pr-2"> نام کاربری:</label>
                                  {state?.errors?.userName && (
                                      <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
                                  )}
                              </div>
                              <input id="userName" name="userName" type="text" placeholder="UserName" dir="ltr"
                                  required autoFocus defaultValue={state?.values?.userName || ""}
                                  className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
                                  pattern="^[a-zA-Z0-9_@#$%^&]{5,50}$"
                              // حروف لاتین کوچک و بزرگ و اعداد و زیرخط و @#$%^& --- حداقل 5 و حداکثر 50 کاراکتر   --  نام کاربری
                              />
                          </div>
                           {/* mobile number ----------- */}
                                  <div className="flex flex-col w-[95%] sm:w-[85%] gap-1">
                                      <div className="flex w-full items-center gap-1 ">
                                          <label className="text-right text-[10px] pr-2">  شماره موبایل : 09100000000 </label>
                                          {state?.errors?.mobile_number && (
                                              <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
                                          )}
                                      </div>
                                      <input id="mobile_number" name="mobile_number" type="text" placeholder="mobile_number" dir="ltr"
                                          required  defaultValue={state?.values?.mobile_number || ""}
                                          className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
                                          pattern="^09[0-9]{9}$"
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
                                   
                         
                          {/* sending reset sms button ---------- */}
                          <div className="flex w-[95%] sm:w-[85%] gap-2 mt-1 text-sm">
                              <button
                                  type="button"
                                  className="block bg-lime-600 text-white w-full rounded-md px-3 pt-2 pb-2 text-center outline-0 disabled:opacity-50"
                                 // disabled={isPending}
                              >
                                  {isPending ? "  ارسال پیامک بازیابی گذرواژه  . . ." : "ارسال پیامک بازیابی گذرواژه"}
                              </button>
                          </div>


<hr className="w-[95%] text-gray-200 shrink-0 mt-7" />

                           {/* resetCode ---------- */}
                          <div className="flex flex-col w-[95%] sm:w-[85%] gap-1 mt-2">
                              <div className="flex w-full items-center gap-1">
                                  <label className="text-right text-[10px] pr-2">کد پیامکی دریافتی  :</label>
                                  {state?.errors?.userCaptcha && (
                                      <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
                                  )}
                              </div>


                              <div className="flex flex-col w-full gap-2">
                                 
                                  <SplitInput name="resetCode" />
                              </div>
                          </div>
                              
                           {/* new passWord ------------ */}
                                  <div className="flex flex-col w-[95%] sm:w-[85%] gap-1">
                                      <div className="flex w-full items-center gap-1 ">
                                          <label className="text-right text-[10px] pr-2">گذر واژه جدید  :</label>
                                          {/* {state?.errors?.passWord  &&(
                                             <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
                                          )} */}
                                      </div>
                                      <input id="password" name="password" type="password" autoComplete="current-password" placeholder="PassWord" dir="ltr"
                                          required
                                          className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
                                          pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&])[a-zA-Z0-9@#$%^&]{5,}$"
                                        //   پسوورد -- پترن پسورود حداقل 5 حرف حتما 	حداقل شامل  1 حرف کوچک -- حداقل 1 حرف بزرگ و  حداقل یک نشانه از @#$%^& باشد
                                      />
                           </div>

                           {/* submit button ---------- */}
                          <div className="flex w-[95%] sm:w-[85%] gap-2 mt-1 text-sm">
                              <button
                                  type="button"
                                  className="block bg-sky-600 text-white w-full rounded-md px-3 pt-2 pb-2 text-center outline-0 disabled:opacity-50"
                                  disabled={isPending}
                              >
                                  {isPending ? "    در حال ذخیره   . . ." : "ذخیره گذرواژه جدید"}
                              </button>
                          </div>


                      </form>
                  </div>

              </div>
   </FlyoutLayout>
  
   </>
  )
}