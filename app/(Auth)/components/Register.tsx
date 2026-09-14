// app/(Auth)/components/Register.tsx
'use client'

import FlyoutLayout from "@/app/components/(Flyouts)/FlyoutLayout";
import { Ref, useActionState, useEffect, useImperativeHandle, useRef, useState } from "react";
import {  RegisterState ,RegisterAction } from "./action/RegisterAction";
import { flyoutPageEnum, useFlyoutPage } from "@/app/components/(Flyouts)/(Provider)/FlyoutPageContextProvider";
import CaptchaCMP, { CaptchaHandler } from "@/app/components/(captcha)/Captcha_CMP";
import SplitInput from "@/app/components/(captcha)/Split_InputCMP";
import { sendSmsAction } from "./action/sendSmsAction";
export interface RegisterHandlerRef{
 openMe:()=>void,
  closeMe:()=>void,
  ToggleShow:()=>void
}

export default function Register({ref }: {ref?:Ref<RegisterHandlerRef>}){
        const[isOpen , setIsOpen]=useState(false)
        const [formKey, setFormKey] = useState(0)

        useImperativeHandle(ref , ()=>({
          openMe :()=>{setIsOpen(true)},
          closeMe :()=>{setIsOpen(false); setFormKey(k => k + 1)},
          ToggleShow:()=>{ setIsOpen(!isOpen) }
        }))

     const closeMe=()=>{
    
    setIsOpen(!isOpen);
    setFormKey(k => k + 1);
  }

    return(
          <FlyoutLayout onCloseMe={closeMe} isOpen={isOpen}>
                      <div id="content" className="flex flex-col w-full h-full  items-center gap-2 portrait:px-3 ">
                          <div className="flex w-full  justify-around items-center relative shrink-0">
                              <h4>فرم ثبت نام کاربران</h4>
                          </div>
        
                          <hr className="w-[99%] text-gray-200 shrink-0" />
                          
                          <div id="form" className="flex flex-col w-full flex-1 min-h-0 items-center overflow-y-auto ">
                                <RegisterForm key={formKey} />
                          </div>
        
                      </div>
           </FlyoutLayout>
    )
}


