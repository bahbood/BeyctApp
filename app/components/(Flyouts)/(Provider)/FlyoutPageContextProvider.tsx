// app/lib/FlyoutPageContext.tsx
'use client'

import { createContext, useContext, useState, ReactNode, useRef } from 'react'
import RegisterSW from '../../../lib/serviceWorker'
import SideMenu, { SideMenuHandlerRef } from '../SideMenu'
import LogIn, { LoginHandlerRef } from '@/app/(Auth)/components/LogIn'
import LogOut, { LogOutHandlerRef } from '@/app/(Auth)/components/LogOut'
import Register, { RegisterHandlerRef } from '@/app/(Auth)/components/Register'
import Profile, { ProfileHandlerRef } from '@/app/(Auth)/components/Profile'
import ResetPassword, { ResetPasswordHandlerRef } from '@/app/(Auth)/components/ResetPassword'
import ChangePassword, { ChangePasswordHandlerRef } from '@/app/(Auth)/components/ChangePassword'

type MessageBoxState = {
    show: boolean
    caption: string
    messages: string[]

    type?: "info" | "success" | "warning" | "error"
}

// FlyoutPageContextType **************************************************************************
interface I_FlyoutPageProviderContext{
  CloseMe_and_Open:(replacePage : flyoutPageEnum)=>void 
  sideMenu_toggleShow:()=>void
  logInPage_toggleShow:()=>void
  logOutPage_toggleShow:()=>void
  ProfilePage_toggleShow:()=>void
  RegisterPage_toggleShow:()=>void
  ResetPasswordPage_toggleShow:()=>void
  ChangePasswordPage_toggleShow:()=>void
  
  messageBox_show(
    caption: string,
    messages:string[],
    type?: MessageBoxState["type"]
): void

    messageBox_close: () => void

    messageBox: MessageBoxState

  user: logined_User_Info | null;
  setUser: (user: logined_User_Info | null) => void;
}
  // تعریف نوع کاربر
export type logined_User_Info = {
  id?:number;
  name?: string;
  family?: string;
  avatar?: string;
  mobile?: string;
  email?: string;
  role?: string;
  store_active?: boolean;
  news_agency_active?: boolean;
  serviceman_active?: boolean;
};

export enum flyoutPageEnum{ login , logout , register , profile , resetPassword , ChangePassword , sideMenu }

const FlyoutPageContext = createContext<I_FlyoutPageProviderContext | undefined >(undefined)

