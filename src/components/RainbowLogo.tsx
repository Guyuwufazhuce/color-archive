// ─── Static rainbow bridge logo for header ─────────────────
// 7 concentric arcs, same gradient as PendulumBounce but static

const STOPS = [
  { offset: 0, color: "#FF3B30" },
  { offset: 16.67, color: "#FF9500" },
  { offset: 33.33, color: "#FFD60A" },
  { offset: 50, color: "#34C759" },
  { offset: 66.67, color: "#00C7BE" },
  { offset: 83.33, color: "#007AFF" },
  { offset: 100, color: "#FF2D55" },
];

function arcPath(r: number): string {
  const cx = 120;
  const cy = 115;
  return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
}

const ARCS = [90, 82, 74, 66, 58, 50, 42];

// height=32px, proportional width = 240/130 * 32 ≈ 59
const VIEW_W = 240;
const VIEW_H = 130;

export default function RainbowLogo() {
  return (
    <svg
      width={Math.round((VIEW_W / VIEW_H) * 32)}
      height={32}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      xmlns="http://www.w3.org/2000/svg"
      className="block select-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0" x2="1" y1="0" y2="0">
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
          stroke="url(#logoGradient)"
          strokeWidth={8}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
