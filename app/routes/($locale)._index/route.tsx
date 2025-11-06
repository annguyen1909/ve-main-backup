import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { HeroSection } from "./hero-section";
import { SummarySection } from "./summary-section";
import { ServiceSection } from "./service-section";
import { SmoothScrollLayout } from "~/components/ui/smooth-scroll-layout";
import { ScrollProgress } from "~/components/ui/scroll-progress";
import { cn, title } from "~/lib/utils";
import type { loader as rootLoader } from "~/root";
import { useEffect, useState } from "react";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { ClientSection } from "~/components/client-section";
import { ContactSection } from "~/components/contact-section";
import { Api } from "~/lib/api";
// MorphingText was used previously in the loading overlay but replaced by LoadingCounter
import LoadingCounter from "~/components/loading-counter";
import { motion, AnimatePresence } from "framer-motion";
import { NewsSection } from "./news-section";
import { WorkProcess } from "./process-section";
import { itemsForLocale } from "~/data/dataWorkProcess";
import { AppContext } from "~/root";
import type { WorkProcessItem } from "~/data/dataWorkProcess";

export const meta: MetaFunction<unknown, { root: typeof rootLoader }> = ({
  matches,
}) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data;

  const titleText = title(rootMatch!.translations["home.page.title"], true);
  const descText = rootMatch!.translations["home.page.description"];
  const ogTitle = rootMatch!.translations["home.page.og.title"];
  const ogDesc = rootMatch!.translations["home.page.og.description"];
  const twitterTitle = rootMatch!.translations["home.page.twitter.title"];
  const twitterDesc = rootMatch!.translations["home.page.twitter.description"];

  return [
    { title: titleText },
    { name: "description", content: descText },

    { property: "og:title", content: ogTitle },
    { property: "og:description", content: ogDesc },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.visualennode.com" },
    {
      property: "og:image",
      content: "https://www.visualennode.com/images/og-cover.jpg",
    },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: twitterTitle },
    { name: "twitter:description", content: twitterDesc },
    {
      name: "twitter:image",
      content: "https://www.visualennode.com/images/og-cover.jpg",
    },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const locale = params.locale ?? "en";

  const api = new Api();

  let newsCount: number = 0;

  const clients = await api.getClients(locale).then(async (response) => {
    return response.data.data;
  });

  const newsList = await api
    .getNewsList(locale, "", 1)
    .then(async (response) => {
      newsCount = response.data.meta.total;
      // return all items from the first page (don't truncate here)
      return response.data.data.splice(0, 6);
    });

  return {
    clients,
    newsList,
    newsCount,
  };
}

export default function Index() {

  const [loaded, setLoaded] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [totalSections, setTotalSections] = useState<number>(0);
  const [videosReady, setVideosReady] = useState<boolean>(false);
  const [counterDone, setCounterDone] = useState<boolean>(false);
  const { clients, newsList, newsCount } = useLoaderData<typeof loader>();
  const { translations, locale } = useOutletContext<AppContext>();
  let processItems = ((translations as unknown) as Record<string, unknown>)[
    "about.process.steps"
  ] as WorkProcessItem[] | undefined;
  if (!processItems) processItems = itemsForLocale(locale);

  const handleIndexChange = (currentIndex: number, totalSections: number) => {
    setCurrentSection(currentIndex);
    setTotalSections(totalSections);
  };

  // If we're on the Korean locale we hide the loading overlay elsewhere
  // so mark the page as loaded immediately so UI elements that depend on
  // `loaded` (like ScrollProgress) render as expected.
  useEffect(() => {
    if (locale === "ko") setLoaded(true);
  }, [locale]);

  useEffect(() => {
    if (loaded) return;

    const videos = document.querySelectorAll("video");
    let videoLoadedCount = 0;
    let autoplayVideoCount = 0;

    videos.forEach((video) => {
      if (video.autoplay) {
        autoplayVideoCount++;
      }
    });

    function handleLoadedVideo() {
      videoLoadedCount++;

      if (videoLoadedCount === autoplayVideoCount) {
        // If counter already finished, we can show the page immediately.
        if (counterDone) {
          setLoaded(true);
        } else {
          // Otherwise remember videos are ready and wait for the counter to finish.
          setVideosReady(true);
        }
      }
    }

    videos.forEach((video) => {
      if (video.autoplay) {
        if (video.readyState >= video.HAVE_FUTURE_DATA) {
          handleLoadedVideo();
          return;
        }

        video.addEventListener("canplaythrough", handleLoadedVideo);
      }
    });

    return () => {
      videos.forEach((video) => {
        if (video.autoplay) {
          video.removeEventListener("canplaythrough", handleLoadedVideo);
        }
      });
    };
  }, [loaded, counterDone, videosReady]);

  return (
    <>
      <AnimatePresence>
        {!loaded && (locale !== "ko") && (
          <motion.div
            key="loading-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              y: -12,
              transition: { duration: 0.6, ease: "easeInOut" },
            }}
            className={cn(
              "fixed inset-0 bg-[#1b1b1b] z-50 flex items-center justify-center",
              loaded ? "hidden" : ""
            )}
          >
            <div className="text-center max-w-screen-md w-full">
              <LoadingCounter
                onFinish={() => {
                  // If videos already ready, finish immediately. Otherwise mark counter done and wait.
                  if (videosReady) {
                    setLoaded(true);
                  } else {
                    setCounterDone(true);
                  }
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar - always show (hidden on small screens by the component's CSS) */}
      <ScrollProgress
        currentIndex={currentSection}
        totalSections={totalSections}
        className="z-40"
        labels={[
          "Home",
          "Services",
          "Works",
          "Clients",
          "Process",
          "News",
          "Contact",
        ]}
      />

      <div className={locale === "ko" ? "ko-solid" : ""}>
        <SmoothScrollLayout onIndexChange={handleIndexChange}>
          <HeroSection ready={loaded} />
          <SummarySection />
          <ServiceSection />
          <ClientSection clients={clients} />
          {/* pass translated steps if available */}
          <WorkProcess items={processItems} />
          <NewsSection newsList={newsList} newsCount={newsCount} />
          <ContactSection />
        </SmoothScrollLayout>
      </div>
    </>
  );
}
