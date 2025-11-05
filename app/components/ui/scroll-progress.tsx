import { cn } from "~/lib/utils";
import * as motion from "motion/react-client";

interface ScrollProgressProps {
  currentIndex: number;
  totalSections: number;
  className?: string;
  labels?: string[];
}

export function ScrollProgress({ currentIndex, totalSections, className, labels }: ScrollProgressProps) {
  return (
    // hide on small screens, show from md up
    <div className={cn("hidden md:block fixed right-8 lg:right-12 top-1/2 -translate-y-1/2 z-40", className)}>
      <div className="relative flex flex-col gap-4">
        {/* Progress numbers */}
        {Array.from({ length: totalSections }, (_, index) => {
          const labelText = labels && labels[index] ? labels[index] : (index + 1).toString().padStart(1, '0');
          const onActivate = () => {
            // find the smooth scroll container and its sections, then scroll to the target
            const container = document.querySelector('[data-smooth-scroll="true"]') as HTMLElement | null;
            if (!container) return;
            const sections = Array.from(container.children) as HTMLElement[];
            const target = sections[index];
            if (!target) return;
            // prefer scrolling to the section's title (h1/h2) so the clicked label points to the visible heading
            const containerRect = container.getBoundingClientRect();
            const title = target.querySelector<HTMLElement>('h1, h2, .section-title');
            const referenceEl = title ?? target;
            const refRect = referenceEl.getBoundingClientRect();

            // offset so the title sits slightly below the top (center-ish) of the container
            const offsetAdjustment = Math.round(container.clientHeight * 0.18);
            const desiredTop = container.scrollTop + (refRect.top - containerRect.top) - offsetAdjustment;

            container.scrollTo({ top: desiredTop, behavior: 'smooth' });

            // also focus the first focusable element inside the section for accessibility
            const focusable = target.querySelector<HTMLElement>('a, button, input, [tabindex]:not([tabindex="-1"])');
            if (focusable) focusable.focus();
          };

          return (
            <motion.div
              role="button"
              tabIndex={0}
              key={index}
              onClick={onActivate}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(); } }}
              className={cn(
                "relative text-right text-lg font-medium cursor-pointer min-h-[24px] flex items-center justify-end",
                index === currentIndex 
                  ? "text-white" 
                  : "text-white/60 hover:text-white/80"
              )}
              initial={{ opacity: 0, x: 30 }}
              animate={{ 
                opacity: 1, 
                x: index === currentIndex ? 0 : 10,
                scale: index === currentIndex ? 1.5 : 1,
              }}
              transition={{ 
                duration: 0.5, 
                ease: "easeOut",
                scale: { duration: 0.15 }
              }}
            >
              {labelText}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}