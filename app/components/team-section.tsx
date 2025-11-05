import { useOutletContext } from "@remix-run/react";
import { forwardRef, useRef } from "react";
import { Container } from "~/components/ui/container";
import { AppContext } from "~/root";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"
import { EmployeeResource } from "~/types/employees";
// Footer intentionally not used here

interface TeamSectionProps {
  teams: Array<EmployeeResource>;
}

const TeamSection = forwardRef<HTMLElement, TeamSectionProps>((props, ref) => {
  const { translations: t } = useOutletContext<AppContext>();
  const containerRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  // helper functions for an optional width calculation are intentionally omitted

  // useEffect(() => {
  //   function calculateCarouselWidth() {
  //     const carouselDom = carouselRef.current;
  //     const containerDom = containerRef.current;

  //     if (!carouselDom || !containerDom) return;

  //     const containerWidthWithoutPadding = getContentWidth(containerDom);

  //     const carouselWidth = containerWidthWithoutPadding + ((window.outerWidth - containerWidthWithoutPadding) / 2) - getScrollBarWidth(document) / 2;
  //     carouselDom.style.width = `${carouselWidth}px`
  //     carouselDom.style.paddingRight = `${getElementComputedStyle(containerDom).paddingRight}px`
  //   }

  //   calculateCarouselWidth();

  //   window.addEventListener('resize', calculateCarouselWidth);

  //   return () => {
  //     window.removeEventListener('resize', calculateCarouselWidth);
  //   };
  // }, [containerRef, carouselRef])

  return (
    <section
      ref={ref}
      className="min-h-screen bg-[#1b1b1b] flex flex-col items-center py-20 overflow-x-hidden relative overscroll-none"
      {...props}
    >
      <div className="absolute z-0 w-1/2 h-4/5 2xl:h-auto right-0 top-0 hidden xl:block">
        <div className="bg-gradient-to-r from-[#1b1b1b] via-[#1b1b1b]/80 to-[#1b1b1b]/40 absolute w-1/2 left-0 top-0 h-full">
        </div>
        <div className="bg-gradient-to-l from-[#1b1b1b] via-[#1b1b1b]/80 to-[#1b1b1b]/40 absolute w-1/2 right-0 top-0 h-full">
        </div>
        <div className="bg-gradient-to-t from-[#1b1b1b] via-[#1b1b1b]/60 to-transparent absolute h-1/2 bottom-0 w-full">
        </div>
        <img src="/images/value-about.jpg" className="w-full object-cover h-full" alt="" />
      </div>
      
      <Container className="text-white lg:h-full" ref={containerRef}>
        <div className="flex flex-col xl:w-1/2 text-justify justify-end h-full" data-koreanable>
          <h2 className="font-bold text-2xl mb-7 mt-auto">{t['about.team.title']}</h2>
          {t["about.team.description"].split('\n').map((row, index) => <p key={index} className="font-light text-base leading-loose mb-7 last:mb-0">{row}</p>)}
        </div>
      </Container>

      <Carousel
        className="w-full transition-[width] text-white duration-500 mt-14 mb-14"
        ref={carouselRef}
        opts={{
          // align start so multiple items can be visible and swiped
          align: "start",
          containScroll: "trimSnaps",
          slidesToScroll: 1,
        }}
      >
        <CarouselContent className="mx-auto container px-5 bg-[#1b1b1b]">
          {(props.teams ?? []).map((member, index) => {
            return (
              <CarouselItem
                key={index}
                className="basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6"
              >
              <div className="aspect-[3/4] bg-black/90">
                <img src={member.attachment_url} alt={member.name} className="object-cover w-full h-full" />
              </div>
              <div className="flex flex-col mt-4">
                <h3 className="font-bold">{member.name}</h3>
                <p className="font-light">{member.tags[0]}</p>
              </div>
            </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section >
  );
});

TeamSection.displayName = "TeamSection";

export { TeamSection };
