import React from "react";
import { cn } from "~/lib/utils";
import { useCheckpointObserver } from "~/components/hooks/useCheckpointObserver";
import { defaultItems, WorkProcessItem } from "~/data/dataWorkProcess";
import { useOutletContext } from "@remix-run/react";
import { AppContext } from "~/root";

interface WorkProcessProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: WorkProcessItem[];
}

export function WorkProcess({
  items = defaultItems,
  className,
  ...props
}: WorkProcessProps) {
  const { translations, locale } = useOutletContext<AppContext>();
  const sectionTitle = ((translations as unknown) as Record<string, string>)[
    "about.process.title"
  ] as string | undefined;
  // If a translated title exists, try to detect a substring to highlight in red.
  // Prefer Korean '프로세스' then '작업', fall back to English 'PROCESS'.
  let titleBefore: string | null = null;
  let titleMatch: string | null = null;
  let titleAfter: string | null = null;
  if (sectionTitle) {
    const korMatch = (() => {
      const candidates = ["프로세스", "작업 프로세스", "작업", "프로세스"];
      for (const w of candidates) {
        const idx = sectionTitle.indexOf(w);
        if (idx >= 0) return { w, idx };
      }
      return null;
    })();

    if (korMatch) {
      titleBefore = sectionTitle.slice(0, korMatch.idx);
      titleMatch = korMatch.w;
      titleAfter = sectionTitle.slice(korMatch.idx + korMatch.w.length);
    } else {
      const eng = sectionTitle.match(/PROCESS/i);
      if (eng && typeof eng.index === "number") {
        titleBefore = sectionTitle.slice(0, eng.index);
        titleMatch = eng[0];
        titleAfter = sectionTitle.slice(eng.index + titleMatch.length);
      }
    }
  }
  const [visibleItems, itemRefs] = useCheckpointObserver(items.length, {
    threshold: 0.5,
    rootMargin: "0px 0px -200px 0px",
  });

  // Map items to a visual left-to-right (top-to-bottom) order based on DOM positions.
  const [orderMap, setOrderMap] = React.useState<number[]>([]);

  React.useEffect(() => {
    // measure positions after mount/updates
    const measure = () => {
      const nodes = itemRefs.current as Array<HTMLElement | null>;
      if (!nodes || !nodes.length) return;

      const rects = nodes.map((n, i) => {
        if (!n) return { i, top: Infinity, left: Infinity };
        const r = n.getBoundingClientRect();
        return { i, top: Math.round(r.top), left: Math.round(r.left) };
      });

      // sort by top then left (so we read rows left->right)
      const sorted = [...rects].sort((a, b) => {
        const topDiff = a.top - b.top;
        if (Math.abs(topDiff) > 20) return topDiff;
        return a.left - b.left;
      });

      const map: number[] = new Array(nodes.length).fill(0);
      sorted.forEach((s, order) => {
        map[s.i] = order;
      });

      setOrderMap(map);
    };

    // run initially and also on resize to recompute order
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [itemRefs, items.length]);

  // Timing knobs (ms) - tweak these to make the whole sequence slower/faster
  const ROW_ORDER_DELAY = 300; // delay multiplier per ordered item
  const SUBTITLE_STAGGER = 200; // delay between subtitles within an item
  const TRANSITION_DURATION = 1200; // duration of the subtitle transition

  // Helper function to get the first word from title

  return (
    <section className="pt-12 md:py-16 relative mb-12 md:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-0">
        {/* Background grid decoration - Fixed position container - hidden on mobile */}
        <div
          className="hidden md:block absolute max-w-7xl mt-6 mx-auto px-4 sm:px-6 md:px-12 left-0 right-0 pointer-events-none"
          style={{
            background: `url('/images/grid-deco.svg') center/contain no-repeat`,

            height: "21rem",
            opacity: 1,
            transition: "none",
            animation: "none",
            willChange: "auto",
          }}
        />

        <div className="relative">
          {/* Title - Always visible */}
          <div>
            {sectionTitle ? (
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight text-center mb-8 sm:mb-10 md:mb-12">
                {titleMatch ? (
                  <>
                    {titleBefore}
                    <span className="text-red-500">{titleMatch}</span>
                    {titleAfter}
                  </>
                ) : (
                  sectionTitle
                )}
              </h2>
            ) : (
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight text-center mb-8 sm:mb-10 md:mb-12">
                {locale === "ko" ? (
                  <>
                    <span className="text-white">프로젝트 </span>
                    <span className="text-red-500">진행 과정</span>
                  </>
                ) : (
                  <>
                    <span className="text-white">OUR WORK </span>
                    <span className="text-red-500">PROCESS</span>
                  </>
                )}
              </h2>
            )}
          </div>

          <div className={cn("w-full max-w-7xl mx-auto", className)} {...props}>
            <div className="relative w-full">
              {/* Responsive Grid layout: single column on mobile, 2 cols on sm/md, full 22-col grid on lg+ */}
              <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(22,1fr)] gap-6 sm:gap-8 md:gap-0 pt-0 sm:pt-8 md:pt-12">
                {items.map((item, index) => {
                  const isVisible = visibleItems[index];

                  // Apply column spans only for lg+ screens via Tailwind arbitrary values
                  // Explicit column ranges for large screens (22-column layout)
                  // 1) columns 1-6  -> span 5
                  // 2) columns 6-13 -> span 7
                  // 3) columns 13-18 -> span 5
                  // 4) columns 18-23 -> span 5
                  const colSpanClasses = [
                    "lg:[grid-column:1/6]",
                    "lg:[grid-column:6/13]",
                    "lg:[grid-column:13/18]",
                    "lg:[grid-column:18/23]",
                  ];

                  return (
                    <div
                      key={index}
                      ref={(el) => (itemRefs.current[index] = el)}
                      className={cn("relative", colSpanClasses[index % 4])}
                    >
                      {/* Content */}
                      <div className="pt-4 sm:pt-8 md:pt-[11.5rem]">
                        <h3
                          className={cn(
                            "text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-2 leading-tight w-full sm:max-w-[200px] md:max-w-[200px]",
                            index < 2 && "md:ml-2"
                          )}
                        >
                          {item.title}
                        </h3>
                        <div className={cn(index < 2 && "md:ml-2")}>
                          {item.subtitles.map((text, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "relative left-[1px] transition-all duration-1000 ease-out",
                                isVisible
                                  ? "translate-y-4 opacity-100"
                                  : "translate-y-0 opacity-0"
                              )}
                              style={{
                                transitionDelay: isVisible
                                  ? `${
                                      (orderMap && orderMap[index]
                                        ? orderMap[index] * ROW_ORDER_DELAY
                                        : index * ROW_ORDER_DELAY) +
                                      idx * SUBTITLE_STAGGER
                                    }ms`
                                  : "0ms",
                                transitionDuration: `${TRANSITION_DURATION}ms`,
                              }}
                            >
                              {/* Vertical line above */}
                              {idx > 0 && (
                                <div
                                  className="w-px bg-gray-500 h-12 sm:h-16 md:h-20 mt-1"
                                  style={{ width: "1px" }}
                                ></div>
                              )}
                              {idx === 0 && (
                                <div
                                  className="w-px bg-gray-500 h-3 sm:h-4 mt-1"
                                  style={{ width: "1px" }}
                                ></div>
                              )}
                              {/* Bullet and text on same line */}
                              <div className="flex items-center">
                                <div className="w-1 h-1 -left-[5px] bg-gray-500 rounded-full flex-shrink-0"></div>
                                <div className="text-sm text-gray-400 leading-relaxed w-full sm:max-w-[240px] md:max-w-[180px] pl-2">
                                  {text}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