function RegisterForm() {
  const { CloseMe_and_Open, messageBox_show } = useFlyoutPage()

  const captchaRef = useRef<CaptchaHandler>(null)
        
  const [state, formAction, isPending] = useActionState<RegisterState, FormData>( RegisterAction, null )

  useEffect(() => {
    if (state?.success === false ) {
      captchaRef.current?.clear()
    }
  }, [state])

  const messageBoxShowRef = useRef(messageBox_show)
  useEffect(() => {
    messageBoxShowRef.current = messageBox_show
  })

  useEffect(() => {
    if (state?.success === true) {
      messageBoxShowRef.current("ثبت نام", 
        [
            "ثبت نام با موفقیت انجام شد.   اکنون میتوانید وارد حساب کاربری خود شوید.",
            " توجه داشته باشید برای استفاده از امکانات سایت میبایست نسبت به تکمیل پروفایل کاربری خود اقدام نمایید ."
        ],
         "success")

    } else if (state?.success === false ) {
        let errorMessage:string[] =[];
        state.errors?.userName && ( errorMessage.push(state.errors?.userName))
        state.errors?.passWord && ( errorMessage.push(state.errors?.passWord))
        state.errors?.userCaptcha && ( errorMessage.push(state.errors?.userCaptcha))
        state.errors?.sms_code && ( errorMessage.push(state.errors?.sms_code))
        state.errors?.publicError && ( errorMessage.push(state.errors?.publicError))
        
       
      messageBoxShowRef.current("خطا", errorMessage, "error")
    }
  }, [state])

  const [sms_Pending , setSms_Pending]=useState(false);
  const [countdown, setCountdown]=useState(0);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const handleSendSms = async () => {
    const mobileInput = document.getElementById('mobile_number') as HTMLInputElement;
    const mobile = mobileInput?.value;
    if (!mobile || !/^09[0-9]{9}$/.test(mobile)) {
      messageBoxShowRef.current("خطا", ["شماره موبایل را صحیح وارد کنید."], "error");
      return;
    }
    setSms_Pending(true);
    const result = await sendSmsAction(mobile);
    setSms_Pending(false);
    if (result?.success) {
      setCountdown(300);
      messageBoxShowRef.current("موفق", ["کد تایید پیامکی ارسال شد."], "success");
    } else {
      messageBoxShowRef.current("خطا", [result?.message || "ارسال پیامک ناموفق بود."], "error");
    }
  };

  const countdownActive = countdown > 0;

  useEffect(() => {
    if (!countdownActive) return;
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [countdownActive]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <form action={formAction} className="flex flex-col   items-center landscape:w-xs portrait:w-full text-slate-800 gap-2">
      {/* userName ----------- */}
      <div className="flex flex-col w-[95%] sm:w-[85%] gap-1">
          <div className="flex w-full items-center gap-1">
              <label className="text-right text-[10px] pr-2"> نام کاربری:</label>
              { state?.errors?.userName && (
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
      {/* passWord ------------ */}
      <div className="flex flex-col w-[95%] sm:w-[85%] gap-1">
          <div className="flex w-full items-center gap-1 ">
              <label className="text-right text-[10px] pr-2">گذر واژه :</label>
              {state?.errors?.passWord  &&(
                 <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
              )}
          </div>
          <input id="password" name="password" type="password" autoComplete="current-password" placeholder="PassWord" dir="ltr"
              required
              className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&])[a-zA-Z0-9@#$%^&]{5,}$"
            //   پسوورد -- پترن پسورود حداقل 5 حرف حتما 	حداقل شامل  1 حرف کوچک -- حداقل 1 حرف بزرگ و  حداقل یک نشانه از @#$%^& باشد
          />
      </div>


<hr  className="w-[90%] border-gray-300 mt-3 "/>


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

           {/* sms code button ---------- */}
      <div className="flex w-[70%] sm:w-[70%] gap-2 mt-1 text-sm">
          <button
              type="button"
              id="smsBTN"
              className="block bg-lime-500 text-white w-full rounded-md px-3 pt-2 pb-2 text-xs text-center outline-0 disabled:opacity-50"
              disabled={sms_Pending || countdown > 0}
              onClick={handleSendSms}
          >
              {countdown > 0
                ? `${formatCountdown(countdown)} ارسال مجدد`
                : sms_Pending
                  ? " در حال ارسال . . ."
                  : "ارسال کد تایید پیامکی"}
          </button>
      </div>

      {/* register button ---------- */}
      <div className="flex flex-col w-[95%] sm:w-[85%] gap-2 mt-2 justify-center">
          <div className="flex w-full items-center gap-1 ">
              <label className="text-right text-[10px] pr-2">   کد تایید پیامکی :  </label>
              {state?.errors?.sms_code && (
                  <div className=" h-2 w-2  bg-red-600 rounded-full"></div>
              )}
          </div>
          <input id="sms_code" name="sms_code" type="text" placeholder="sms_code" dir="ltr"
              required  
              className="block w-full rounded-md px-3 pt-3 pb-2 text-xs outline-1 outline-gray-300"
              pattern="^[0-9]{5}$"
          />
      </div>


 <hr  className="w-[90%] border-gray-300 mb-3"/>

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
              <SplitInput name="userCaptchaInput"  />
          </div>

      </div>
              {/* submit button ---------- */}
      <div className="flex w-[95%] sm:w-[85%] gap-2 mt-1 text-sm">
          <button
              type="submit"
              className="block bg-sky-600 text-white w-full rounded-md px-3 pt-2 pb-2 text-center outline-0 disabled:opacity-50"
              disabled={isPending}
          >
              {isPending ? "  ثبت مشخصات  . . ." : " ثبت مشخصات "}
          </button>
      </div>

              {/* register button ---------- */}
      <div className="flex flex-col w-[95%] sm:w-[85%] gap-2 mt-2 justify-center">
          <p className="w-full mt-5 text-center text-sm/6">
                قبلا در سایت ثبت نام کرده اید ؟{' '}
              <button
                  type="button"
                  className="text-sm font-extrabold text-sky-600 hover:text-sky-400 hover:cursor-pointer"
                    onClick={()=>CloseMe_and_Open(flyoutPageEnum.login)}
              >
                   ورود
              </button>
          </p>
      </div>

    </form>
  )
}
