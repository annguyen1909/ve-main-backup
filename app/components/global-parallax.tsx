import { useEffect, useRef, useState } from "react";

/**
 * Lightweight two-layer cursor (outer ring + inner dot).
 * - Outer ring follows pointer snappily.
 * - Inner dot lags slightly to create a subtle parallax.
 * - Uses GPU transforms only and is skipped on touch/coarse-pointer devices.
 */
export default function GlobalParallax() {
	const outerRef = useRef<HTMLDivElement | null>(null);
	const innerRef = useRef<HTMLDivElement | null>(null);

	// Only enable the custom cursor on the client for fine-pointer devices
	// and at least the small breakpoint width to avoid rendering on phones.
	const [enabled, setEnabled] = useState(false);
	const [mounted, setMounted] = useState(false);

	// pointer holds target positions and current smoothed positions for both layers
	const pointer = useRef({
		x: 0,
		y: 0,
		// outer (ring) smoothed
		ox: -9999,
		oy: -9999,
		// inner (dot) smoothed
		ix: -9999,
		iy: -9999,
	});

	useEffect(() => {
		// client-only mount flag to avoid SSR/client markup mismatch
		setMounted(true);

		if (typeof window === "undefined") return;

		const isTouch =
			("ontouchstart" in window || navigator.maxTouchPoints > 0 || (window.matchMedia && window.matchMedia("(pointer: coarse)").matches));
		const isFine = window.matchMedia ? window.matchMedia("(pointer: fine)").matches : true;
		const isWide = typeof window.innerWidth === 'number' ? window.innerWidth >= 640 : true; // sm breakpoint

		const shouldEnable = !isTouch && isFine && isWide;
		setEnabled(shouldEnable);

		if (!shouldEnable) return;

		let raf = 0;

		function onMove(e: MouseEvent) {
			pointer.current.x = e.clientX;
			pointer.current.y = e.clientY;
		}

		// keep the cursor from being interactive
		window.addEventListener("mousemove", onMove, { passive: true });

		const outerEase = 0.125; // outer ring is a bit slower
		const innerEase = 0.1625; // inner dot lags more for a subtle parallax

		function loop() {
			const p = pointer.current;

			// initialize targets if they're off-screen
			if (p.ox === -9999) {
				p.ox = p.x;
				p.oy = p.y;
				p.ix = p.x;
				p.iy = p.y;
			}

			// update outer ring (snappy)
			p.ox += (p.x - p.ox) * outerEase;
			p.oy += (p.y - p.oy) * outerEase;

			// update inner dot (lags)
			p.ix += (p.ox - p.ix) * innerEase;
			p.iy += (p.oy - p.iy) * innerEase;

			if (outerRef.current) {
				outerRef.current.style.transform = `translate3d(${p.ox}px, ${p.oy}px, 0) translate(-50%, -50%)`;
			}

			if (innerRef.current) {
				innerRef.current.style.transform = `translate3d(${p.ix}px, ${p.iy}px, 0) translate(-50%, -50%)`;
			}

			raf = requestAnimationFrame(loop);
		}

		raf = requestAnimationFrame(loop);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("mousemove", onMove);
		};
	}, []);


	if (!mounted || !enabled) return null;

	return (
		<div aria-hidden className="pointer-events-none">
			<div
				ref={outerRef}
				className="global-cursor fixed left-0 top-0 z-[9999] w-10 h-10 rounded-full border-2 border-gray-300/60"
				style={{ transform: "translate3d(-50%, -50%, 0)", willChange: "transform" }}
			/>

			<div
				ref={innerRef}
				className="fixed left-0 top-0 z-[9999] w-6 h-6 rounded-full bg-gray-300/60"
				style={{ transform: "translate3d(-50%, -50%, 0)", willChange: "transform" }}
			/>
		</div>
	);
}

