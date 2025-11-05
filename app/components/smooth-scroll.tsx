import { useEffect, useRef } from "react";

// Lightweight smooth scroll controller
// - intercepts wheel events on non-coarse pointer devices
// - accumulates a target scrollY and animates the window scroll with easing
// - safe-guards: disables when user uses keyboard nav or during touch

export default function SmoothScroll() {
  // Disable the custom smooth-scroll globally for now — use native scrolling.
  // To re-enable, change this to the original feature-detection logic below.
  // const enabled = typeof window !== "undefined" && window.matchMedia && !window.matchMedia('(pointer: coarse)').matches;
  const enabled = false;
  const rafRef = useRef<number | null>(null);
  const state = useRef({
    target: 0,
    current: 0,
    isTicking: false,
  });
  const lastWheelTime = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const ease = 0.08; // lower = smoother/slower. Tune between 0.04 - 0.12
    const maxDelta = 1600; // clamp large wheel deltas

    function tick() {
      state.current.current += (state.current.target - state.current.current) * ease;
      // If we're very close, snap to target and stop
      if (Math.abs(state.current.target - state.current.current) < 0.5) {
        state.current.current = state.current.target;
        state.current.isTicking = false;
        cancelAnimationFrame(rafRef.current ?? 0);
        rafRef.current = null;
        window.scrollTo(0, Math.round(state.current.current));
        return;
      }

      window.scrollTo(0, Math.round(state.current.current));
      rafRef.current = requestAnimationFrame(tick);
    }

    function onWheel(e: WheelEvent) {
      // allow ctrl+wheel (zoom) to be handled by browser
      if (e.ctrlKey || e.metaKey) return;

      // If event originates inside a PageScroller, let that component handle it
      const target = e.target as HTMLElement | null;
      if (target && target.closest && target.closest('[data-page-scroller]')) {
        return;
      }

      e.preventDefault();

      // mark recent wheel usage so programmatic scrolls (clicking scrollbar / progress bar)
      // do not get smoothed. This makes smooth behavior apply only to mouse wheel.
      lastWheelTime.current = Date.now();

      const delta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), maxDelta);
      const docH = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);

      state.current.target = Math.max(0, Math.min(docH, state.current.target + delta));

      if (!state.current.isTicking) {
        state.current.isTicking = true;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    // If a scroll event occurs without a recent wheel event, it's likely from
    // a programmatic scroll or scrollbar click — snap to it (no smoothing).
    function onScroll() {
      const now = Date.now();
      if (now - lastWheelTime.current > 120) {
        // Cancel any running animation and snap to the current scroll position
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        state.current.current = window.scrollY || window.pageYOffset || 0;
        state.current.target = state.current.current;
        state.current.isTicking = false;
        rafRef.current = null;
      }
    }

    // initialize current/target to current scroll
    state.current.current = window.scrollY || window.pageYOffset || 0;
    state.current.target = state.current.current;

  // Indicate globally that smooth scroll is active so other scrollers can opt-out
  type WinSmooth = Window & { __smoothScrollActive?: boolean };
  (window as unknown as WinSmooth).__smoothScrollActive = true;
  const wheelOptions: AddEventListenerOptions = { passive: false, capture: true };
  // Use capture so we can preventDefault before other handlers (like PageScroller)
  window.addEventListener("wheel", onWheel, wheelOptions);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });

    // handle window resize (recompute doc height clamping)
    const onResize = () => {
      const docH = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
      state.current.target = Math.max(0, Math.min(docH, state.current.target));
      state.current.current = Math.max(0, Math.min(docH, state.current.current));
    };

    window.addEventListener("resize", onResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
  window.removeEventListener("wheel", onWheel, wheelOptions);
  (window as unknown as WinSmooth).__smoothScrollActive = false;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, { capture: true } as EventListenerOptions);
    };
  }, [enabled]);

  return null;
}
