import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useOutletContext,
  useNavigate,
} from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import * as motion from "motion/react-client";
import { Api } from "~/lib/api";
import { cn, localePath, title, montserratIfKo } from "~/lib/utils";
import { AppContext } from "~/root";
import { useTranslation } from "react-i18next";
import type { loader as rootLoader } from "~/root";
import { ContactSection } from "~/components/contact-section";

const CARD_ANIMATION_SECONDS = 0.5;

export async function loader({ params }: LoaderFunctionArgs) {
  const api = new Api();
  const locale = params.locale ?? "en";
  const categories = await api
    .getCategories(locale)
    .then((res) => res.data.data);

  const imageCategory = categories.find(
    (category) => category.slug === "image"
  );
  const cinematicCategory = categories.find(
    (category) => category.slug === "cinematic"
  );

  return {
    imageCategory,
    cinematicCategory,
  };
}

export const meta: MetaFunction<unknown, { root: typeof rootLoader }> = ({
  matches,
}) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data;

  return [
    { title: title(rootMatch!.translations["work.page.title"]) },
    {
      name: "description",
      content: rootMatch!.translations["work.page.description"],
    },

    // ✅ Open Graph
    {
      property: "og:title",
      content: rootMatch!.translations["work.page.og.title"],
    },
    {
      property: "og:description",
      content: rootMatch!.translations["work.page.og.description"],
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.visualennode.com/works" },
    {
      property: "og:image",
      content: "https://www.visualennode.com/images/og-cover.jpg",
    },

    // ✅ Twitter
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: rootMatch!.translations["work.page.og.title"],
    },
    {
      name: "twitter:description",
      content: rootMatch!.translations["work.page.og.description"],
    },
    {
      name: "twitter:image",
      content: "https://www.visualennode.com/images/og-cover.jpg",
    },
  ];
};

