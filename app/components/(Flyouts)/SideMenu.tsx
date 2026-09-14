// app/components/SideMenu.tsx
'use client'

import { motion, AnimatePresence,easeIn ,easeOut } from 'framer-motion'
import { useFlyoutPage } from '@/app/components/(Flyouts)/(Provider)/FlyoutPageContextProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useImperativeHandle ,Ref, useState } from 'react'

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: easeOut } },
  exit: { opacity: 0, transition: { duration: 0.2, ease:easeIn } },
}

const menuVariants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: {
      type: "tween" as const,
      duration: 0.4,
      ease: "easeOut" as const,          // یا "easeOut" as const
      delay: 0.1,
    },
  },
  exit: {
    x: "-100%",
    transition: { 
        duration: 0.3,
         ease: "easeIn" as const 
    },
  },
}

export interface SideMenuHandlerRef{
  openMe:()=>void,
  closeMe:()=>void,
  ToggleShow:()=>void
}

export default function SideMenu({ref }: {ref?:Ref<SideMenuHandlerRef>}) {

//  const {sideMenu:{ menu_isOpen, menuClose }} = useFlyoutPage()
  const currentPath = usePathname();
  const { user } = useFlyoutPage();

  const[isOpen , setIsOpen]=useState(false)

  useImperativeHandle(ref , ()=>({
    openMe :()=>{setIsOpen(true)},
    closeMe :()=>{setIsOpen(false)},
    ToggleShow:()=>{ setIsOpen(!isOpen) }
  }))

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - اول fade می‌شود */}
          <motion.div 
            className="fixed inset-0 z-40  bg-black/50 backdrop-blur-xs flex justify-center items-center overscroll-none "
           variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={()=>setIsOpen(false)}
          />

          {/* خود منو - بعد از backdrop slide می‌شود */}
          <motion.div
            className="fixed top-0 bottom-0 left-0 z-50 w-4/5 max-w-sm bg-white shadow-sm  "
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()} // جلوگیری از بسته شدن با کلیک داخل منو
          >
            <div className="flex flex-col h-full gap-1 ">
              {/* هدر منو + دکمه بستن */}
              <div className="flex items-center justify-end  px-5 py-4 bg-linear-30  from-sky-700 to-sky-600">
               
               
               <svg xmlns="http://www.w3.org/2000/svg"  width="20mm" height="20mm" version="1.1" viewBox="0 0 2000 2000"
                    className=' size-7  cursor-pointer
                      fill-sky-100 hover:fill-orange-500 duration-300 transition-colors' 
                      onClick={()=>setIsOpen(false)}
                      >
                      <path  d="M541.36 1056.22l614.33 614.32c64.32,64.29 64.32,169.19 0,233.47l-16.49 16.49c-64.29,64.31 -169.17,64.31 -233.48,0.02l-864.3 -864.3c-27.3,-27.31 -27.3,-71.85 0,-99.15l864.3 -864.3c64.31,-64.29 169.19,-64.29 233.48,0.01l16.49 16.48c64.32,64.3 64.32,169.2 0,233.48l-614.33 614.33c-27.3,27.3 -27.3,71.84 0,99.15z"/>
                      <path  d="M992.07 829.89l784.51 0c90.27,0 165.09,74.82 165.09,165.09l0 23.33c0,90.26 -74.16,165.09 -165.09,165.09l-784.51 0c-90.92,0 -165.09,-74.17 -165.09,-165.09l0 -23.33c0,-90.93 75.49,-165.09 165.09,-165.09z"/>
                  </svg>

                
              </div>

              {/* آیتم‌های منو */}
              <div className='flex w-full p-2 gap-1'>
                <Link className="flex basis-1/5 aspect-square bg-sky-500 hover:bg-sky-500/40 stroke-slate-200 hover:stroke-slate-600 text-slate-200 hover:text-slate-600
                                 rounded-sm flex-col justify-center items-center gap-1 relative transition duration-500 ease-in-out" href="/" 
                                 onClick={()=>setIsOpen(false)}
                                 >
 
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="" className="size-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>

                    <span className="w-full flex-0 text-nowrapp text-center text-[10px] sm:text-[11px] "> خانه </span>
                    <div className="flex w-full h-[3px]    justify-center    absolute bottom-0 right-0">
                        <div className={ `w-5 h-1   rounded-full   ${currentPath === "/" ? " bg-accent " : ""} `} ></div>
                    </div>
                </Link>

                <Link className="flex  basis-1/5 aspect-square bg-sky-500 hover:bg-sky-500/40 stroke-slate-200 hover:stroke-slate-600 text-slate-200 hover:text-slate-600
                                 rounded-sm flex-col justify-center items-center gap-1 relative transition duration-500 ease-in-out" href="/news" 
                                 onClick={()=>setIsOpen(false)}
                                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="" className="size-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                    </svg>

                    <span className="w-full flex-0 text-nowrapp text-center text-[10px] sm:text-[11px]"> خبرنامه </span>
                    <div className="flex w-full h-[3px]    justify-center    absolute bottom-0 right-0">
                        <div className={ `w-5 h-1   rounded-full   ${currentPath === "/news" ? " bg-accent " : ""} `} ></div>
                    </div>

                </Link>


        
                <Link className="flex  basis-1/5 aspect-square bg-sky-500 hover:bg-sky-500/40 stroke-slate-200 hover:stroke-slate-600 text-slate-200 hover:text-slate-600
                                 rounded-sm flex-col justify-center items-center gap-1 relative transition duration-500 ease-in-out" href="/bazar "
                                 onClick={()=>setIsOpen(false)}
                                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="" className="size-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                    </svg>
                    <span className="w-full flex-0 text-nowrapp text-center text-[10px] sm:text-[11px]"> بازارچه </span>
                    <div className="flex w-full h-[3px]    justify-center    absolute bottom-0 right-0">
                        <div className={ `w-5 h-1  rounded-full   ${currentPath === "/bazar" ? " bg-accent " : ""} `} ></div>
                    </div>

                </Link>

                <Link className=" flex  basis-1/5 aspect-square bg-sky-500 hover:bg-sky-500/40 stroke-slate-200 hover:stroke-slate-600 text-slate-200 hover:text-slate-600
                                 rounded-sm flex-col justify-center items-center gap-1 relative transition duration-500 ease-in-out" href="/occupations ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="" className="size-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                </svg>

                    <span className="w-full flex-0 text-nowrapp text-center text-[9px] sm:text-[9px]"> بانک مشاغل </span>
                    <div className="flex w-full h-[3px]    justify-center    absolute bottom-0 right-0">
                        <div className={ `w-5 h-1   rounded-full   ${currentPath === "/occupations" ? " bg-accent " : ""} `} ></div>
                    </div>

                </Link>

                <Link className="flex  basis-1/5 aspect-square bg-sky-500 hover:bg-sky-500/40 stroke-slate-200 hover:stroke-slate-600 text-slate-200 hover:text-slate-600
                                 rounded-sm flex-col justify-center items-center gap-1 relative transition duration-500 ease-in-out" href="/info ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="" className="size-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>

                    <span className="w-full flex-0 text-nowrapp text-center text-[10px] sm:text-[11px]"> درباره </span>
                    <div className="flex w-full h-[3px]    justify-center    absolute bottom-0 right-0">
                        <div className={ `w-5 h-1   rounded-full   ${currentPath === "/info" ? " bg-accent " : ""} `} ></div>
                    </div>

                </Link>
                </div>


 {/* show for admin only  - admin panel*/}
              {user?.role === 'admin' && (
              <div className=' w-full  bg-gray-200'>
                <label className='block w-full px-2 py-2 bg-sky-300 text-white  text-xs'>مدیریت  سایت</label>
                <div className='flex flex-col w-full mx-auto gap-3 px-3 py-2  '>
                  <ul>
                    <li> 
                      <Link className='text-xs hover:text-orange-600' href='/users' onClick={() => setIsOpen(false)}>لیست یوزر  ها </Link>
                    </li>
                    <li>
                      <Link className='text-xs hover:text-orange-600' href='/users/passToHash' onClick={() => setIsOpen(false)}>  تبدیل تکست به هش </Link>

                    </li>
                  </ul>
                </div>
              </div>
              )}


