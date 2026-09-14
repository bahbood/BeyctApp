// app/components/(Flyouts)/FlyoutLayout.tsx

'use client'

import { ReactNode } from "react";
import Image from 'next/image'
import { motion, AnimatePresence,easeIn ,easeOut } from 'framer-motion'


const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: easeOut } },
  exit: { opacity: 0, transition: { duration: 0.2, ease:easeIn } },
}
const menuVariants = {
  hidden: { y: "-100%" },
  visible: {
    y: 0,
    transition: {
      type: "tween" as const,
      duration: 0.4,
      ease: "easeOut" as const,          // یا "easeOut" as const
      delay: 0.1,
    },
  },
  exit: {
    y: "-100%",
    transition: { 
        duration: 0.3,
         ease: "easeIn" as const 
    },
  },
}

 export default function FlyoutLayout({children,onCloseMe,isOpen  }:
  {children?:ReactNode,onCloseMe:()=>void,isOpen:boolean ,} ){
      
   

    

    return(
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex justify-center items-center overscroll-none"
            onClick={(e) => e.stopPropagation()}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >

            {/* خود منو - بعد از backdrop slide می‌شود */}
            <motion.div className=" z-50  flex relative
            landscape:h-[95%] landscape:md:h-[90%]   landscape:aspect-14/9  landscape:md:m-4 landscape:m-2
            portrait:h-[80%]  portrait:md:h-[90%]     portrait:aspect-9/16 
            overflow-hidden overscroll-none bg-gray-100  shadow-sm rounded-sm    border border-gray-400"
              onClick={(e) => e.stopPropagation()}
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"

            >
              <div id="RC" className="flex flex-col items-center justify-around landscape:w-4/12 portrait:hidden h-full bg-sky-600 pt-5">
                  <Image className="w-[50%]   " width={200} height={350} src="/logo/manaMode-V-2035-0.png" alt={"logo V"} ></Image>
                  <div className="w-full">
                    <span className="text-white block w-full text-center">www.ManaMode.ir</span>
                  </div>
              </div>

              <div id="LC" className="landscape:w-8/12 portrait:w-full h-full flex flex-col">

                <div dir="ltr" id="header" className="flex w-full landscape:px-5 portrait:px-2 pt-4 pb-2 justify-between items-center portrait:bg-sky-600 ">
                 
                  <svg xmlns="http://www.w3.org/2000/svg" width="20mm" height="20mm" version="1.1" viewBox="0 0 2000 2000"
                    className=' size-7  cursor-pointer duration-300 transition-colors
                      landscape:fill-sky-900 landscape:hover:fill-orange-500
                      portrait:fill-sky-100 portrait:hover:fill-orange-500 '
                    onClick={onCloseMe}
                  >
                    <path d="M541.36 1056.22l614.33 614.32c64.32,64.29 64.32,169.19 0,233.47l-16.49 16.49c-64.29,64.31 -169.17,64.31 -233.48,0.02l-864.3 -864.3c-27.3,-27.31 -27.3,-71.85 0,-99.15l864.3 -864.3c64.31,-64.29 169.19,-64.29 233.48,0.01l16.49 16.48c64.32,64.3 64.32,169.2 0,233.48l-614.33 614.33c-27.3,27.3 -27.3,71.84 0,99.15z" />
                    <path d="M992.07 829.89l784.51 0c90.27,0 165.09,74.82 165.09,165.09l0 23.33c0,90.26 -74.16,165.09 -165.09,165.09l-784.51 0c-90.92,0 -165.09,-74.17 -165.09,-165.09l0 -23.33c0,-90.93 75.49,-165.09 165.09,-165.09z" />
                  </svg>
                   <Image className="w-[90px] landscape:hidden  " width={600} height={200} src="/logo/manamodeLine2-1.png" alt={"logo H"} ></Image>


                </div>

                <div className="w-full flex-1 min-h-0 overflow-hidden">
                  {children}
                </div>

              </div>

             
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    )
 }
 