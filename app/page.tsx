// app/page.tsx
import Image from "next/image";
import { MainCarousel } from "./components/(mainCarousel)/mainCarousel";
import { getActiveSlides } from "./(slides)/lib/slidesDb";

export default async function Home() {
  const slides = await getActiveSlides()

  return (
    <div id="Home" className="flex w-full  justify-center gap-5  mx-auto  py-2 portrait:py-3">

      <div id="R" className="landscape:w-[20%] portrait:hidden h-full flex-none ">
        <div className="flex justify-center items-center w-full  overflow-hidden bg-linear-30 from-gray-300 to-gray-500 p-4" >
         <Image className="w-[60%] " src="/logo/manaMode-V-2035-0.png" width={200} height={350} alt={"logo"}></Image>
        </div>
        
      </div>
      {/* 16/9   9/13->9/11 */}
      <div id="L" className=" landscape:w-[75%] portrait:w-full    ">
        <MainCarousel key={slides.length} className=" landscape:w-full  landscape:aspect-16/9 portrait:w-full  portrait:aspect-9/11  mx-auto" slides={slides}/>
      </div>
     
    </div>
  );
}
