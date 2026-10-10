// app/components/(mainCarousel)/mainCarousel.tsx
"use client"
import React, { useEffect, useState } from 'react'

import useEmblaCarousel from 'embla-carousel-react'
import Image from "next/image";
import Autoplay from 'embla-carousel-autoplay';

import {
  NextButton,
  PrevButton,
  usePrevNextButtons
} from './EmblaCarouselArrowButtons'
import { DotButton, useDotButton } from './EmblaCarouselDotButtons';

export type  images= {
    id: number;
    image_name: string;
    position: number;
    created_at: Date;
    news_id: number;
}

export function NewsCarousel({ className, images }: { className: string; images: string[] }) {

  const [autoplay] = useState(() => Autoplay({}))

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    
  ])

  useEffect(() => {
    if (!emblaApi || images.length <= 1) return
    emblaApi.plugins().autoplay?.play()
  }, [emblaApi, images.length])

 
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)
 const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi)

  return (
     <div dir='ltr' className={`embla relative ${className}`}>
      <div className="embla__viewport w-full h-full  overflow-hidden relative" ref={emblaRef}>
        <div className="embla__container flex w-full  h-full ">
          {images.map((img , index) => (
            
            <div className="embla__slide flex justify-center items-center  flex-none w-full  h-full  relative bg-gray-200/60 " key={index}>
              
              <Image
                src={`/newsImages/newsIMGs/${img}`}
                alt={img}
                fill
      sizes="(max-width: 768px) 100vw, 200px"
      className="object-contain"
              />
            </div>
            
          ))}
        </div>

        {/* <PrevButton className='absolute portrait:hidden h-full top-0 left-0 px-2 z-2 select-none opacity-10 hover:opacity-80 cursor-pointer transition duration-500 hover:bg-white/10' onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
        <NextButton className='absolute portrait:hidden h-full top-0 right-0 px-2 z-2 select-none opacity-10 hover:opacity-80 cursor-pointer transition duration-500 hover:bg-white/10' onClick={onNextButtonClick} disabled={nextBtnDisabled} /> */}
      </div>
  { images.length > 1 &&
      <div className="embla__dots flex w-full h-1 justify-center items-center mx-auto absolute bottom-2 ">
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={index}
            onClick={() => onDotButtonClick(index)}
            className={'embla__dot h-2 mx-0.5 rounded-full '.concat(
              index === selectedIndex ? ' embla__dot--selected w-4 bg-orange-600' : 'w-2 bg-gray-400'
            )}
          />
        ))}
      </div>
  }
    </div>
  )
}