"use client";

import { useEffect, useRef } from "react";

// ─── 7-rainbow stop colors ────────────────────────────────
const STOPS = [
  { offset: 0, color: "#FF3B30" },
  { offset: 16, color: "#FF9500" },
  { offset: 33, color: "#FFD60A" },
  { offset: 50, color: "#34C759" },
  { offset: 66, color: "#00C7BE" },
  { offset: 83, color: "#007AFF" },
  { offset: 100, color: "#AF52DE" },
];

// ─── 7 concentric half-arch paths ─────────────────────────
const BASELINE_Y = 92;
const CENTER_X = 110;

function makeArcs(): { rx: number; ry: number }[] {
  const arcs = [];
  for (let i = 0; i < 7; i++) {
    arcs.push({ rx: 98 - i * 12, ry: 72 - i * 9 });
  }
  return arcs;
}

const ARCS = makeArcs();

function arcPath(rx: number, ry: number): string {
  const left = CENTER_X - rx;
  const right = CENTER_X + rx;
  return `M ${left} ${BASELINE_Y} A ${rx} ${ry} 0 0 1 ${right} ${BASELINE_Y}`;
}

export default function RainbowArch() {
  const gradientRef = useRef<SVGLinearGradientElement>(null);

  useEffect(() => {
    const grad: SVGLinearGradientElement = gradientRef.current!;
    // gradientRef is always set after mount; if not, bail.
    if (!grad) return;

    const duration = 5000;
    let start: number | null = null;
    let frame: number;

    function tick(ts: number) {
      if (start === null) start = ts;
      const elapsed = (ts - start) / duration;
      const shift = Math.sin(elapsed * 2 * Math.PI) * 0.18;
      grad.setAttribute("gradientTransform", `translate(${shift.toFixed(4)}, 0)`);
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <svg
      width="220"
      height="100"
      viewBox="0 0 220 100"
      xmlns="http://www.w3.org/2000/svg"
      className="block mx-auto select-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="archFlowGradient"
          ref={gradientRef}
          x1="-0.25"
          x2="1.25"
          y1="0"
          y2="0"
          gradientUnits="objectBoundingBox"
        >
          {STOPS.map((s) => (
            <stop key={s.offset} offset={`${s.offset}%`} stopColor={s.color} />
          ))}
        </linearGradient>
      </defs>

      {ARCS.map((arc, i) => (
        <path
          key={i}
          d={arcPath(arc.rx, arc.ry)}
          fill="none"
          stroke="url(#archFlowGradient)"
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={1 - i * 0.06}
        />
      ))}
    </svg>
  );
}