// FlyoutPageProvider **************************************************************************
/** پرووایدر منوی شناور برای صفحات احراز هویت و منوی چپ به راست نرم افزار */
export function FlyoutPageProvider({ children , initialUser = null }: { children: ReactNode ,initialUser?: logined_User_Info | null} ) {
  //
   const [user, setUser] = useState<logined_User_Info | null>(initialUser);

   const [messageBox, setMessageBox] = useState<MessageBoxState>({
    show: false,
    caption: "",
    messages: []
})

   const SideMenuHandler= useRef<SideMenuHandlerRef>(null)
   const LogInHandler= useRef<LoginHandlerRef>(null)
  const LogOutHandler= useRef<LogOutHandlerRef>(null)
  const RegisterHandler=useRef<RegisterHandlerRef>(null)
  const ProfileHandler=useRef<ProfileHandlerRef>(null)
  const ResetPasswordHandler=useRef<ResetPasswordHandlerRef>(null)
   const ChangePasswordHandler=useRef<ChangePasswordHandlerRef>(null)

  const closeAllForm=()=>{
                  SideMenuHandler.current?.closeMe();
                  LogInHandler.current?.closeMe();
                  LogOutHandler.current?.closeMe();
                  ProfileHandler.current?.closeMe();
                  RegisterHandler.current?.closeMe();
                  ResetPasswordHandler.current?.closeMe();
                  ChangePasswordHandler.current?.closeMe();
                  messageBox_close();
  }

  const [messageBoxVisible, setMessageBoxVisible] = useState(false);

 const messageBox_show = (
    caption: string,
    messages: string[],
    type: MessageBoxState["type"] = "info"
) => {

    setMessageBox({
        show: true,
        caption,
        messages,
        type
    });

    requestAnimationFrame(() => {
        setMessageBoxVisible(true);
    });
};

const messageBox_close = () => {

    setMessageBoxVisible(false);

    setTimeout(() => {
        setMessageBox({
            show: false,
            caption: "",
            messages: [],
            type: "info"
        });
    }, 250);
};

  const CloseMe_and_Open=(replacePage : flyoutPageEnum)=>{
    closeAllForm();
  setTimeout(() => {
    switch (replacePage) {
    case flyoutPageEnum.login:
         LogInHandler.current?.ToggleShow()
      break;
      case flyoutPageEnum.logout:
        LogOutHandler.current?.ToggleShow()
      break;
      case flyoutPageEnum.register:
        RegisterHandler.current?.ToggleShow()
      break;
      case flyoutPageEnum.profile:
        ProfileHandler.current?.ToggleShow()
      break;
      case flyoutPageEnum.resetPassword:
        ResetPasswordHandler.current?.ToggleShow()
      break;
      case flyoutPageEnum.ChangePassword:
        ChangePasswordHandler.current?.ToggleShow()
      break;
      case flyoutPageEnum.sideMenu:
        SideMenuHandler.current?.ToggleShow()
      break;
  
   }

   },1000)
  }

  const headerColor = {
    info: "bg-sky-600",
    success: "bg-green-600",
    warning: "bg-yellow-500",
    error: "bg-red-600"
    }[messageBox.type ?? "info"]

  return (
    <FlyoutPageContext.Provider 
            value={
              { 
                CloseMe_and_Open: (replacePage : flyoutPageEnum)=>{ CloseMe_and_Open(replacePage);}
                ,
                sideMenu_toggleShow : ()=>{ closeAllForm();  SideMenuHandler.current?.ToggleShow() }
                ,
                logInPage_toggleShow :()=>{ closeAllForm(); LogInHandler.current?.ToggleShow()}
                ,
                logOutPage_toggleShow :()=>{ closeAllForm(); LogOutHandler.current?.ToggleShow()}
                ,
                ProfilePage_toggleShow :()=>{ closeAllForm(); ProfileHandler.current?.ToggleShow() }
                ,
                RegisterPage_toggleShow :()=>{ closeAllForm(); RegisterHandler.current?.ToggleShow() }
                ,
                
                ChangePasswordPage_toggleShow : ()=>{ closeAllForm(); ChangePasswordHandler.current?.ToggleShow() }
                ,
                ResetPasswordPage_toggleShow : ()=>{ closeAllForm(); ResetPasswordHandler.current?.ToggleShow() }
                ,

messageBox,
messageBox_show,
messageBox_close

                ,
                user
                ,
                setUser
              }
             
            }>
       <RegisterSW/>

       {/* popup message box on top off all *************** */}
      {messageBox.show && (

        <div className={` fixed inset-0 z-60 flex justify-center items-center bg-black/30
            transition-opacity duration-500
            ${messageBoxVisible ? "opacity-100" : "opacity-0"}
        `}>
          <div className={` flex flex-col landscape:w-md portrait:w-[90%] max-h-[70%] bg-white border-2 border-gray-500 rounded-sm shadow-lg
                transition-all duration-500
                ${ messageBoxVisible ? "opacity-100 scale-100 translate-y-0": "opacity-0 scale-90 translate-y-6" }
            `}>
            <span className={`${headerColor} text-white p-3`} > {messageBox.caption} </span>
            <div className="flex flex-col items-center w-full flex-1 bg-gray-100 px-3 py-2 overflow-y-scroll">
              {messageBox.messages &&
                messageBox.messages.map((message, index) =>
                  <p key={index} className="block w-full text-justify indent-1 text-xs py-1">
                    {message}
                  </p>
                )
              }

              <button onClick={messageBox_close}
                className="w-[85%]  py-3 bg-lime-500 text-white text-center text-md rounded-sm my-4 cursor-pointer"> متوجه شدم </button>

            </div>
          </div>
        </div>
      )}   
        {/* popup message box end *************** */}

        {/* فرم ها و برگ های پرنده       */}
       <SideMenu ref={SideMenuHandler}/>
       <LogIn  ref={LogInHandler} />
       <LogOut ref={LogOutHandler} />
       <Profile ref={ProfileHandler} />
       <Register  ref={RegisterHandler} />
       <ResetPassword ref={ResetPasswordHandler} />
       <ChangePassword ref={ChangePasswordHandler} /> 


      {children}

    </FlyoutPageContext.Provider>
  )
}

// useFlyoutPage **************************************************************************
/** FlyoutPageContext هوک برای دسترسی به کانتکس های ارائه شده منوی شناور  */
export function useFlyoutPage() {
  const context = useContext(FlyoutPageContext)
  if (!context) {
    throw new Error('useMobileMenu must be used within MobileMenuProvider')
  }
  return context
}



