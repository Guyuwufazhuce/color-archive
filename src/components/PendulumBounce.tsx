"use client";

import { useEffect, useRef } from "react";

// ─── 8-color spectrum for the pendulum ball ────────────────
const COLORS = [
  { r: 255, g: 59, b: 48 },   // Red    #FF3B30
  { r: 255, g: 149, b: 0 },   // Orange #FF9500
  { r: 255, g: 214, b: 10 },  // Yellow #FFD60A
  { r: 52, g: 199, b: 89 },   // Green  #34C759
  { r: 0, g: 199, b: 190 },   // Cyan   #00C7BE
  { r: 0, g: 122, b: 255 },   // Blue   #007AFF
  { r: 175, g: 82, b: 222 },  // Purple #AF52DE
  { r: 255, g: 45, b: 85 },   // Pink   #FF2D55
] as const;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(
  c1: { r: number; g: number; b: number },
  c2: { r: number; g: number; b: number },
  t: number,
): string {
  return `rgb(${Math.round(lerp(c1.r, c2.r, t))},${Math.round(lerp(c1.g, c2.g, t))},${Math.round(lerp(c1.b, c2.b, t))})`;
}

export default function PendulumBounce() {
  const ballRef = useRef<SVGCircleElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const groundRef = useRef<SVGEllipseElement>(null);

  useEffect(() => {
    const ball = ballRef.current as SVGCircleElement;
    const group = groupRef.current as SVGGElement;
    const ground = groundRef.current as SVGEllipseElement;

    const maxAngle = 22; // degrees
    const period = 2.4;  // seconds (L → R → L)
    const omega = (2 * Math.PI) / period;
    let startTime: number | null = null;
    let frameId: number;

    function animate(time: number) {
      if (startTime === null) startTime = time;
      const elapsed = (time - startTime) / 1000;

      // ── Pendulum position ──────────────────────────────
      const sinVal = Math.sin(omega * elapsed);
      const theta = maxAngle * sinVal;
      group.setAttribute("transform", `rotate(${theta.toFixed(2)}, 100, 20)`);

      // ── Ground shadow (moves with ball, fades at edges) ──
      const shadowX = 100 + sinVal * 24;
      const shadowOpacity = 0.06 + 0.12 * (1 - Math.abs(sinVal));
      ground.setAttribute("cx", shadowX.toFixed(1));
      ground.setAttribute("opacity", shadowOpacity.toFixed(3));

      // ── Color: map sinVal [-1, 1] → spectrum index ─────
      const normT = (sinVal + 1) / 2; // [0, 1]
      const idx = normT * (COLORS.length - 1);
      const i = Math.floor(idx);
      const frac = idx - i;
      const c1 = COLORS[Math.min(i, COLORS.length - 1)];
      const c2 = COLORS[Math.min(i + 1, COLORS.length - 1)];
      ball.setAttribute("fill", lerpColor(c1, c2, frac));

      frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <svg
      width="200"
      height="220"
      viewBox="0 0 200 220"
      xmlns="http://www.w3.org/2000/svg"
      className="block mx-auto select-none"
      aria-hidden="true"
    >
      <defs>
        {/* 3D sphere highlight gradient */}
        <radialGradient id="ballHighlight" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="35%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
        </radialGradient>

        {/* Soft drop shadow under the ball */}
        <filter
          id="ballShadow"
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
        >
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="4"
            floodColor="rgba(0,0,0,0.2)"
          />
        </filter>
      </defs>

      {/* Ground shadow ellipse */}
      <ellipse
        ref={groundRef}
        cx="100"
        cy="204"
        rx="20"
        ry="3"
        fill="rgba(0,0,0,0.12)"
      />

      {/* Pendulum group — pivot at (100, 20) */}
      <g ref={groupRef} transform="rotate(0, 100, 20)">
        {/* String */}
        <line
          x1="100"
          y1="20"
          x2="100"
          y2="178"
          stroke="#cbd5e1"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Ball — base color (updated by RAF) */}
        <circle
          ref={ballRef}
          cx="100"
          cy="184"
          r="16"
          fill="#FF3B30"
          filter="url(#ballShadow)"
        />

        {/* Ball — highlight overlay for 3D look */}
        <circle
          cx="100"
          cy="184"
          r="16"
          fill="url(#ballHighlight)"
          pointerEvents="none"
        />
      </g>
    </svg>
  );
}