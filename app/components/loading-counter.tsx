"use client";

import { animate, useMotionValue } from "framer-motion";
import { useEffect } from "react";
// no outlet context required for this component

type LoadingCounterProps = {
  onFinish?: () => void;
};

export default function LoadingCounter({ onFinish }: LoadingCounterProps) {
  // Try to get brand from context when available; otherwise caller can render with img props.
  // outlet context is available if needed via useOutletContext

  const count = useMotionValue(0);

  // loader behavior: animate `count` from 0→100 and call onFinish when done.

  // Respect reduced motion - detect once on mount
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (typeof window === "undefined") return;

    // animate count from 0 to 100 (slower for a longer load feel)
    const controls = animate(count, 100, { duration: 1.5, ease: "easeOut" });
    const unsubscribe = count.onChange((v) => {
      if (v >= 100) {
        onFinish?.();
        controls.stop();
      }
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, onFinish, prefersReduced]);

  // (No clipPath required for the CSS-based loader)
  return (
    <div
      role="img"
      aria-label="Loading"
      aria-live="polite"
      className="flex items-center justify-center"
      style={{ width: "100%", height: "100%" }}
    >
      <div className="relative w-96 h-96 sm:w-96 sm:h-96 select-none flex items-center justify-center">
        {/* Replaced SVG loader with CSS-based text loader for stability during debugging */}
          {/* Inline SVG: stroke-only outlines visible, fill revealed from bottom→top via an internal mask rectangle that animates upward. */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 907.09 748.35"
            className="w-48 h-48 md:w-80 md:h-80"
            role="img"
            aria-label="logo"
          >
            <style>{`
              .fill { fill: #fff }
              /* mask rect starts translated down (hidden) and moves up to reveal */
              .mask-rect { transform-box: fill-box; transform: translateY(100%); animation: mask-up 1000ms ease forwards 300ms }
              @keyframes mask-up { to { transform: translateY(0%); } }
            `}</style>

            <defs>
              <mask id="revealMask">
                <rect x="0" y="0" width="100%" height="100%" fill="black" />
                <rect className="mask-rect" x="0" y="0" width="100%" height="100%" fill="white" />
              </mask>
            </defs>

            {/* Filled shapes that get revealed by the mask */}
            <g mask="url(#revealMask)">
              <polygon className="fill" points="373.32 650.33 448.15 423.18 800.59 423.18 800.59 325.16 480.44 325.16 555.27 98.02 693.47 98.02 693.47 0 506.15 0 506.15 0 467.33 0 290.05 538.12 288.53 542.99 288.49 542.86 228.41 725.22 236.03 748.35 341.03 748.35 341.03 748.35 907.71 748.35 907.71 650.33 373.32 650.33" />
              <polygon className="fill" points="168.5 542.36 228.42 350.23 119.2 0 -.63 0 168.5 542.36" />
            </g>

          </svg>

        {/* Loader styles are now in `app/tailwind.css` as `.loader` (text)
            and `.loader-image` / `.loader-image__img` (image mask). */}
      </div>
    </div>
  );
}
