'use client'
import Image from "next/image";
import {  useFlyoutPage } from '@/app/components/(Flyouts)/(Provider)/FlyoutPageContextProvider'
import { useRouter } from "next/navigation";
import AuthenticationCMP from "../(Auth)/components/AuthenticationCMP";
import { HeaderIconsCMP } from "./HeaderIconsCMP";

export default function HeaderCMP( {className}: {className?: string} ) {
    
    const {sideMenu_toggleShow , } = useFlyoutPage()

    const router= useRouter()
    const handleAuthForm_CloseEvent=()=>{
        router.refresh()
    }
    return (
        <div className={`${className}  `}>
           
            <div className=" w-3/4  h-full flex items-center p-0 m-0 ">
                <Image className="w-[100px]  " width={700} height={200} src="/logo/manaModeLine-7020-0.png" alt={"logo"} ></Image>
                <HeaderIconsCMP className="landscape:flex portrait:hidden  ms-5"/>
            </div>
            <div dir="ltr" className=" w-1/4  h-full flex items-center  ">

                <svg onClick={()=>sideMenu_toggleShow()} xmlns="http://www.w3.org/2000/svg" width="20mm" height="20mm" viewBox="0 0 20 20"
                    className="size-6 fill-white stroke-0 hover:fill-orange-500 transition-colors duration-300 me-3 cursor-pointer " >
                    <path d="M1.8989 8.4724l16.1362 0c0.6866,0 1.2485,0.7021 1.2485,1.5605l0 0.0002c0,0.8584 -0.5619,1.5605 -1.2485,1.5605l-16.1362 0c-0.6866,0 -1.2485,-0.7021 -1.2485,-1.5605l0 -0.0002c0,-0.8584 0.5619,-1.5605 1.2485,-1.5605z" />
                    <path d="M1.8989 0.8013l16.1362 0c0.6866,0 1.2485,0.7021 1.2485,1.5605l0 0.0001c0,0.8585 -0.5619,1.5606 -1.2485,1.5606l-16.1362 0c-0.6866,0 -1.2485,-0.7021 -1.2485,-1.5606l0 -0.0001c0,-0.8584 0.5619,-1.5605 1.2485,-1.5605z" />
                    <path d="M1.8989 16.1436l16.1362 0c0.6866,0 1.2485,0.7021 1.2485,1.5606l0 0.0001c0,0.8584 -0.5619,1.5605 -1.2485,1.5605l-16.1362 0c-0.6866,0 -1.2485,-0.7021 -1.2485,-1.5605l0 -0.0001c0,-0.8585 0.5619,-1.5606 1.2485,-1.5606z" />
                </svg>
                
                <AuthenticationCMP className=" flex h-9  group justify-center items-center cursor-pointer bg-white/10  px-2 rounded-sm " />
                    
                

            </div>


     

        </div>
    );
}