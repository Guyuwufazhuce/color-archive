"use client";

import { useEffect, useRef } from "react";

// ─── 7 color stops for the rainbow gradient ───────────────
const STOPS = [
  { offset: 0, color: "#FF3B30" },    // Red
  { offset: 16.67, color: "#FF9500" }, // Orange
  { offset: 33.33, color: "#FFD60A" }, // Yellow
  { offset: 50, color: "#34C759" },    // Green
  { offset: 66.67, color: "#00C7BE" }, // Cyan
  { offset: 83.33, color: "#007AFF" }, // Blue
  { offset: 100, color: "#FF2D55" },   // Magenta
];

// ─── 7 concentric semi-circular arcs ──────────────────────
// viewBox: 0 0 240 130, center (120, 115)
function makeArcs(): number[] {
  const radii: number[] = [];
  for (let i = 0; i < 7; i++) {
    radii.push(90 - i * 8);
  }
  return radii;
}

const ARCS = makeArcs();

function arcPath(r: number): string {
  const cx = 120;
  const cy = 115;
  return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
}

export default function RainbowBridge() {
  const gradRef = useRef<SVGLinearGradientElement>(null);

  useEffect(() => {
    const duration = 4000;
    let start: number | null = null;
    let frame: number;

    function tick(ts: number) {
      if (start === null) start = ts;
      const elapsed = (ts - start) / duration;
      const shift = Math.sin(elapsed * 2 * Math.PI) * 0.5;
      const g = gradRef.current;
      if (g) g.setAttribute("gradientTransform", `translate(${shift.toFixed(4)}, 0)`);
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <svg
      width="240"
      height="120"
      viewBox="0 0 240 130"
      xmlns="http://www.w3.org/2000/svg"
      className="block mx-auto select-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          ref={gradRef}
          id="bridgeGradient"
          x1="-0.5"
          x2="1.5"
          y1="0"
          y2="0"
          gradientUnits="objectBoundingBox"
        >
          {STOPS.map((s) => (
            <stop key={s.offset} offset={`${s.offset}%`} stopColor={s.color} />
          ))}
        </linearGradient>
      </defs>

      {ARCS.map((r, i) => (
        <path
          key={i}
          d={arcPath(r)}
          fill="none"
          stroke="url(#bridgeGradient)"
          strokeWidth={8}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}