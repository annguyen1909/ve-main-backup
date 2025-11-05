import { Link, useOutletContext } from "@remix-run/react"
import { AppContext } from "~/root"
import { Container } from "~/components/ui/container"
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import { useInView } from "motion/react"
import { NewsResource } from "~/types/news"
import { localePath } from "~/lib/utils"

interface NewsSectionProps {
  newsList: Array<NewsResource>,
  newsCount: number
  imageWidthClass?: string
}

const NewsSection = forwardRef<HTMLElement, NewsSectionProps>((props, forwardedRef) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { newsList: propsNewsList, newsCount, imageWidthClass, ...domProps } = props;
  const ref = useRef<HTMLElement>(null);
  const { translations: t, locale } = useOutletContext<AppContext>();
  const inView = useInView(ref, { amount: 1 })

  const newsList = Array.isArray(propsNewsList) ? propsNewsList : [];

  const getT = (k: string) => (t as unknown as Record<string, string>)[k] ?? k;

  useImperativeHandle(forwardedRef, () => ref.current as HTMLElement);

  useEffect(() => {
    const headerDom = document.getElementById("header");

    if (!headerDom || !inView) return;

    headerDom.dataset.variant = "light";
  }, [inView]);

  return (
    <section ref={ref} className="min-h-screen flex py-12 md:py-16" {...domProps}>
      <Container className="m-auto w-full" variant={"fluid"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="relative mb-6 sm:mb-8 lg:mb-10">
            {/* watermark behind title */}
            <div className="absolute left-0 top-0 opacity-5 pointer-events-none hidden sm:block">
              <img src="/images/ennode-placeholder.webp" alt="" className="w-32 sm:w-40 lg:w-48 h-32 sm:h-40 lg:h-48 object-contain" />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-4 sm:gap-6">
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                  {locale === 'ko' ? (
                    <>
                      <span className="">RELATED </span>
                      <span className="text-red-500">NEWS</span>
                    </>
                  ) : (
                    <>
                      <span className="">{'RELATED'} </span>
                      <span className=" text-red-500">{(t as Record<string,string>)["NEWS"] ?? 'NEWS'}</span>
                    </>
                  )}
                </h2>
                <p className="text-base sm:text-lg text-white/60 mt-2 sm:mt-3">{(t as Record<string,string>)["New update"] ?? 'Latest articles'}</p>
              </div>
              {props.newsCount > 4 && (
                <Link to={localePath(locale, 'news')} className="text-xs sm:text-sm text-white/70 hover:text-white transition whitespace-nowrap">{(t as Record<string,string>)['See more'] ?? 'See more'} ({props.newsCount})</Link>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden">
            {/* make images wider on large screens: 1 / 2 / 3 columns at sm / lg / xl respectively */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {newsList.map((news, index) => (
               <article key={index} className="rounded-none mb-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                 <Link to={localePath(locale, `news/${news.slug}`)} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                  <div
                    className={`overflow-hidden rounded-none mx-auto w-full max-w-full ${imageWidthClass ?? ''} aspect-video`}
                  >
                    <img src={news.optimize_attachment_url ?? news.attachment_url} alt={news.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                   </div>

                   <div className="mt-2 sm:mt-3 md:mt-4">
                     <time className="text-xs text-white/60 block mb-1 sm:mb-2">{new Date(news.published_at).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric', day: '2-digit' })}</time>
                     <h4 className="text-white text-base sm:text-lg md:text-xl font-normal line-clamp-2" data-koreanable>{news.title}</h4>
                   </div>
                 </Link>
               </article>
              ))}
            </div>

            {/* bottom gradient overlay inside the news grid */}
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-b from-transparent to-[#1b1b1b] pointer-events-none z-10" />
          </div>

          {/* Go to news button */}
          <div className="mt-4 sm:mt-5 lg:mt-6 flex justify-center">
            <Link to={localePath(locale, 'news')} className="px-6 py-2 sm:py-3 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 rounded-full text-white uppercase text-xs sm:text-sm tracking-wide transition-all duration-300">
              {getT('Go to news')}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
});

NewsSection.displayName = "NewsSection";

export { NewsSection };