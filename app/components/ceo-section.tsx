import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useInView } from "motion/react";
import { useOutletContext } from "@remix-run/react";
import { AppContext } from "~/root";

interface CEOSectionProps {
  className?: string;
}

const CEOSection = forwardRef<HTMLElement, CEOSectionProps>(
  ({ className = "" }, forwardedRef) => {
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { amount: 0.3 });

    useImperativeHandle(forwardedRef, () => ref.current as HTMLElement);

    useEffect(() => {
      const headerDom = document.getElementById("header");
      if (!headerDom || !inView) return;
      headerDom.dataset.variant = "dark";
    }, [inView]);

  const { translations } = useOutletContext<AppContext>();

  return (
        <section
          ref={ref}
          className={`relative lg:max-h-[80svh] flex items-center justify-center bg-[#1b1b1b] ${className}`}
        >
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-12">
          <div className="border border-white/5 rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
              {/* Left: Profile Image */}
              <div className="md:col-span-5 flex justify-center md:justify-start">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                  <img
                    src="/images/JIMMY CHUNG.png"
                    alt="CEO Profile"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target && !target.dataset.fallback) {
                        target.dataset.fallback = "1";
                        target.src = "/images/visual-placeholder.png";
                      }
                    }}
                  />
                </div>
              </div>

              {/* Right: CEO Info */}
              <div className="md:col-span-7 space-y-6 md:space-y-8 text-left md:pr-16 lg:pr-24">
                {/* Name & Title */}
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                    {(translations as Record<string,string>)["ceo.name"] ?? "YOONCHANG CHUNG"}
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl text-white/60 tracking-wide">
                    {(translations as Record<string,string>)["ceo.title"] ?? "| CEO | FOUNDER"}
                  </p>
                </div>

                {/* Message */}
                <div className="space-y-4 md:space-y-6 max-w-3xl">
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/80">
                    {(translations as Record<string,string>)["ceo.message.1"] ?? "Visual Ennode is the crystallization between architectural art and cinema language, where each frame not only reproduces the space but also tells a story. We do not merely create images, but also arouse emotions, turn quiet designs into vivid, attractive movies."}
                  </p>
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/80">
                    {(translations as Record<string,string>)["ceo.message.2"] ?? "With the combination of advanced technology and sophisticated art thinking, we bring a high-class visual experience, helping architects, real estate developers and brands to convey ideas of the idea."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

CEOSection.displayName = "CEOSection";

export { CEOSection };
