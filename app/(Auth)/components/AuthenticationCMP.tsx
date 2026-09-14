import { useFlyoutPage } from "@/app/components/(Flyouts)/(Provider)/FlyoutPageContextProvider"


export default function AuthenticationCMP({className ,}:{className:string , }){

        const {logInPage_toggleShow,logOutPage_toggleShow ,ProfilePage_toggleShow,RegisterPage_toggleShow, user } = useFlyoutPage()

        const UserCMP_ClickHandler=()=>{
                if(user)
                {
                    logOutPage_toggleShow()
                }
                else{
                    logInPage_toggleShow()
                }
        }
    
    return(
        <>
      <div className={`${className}`} onClick={UserCMP_ClickHandler} >
            <svg xmlns="http://www.w3.org/2000/svg" className="size-6 group-hover:fill-orange-600 fill-white transition-colors duration-300 stroke-0 mx-1 " width="20mm" height="20mm" viewBox="0 0 20 20">
                        <path d="M15.8039 19.236l3.0963 0c-0.6721,-4.3289 -4.4158,-7.6424 -8.9332,-7.6424 -4.5174,0 -8.2611,3.3135 -8.9332,7.6424l3.0963 0c0.63,-2.6396 3.0042,-4.6024 5.8369,-4.6024 2.8327,0 5.2069,1.9628 5.8369,4.6024z" />
                        <path d="M9.967 0.8724c-2.7614,0 -5,2.2386 -5,5 0,2.7614 2.2386,5 5,5 2.7614,0 5,-2.2386 5,-5 0,-2.7614 -2.2386,-5 -5,-5zm0 3.04c1.0825,0 1.96,0.8775 1.96,1.96 0,1.0825 -0.8775,1.96 -1.96,1.96 -1.0825,0 -1.96,-0.8775 -1.96,-1.96 0,-1.0825 0.8775,-1.96 1.96,-1.96z" />
                        
            </svg>

            <div className="landscape:flex portrait:hidden flex-1 flex-col justify-center items-center  h-12.5 ms-1 ">
                        <div className="w-full h-1/4">
                            <span className=" flex items-center w-full h-full  text-[10px] group-hover:text-sky-300 text-white/50 transition-colors duration-300 " >
                                {user ? `Logout . Profile` : `Login`}
                            </span>

                        </div>
                        <div className="flex gap-1 w-full h-1/4 items-center">
                            <div className={` w-1 h-1 rounded-full ${ user ? `bg-green-200` : `hidden` }`}></div>
                            <span className=" flex items-center w-full h-full  text-[10px] group-hover:text-sky-300 text-white/60 transition-colors duration-300 ">
                               {user ? `User : ${user.name}` : `User : Quest user`}
                            </span>

                        </div>
            </div>
            
       </div>  

       {/* <div className="w-2 h-9 bg-white/20 mx-1"  onClick={()=>RegisterPage_toggleShow()}></div>
       <div className="w-2 h-9 bg-white/20 "  onClick={()=>ProfilePage_toggleShow()}></div> */}
       </>
    )
}