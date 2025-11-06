import { Link, MetaFunction, useOutletContext } from "@remix-run/react"
import { ArrowRight } from "lucide-react";
import { Container } from "~/components/ui/container";
import { cn, localePath, title, montserratIfKo } from "~/lib/utils";
import { AppContext } from "~/root"
import type { loader as rootLoader } from "~/root";

export const meta: MetaFunction<unknown, { "root": typeof rootLoader }> = ({ matches }) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data

  return [
    { title: title(rootMatch!.translations['Graphics, more than just value']) },
    { name: "description", content: rootMatch!.translations['Visual Ennode flatforms'] },
  ];
};

export default function Ennode() {
  const { translations: t, locale, banners } = useOutletContext<AppContext>();

  return <section
    className="h-dvh max-h-dvh relative"
  >
    <video muted autoPlay={true} playsInline loop preload="none" className={cn("object-cover h-dvh w-full max-h-dvh")}>
      <source src={banners.find(banner => banner.group === 'ennode')?.url ?? ''} type="video/mp4" />
    </video>

    <div className="absolute inset-0 bg-black/50">
      <Container variant={"fluid"} className="text-white flex w-full h-full items-center lg:items-end justify-center lg:justify-start !p-20 md:p-28 lg:!p-36">
        <div className="max-w-lg w-full">
          <div className="flex flex-col md:gap-3 xl:gap-4 2xl:gap-5 group">
            <Link to={localePath(locale, 'about')} className="inline-block text-5xl xl:text-6xl font-semibold text-white uppercase drop-shadow group-hover:mb-2 duration-300">{t['ennode.arc.title']}</Link>
            <div className="opacity-0 group-hover:opacity-100 duration-300 translate-y-4 group-hover:translate-y-0">
              <p className="font-light text-base sm:text-lg md:text-xl xl:text-2xl 2xl:text-3xl mb-2">{t['ennode.arc.description']}</p>
              <Link to={localePath(locale, 'about')} className={`inline-flex items-center font-light text-base sm:text-lg md:text-xl text-white/80 mt-7 ${montserratIfKo(t["See service"] as string, locale)}`}>{t["See service"]} <ArrowRight className="size-3 ml-1" /></Link>
            </div>
          </div>

          <div className="flex flex-col md:gap-3 xl:gap-4 2xl:gap-5 group mt-14">
            <Link to={localePath(locale, 'ennode/digital')} className="inline-block text-5xl xl:text-6xl font-semibold text-white uppercase drop-shadow group-hover:mb-2 duration-300">{t['ennode.digital.title']}</Link>
            <div className="opacity-0 group-hover:opacity-100 duration-300 translate-y-4 group-hover:translate-y-0">
              <p className="font-light text-base sm:text-lg md:text-xl xl:text-2xl 2xl:text-3xl mb-2">{t['ennode.digital.description']}</p>
              <Link to={localePath(locale, 'ennode/digital')} className={`inline-flex items-center font-light text-base sm:text-lg md:text-xl text-white/80 mt-7 ${montserratIfKo(t["See service"] as string, locale)}`}>{t["See service"]} <ArrowRight className="size-3 ml-1" /></Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  </section >
}