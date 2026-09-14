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

export type CarouselSlide = {
  id: number
  name: string
  image_L: string
  image_P: string
}

export function MainCarousel({ className, slides }: { className: string; slides: CarouselSlide[] }) {

  const [autoplay] = useState(() => Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true }))

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    autoplay,
  ])

  useEffect(() => {
    if (!emblaApi || slides.length <= 1) return
    emblaApi.plugins().autoplay?.play()
  }, [emblaApi, slides.length])

 
  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)
 const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi)

  if (slides.length === 0) {
    return (
      <div className={`embla ${className}`}>
        <div className="embla__viewport w-full h-full overflow-hidden relative" ref={emblaRef}>
          <div className="embla__container flex w-full h-full">
            <div className="embla__slide flex-none basis-full h-full bg-gray-300 flex justify-center items-center text-gray-500">
              No slides available
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
     <div dir='ltr' className={`embla ${className}`}>
      <div className="embla__viewport w-full h-full overflow-hidden relative" ref={emblaRef}>
        <div className="embla__container flex w-full h-full">
          {slides.map((slide) => (
            
            <div className="embla__slide  flex-none basis-full h-full relative" key={slide.id}>
               <Image
                src={`/slideImages/${slide.image_L}`}
                alt={slide.name}
                fill
                className="object-cover landscape:block portrait:hidden"
                sizes="(max-width: 768px) 100vw, 75vw"
              />
              <Image
                src={`/slideImages/${slide.image_P}`}
                alt={slide.name}
                fill
                className="object-cover landscape:hidden portrait:block"
                sizes="(max-width: 768px) 100vw, 75vw"
              />
            </div>
            
          ))}
        </div>

        <PrevButton className='absolute portrait:hidden h-full top-0 left-0 px-2 z-2 select-none opacity-10 hover:opacity-80 cursor-pointer transition duration-500 hover:bg-white/10' onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
        <NextButton className='absolute portrait:hidden h-full top-0 right-0 px-2 z-2 select-none opacity-10 hover:opacity-80 cursor-pointer transition duration-500 hover:bg-white/10' onClick={onNextButtonClick} disabled={nextBtnDisabled} />
      </div>

      <div className="embla__dots flex w-3/4 h-5 items-center mx-auto">
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={index}
            onClick={() => onDotButtonClick(index)}
            className={'embla__dot h-2 mx-0.5 rounded-full '.concat(
              index === selectedIndex ? ' embla__dot--selected w-5 bg-orange-600' : 'w-2 bg-gray-400'
            )}
          />
        ))}
      </div>
    </div>
  )
}