import { useEffect, useState } from "react";

export default function DebugOverflow() {
  const [results, setResults] = useState<Array<{ selector: string; rect: DOMRect }>>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Run after a short delay to allow layout to settle
    const t = setTimeout(() => {
      const overs: Array<{ selector: string; rect: DOMRect }> = [];
      const ww = document.documentElement.clientWidth;
      document.querySelectorAll("*").forEach((el) => {
        try {
          const r = (el as HTMLElement).getBoundingClientRect();
          if (r.right > ww + 1 || r.left < -1) {
            let selector = el.tagName.toLowerCase();
            if (el.id) selector += `#${el.id}`;
            else if (el.className && typeof el.className === "string") {
              const cls = (el.className as string).split(" ")[0] || "";
              if (cls) selector += `.${cls.replace(/\s+/g, ".")}`;
            }
            overs.push({ selector, rect: r });
          }
        } catch (e) {
          // ignore
        }
      });

      setResults(overs);
    }, 250);

    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ padding: 20, color: "white", background: "#111", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 18, marginBottom: 10 }}>Overflow debug</h1>
      <p style={{ marginBottom: 12, color: '#ccc' }}>
        This page scans the DOM and lists elements whose bounding box extends outside the viewport. Open this URL on the device where you see horizontal scrolling (mobile/emulator) and paste the first few results here.
      </p>

      <div style={{ marginBottom: 12 }}>
        <strong>Results: {results.length}</strong>
      </div>

      <div>
        {results.length === 0 && <div style={{ color: '#9aa' }}>No overflowing elements detected (or they appear briefly). Try toggling the mobile menu before loading this page.</div>}
        {results.map((r, i) => (
          <div key={i} style={{ padding: 8, borderRadius: 6, background: '#0e0e0e', marginBottom: 8 }}>
            <div style={{ fontFamily: 'monospace' }}>{r.selector}</div>
            <div style={{ color: '#9aa', fontSize: 12 }}>
              left: {Math.round(r.rect.left)}, right: {Math.round(r.rect.right)}, width: {Math.round(r.rect.width)}, top: {Math.round(r.rect.top)}, height: {Math.round(r.rect.height)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
  <small style={{ color: '#777' }}>When you have results, paste the top 3 selectors here and I&apos;ll patch them.</small>
      </div>
    </div>
  );
}
