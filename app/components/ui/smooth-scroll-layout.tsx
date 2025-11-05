import React, { useEffect, useRef } from "react";
import { cn } from "~/lib/utils";

interface SmoothScrollLayoutProps {
  children: React.ReactNode;
  onIndexChange?: (currentIndex: number, totalSections: number) => void;
  className?: string;
}

export function SmoothScrollLayout({ children, onIndexChange, className }: SmoothScrollLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set up intersection observer for tracking sections
    const sections = Array.from(container.children) as HTMLElement[];

    const debug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debugScroll');

    const observer = new IntersectionObserver(
      (entries) => {
        if (debug) {
          // eslint-disable-next-line no-console
          console.debug('[scroll-observer] entries', entries.length);
        }
        // compute which section has the largest visible area inside the scroll container
        const containerRect = container.getBoundingClientRect();

        let bestIndex = -1;
        let bestRatio = -1;
        let bestDistance = Number.POSITIVE_INFINITY;

        sections.forEach((s, idx) => {
          const rect = s.getBoundingClientRect();
          // compute vertical overlap between section and container
          const overlapTop = Math.max(rect.top, containerRect.top);
          const overlapBottom = Math.min(rect.bottom, containerRect.bottom);
          const visibleHeight = Math.max(0, overlapBottom - overlapTop);
          const ratio = rect.height > 0 ? visibleHeight / rect.height : 0;

          // distance of section center to container center as tiebreaker
          const elemCenterY = rect.top + rect.height / 2;
          const containerCenterY = containerRect.top + container.clientHeight / 2;
          const distance = Math.abs(elemCenterY - containerCenterY);

          if (debug) {
            // eslint-disable-next-line no-console
            console.debug('[scroll-observer] section', idx, { ratio, visibleHeight, rect, distance });
          }

          if (ratio > bestRatio || (Math.abs(ratio - bestRatio) < 1e-6 && distance < bestDistance)) {
            bestRatio = ratio;
            bestIndex = idx;
            bestDistance = distance;
          }
        });

        if (debug) {
          // eslint-disable-next-line no-console
          console.debug('[scroll-observer] best', { bestIndex, bestRatio, bestDistance });
        }

        if (bestIndex !== -1 && onIndexChange) {
          onIndexChange(bestIndex, sections.length);
        }

        // mark the underlying section element as active for visual debugging
        if (bestIndex !== -1) {
          sections.forEach((s, i) => {
            if (i === bestIndex) s.dataset.scrollActive = 'true';
            else delete s.dataset.scrollActive;
          });
        }
      },
      {
        threshold: [0, 0.05, 0.1, 0.25, 0.5],
        root: container,
        rootMargin: '0px 0px 0px 0px',
      }
    );

    sections.forEach((t) => observer.observe(t));

    return () => {
      observer.disconnect();
    };
  }, [onIndexChange]);

  return (
    <div 
      ref={containerRef}
      data-smooth-scroll="true"
      className={cn(
        "overflow-y-auto scroll-smooth", // Remove fixed height, let content flow naturally
        className
      )}
      style={{
        scrollBehavior: 'smooth',
        height: '100vh', // Only the container should be viewport height
      }}
    >
      {children}
    </div>
  );
}