{/* show for admin only */}
              {user?.role === 'admin' && (
              <div className=' w-full  bg-gray-200'> 
                <label className='block w-full px-2 py-2 bg-sky-300 text-white  text-xs'>مدیریت اسلایدر اصلی</label>
                <div className='flex flex-col w-full mx-auto gap-3 px-3 py-2  '>
                  <Link className='text-xs hover:text-orange-600' href='/slides' onClick={() => setIsOpen(false)}>مدیریت اسلاید ها </Link>
                </div>
              </div>
              )}

{/* show for users that have active store */}
              {user?.store_active && (
              <div className=' w-full  bg-gray-200'>
                <label className='block w-full px-2 py-2 bg-sky-300 text-white  text-xs'>مدیریت  فروشگاه :</label>
                <div className='flex flex-col w-full mx-auto gap-3 px-3 py-2  '>
                <Link className='text-xs hover:text-orange-600' href='/storeProfile' onClick={()=>setIsOpen(false)}>مدیریت فروشگاه </Link>
                <Link className='text-xs hover:text-orange-600' href='/storeActivation' onClick={()=>setIsOpen(false)} >فعال سازی فروشگاه</Link>
                </div>
              </div>
              )}

{/* show for users that have active newsAgency */}
              {user?.news_agency_active && (
              <div className=' w-full  bg-gray-200'>
                <label className='block w-full px-2 py-2 bg-sky-300 text-white  text-xs'>مدیریت  رسانه خبری :</label>
                <div className='flex flex-col w-full mx-auto gap-3 px-3 py-2  '>
                <Link className='text-xs hover:text-orange-600' href='/newsAgencyProfile' onClick={()=>setIsOpen(false)}>مدیریت خبرنامه </Link>
                <Link className='text-xs hover:text-orange-600' href='/newsAgencyActivation' onClick={()=>setIsOpen(false)} >فعال سازی خبرنامه</Link>
                </div>
              </div>
              )}

{/* show for users that have active serviceis */}
              {user?.serviceman_active && (
              <div className=' w-full  bg-gray-200'>
                <label className='block w-full px-2 py-2 bg-sky-300 text-white  text-xs'>مدیریت  خدمات و سرویس :</label>
                <div className='flex flex-col w-full mx-auto gap-3 px-3 py-2  '>
                <Link className='text-xs hover:text-orange-600' href='/' onClick={()=>setIsOpen(false)}>مدیریت خدمات </Link>
                <Link className='text-xs hover:text-orange-600' href='/' onClick={()=>setIsOpen(false)} >فعال سازی خدمات</Link>
                </div>
              </div>
              )}

             

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}