// ─── Rainbow arch logo (4 arcs, thick strokes, reference-match colors)
//     Subtle flowing gradient via SVG animate on stop offsets ──

function arcPath(r: number): string {
  const cx = 120;
  const cy = 115;
  return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
}

const ARCS = [90, 76, 62, 48];

const VIEW_W = 240;
const VIEW_H = 130;

/** Reusable animate element for gentle ease-in-out offset oscillation */
function FlowAnimate(props: { values: string }) {
  return (
    <animate
      attributeName="offset"
      values={props.values}
      keyTimes="0;0.5;1"
      keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
      calcMode="spline"
      dur="7s"
      repeatCount="indefinite"
    />
  );
}

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
            <stop offset="0%" stopColor="#ff5a4a">
              <FlowAnimate values="0%;14%;0%" />
            </stop>
            <stop offset="15%" stopColor="#ff9f1a">
              <FlowAnimate values="15%;29%;15%" />
            </stop>
            <stop offset="30%" stopColor="#ffd60a">
              <FlowAnimate values="30%;44%;30%" />
            </stop>
            <stop offset="50%" stopColor="#7bdc3c">
              <FlowAnimate values="50%;64%;50%" />
            </stop>
            <stop offset="68%" stopColor="#2ed3c6">
              <FlowAnimate values="68%;82%;68%" />
            </stop>
            <stop offset="84%" stopColor="#3b82f6">
              <FlowAnimate values="84%;98%;84%" />
            </stop>
            <stop offset="100%" stopColor="#9b5de5">
              <FlowAnimate values="100%;114%;100%" />
            </stop>
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