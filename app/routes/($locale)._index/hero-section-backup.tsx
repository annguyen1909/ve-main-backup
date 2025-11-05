import { forwardRef, MutableRefObject, useEffect, useRef, useState } from "react";

// eslint-disable-next-line import/no-unresolved
// eslint-disable-next-line import/no-unresolved
import visualPlaceHolder from "/images/visual-placeholder.png";
// eslint-disable-next-line import/no-unresolved
import ennodePlaceHolder from "/images/ennode-placeholder.png";
import { AnimatePresence } from "motion/react";
import { Link, useOutletContext } from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import * as motion from "motion/react-client";
import { SpinnerIcon } from "~/components/ui/icon";
import { cn, localePath } from "~/lib/utils";
import { AppContext } from "~/root";

const ANIMATION_DELAY_SECONDS = 3;
const CARD_ANIMATION_SECONDS = 0.5;

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  videoRefs: MutableRefObject<Array<HTMLVideoElement>>;
}

const HeroSection = forwardRef<HTMLElement, HeroSectionProps>((props, ref) => {
  const { brand, translations: t, locale } = useOutletContext<AppContext>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [animationEnd, setAnimationEnd] = useState<boolean>(false);

  useEffect(() => {
    const headerDom = document.getElementById("header");

    if (!headerDom) return;

    headerDom.dataset.variant = "dark";
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    props.videoRefs.current[0] = video;

    function startAnimation() {
      if (!loaded) {
        setLoaded(true)
        setTimeout(() => setAnimationEnd(true), (ANIMATION_DELAY_SECONDS + CARD_ANIMATION_SECONDS) * 1000);
      }
    }

    if (video.currentTime > 0) {
      startAnimation()
      return
    }

    video.addEventListener("canplaythrough", startAnimation);

    return () => {
      video.removeEventListener("canplaythrough", startAnimation);
    };
  }, [videoRef, loaded, props.videoRefs]);

  return (
    <section
      className={cn("h-dvh max-h-dvh", animationEnd ? '' : 'page-scroller-disabled')}
      ref={ref}
    >
      <div className={cn('fixed inset-0 bg-[#1b1b1b] z-50 flex items-center justify-center', loaded ? 'hidden' : '')}>
        <SpinnerIcon className="size-10 text-white" />
      </div>
      <AnimatePresence>
        {animationEnd ? null : <motion.div key="loading" className="fixed inset-0 flex items-center justify-center z-20 bg-black/30"
          transition={{ scale: { duration: 1 }, opacity: { duration: 1 } }}
          exit={{ scale: 2, opacity: 0 }}
        >
          <img
            src={brand.url}
            alt={brand.description}
            className="w-52 sm:w-80 select-none drop-shadow-xl"
          />
        </motion.div>}
      </AnimatePresence>
      <video muted playsInline loop preload="none" className={cn("fixed inset-0 object-cover h-dvh w-full max-h-dvh", animationEnd ? '' : 'z-10')} ref={videoRef}>
        <source src="https://download-video-ak.vimeocdn.com/v3-1/playback/3a791e0d-f2fd-4605-8d35-9a5938cc3d7a/d51527b5-9bf85784?__token__=st=1740659309~exp=1740673709~acl=%2Fv3-1%2Fplayback%2F3a791e0d-f2fd-4605-8d35-9a5938cc3d7a%2Fd51527b5-9bf85784%2A~hmac=683ed346fc0a8f2c3051c06c91291188daa2362daed1e9c817f102e4bfcc861f&r=dXMtY2VudHJhbDE%3D" type="video/mp4" />
      </video>

      <div className="h-full overflow-hidden max-h-full grid grid-cols-1 lg:grid-cols-2">
        <motion.div
          className="hover:bg-black/60 bg-black/30 relative group"
          initial={{ translateX: "-10%" }}
          animate={{ translateX: 0 }}
          transition={{ translateX: { duration: CARD_ANIMATION_SECONDS, delay: ANIMATION_DELAY_SECONDS } }}
        >
          <div className="h-full flex items-center justify-center" style={{
            background: `center/auto 100% no-repeat url(${visualPlaceHolder})`,
          }}>
            <div className="text-center">
              <h3 className="text-5xl xl:text-6xl font-semibold text-white uppercase drop-shadow duration-300  group-hover:mb-7">
                VISUAL
              </h3>
              <div className="opacity-0 translate-y-4 h-0 group-hover:h-auto group-hover:translate-y-0 group-hover:opacity-100 duration-300">
                <p className="uppercase text-xl lg:text-2xl text-[#959595]">
                  {t['home.hero-section.visual.slogan']}
                </p>
                <Link
                  to={localePath(locale, 'works')}
                  className="inline-flex items-center text-base text-white/80 opacity-65 font-light mt-1"
                >
                  {t['home.hero-section.visual.cta']} <ArrowRight className="size-3 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="hover:bg-black/60 bg-black/30 relative group"
          initial={{ translateX: "10%" }}
          animate={{ translateX: 0 }}
          transition={{ translateX: { duration: CARD_ANIMATION_SECONDS, delay: ANIMATION_DELAY_SECONDS } }}
        >
          <div className=" h-full flex items-center justify-center" style={{
            background: `center/auto 100% no-repeat url(${ennodePlaceHolder})`,
          }}>
            <div className="text-center">
              <h3 className="text-5xl xl:text-6xl font-semibold text-white uppercase drop-shadow duration-300  group-hover:mb-7">
                ENNODE
              </h3>
              <div className="opacity-0 translate-y-4 h-0 group-hover:h-auto group-hover:translate-y-0 group-hover:opacity-100 duration-300">
                <p className="uppercase text-xl lg:text-2xl text-[#959595]">
                  {t['home.hero-section.ennode.slogan']}
                </p>
                <Link
                  to={localePath(locale, 'works')}
                  className="inline-flex items-center text-base text-white/80 opacity-65 font-light mt-1"
                >
                  {t['home.hero-section.ennode.cta']} <ArrowRight className="size-3 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section >
  );
})

HeroSection.displayName = "HeroSection";

export { HeroSection };

