import { forwardRef, useEffect, useRef, useState } from "react";

import { Link, useOutletContext } from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import * as motion from "motion/react-client";
import { cn, localePath } from "~/lib/utils";
import { AppContext } from "~/root";

// Increased delay so hero entrance waits a bit longer after the loading counter finishes
const ANIMATION_DELAY_SECONDS = 0.75;
const CARD_ANIMATION_SECONDS = 0.5;
// derived delays so a single constant controls sequencing
const HERO_TITLE_DELAY = ANIMATION_DELAY_SECONDS + 0.5;
const HERO_SUB_DELAY = ANIMATION_DELAY_SECONDS + 0.5;

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  ready?: boolean;
}

const HeroSection = forwardRef<HTMLElement, HeroSectionProps>((props, ref) => {
  const { locale, translations } = useOutletContext<AppContext>();
  const [cardAnimationStart, setCardAnimationStart] = useState<boolean>(
    props.ready ?? false
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const [animationEnd, setAnimationEnd] = useState<boolean>(
    props.ready ?? false
  );

  useEffect(() => {
    const headerDom = document.getElementById("header");

    if (!headerDom) return;

    headerDom.dataset.variant = "dark";
  }, []);

  useEffect(() => {
    if (props.ready) {
      setTimeout(() => {
        setAnimationEnd(true);
        setCardAnimationStart(true);

        setTimeout(
          () => setCardAnimationStart(false),
          CARD_ANIMATION_SECONDS * 0.5
        );
      }, ANIMATION_DELAY_SECONDS * 1000);
    }
  }, [props.ready]);

  return (
    <section
      className={cn(
        "min-h-screen relative",
        animationEnd && !cardAnimationStart ? "" : "page-scroller-disabled"
      )}
      ref={ref}
    >
      {/* Background video with overlay */}
      <video
        muted
        playsInline
        loop
        autoPlay
        preload="none"
        className={cn(
          "absolute inset-0 object-cover h-full w-full",
          animationEnd ? "" : "z-10"
        )}
        ref={videoRef}
      >
        <source src="/videos/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Overlay: darken video for legibility (stronger on mobile) */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent to-[#1b1b1b] pointer-events-none z-10"
      />
      {/* Smooth transition gradient over the bottom of the video (fades video into next section) */}
      <div className="absolute bottom-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-b from-transparent to-[#1b1b1b]"></div>

      {/* Main content - responsive layout */}
      <div className="relative z-30 h-full min-h-screen flex flex-col justify-center sm:justify-between p-4 sm:p-8 lg:py-36 lg:px-20">
        {/* Decorative blob on the right for large screens (visual anchor) */}
        <div
          aria-hidden
          className="hidden lg:block pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 z-10"
          style={{ width: 520, height: 520 }}
        >
          <svg
            viewBox="0 0 600 600"
            className="w-full h-full opacity-30 filter blur-2xl"
          >
            <defs>
              <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ff4757" stopOpacity="0.18" />
              </linearGradient>
            </defs>
            <g transform="translate(300,300)">
              <path
                d="M120,-160C160,-120,180,-60,170,-10C160,40,120,80,80,120C40,160,-10,200,-60,200C-110,200,-160,160,-190,110C-220,60,-230,-10,-200,-60C-170,-110,-110,-150,-50,-180C10,-210,70,-200,120,-160Z"
                fill="url(#g1)"
              />
            </g>
          </svg>
        </div>
        {/* Spacer for header - much smaller on mobile */}
        <div className="h-0 sm:h-20 md:h-24"></div>

        {/* Main title section - responsive positioning */}
        <div className="flex-1 flex items-center justify-center sm:justify-start">
          <div className="max-w-4xl text-center sm:text-left space-y-8 sm:space-y-0">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white uppercase mb-4 sm:mb-6 lg:mb-8 leading-tight tracking-tight px-4 sm:px-0 sm:ml-12"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: HERO_TITLE_DELAY }}
            >
              {(() => {
                const title =
                  (translations as Record<string, string>)?.[
                    "home.hero.title"
                  ] ?? "ARCHVIZ\nSTUDIO";
                return title.split("\n").map((line: string, i: number) => (
                  <span
                    key={i}
                    // Force Montserrat for the English hero title even when the
                    // page is rendered in Korean. Inline fontFamily ensures the
                    // correct font is used regardless of parent locale styles.
                    className="leading-tight"
                    style={{
                      fontFamily:
                        '"Montserrat", "Gilroy", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    }}
                  >
                    {line}
                    <br />
                  </span>
                ));
              })()}
            </motion.h1>
            <motion.p
              className="text-base sm:text-base md:text-lg lg:text-xl text-gray-200 max-w-sm sm:max-w-xl leading-relaxed font-light px-4 sm:px-0 sm:ml-12 mb-8 sm:mb-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: HERO_SUB_DELAY }}
            >
              {(translations as Record<string, string>)?.[
                "home.hero.subtitle"
              ] ?? "We unite diverse departments for seamless collaboration"}
            </motion.p>

            {/* CTAs on mobile - integrated in the center section */}
            <div className="sm:hidden flex flex-col gap-4 px-4 mt-8">
              <motion.div
                className="group cursor-pointer touch-manipulation"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: HERO_SUB_DELAY }}
              >
                <p className="text-xs text-gray-300 uppercase tracking-wider mb-1 font-medium">
                  {(translations as Record<string, string>)?.[
                    "home.hero-section.visual.slogan"
                  ] ?? "WE VISUALIZE"}
                </p>
                <Link
                  to={localePath(locale, "works")}
                  className="text-lg text-white font-medium inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-300 hover:text-gray-200 active:text-gray-300"
                >
                  {(translations as Record<string, string>)?.[
                    "home.hero-section.visual.cta"
                  ] ?? "SEE WORKS"}{" "}
                  <ArrowRight className="size-5" />
                </Link>
              </motion.div>

              <motion.div
                className="group cursor-pointer touch-manipulation"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: HERO_SUB_DELAY }}
              >
                <p className="text-xs text-gray-300 uppercase tracking-wider mb-1 font-medium">
                  {(translations as Record<string, string>)?.[
                    "home.hero-section.ennode.slogan"
                  ] ?? "WE CONNECT"}
                </p>
                <Link
                  to={localePath(locale, "about")}
                  className="text-lg text-white font-medium inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-300 hover:text-gray-200 active:text-gray-300"
                >
                  {(translations as Record<string, string>)?.[
                    "home.hero-section.ennode.cta"
                  ] ?? "MORE ABOUT US"}{" "}
                  <ArrowRight className="size-5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom CTA section - desktop only */}
        <div className="hidden sm:flex flex-col gap-8 lg:gap-16 pb-12 lg:pb-16 px-0 ml-12">
          {/* Desktop: Side by side */}
          <div className="flex flex-row gap-16">
            <motion.div
              className="group cursor-pointer touch-manipulation"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2 }}
            >
              <p className="text-sm text-gray-300 uppercase tracking-wider mb-3 font-medium">
                {(translations as Record<string, string>)?.[
                  "home.hero-section.visual.slogan"
                ] ?? "WE VISUALIZE"}
              </p>
              <Link
                to={localePath(locale, "works")}
                className="text-2xl lg:text-3xl text-white font-medium inline-flex items-center gap-4 group-hover:gap-6 transition-all duration-300 hover:text-gray-200 active:text-gray-300"
              >
                {(translations as Record<string, string>)?.[
                  "home.hero-section.visual.cta"
                ] ?? "SEE WORKS"}{" "}
                <ArrowRight className="size-6" />
              </Link>
            </motion.div>

            <motion.div
              className="group cursor-pointer touch-manipulation"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2 }}
            >
              <p className="text-sm text-gray-300 uppercase tracking-wider mb-3 font-medium">
                {(translations as Record<string, string>)?.[
                  "home.hero-section.ennode.slogan"
                ] ?? "WE CONNECT"}
              </p>
              <Link
                to={localePath(locale, "about")}
                className="text-2xl lg:text-3xl text-white font-medium inline-flex items-center gap-4 group-hover:gap-6 transition-all duration-300 hover:text-gray-200 active:text-gray-300"
              >
                {(translations as Record<string, string>)?.[
                  "home.hero-section.ennode.cta"
                ] ?? "MORE ABOUT US"}{" "}
                <ArrowRight className="size-6" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";

export { HeroSection };
