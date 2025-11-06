import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { cn, localePath, title, montserratIfKo } from "~/lib/utils";
import type { AppContext, loader as rootLoader } from "~/root";
import { ContactSection } from "~/components/contact-section";
import { Api } from "~/lib/api";
import { Link, useLoaderData, useOutletContext } from "@remix-run/react";
import { Container } from "~/components/ui/container";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const meta: MetaFunction<unknown, { root: typeof rootLoader }> = ({
  matches,
}) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data;

  return [
    { title: title(rootMatch!.translations["news.page.title"]) },
    {
      name: "description",
      content: rootMatch!.translations["news.page.description"],
    },
    {
      property: "og:title",
      content: rootMatch!.translations["news.page.og.title"],
    },
    {
      property: "og:description",
      content: rootMatch!.translations["news.page.og.description"],
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.visualennode.com/news" },
    {
      property: "og:image",
      content: "https://www.visualennode.com/images/og-cover.jpg",
    },
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: rootMatch!.translations["news.page.twitter.title"],
    },
    {
      name: "twitter:description",
      content: rootMatch!.translations["news.page.twitter.description"],
    },
    {
      name: "twitter:image",
      content: "https://www.visualennode.com/images/og-cover.jpg",
    },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const locale = params.locale ?? "en";
  const page = parseInt(url.searchParams.get("page") ?? "1");

  const api = new Api();

  const newsPagination = await api
    .getNewsList(locale, "", page)
    .then(async (response) => {
      return response.data;
    });

  return {
    newsPagination,
  };
}

export default function Index() {
  const { newsPagination } = useLoaderData<typeof loader>();
  const { translations: t, locale } = useOutletContext<AppContext>();

  return (
    <div className={locale === "ko" ? "ko-solid" : ""}>
      <section className="flex py-7 sm:py-14">
        <Container
          className="flex-none m-auto min-h-full flex flex-col"
          variant={"fluid"}
        >
          <div className="text-center mt-14 mb-2">
            <h3
              className="font-semibold text-3xl sm:text-4xl md:text-5xl uppercase text-white mb-2"
              data-koreanable
            >
              {t["New update"]}
            </h3>
            <h4 className="text-white/70 text-base sm:text-lg mt-2" data-koreanable>
              {String(t["news.section.subtitle"] ?? "Latest news and updates")}
            </h4>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-auto">
            {(newsPagination?.data ?? []).map((news, index) => (
              <Link
                to={localePath(locale, `news/${news.slug}`)}
                key={index}
                className="h-full flex flex-col group"
              >
                <img
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 ease-out transform group-hover:scale-105"
                  src={news.optimize_attachment_url ?? news.attachment_url}
                  alt={news.title}
                />
                <div className="grow">
                  <div className="p-2 xl:p-4">
                    <span className="text-white font-medium text-xs mb-2 xl:mb-4 inline-block transition-colors duration-200 group-hover:text-white/70">
                      {new Date(news.published_at).toLocaleDateString("vi-VN", {
                        month: "2-digit",
                        year: "numeric",
                        day: "2-digit",
                      })}
                    </span>
                    <h4
                      className="font-semibold text-white text-base sm:text-lg lg:text-base xl:text-xl 2xl:text-2xl line-clamp-4 transition-colors duration-200 group-hover:text-white/70"
                      data-koreanable
                    >
                      {news.title}
                    </h4>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {newsPagination?.meta && newsPagination.meta.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-7 lg:mt-10">
              <Link
                to={{
                  search: `page=${
                    newsPagination.meta.current_page === 1
                      ? 1
                      : newsPagination.meta.current_page - 1
                  }`,
                }}
                className={cn(
                  "border-2 border-white uppercase bg-transparent text-white inline-flex items-center gap-2 px-3 py-2 font-medium text-xl md:text-2xl",
                  montserratIfKo(t["Previous"], locale),
                  newsPagination.meta.current_page === 1
                    ? "opacity-10 cursor-not-allowed disabled"
                    : " hover:bg-white hover:text-[#1b1b1b]"
                )}
              >
                <ChevronLeft className="size-6 md:size-8" /> {t["Previous"]}
              </Link>
              <Link
                to={{
                  search: `page=${
                    newsPagination.meta.current_page ===
                    newsPagination.meta.last_page
                      ? newsPagination.meta.last_page
                      : newsPagination.meta.current_page + 1
                  }`,
                }}
                className={cn(
                  "border-2 border-white uppercase bg-transparent text-white inline-flex items-center px-3 py-2 font-medium text-xl md:text-2xl",
                  montserratIfKo(t["Next"], locale),
                  newsPagination.meta.current_page ===
                    newsPagination.meta.last_page
                    ? "opacity-10 cursor-not-allowed disabled"
                    : " hover:bg-white hover:text-[#1b1b1b]"
                )}
              >
                {t["Next"]} <ChevronRight className="size-6 md:size-8" />
              </Link>
            </div>
          )}
        </Container>
      </section>
      <ContactSection />
    </div>
  );
}
