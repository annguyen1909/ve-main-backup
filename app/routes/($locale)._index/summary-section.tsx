import { useOutletContext } from "@remix-run/react";
import { useInView } from "motion/react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { AppContext } from "~/root";
import { montserratIfKo } from "~/lib/utils";

const SummarySection = forwardRef<HTMLElement>((props, forwardedRef) => {
  const ref = useRef<HTMLElement>(null);
  const { translations, locale } = useOutletContext<AppContext>();
  const inView = useInView(ref, { amount: 1 });

  useImperativeHandle(forwardedRef, () => ref.current as HTMLElement);

  useEffect(() => {
    const headerDom = document.getElementById("header");
    if (!headerDom || !inView) return;
    headerDom.dataset.variant = "dark";
  }, [inView]);

  const categories = [
    (translations as Record<string, string>)["home.categories.still_image"] ??
      "Still Image",
    (translations as Record<string, string>)["home.categories.animation"] ??
      "Animation",
    (translations as Record<string, string>)["home.categories.cinematic"] ??
      "Cinematic",
    (translations as Record<string, string>)["home.categories.product"] ??
      "Product",
    (translations as Record<string, string>)["home.categories.vfx"] ?? "VFX",
  ];

  // use videos instead of static images (files located in public/videos)
  const videos = [
    "/videos/still%20image.mp4",
    "/videos/animation.mp4",
    "/videos/cinematic.mp4",
    "/videos/product.mp4",
    "/videos/car.mp4",
  ];

  // refs to control video playback on hover
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  // no default selection on desktop; default to first image for mobile to avoid empty image area
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  // track mouse position for parallax (normalized -1..1)
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  // ensure we show at least the first image by default (helps mobile where no hover occurs)
  const visibleIndex = hovered ?? selected ?? 0;

  // Play/pause videos when categories are hovered (desktop). Videos are muted so autoplay is allowed.
  useEffect(() => {
    // Play the hovered video on desktop, and always play the currently
    // visible video (visibleIndex) so mobile devices — which don't have
    // hover — will start the preview when the selected index changes.
    videoRefs.current.forEach((v, idx) => {
      if (!v) return;
      const shouldPlay = hovered === idx || visibleIndex === idx;
      if (shouldPlay) {
        try {
          v.currentTime = 0;
          const p = v.play();
          if (p && typeof (p as Promise<void>).catch === "function")
            (p as Promise<void>).catch(() => {});
        } catch (e) {
          // ignore play errors
        }
      } else {
        try {
          v.pause();
          v.currentTime = 0;
        } catch (e) {
          // ignore
        }
      }
    });
  }, [hovered, visibleIndex]);

  // touch/swipe support for mobile
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchMoved = useRef(false);
  const lastTouchX = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    touchMoved.current = false;
    lastTouchX.current = null;
    // debug
    if (typeof window !== "undefined")
      console.debug(
        "[swipe] touchstart",
        touchStartX.current,
        touchStartY.current
      );
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    // if vertical movement is dominant, don't treat as horizontal swipe
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) > 10) touchMoved.current = true;
    lastTouchX.current = t.clientX;
    if (typeof window !== "undefined")
      console.debug(
        "[swipe] touchmove dx",
        dx,
        "dy",
        dy,
        "lastX",
        lastTouchX.current
      );
  };

  const onTouchEnd = () => {
    if (
      !touchMoved.current ||
      touchStartX.current == null ||
      lastTouchX.current == null
    ) {
      touchStartX.current = null;
      touchStartY.current = null;
      touchMoved.current = false;
      return;
    }
    const dx = lastTouchX.current - (touchStartX.current ?? 0);
    const threshold = 30;
    if (Math.abs(dx) >= threshold) {
      const len = videos.length;
      if (dx < 0) {
        // swiped left → next
        setSelected((prev) => {
          const current = prev ?? 0;
          return (current + 1) % len;
        });
      } else {
        // swiped right → prev
        setSelected((prev) => {
          const current = prev ?? 0;
          return (current - 1 + len) % len;
        });
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchMoved.current = false;
    lastTouchX.current = null;
    if (typeof window !== "undefined") console.debug("[swipe] touchend dx", dx);
  };

  const onTouchCancel = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    touchMoved.current = false;
    lastTouchX.current = null;
    if (typeof window !== "undefined") console.debug("[swipe] touchcancel");
  };

  // Pointer event fallbacks (some browsers support pointer events better)
  const onPointerDown = (e: React.PointerEvent) => {
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    touchMoved.current = false;
    lastTouchX.current = null;
    if (typeof window !== "undefined")
      console.debug("[swipe] pointerdown", e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const dx = e.clientX - touchStartX.current;
    const dy = e.clientY - touchStartY.current;
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) > 10) touchMoved.current = true;
    lastTouchX.current = e.clientX;
    if (typeof window !== "undefined")
      console.debug("[swipe] pointermove dx", dx, "dy", dy);
  };

  const onPointerUp = () => {
    if (
      !touchMoved.current ||
      touchStartX.current == null ||
      lastTouchX.current == null
    ) {
      touchStartX.current = null;
      touchStartY.current = null;
      touchMoved.current = false;
      return;
    }
    const dx = lastTouchX.current - (touchStartX.current ?? 0);
    const threshold = 30;
    if (Math.abs(dx) >= threshold) {
      const len = videos.length;
      if (dx < 0) {
        setSelected((prev) => ((prev ?? 0) + 1) % len);
      } else {
        setSelected((prev) => ((prev ?? 0) - 1 + len) % len);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    touchMoved.current = false;
    lastTouchX.current = null;
    if (typeof window !== "undefined")
      console.debug("[swipe] pointerup dx", dx);
  };

  return (
    <section
      className="relative mt-8 md:mt-0 py-6 md:py-16 md:min-h-screen md:mb-0"
      ref={ref}
      {...props}
    >
      <div className="relative h-full z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-12 items-start md:items-center md:min-h-[70vh] gap-8 md:gap-12">
          {/* left list (desktop) - hidden on small screens */}
          <div className="md:col-span-5 col-span-12 h-full hidden md:flex md:flex-col justify-between md:self-end md:relative order-2 md:order-1">
            <div>
              {
                // ensure English words like "SERVICES" render with Montserrat on Korean pages
                (() => {
                  const svc = (translations as Record<string, string>)["home.summary.services"] ?? "SERVICE";
                  if (locale === 'ko' && /[A-Za-z]/.test(svc)) {
                    return (
                      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                        <span className="montserrat-for-en">{svc}</span>
                      </h2>
                    );
                  }
                  return (
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                      {svc}
                    </h2>
                  );
                })()
              }
            </div>
            <div className="space-y-2 md:space-y-4">
              {categories.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onMouseEnter={(e) => {
                    // compute mouse relative position inside the label to feed parallax
                    const rect = (
                      e.currentTarget as HTMLElement
                    ).getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    const nx = (e.clientX - cx) / (rect.width / 2);
                    const ny = (e.clientY - cy) / (rect.height / 2);
                    setMouse({
                      x: Math.max(-1, Math.min(1, nx)),
                      y: Math.max(-1, Math.min(1, ny)),
                    });
                    setHovered(i);
                    setSelected(i);
                  }}
                  onMouseMove={(e) => {
                    const rect = (
                      e.currentTarget as HTMLElement
                    ).getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    const nx = (e.clientX - cx) / (rect.width / 2);
                    const ny = (e.clientY - cy) / (rect.height / 2);
                    setMouse({
                      x: Math.max(-1, Math.min(1, nx)),
                      y: Math.max(-1, Math.min(1, ny)),
                    });
                  }}
                  onMouseLeave={() => {
                    setHovered(null);
                    setMouse({ x: 0, y: 0 });
                  }}
                  className={`text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors duration-500 ease-in-out flex items-center gap-4 md:gap-6 ${
                    selected === i || hovered === i
                      ? "text-white"
                      : "text-white/60"
                  }`}
                  aria-pressed={selected === i}
                >
                  <div className="flex items-center gap-4">
                    {/* large decorative label restored inline for each item */}
                    <span
                      className={`text-[20px] md:text-5xl text-outline block transform ${
                        selected === i || hovered === i
                          ? "text-white/100"
                          : "text-white/60"
                      } ${montserratIfKo(label, locale)}`}
                      style={{
                        fontFamily: "'Gilroy', sans-serif",
                        letterSpacing: "-0.44px",
                      }}
                    >
                      {label}
                    </span>

                    <img
                      src="/images/arrow.png"
                      alt=""
                      aria-hidden="true"
                      className="ml-2 w-5 h-5 transform transition-all duration-300 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-1"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* mobile: category label overlay is shown on the image instead of chips */}
          <div className="col-span-12 md:hidden" aria-hidden>
            {/* intentionally empty - label overlay renders inside the image container */}
          </div>

          {/* right panel */}
          <div className="md:col-span-7 col-span-12 md:order-2 order-1 flex items-center justify-center">
            <div className="w-full max-w-full overflow-hidden relative">
              {/* decorative divider for md screens */}
              <div className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 w-px h-3/4 bg-white/6" />

              {/* images */}
              <div
                className="relative h-[min(48vh,560px)] md:h-[min(80vh,720px)]"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchCancel}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                style={{ touchAction: "pan-y" }}
              >
                {/* mobile-only subtle top gradient to add depth on small screens */}
                <div className="md:hidden absolute inset-x-0 top-0 h-28 pointer-events-none z-20" />
                {videos.map((src, i) => {
                  // compute a parallax offset when the image corresponds to the hovered category
                  const isVisible = visibleIndex === i;
                  // smaller movement for touch or if not hovered
                  const intensity = isVisible && hovered !== null ? 18 : 6;
                  const offsetX = isVisible ? mouse.x * intensity : 0;
                  const offsetY = isVisible ? mouse.y * intensity : 0;
                  return (
                    <video
                      key={i}
                      ref={(el) => (videoRefs.current[i] = el)}
                      src={src}
                      muted
                      playsInline
                      loop
                      autoPlay
                      preload="auto"
                      className={`pointer-events-none absolute inset-0 h-full w-full object-cover drop-shadow-2xl transition-all will-change-[opacity,transform] ${
                        isVisible ? "opacity-100 z-10" : "opacity-0 z-0"
                      }`}
                      style={{
                        transform: `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${
                          isVisible ? 1 : 0.98
                        })`,
                        transition: isVisible
                          ? "opacity 360ms cubic-bezier(.22,1,.36,1), transform 520ms cubic-bezier(.22,1,.36,1)"
                          : "opacity 280ms ease-out, transform 360ms ease-out",
                        objectPosition: "center",
                      }}
                      // prevent native controls from appearing
                      controls={false}
                      aria-hidden
                    />
                  );
                })}

                {/* announce current category for screen readers */}
                <span className="sr-only" aria-live="polite">
                  {categories[visibleIndex] ?? ""}
                </span>

                {/* mobile split pill: chevron - label - chevron (centered) */}
                <div
                  className="md:hidden absolute left-4 right-4 bottom-10 z-40 flex items-center justify-center"
                  style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                >
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => {
                      const len = videos.length;
                      setSelected((prev) => {
                        const current = prev ?? 0;
                        return (current - 1 + len) % len;
                      });
                    }}
                    className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    ‹
                  </button>

                  <div className={`mx-3 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm flex items-center gap-3 min-w-[120px] justify-center ${montserratIfKo(categories[visibleIndex] ?? "", locale)}`}>
                    <span className="font-medium truncate">
                      {categories[visibleIndex] ?? ""}
                    </span>
                  </div>

                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => {
                      const len = videos.length;
                      setSelected((prev) => {
                        const current = prev ?? 0;
                        return (current + 1) % len;
                      });
                    }}
                    className="w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    ›
                  </button>
                </div>

                {/* mobile pagination dots (tap to switch) - lowered to avoid overlapping the pill */}
                <div className="md:hidden absolute left-0 right-0 bottom-3 flex justify-center gap-2 z-30">
                  {videos.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelected(idx)}
                      aria-label={`Show ${
                        categories[idx] ?? `image ${idx + 1}`
                      }`}
                      className={`w-2.5 h-2.5 rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                        visibleIndex === idx ? "bg-white" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

SummarySection.displayName = "SummarySection";

export { SummarySection };
