import { Link, useOutletContext } from "@remix-run/react";
// import { ArrowRight } from "lucide-react";
import { useInView } from "motion/react";
import { motion, useAnimation } from "framer-motion";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { localePath, montserratIfKo } from "~/lib/utils";
import { AppContext } from "~/root";

const ServiceSection = forwardRef<HTMLElement>((props, forwardedRef) => {
  const ref = useRef<HTMLElement>(null);
  const { translations: t, locale, banners } = useOutletContext<AppContext>();
  const inView = useInView(ref, { amount: 0.25 });
  const controls = useAnimation();
  const [rowIdxMap, setRowIdxMap] = useState<number[]>([]);
  const [delays, setDelays] = useState<number[]>([]);
  const lottieRefs = useRef<
    Array<null | { play?: () => void; pause?: () => void }>
  >([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);
  const [hasAnimatedOnce, setHasAnimatedOnce] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("serviceTilesAnimated") === "1";
  });

  useImperativeHandle(forwardedRef, () => ref.current as HTMLElement);

  useEffect(() => {
    const headerDom = document.getElementById("header");
    if (!headerDom || !inView) return;
    headerDom.dataset.variant = "dark";
    // measure tile vertical positions and group into rows, then start animation
    requestAnimationFrame(() => {
        const container = ref.current as HTMLElement | null;
        if (!container) {
          controls.start("visible");
          return;
        }
        const nodes = Array.from(
          container.querySelectorAll("[data-tile-index]")
        ) as HTMLElement[];
        if (!nodes.length) {
          controls.start("visible");
          return;
        }

        const containerTop = container.getBoundingClientRect().top;
        // round tops to 8px grid to reduce tiny differences
        const tops = nodes.map(
          (n) =>
            Math.round((n.getBoundingClientRect().top - containerTop) / 8) * 8
        );

        const tolerance = 12;

        // Build a list of unique row tops then sort them so indices correspond to top-to-bottom order
        const uniqueTops: number[] = [];
        tops.forEach((t) => {
          if (!uniqueTops.some((u) => Math.abs(u - t) <= tolerance)) {
            uniqueTops.push(t);
          }
        });
        uniqueTops.sort((a, b) => a - b);

        // group node indices by row, and sort nodes in each row by their left position
        const rows: number[][] = uniqueTops.map(() => []);
        nodes.forEach((n, i) => {
          const rowIdx = uniqueTops.findIndex((u) => Math.abs(u - tops[i]) <= tolerance);
          if (rowIdx >= 0) rows[rowIdx].push(i);
        });
        // sort each row by x (left) coordinate so intra-row order is left-to-right
        rows.forEach((r) =>
          r.sort((a, b) => {
            const na = nodes[a].getBoundingClientRect();
            const nb = nodes[b].getBoundingClientRect();
            return na.left - nb.left;
          })
        );

        const rowIndexForNode: number[] = new Array(nodes.length).fill(0);
        const computedDelays: number[] = new Array(nodes.length).fill(0);
        const rowDelay = 0.12; // delay per row
        const colDelay = 0.03; // delay per column within a row

        rows.forEach((r, rowIdx) => {
          r.forEach((nodeIdx, posInRow) => {
            rowIndexForNode[nodeIdx] = rowIdx;
            computedDelays[nodeIdx] = rowIdx * rowDelay + posInRow * colDelay;
          });
        });

        setRowIdxMap(rowIndexForNode);
        setDelays(computedDelays);
        // trigger animation start via controls for any other consumers
        // and mark that we've animated once so we don't replay on later views
        const alreadyAnimated =
          typeof window !== "undefined" &&
          sessionStorage.getItem("serviceTilesAnimated") === "1";
        if (!alreadyAnimated) {
          try {
            sessionStorage.setItem("serviceTilesAnimated", "1");
          } catch (e) {
            /* ignore storage errors */
          }
          setHasAnimatedOnce(true);
          controls.start("visible");
        }
      });
  }, [inView, controls]);

  // create a beautiful masonry-like pattern with varied sizes for visual interest
  // pattern: large anchors (5-7) alternating with accent clusters (2-3 stacked)
  const tiles = [
    { rowSpan: 6 }, // large anchor left
    { rowSpan: 3 }, // accent upper
    { rowSpan: 3 }, // accent lower (stacks with previous)
    { rowSpan: 5 }, // mid anchor
    { rowSpan: 2 }, // small accent
    { rowSpan: 3 }, // medium accent
    { rowSpan: 7 }, // large anchor right
    { rowSpan: 2 }, // small accent
    { rowSpan: 4 }, // medium anchor
    { rowSpan: 3 }, // accent
    { rowSpan: 5 }, // large anchor right
    { rowSpan: 4 }, // small accent
    { rowSpan: 4 }, // medium anchor
    { rowSpan: 3 }, // accent
  ];

  // explicit client-side image list (place files in public/images/)
  const imgs = [
    "/images/hero-1.jpg",
    "/images/hero-2.jpg",
    "/images/hero-3.jpg",
    "/images/hero-4.jpg",
    "/images/hero-5.jpg",
    "/images/hero-1.jpg",
    "/images/hero-2.jpg",
    "/images/hero-3.jpg",
    "/images/hero-3.jpg",
    "/images/hero-1.jpg",
    "/images/hero-2.jpg",
    "/images/hero-3.jpg",
    "/images/hero-3.jpg",
    "/images/hero-1.jpg",
  ];

  // Force local images by default. To explicitly use server banners, pass ?useServerBanners=1
  const useServerBanners =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("useServerBanners") === "1";

  const tileImgs =
    useServerBanners && Array.isArray(banners) && banners.length > 0
      ? banners.map((b) => b.url)
      : imgs;

  // Debug: allow showing tile URLs when ?showTileUrls=1 is present in the URL (removed unused variable)

  // modal state for showing clicked tile
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const MODAL_ANIM_MS = 320;

  // computed service title and whether to append the word 'WORKS'
  const serviceTitleRaw = (t as Record<string, string>)["home.service.title"];
  const serviceTitle = serviceTitleRaw ?? "SELECTED";
  const shouldAppendWorks = !serviceTitleRaw || !/work/i.test(serviceTitleRaw);

  // Determine a substring to highlight in red.
  // Original logic looked for English 'work(s)'. Add a fallback to detect the
  // common Korean word '작품' or '작품들' so translations can mark that word red
  // without changing the component markup.
  let titleBefore = serviceTitle;
  let titleMatch: string | null = null;
  let titleAfter = "";

  if (serviceTitleRaw) {
    const engMatch = serviceTitleRaw.match(/works?|work/i);
    if (engMatch && typeof engMatch.index === "number") {
      titleBefore = serviceTitleRaw.slice(0, engMatch.index);
      titleMatch = engMatch[0];
      titleAfter = serviceTitleRaw.slice(engMatch.index + titleMatch.length);
    } else {
      // look for Korean highlight words
      const korCandidates = ["작품들", "작품"];
      const found = korCandidates
        .map((w) => ({ w, idx: serviceTitleRaw.indexOf(w) }))
        .filter((x) => x.idx >= 0)
        .sort((a, b) => a.idx - b.idx)[0];
      if (found) {
        titleBefore = serviceTitleRaw.slice(0, found.idx);
        titleMatch = found.w;
        titleAfter = serviceTitleRaw.slice(found.idx + found.w.length);
      } else {
        // fallback: no highlighted substring
        titleBefore = serviceTitle;
        titleMatch = null;
        titleAfter = "";
      }
    }
  }

  // helper: when page is Korean, render ASCII/English substrings with Montserrat
  const renderMaybeMontserrat = (text: string | null | undefined) => {
    if (!text) return null;
    if (locale === "ko" && /[A-Za-z]/.test(text)) {
      return <span className="montserrat-for-en">{text}</span>;
    }
    return <>{text}</>;
  };

  const serviceDescription = (t as Record<string, string>)["home.service.description"] ??
    "Explore the impressive portfolio of Our 3D Rendering Company to see how VISUAL ENNODE brings architectural visions to life with precision and creativity. Dive into our projects to experience the high-quality visualizations that set us apart.";

  function openModal(url: string) {
    setModalUrl(url);
    // allow mount then trigger visibility for CSS transition
    requestAnimationFrame(() => setModalVisible(true));
  }

  function closeModal() {
    setModalVisible(false);
    setTimeout(() => setModalUrl(null), MODAL_ANIM_MS);
  }

  // lock body scroll when modal is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    if (modalUrl) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = prev;
    }
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalUrl]);

  // close modal on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section
      className="min-h-[700px] md:min-h-[1400px] py-12 md:py-16 relative bg-[#1b1b1b]"
      ref={ref}
      {...props}
      onMouseMove={(e) => {
        // Track mouse position across the entire section for global parallax
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const normalizedX = (x - centerX) / centerX;
        const normalizedY = (y - centerY) / centerY;

        setMousePos({ x: normalizedX * 0.5, y: normalizedY * 0.5 }); // Reduced intensity for global movement
      }}
      onMouseLeave={() => {
        setMousePos({ x: 0, y: 0 });
        setHoveredTile(null);
      }}
    >
      {/* heading */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-8 sm:pt-12 min-w-0">
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            {serviceTitleRaw ? (
                titleMatch ? (
                <>
                  {renderMaybeMontserrat(titleBefore)}
                  <span className="text-red-500">{renderMaybeMontserrat(titleMatch)}</span>
                  {renderMaybeMontserrat(titleAfter)}
                </>
              ) : (
                <>{renderMaybeMontserrat(serviceTitle)}</>
              )
            ) : (
              <>
                {renderMaybeMontserrat(serviceTitle)}{' '}
                {shouldAppendWorks ? <span className="text-red-500">{renderMaybeMontserrat('WORKS')}</span> : null}
              </>
            )}
          </h2>
          {
            // Only split into multiple paragraphs for Korean locale. Other locales render as single paragraph.
            locale === 'ko' ? (
              // split first on explicit newlines, then further split sentences at period+space
              (serviceDescription ?? "").split(/\r?\n/).flatMap((s) => s.split(/(?<=\.)\s+/)).map((line, i) => (
                <p
                  key={i}
                  className={`${i === 0 ? 'mt-3 sm:mt-4' : 'mt-2'} max-w-[68rem] text-base sm:text-lg md:text-xl text-white/80 leading-relaxed`}
                >
                  {line}
                </p>
              ))
            ) : (
              <p className="mt-3 sm:mt-4 max-w-[68rem] text-base sm:text-lg md:text-xl text-white/80 leading-relaxed">
                {serviceDescription}
              </p>
            )
          }
        </div>
      </div>

      {/* mosaic grid (full-bleed) */}
      <div className="mt-6 sm:mt-8 md:mt-10 w-full px-0">
        <div className="w-full relative overflow-hidden min-h-[1000px] md:min-h-[1800px] bg-[#1b1b1b]">
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px sm:gap-2 lg:gap-px auto-rows-[minmax(80px,1fr)] sm:auto-rows-[minmax(120px,1fr)] md:auto-rows-[minmax(160px,1fr)] lg:auto-rows-fr">
            {tiles.map((tile, idx) => {
              const url = tileImgs[idx % tileImgs.length];
              const rowForThis =
                typeof rowIdxMap[idx] === "number"
                  ? rowIdxMap[idx]
                  : Math.floor(idx / 4);

              

              // Calculate parallax offset based on mouse position
              const handleMouseMove = (
                e: React.MouseEvent<HTMLButtonElement>
              ) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Normalize to -1 to 1 range
                const normalizedX = (x - centerX) / centerX;
                const normalizedY = (y - centerY) / centerY;

                setMousePos({ x: normalizedX, y: normalizedY });
                setHoveredTile(idx);
              };

              const handleMouseLeave = () => {
                setMousePos({ x: 0, y: 0 });
                setHoveredTile(null);
              };

              // Calculate image transform based on mouse position
              const isHovered = hoveredTile === idx;
              const isHeadingHovered = hoveredTile === -1;

              // Use global mouse position when heading is hovered, local when tile is hovered
              const moveX = isHovered
                ? mousePos.x * 20 // Stronger movement for direct tile hover
                : isHeadingHovered
                ? mousePos.x * 8 // Subtle global movement when hovering heading
                : 0;
              const moveY = isHovered
                ? mousePos.y * 20
                : isHeadingHovered
                ? mousePos.y * 8
                : 0;

              const scale = isHovered ? 1.15 : isHeadingHovered ? 1.05 : 1;

              return (
                <motion.button
                  data-tile-index={idx}
                  key={idx}
                  type="button"
                  onClick={() => openModal(url)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => {
                    handleMouseLeave();
                    lottieRefs.current[idx]?.pause?.();
                  }}
                  onMouseEnter={() => {
                    lottieRefs.current[idx]?.play?.();
                    setHoveredTile(idx);
                  }}
                  onFocus={() => lottieRefs.current[idx]?.play?.()}
                  onBlur={() => lottieRefs.current[idx]?.pause?.()}
                  className={`relative overflow-hidden rounded-none bg-gray-800 block group transition-all duration-300`}
                  style={{ gridRowEnd: `span ${tile.rowSpan}` }}
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={
                    hasAnimatedOnce
                      ? { opacity: 1, scale: 1, y: 0 }
                      : inView
                      ? { opacity: 1, scale: 1, y: 0 }
                      : { opacity: 0, scale: 0.9, y: 30 }
                  }
                  transition={
                    hasAnimatedOnce
                      ? { duration: 0 }
                      : {
                          delay: delays[idx] ?? rowForThis * 0.12,
                          duration: 0.8,
                          ease: [0.22, 1, 0.36, 1],
                        }
                  }
                >
                  <div
                    className="w-full h-full"
                    style={{
                      transform: `translate(${moveX}px, ${moveY}px) scale(${scale})`,
                      transition: isHovered
                        ? "transform 0.2s ease-out"
                        : "transform 0.5s ease-out",
                    }}
                  >
                    <img
                      src={url}
                      alt={`work-${idx + 1}`}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target && target.src && !target.dataset.fallback) {
                          target.dataset.fallback = "1";
                          target.src = "/images/visual-placeholder.webp";
                        }
                      }}
                      className="block w-full h-full object-cover"
                    />
                  </div>
                  {/* per-tile gradient removed — using a single overlay for the whole mosaic */}
                </motion.button>
              );
            })}
          </div>

          <div
            aria-hidden
            className="absolute left-0 bottom-0 right-0 md:right-12 lg:right-16 h-[40%] bg-gradient-to-b from-transparent to-[#1b1b1b] pointer-events-none z-10"
          />
        </div>

        {/* CTA centered at bottom */}
        <div className="mt-6 sm:mt-8 md:mt-12 flex justify-center">
            <Link
              to={localePath(locale, "works")}
              className={`px-6 sm:px-8 py-2 sm:py-3 bg-white/10 hover:bg-white/20 rounded-full text-white uppercase text-xs sm:text-sm tracking-wide transition-all duration-300 ${montserratIfKo(
                locale === "ko"
                  ? "더 알아보기"
                  : (t as Record<string, string>)["Explore more"] ?? "explore more",
                locale
              )}`}
            >
              {locale === "ko"
                ? "더 알아보기"
                : (t as Record<string, string>)["Explore more"] ?? "explore more"}
            </Link>
        </div>
        {/* section-level shadow removed; using a single overlay directly above the grid for reliability */}
      </div>
      {modalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
              modalVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => closeModal()}
            aria-hidden
          />
          <div
            className={`relative max-w-[min(1100px,90vw)] max-h-[90vh] w-full p-4 transform transition-all duration-300 ease-out ${
              modalVisible
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <button
              onClick={() => closeModal()}
              className="absolute top-5 bg-black/10 right-5 z-10 text-white rounded-sm px-2"
              aria-label="Close"
            >
              ✕
            </button>
            <img
              src={modalUrl}
              alt="tile"
              className="w-full h-full object-contain rounded-md bg-black"
            />
          </div>
        </div>
      )}
    </section>
  );
});

ServiceSection.displayName = "ServiceSection";

export { ServiceSection };