export default function Works() {
  const { translations: t, locale } = useOutletContext<AppContext>();
  const navigate = useNavigate();
  const { imageCategory, cinematicCategory } = useLoaderData<typeof loader>();

  const { t: i18nT } = useTranslation();

  // Simple locale-only strings for Korean locales (accept ko variants like ko-KR)
  const trans = t as Record<string, string>;
  // Use work.page.* keys only (do not fall back to home.* or API for Korean pages).
  // If keys are missing we'll intentionally show an empty string, but warn in
  // development so missing translations are obvious.
  // Prefer the loader-provided flat translations object first, but fall back to
  // the i18next `t` function if those keys aren't present at runtime. This
  // keeps behavior deterministic for Korean pages while covering cases where
  // the server-side `translations` object didn't include the key.
  const imageTitleLocal = trans["work.page.categories.still_image"] ?? i18nT("work.page.categories.still_image");
  const imageDescLocal = trans["work.page.categories.still_image_description"] ?? i18nT("work.page.categories.still_image_description");
  const cinematicTitleLocal = trans["work.page.categories.cinematic"] ?? i18nT("work.page.categories.cinematic");
  const cinematicDescLocal = trans["work.page.categories.cinematic_description"] ?? i18nT("work.page.categories.cinematic_description");

  const isKoreanLocale = Boolean(locale && locale.startsWith("ko"));

  if (process.env.NODE_ENV !== "production" && isKoreanLocale) {
    // Small dev warnings so missing work.page.* keys are easy to catch.
    if (!imageTitleLocal) {
      // eslint-disable-next-line no-console
      console.warn("Missing translation: work.page.categories.still_image");
    }
    if (!imageDescLocal) {
      // eslint-disable-next-line no-console
      console.warn("Missing translation: work.page.categories.still_image_description");
    }
    if (!cinematicTitleLocal) {
      // eslint-disable-next-line no-console
      console.warn("Missing translation: work.page.categories.cinematic");
    }
    if (!cinematicDescLocal) {
      // eslint-disable-next-line no-console
      console.warn("Missing translation: work.page.categories.cinematic_description");
    }
  }

  return (
  <div className={isKoreanLocale ? "ko-solid" : ""}>
      <section className="h-dvh overflow-hidden max-h-dvh grid grid-cols-1 lg:grid-cols-2">
        <div className="relative">
          {imageCategory?.attachment_url ? (
            <video
              muted
              playsInline
              autoPlay
              loop
              preload="auto"
              className={cn(
                "absolute p-6 md:p-0 inset-0 object-cover h-dvh w-full max-h-dvh"
              )}
            >
              <source src={imageCategory.attachment_url} type="video/mp4" />
            </video>
          ) : null}

          <motion.div
            className="hover:bg-black/60 bg-black/30 relative group h-full cursor-pointer"
            initial={{ translateX: "-10%" }}
            animate={{ translateX: 0 }}
            transition={{ translateX: { duration: CARD_ANIMATION_SECONDS } }}
            // make whole card clickable — allow keyboard activation via Enter/Space
            onClick={() => navigate(localePath(locale, "/works/image"))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(localePath(locale, "/works/image"));
              }
            }}
            role="link"
            tabIndex={0}
          >
            <div className="h-full flex items-center justify-center lg:items-end lg:justify-start lg:px-24 lg:py-40">
              <div className="">
                <Link
                  to={localePath(locale, "/works/image")}
                  className="inline-block text-5xl xl:text-6xl font-semibold text-white uppercase drop-shadow duration-500 lg:group-hover:mb-7"
                >
                  {isKoreanLocale ? imageTitleLocal : imageCategory?.title ?? "IMAGE"}
                </Link>
                <div className="opacity-0 translate-y-4 h-0 group-hover:h-auto group-hover:translate-y-0 group-hover:opacity-100 duration-300">
                  <p className="text-3xl hidden lg:block text-white/80">
                    {isKoreanLocale ? imageDescLocal : imageCategory?.description ?? ""}
                  </p>
                  <Link
                    to={localePath(locale, "/works/image")}
                    className={`hidden lg:inline-flex items-center text-xl text-white/80 font-light mt-7`}
                  >
                    See Works <ArrowRight className="size-3 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="relative">
          {cinematicCategory?.attachment_url ? (
            <video
              muted
              playsInline
              autoPlay
              loop
              preload="auto"
              className={cn(
                "absolute p-6 md:p-0 inset-0 object-cover h-dvh w-full max-h-dvh"
              )}
            >
              <source src={cinematicCategory.attachment_url} type="video/mp4" />
            </video>
          ) : null}

          <motion.div
            className="hover:bg-black/60 bg-black/30 relative group h-full cursor-pointer"
            initial={{ translateX: "10%" }}
            animate={{ translateX: 0 }}
            transition={{ translateX: { duration: CARD_ANIMATION_SECONDS } }}
            onClick={() => navigate(localePath(locale, "/works/cinematic"))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(localePath(locale, "/works/cinematic"));
              }
            }}
            role="link"
            tabIndex={0}
          >
            <div className="h-full flex items-center justify-center lg:items-end lg:justify-start lg:px-24 lg:py-40">
              <div>
                <Link
                  to={localePath(locale, "/works/cinematic")}
                  className="inline-block text-5xl xl:text-6xl font-semibold text-white uppercase drop-shadow duration-500 lg:group-hover:mb-7"
                >
                  {isKoreanLocale ? cinematicTitleLocal : cinematicCategory?.title ?? "CINEMATIC"}
                </Link>
                <div className="opacity-0 translate-y-4 h-0 group-hover:h-auto group-hover:translate-y-0 group-hover:opacity-100 duration-300">
                  <p className="text-3xl hidden lg:block text-white/80">
                    {isKoreanLocale ? cinematicDescLocal : cinematicCategory?.description ?? ""}
                  </p>
                  <Link
                    to={localePath(locale, "/works/cinematic")}
                    className={`hidden lg:inline-flex items-center text-xl text-white/80 font-light mt-7`}
                  >
                    See Works<ArrowRight className="size-3 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[12%] bg-gradient-to-b from-transparent to-[#1b1b1b] pointer-events-none z-10"
      />

      <ContactSection />
    </div>
  );
}
