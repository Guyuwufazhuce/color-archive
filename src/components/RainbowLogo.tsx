// ─── Rainbow arch logo (4 arcs, thick strokes, reference-match colors)
//     Color flow via native SVG gradientTransform animation ──

function arcPath(r: number): string {
  const cx = 120;
  const cy = 115;
  return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
}

const ARCS = [90, 76, 62, 48];

const VIEW_W = 240;
const VIEW_H = 130;

export default function RainbowLogo() {
  const h = 28;
  const w = Math.round((VIEW_W / VIEW_H) * h);

  return (
    <div className="group">
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        xmlns="http://www.w3.org/2000/svg"
        className="block select-none transition-all duration-700 ease-in-out will-change-transform group-hover:scale-[1.06] group-hover:brightness-110"
        aria-label="Color Archive"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0" x2="1" y1="0" y2="0">
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              values="-0.3,0;0.3,0;-0.3,0"
              dur="4s"
              repeatCount="indefinite"
            />
            <stop offset="0%" stopColor="#ff5a4a" />
            <stop offset="12%" stopColor="#ff9f1a" />
            <stop offset="24%" stopColor="#ffd60a" />
            <stop offset="36%" stopColor="#7bdc3c" />
            <stop offset="48%" stopColor="#2ed3c6" />
            <stop offset="60%" stopColor="#3b82f6" />
            <stop offset="72%" stopColor="#9b5de5" />
            <stop offset="84%" stopColor="#ff5a4a" />
            <stop offset="100%" stopColor="#ff9f1a" />
          </linearGradient>
        </defs>

        {ARCS.map((r) => (
          <path
            key={r}
            d={arcPath(r)}
            fill="none"
            stroke="url(#logoGrad)"
            strokeWidth={14}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  );
}