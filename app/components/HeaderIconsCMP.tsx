"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"


export  function HeaderIconsCMP({className}:{className?:string}){

    const pathname = usePathname()

    return(
        <div className={`${className}`}>
            <Link href={"/"} className={`${pathname=="/"?" cursor-default ":"  cursor-pointer "} group  select-none`}>
                <div className="flex px-2 gap-1 items-center select-none ">
                    <div className={`w-2 h-2 group-hover:bg-orange-200  rounded-full mx-auto mt-px duration-300 ${pathname=="/"?" bg-orange-600 ":" bg-white/30 "}`}></div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                    className="size-4 md:size-4 lg:size-5 stroke-[1.5px] stroke-white group-hover:stroke-orange-200 transition duration-400 ease-in-out select-none">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    <span className="mt-0.5 text-white group-hover:text-orange-200 transition duration-400 ease-in-out text-[10px] md:text-[12px] select-none"> خانه </span>
                </div>
                
            </Link>

             <Link href={"/bazar"} className={`${pathname=="/bazar"?"":"group"}   cursor-pointer select-none`}>
             
                <div className="flex px-2 gap-1 items-center select-none">
                    <div className={`w-2 h-2 group-hover:bg-orange-200  rounded-full mx-auto mt-px duration-300 ${pathname=="/bazar" ? " bg-orange-600 " : " bg-white/30 "}`}></div>
                    <svg xmlns="http://www.w3.org/1000/svg" fill="none" viewBox="0 0 24 24" 
            className="size-4 md:size-4 lg:size-5 stroke-[1.5px] stroke-white group-hover:stroke-orange-200 transition duration-400 ease-in-out select-none">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
            </svg>
            <span className="mt-0.5 text-white group-hover:text-orange-200 transition duration-400 ease-in-out text-[10px] md:text-[12px] select-none"> بازارچه </span>
                </div>
                
            </Link>

 <Link href={"/asnaf"} className={`${pathname=="/asnaf"?"":"group"}   cursor-pointer select-none`}>
                <div className="flex px-2 gap-1 items-center select-none ">
                      <div className={`w-2 h-2 group-hover:bg-orange-200  rounded-full mx-auto mt-px duration-300 ${pathname=="/asnaf" ? " bg-orange-600 " : " bg-white/30 "}`}></div>
                     <svg xmlns="http://www.w3.org/1000/svg" fill="none" viewBox="0 0 24 24" 
            className="size-4 md:size-4 lg:size-5 stroke-[1.5px] stroke-white group-hover:stroke-orange-200 transition duration-400 ease-in-out select-none">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
            </svg>
            <span className="mt-0.5 text-white group-hover:text-orange-200  transition duration-400 ease-in-out text-[10px] md:text-[12px] select-none"> بانک مشاغل </span>
                </div>
            </Link>

       
    
        <Link href={"/about"} className={`${pathname=="/about"?"":"group"}   cursor-pointer select-none`}>
                <div className="flex px-2 gap-1 items-center select-none">
                      <div className={`w-2 h-2 group-hover:bg-orange-200  rounded-full mx-auto mt-px duration-300 ${pathname=="/about" ? " bg-orange-600 " : " bg-white/30 "}`}></div>
                    <svg xmlns="http://www.w3.org/1000/svg" fill="none" viewBox="0 0 24 24" 
            className="size-4 md:size-4 lg:size-5 stroke-[1.5px] stroke-white group-hover:stroke-orange-200 transition duration-400 ease-in-out select-none">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>

            <span className="mt-0.5 text-white group-hover:text-orange-200  transition duration-400 ease-in-out text-[10px] md:text-[12px] select-none">  درباره ما </span>
                </div>
            </Link>
    
        <div className="flex px-2 gap-1 group cursor-pointer">

           
        </div>
        </div>
    )
}