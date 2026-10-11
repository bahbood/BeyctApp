'use client'
import Image from "next/image";
import {  useFlyoutPage } from '@/app/components/(Flyouts)/(Provider)/FlyoutPageContextProvider'
import { useRouter } from "next/navigation";
import AuthenticationCMP from "../(Auth)/components/AuthenticationCMP";
import { HeaderIconsCMP } from "./HeaderIconsCMP";
import { MessagesIndicatorCMP } from "./MessagesIndicatorCMP";
import { HeaderFallIconsCMP } from "./HeaderFallIconsCMP";

export default function HeaderCMP( {className, unreadMessagesCount = 0}: {className?: string; unreadMessagesCount?: number} ) {
    
    const {sideMenu_toggleShow , user } = useFlyoutPage()

    const router= useRouter()
    const handleAuthForm_CloseEvent=()=>{
        router.refresh()
    }
    return (
        <div className={`${className}  `}>
           
            <div className=" landscape:w-6/9 portrait:w-1/2  h-full flex items-center p-0 m-0 ">
                <Image className="w-[60px]  " width={700} height={700} src="/logo/Bey-Logo-new-06-blue.svg" alt={"logo"} ></Image>
                <HeaderIconsCMP className="hidden md:flex  portrait:hidden  ms-5"/>
                <HeaderFallIconsCMP className="flex min-w-24 md:hidden  portrait:flex  ms-1"/>
            </div>
            <div dir="ltr" className=" landscape:w-3/9 portrait:w-1/2  h-full flex items-center gap-1  ">


                <svg onClick={()=>sideMenu_toggleShow()} xmlns="http://www.w3.org/2000/svg" width="20mm" height="20mm" viewBox="0 0 20 20"
                    className="size-6 fill-gray-500 stroke-0 hover:fill-orange-500 transition-colors duration-300 me-3 cursor-pointer " >
                    <path d="M1.8989 8.4724l16.1362 0c0.6866,0 1.2485,0.7021 1.2485,1.5605l0 0.0002c0,0.8584 -0.5619,1.5605 -1.2485,1.5605l-16.1362 0c-0.6866,0 -1.2485,-0.7021 -1.2485,-1.5605l0 -0.0002c0,-0.8584 0.5619,-1.5605 1.2485,-1.5605z" />
                    <path d="M1.8989 0.8013l16.1362 0c0.6866,0 1.2485,0.7021 1.2485,1.5605l0 0.0001c0,0.8585 -0.5619,1.5606 -1.2485,1.5606l-16.1362 0c-0.6866,0 -1.2485,-0.7021 -1.2485,-1.5606l0 -0.0001c0,-0.8584 0.5619,-1.5605 1.2485,-1.5605z" />
                    <path d="M1.8989 16.1436l16.1362 0c0.6866,0 1.2485,0.7021 1.2485,1.5606l0 0.0001c0,0.8584 -0.5619,1.5605 -1.2485,1.5605l-16.1362 0c-0.6866,0 -1.2485,-0.7021 -1.2485,-1.5605l0 -0.0001c0,-0.8585 0.5619,-1.5606 1.2485,-1.5606z" />
                </svg>
                               
                {user && 
                <MessagesIndicatorCMP className="relative flex h-9  group justify-center items-center cursor-pointer bg-gray-500/10 hover:bg-gray-500/20   aspect-square  rounded-sm" 
                unreadCount={unreadMessagesCount} />
                }

                <AuthenticationCMP className=" flex h-9  group justify-center items-center cursor-pointer bg-gray-500/10 hover:bg-gray-500/20  landscape:px-2 portrait:aspect-square  rounded-sm " />
                    
                <div className=" flex h-9  group justify-center items-center cursor-pointer bg-gray-500/10 hover:bg-gray-500/20  aspect-square  rounded-sm ">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20mm" height="20mm" version="1.1"  
                    className="size-7 group-hover:fill-orange-600 fill-sky-600 transition-colors duration-300 stroke-0 mx-0 " viewBox="0 0 2000 2000" >
                    <path  d="M1109.64 120.91c-407.62,0 -738.08,330.46 -738.08,738.08 0,155.56 48.17,299.84 130.34,418.84l-382.57 404.21c-20.8,21.96 -19.84,56.93 2.13,77.71l134.72 127.51c21.96,20.79 56.93,19.82 77.72,-2.13l380.93 -402.48c114.18,72.45 249.59,114.42 394.81,114.42 407.62,0 738.08,-330.46 738.08,-738.08 0,-407.62 -330.46,-738.08 -738.08,-738.08zm0 256.51c265.95,0 481.56,215.62 481.56,481.57 0,265.95 -215.61,481.56 -481.56,481.56 -265.95,0 -481.56,-215.61 -481.56,-481.56 0,-265.95 215.61,-481.57 481.56,-481.57z"/>
                    <path  d="M894.99 949.62l103.78 -10.31c6.25,34.72 18.76,60.11 37.79,76.44 19,16.31 44.65,24.41 76.92,24.41 34.1,0 59.87,-7.25 77.15,-21.72 17.3,-14.48 26.01,-31.4 26.01,-50.79 0,-12.52 -3.67,-23.07 -10.92,-31.9 -7.23,-8.7 -19.99,-16.31 -38.15,-22.7 -12.39,-4.41 -40.6,-12.01 -84.76,-23.05 -56.81,-14.24 -96.68,-31.67 -119.61,-52.39 -32.27,-29.07 -48.34,-64.53 -48.34,-106.36 0,-26.87 7.6,-52.15 22.69,-75.57 15.22,-23.44 37.05,-41.23 65.64,-53.49 28.59,-12.27 62.93,-18.41 103.41,-18.41 65.88,0 115.57,14.61 148.82,43.92 33.37,29.32 50.79,68.34 52.49,117.28l-106.72 3.69c-4.54,-27.23 -14.23,-46.74 -29.08,-58.65 -14.85,-11.89 -37.17,-17.91 -66.85,-17.91 -30.68,0 -54.72,6.38 -72.02,19.14 -11.17,8.23 -16.8,19.15 -16.8,32.88 0,12.51 5.27,23.18 15.82,32.02 13.37,11.4 45.89,23.19 97.53,35.45 51.64,12.15 89.81,24.92 114.47,37.91 24.77,13.12 44.16,30.91 58.14,53.62 13.98,22.69 20.97,50.67 20.97,83.91 0,30.17 -8.33,58.51 -25.14,84.89 -16.82,26.38 -40.48,46.01 -71.15,58.77 -30.68,12.87 -68.95,19.25 -114.71,19.25 -66.61,0 -117.77,-15.34 -153.47,-46.13 -35.71,-30.65 -56.92,-75.45 -63.91,-134.2z"/>
                    </svg>
                </div>

            </div>


     

        </div>
    );
}