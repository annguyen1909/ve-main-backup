"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
// lucide icons removed from this file because they are not used here

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }

      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }

      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!api) {
        return
      }

      onSelect(api)
      api.on("reInit", onSelect)
      api.on("select", onSelect)

      return () => {
        api?.off("select", onSelect)
      }
    }, [api, onSelect])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden h-full">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        // make the item a positioned container so absolutely-positioned
        // children (like a close button) are placed relative to the slide
        "relative min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <button
      ref={ref}
      className={cn(
        "absolute h-[calc(100%_+_2px)] flex items-center justify-center w-14 md:w-40 !p-0 rounded-none bg-gradient-to-r from-[#1b1b1b] via-[33%] via-[#1b1b1b] to-transparent",
        orientation === "horizontal"
          ? "left-0 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        !canScrollPrev ? 'opacity-0' : '',
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <svg width="22" height="43" viewBox="0 0 22 43" fill="none" xmlns="http://www.w3.org/2000/svg" className="-scale-x-100">
        <path d="M1.70795 0.300026L21.7067 20.7757C21.7997 20.8708 21.8735 20.9837 21.9238 21.108C21.9741 21.2322 22 21.3655 22 21.5C22 21.6345 21.9741 21.7678 21.9238 21.892C21.8735 22.0163 21.7997 22.1292 21.7067 22.2243L1.70795 42.7C1.61505 42.7951 1.50475 42.8705 1.38337 42.922C1.26198 42.9735 1.13188 43 1.0005 43C0.869109 43 0.739008 42.9735 0.617623 42.922C0.496237 42.8705 0.385943 42.7951 0.293039 42.7C0.105409 42.5079 0 42.2473 0 41.9756C0 41.8411 0.02588 41.7079 0.0761596 41.5836C0.126439 41.4594 0.200134 41.3464 0.293039 41.2513L19.5844 21.5L0.293039 1.74868C0.200134 1.65356 0.126439 1.54063 0.0761596 1.41636C0.02588 1.29208 0 1.15887 0 1.02435C0 0.889832 0.02588 0.75663 0.0761596 0.632351C0.126439 0.508072 0.200134 0.395145 0.293039 0.300026C0.385943 0.204906 0.496237 0.129456 0.617623 0.0779762C0.739008 0.0264969 0.869109 0 1.0005 0C1.13188 0 1.26198 0.0264969 1.38337 0.0779762C1.50475 0.129456 1.61505 0.204906 1.70795 0.300026Z" fill="white" fillOpacity="0.25" />
      </svg>
      <span className="sr-only">Previous slide</span>
    </button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <button
      ref={ref}
      className={cn(
        "absolute h-[calc(100%_+_2px)] flex items-center justify-center w-14 md:w-40 !p-0 rounded-none bg-gradient-to-r from-transparent via-[66%] via-[#1b1b1b] to-[#1b1b1b]",
        orientation === "horizontal"
          ? "right-0 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        !canScrollNext ? 'opacity-0' : '',
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <svg width="22" height="43" viewBox="0 0 22 43" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.70795 0.300026L21.7067 20.7757C21.7997 20.8708 21.8735 20.9837 21.9238 21.108C21.9741 21.2322 22 21.3655 22 21.5C22 21.6345 21.9741 21.7678 21.9238 21.892C21.8735 22.0163 21.7997 22.1292 21.7067 22.2243L1.70795 42.7C1.61505 42.7951 1.50475 42.8705 1.38337 42.922C1.26198 42.9735 1.13188 43 1.0005 43C0.869109 43 0.739008 42.9735 0.617623 42.922C0.496237 42.8705 0.385943 42.7951 0.293039 42.7C0.105409 42.5079 0 42.2473 0 41.9756C0 41.8411 0.02588 41.7079 0.0761596 41.5836C0.126439 41.4594 0.200134 41.3464 0.293039 41.2513L19.5844 21.5L0.293039 1.74868C0.200134 1.65356 0.126439 1.54063 0.0761596 1.41636C0.02588 1.29208 0 1.15887 0 1.02435C0 0.889832 0.02588 0.75663 0.0761596 0.632351C0.126439 0.508072 0.200134 0.395145 0.293039 0.300026C0.385943 0.204906 0.496237 0.129456 0.617623 0.0779762C0.739008 0.0264969 0.869109 0 1.0005 0C1.13188 0 1.26198 0.0264969 1.38337 0.0779762C1.50475 0.129456 1.61505 0.204906 1.70795 0.300026Z" fill="white" fillOpacity="0.25" />
      </svg>
      <span className="sr-only">Next slide</span>
    </button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}