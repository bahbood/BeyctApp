// app/(newsPaper)/news/layout.tsx
import Image from "next/image";

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return ( 
     <div id="Home" className="flex landscape:w-[85%] portrait:w-full  justify-center gap-5  mx-auto  py-2 portrait:py-3">
    
          <div id="R" className="hidden lg:block landscape:w-[20%]  portrait:hidden h-full flex-none sticky top-16 ">
            <div className="flex justify-center items-center w-full  overflow-hidden bg-gray-100  p-4" >
             <Image className="w-[100%] " src="/logo/Bey-Logo-new-07-blue.svg" width={200} height={350} alt={"logo"}></Image>
            </div>
            
          </div>
  <div id="L" className="min-h-screen "> {children} </div>
  </div>
)
}
