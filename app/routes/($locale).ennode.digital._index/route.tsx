import { MetaFunction, useLoaderData, useOutletContext } from "@remix-run/react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel";
import { Container } from "~/components/ui/container";
import { AppContext } from "~/root";

import type { LoaderFunctionArgs } from "@remix-run/node";
import { Api } from "~/lib/api";
import { cn, title } from "~/lib/utils";
import { useIsMobile } from "~/components/hooks/use-mobile";
import type { loader as rootLoader } from "~/root";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  try {
    const locale = params.locale || 'en';

    const api = new Api();
    const flatforms = await api.getFlatforms(locale).then(res => res.data.data);

    return { flatforms };
  } catch (error) {
    return { flatforms: [] };
  }
};

export const meta: MetaFunction<unknown, { "root": typeof rootLoader }> = ({ matches }) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data

  return [
    { title: title(rootMatch!.translations['Our flatforms']) },
    { name: "description", content: rootMatch!.translations['Visual Ennode flatforms'] },
  ];
};

export default function Career() {
  const { translations: t } = useOutletContext<AppContext>()
  const { flatforms } = useLoaderData<typeof loader>();
  const isMobile = useIsMobile();

  return <section className="h-dvh max-h-dvh bg-[#1b1b1b] text-white overflow-auto">
    <Container className="h-dvh max-h-dvh grid grid-cols-1 gap-7 lg:grid-cols-2 lg:gap-36 !py-0">
      <div className="h-full flex items-center justify-center" data-koreanable>
        <div className="pt-32 lg:pt-0">
          <h2 className="font-bold text-2xl mb-7">{t['digital.title']}</h2>
          {t["digital.body"].split('\n').map((row, index) => <p key={index} className="font-extralight text-[15px] leading-loose mb-7 last:mb-0" dangerouslySetInnerHTML={{ __html: row }}></p>)}
        </div>
      </div>
 
      <div className={cn("pb-20 lg:pb-0", !isMobile ? 'h-dvh' : '')}>
        <Carousel opts={{
          active: !isMobile,
          align: "start",
        }}
          orientation="vertical" className="h-full">
          <CarouselContent className="h-full -mt-5 relative">
            {flatforms.map((flatform, index) => {
              return <CarouselItem key={index} className="pt-5 basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6">
                <div className="flex flex-col">
                  <img src={flatform.attachment_url} className="mb-1" alt={flatform.title} />
                  <a href={flatform.link_platform} target="_blank" rel="noreferrer" className="font-bold">{flatform.title}</a>
                  <a href={flatform.link_platform} className="font-extralight" target="_blank" rel="noreferrer">{flatform.link_platform}</a>
                </div>
              </CarouselItem>
            })}
          </CarouselContent>
          {!isMobile ? <><CarouselPrevious className="absolute top-0 !w-full !h-14 !rotate-0 *:rotate-90 !z-40 bg-gradient-to-b" />
          <CarouselNext className="absolute bottom-0 !w-full !h-14 !rotate-0 *:rotate-90 bg-gradient-to-b" /></> : null}
        </Carousel>
      </div>
    </Container>
  </section>
}