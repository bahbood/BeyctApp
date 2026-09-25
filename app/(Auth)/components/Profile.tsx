// app/(Auth)/components/Profile.tsx

'use client'

import { useActionState, useState, useEffect, useRef,  useImperativeHandle, Ref } from "react"
import { useRouter } from "next/navigation"
import FlyoutLayout from "@/app/components/(Flyouts)/FlyoutLayout"
import { flyoutPageEnum, useFlyoutPage } from "@/app/components/(Flyouts)/(Provider)/FlyoutPageContextProvider"
import { ProfileAction, ProfileState } from "./action/profileAction"
import CaptchaCMP, { CaptchaHandler } from "@/app/components/(captcha)/Captcha_CMP"
import SplitInput from "@/app/components/(captcha)/Split_InputCMP"

export interface ProfileHandlerRef{
  openMe:()=>void,
  closeMe:()=>void,
  ToggleShow:()=>void
}


export default function Profile( {ref }: {ref?:Ref<ProfileHandlerRef>} ) {
  const { setUser, user , CloseMe_and_Open , messageBox_show} = useFlyoutPage()
    const[isOpen , setIsOpen]=useState(false)
  const [formKey, setFormKey] = useState(0)
  
    useImperativeHandle(ref , ()=>({
      openMe :()=>{setIsOpen(true)},
       closeMe :()=>{setIsOpen(false); setFormKey(k => k + 1)},
       ToggleShow: () => {setIsOpen(prev => !prev)},
  
    }))
  
   const captchaRef = useRef<CaptchaHandler>(null)

  
  const [state, formAction, isPending] = useActionState<ProfileState, FormData>( ProfileAction, null )

  
  const router = useRouter()
   const messageBoxShowRef = useRef(messageBox_show)

useEffect(() => {
  messageBoxShowRef.current = messageBox_show
}, [messageBox_show])

    useEffect(() => {
       if (state?.success === true) {
            if (state.user){ setUser(state.user)}
           
           messageBoxShowRef.current(
  "پروفایل",
  [
    "اطلاعات پروفایل با موفقیت به‌روزرسانی شد.",
  ],
  "success"
)
            router.refresh()
            setIsOpen(false)
        }else if (state?.success === false ){
           let errorMessage: string[] = [];
           state.errors?.name && (errorMessage.push(state.errors?.name))
           state.errors?.family && (errorMessage.push(state.errors?.family))
           state.errors?.userCaptcha && (errorMessage.push(state.errors?.userCaptcha))
           state.errors?.email && (errorMessage.push(state.errors?.email))
           state.errors?.publicError && (errorMessage.push(state.errors?.publicError))


           messageBoxShowRef.current("خطا", errorMessage, "error")
        }

    }, [state, router, setUser])

     useEffect(() => {
       if ( state?.success === false && state?.errors?.userCaptcha) {
            captchaRef.current?.clear()
        }

    }, [state])

  const closeMe=()=>{
    setFormKey(k => k + 1);
    setIsOpen(!isOpen);
    
  }

  return (
    <>
    <FlyoutLayout onCloseMe={closeMe} isOpen={isOpen}>
              <div id="content" className="flex flex-col w-full h-full  items-center gap-2 portrait:px-3 ">
                  <div className="flex w-full  justify-around items-center relative shrink-0">
                      <h4>فرم پروفایل </h4>
                  </div>

                  <hr className="w-[99%] text-gray-200 shrink-0" />
                  
                  <div id="form" className="flex flex-col w-full flex-1 min-h-0 items-center overflow-y-auto ">
                        <form action={formAction} key={formKey} className="flex flex-col   items-center landscape:w-xs portrait:w-full text-slate-800 gap-2">
                          {/* name ----------- */}
                          <div className="flex flex-col w-[95%] sm:w-[85%] gap-1">
                              <div className="flex w-full ">
                                  <label className="text-right text-[10px] pr-2">نام  :</label>
                                  {state?.errors?.name && (
                                      <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
                                  )}
                              </div>
                              <input id="name" name="name" type="text" placeholder="نام" dir="rtl"
                                  required autoFocus defaultValue={state?.values?.name ?? user?.name ?? ""}
                                  className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
                              />
                          </div>
                          {/* family ----------- */}
                          <div className="flex flex-col w-[95%] sm:w-[85%] gap-1">
                              <div className="flex w-full ">
                                  <label className="text-right text-[10px] pr-2">نام خانوادگی  :</label>
                                  {state?.errors?.family && (
                                      <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
                                  )}
                              </div>
                              <input id="family" name="family" type="text" placeholder="نام خانوادگی" dir="rtl"
                                  required  defaultValue={state?.values?.family ?? user?.family ?? ""}
                                  className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
                              />
                          </div>

                           {/* mobile ----------- */}
                          <div className="flex flex-col w-[95%] sm:w-[85%] gap-1">
                              <div className="flex w-full ">
                                  <label className="text-right text-[10px] pr-2">تلفن همراه:</label>
                              </div>
                              <input id="mobile"  type="text"  dir="ltr"
                                  readOnly  defaultValue={user?.mobile ||  ""}
                                  className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
                              />
                          </div>

                           {/* email ----------- */}
                          <div className="flex flex-col w-[95%] sm:w-[85%] gap-1">
                              <div className="flex w-full ">
                                  <label className="text-right text-[10px] pr-2"> رایانامه ( ایمیل ):</label>
                                  {state?.errors?.email && (
                                      <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
                                  )}
                              </div>
                              <input id="email" name="email" type="text" placeholder="email" dir="ltr"
                                  required  defaultValue={state?.values?.email ?? user?.email ?? ""}
                                  className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
                              />
                          </div>

                           {/* avatar ----------- */}
                          {/* <div className="flex flex-col w-[95%] sm:w-[85%] gap-1">
                              <div className="flex w-full ">
                                  <label className="text-right text-[10px] pr-2"> شکلک ( آواتار ):</label>
                                  {state?.errors?.avatar && (
                                      <label className="text-right text-[10px] pr-2 text-red-600">{state?.errors?.avatar}</label>
                                  )}
                              </div>
                              <input id="avatar" name="avatar" type="text" placeholder="avatar" dir="ltr"
                                  required  defaultValue={state?.values?.avatar || ""}
                                  className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
                              />
                          </div> */}

                          
                         
                        {/* captcha ---------- */}
                          <div className="flex flex-col w-[95%] sm:w-[85%] gap-1 mt-2">
                              <div className="flex w-full">
                                  <label className="text-right text-[10px] pr-2">کد امنیتی :</label>
                                  {state?.errors?.userCaptcha && (
                                      <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
                                  )}
                              </div>

                              <div className="flex flex-col w-full gap-2">
                                  <CaptchaCMP className="w-full flex" name="captchaId" ref={captchaRef} />
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
                                  {isPending ? "   در حال ذخیره . . ." : "ذخیره"}
                              </button>
                          </div>

                          {/* ChangePassword   ---------- */}
                          <div className="flex flex-col w-[95%] sm:w-[85%] gap-2 mt-2 justify-center">
                              <p className="w-full mt-5 text-center text-sm/6">
                                 
                                  <button
                                      type="button"
                                      className="text-sm font-extrabold text-sky-600 hover:text-sky-400 hover:cursor-pointer"
                                        onClick={()=>{ CloseMe_and_Open(flyoutPageEnum.ChangePassword) }}
                                  >
                                      فرم تغییر گذرواژه ( کلمه عبور ) 
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

