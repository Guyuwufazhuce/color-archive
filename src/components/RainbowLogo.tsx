// ─── Full brand logo: rainbow arch + "Color Archive" text ──
// Color: red → orange → yellow → green gradient
// Archive: cyan → blue → purple gradient
// Height 44px, proportional width

const ARCH_STOPS = [
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

// Arch viewBox: 0 0 240 130 → arch occupies top ~120px
// We'll overlay text alongside. Layout: |arch(120px) + gap(12px) + text|
// Total SVG = 120 + 12 + ~280 = ~412 wide, height = 130

const ARCH_W = 120;  // left portion for the arch (half of 240, centered)
const GAP = 12;
const TEXT_X = ARCH_W + GAP;   // ~132
const TEXT_Y = 68;             // vertically centered in 130

// "Color Archive" as two separate <text> elements with their own gradients
// "Color": red → orange → yellow → green
// "Archive": cyan → blue → purple

export default function RainbowLogo() {
  // height = 44px, scale = 44/130 ≈ 0.338
  const svgHeight = 44;
  const svgWidth = Math.round(440 * (svgHeight / 130));

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox="0 0 440 130"
      xmlns="http://www.w3.org/2000/svg"
      className="block select-none"
      aria-label="Color Archive"
    >
      <defs>
        <linearGradient id="archGrad" x1="0" x2="1" y1="0" y2="0">
          {ARCH_STOPS.map((s) => (
            <stop key={s.offset} offset={`${s.offset}%`} stopColor={s.color} />
          ))}
        </linearGradient>
        <linearGradient id="colorGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#FF3B30" />
          <stop offset="33%" stopColor="#FF9500" />
          <stop offset="66%" stopColor="#FFD60A" />
          <stop offset="100%" stopColor="#34C759" />
        </linearGradient>
        <linearGradient id="archiveGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#00C7BE" />
          <stop offset="50%" stopColor="#007AFF" />
          <stop offset="100%" stopColor="#AF52DE" />
        </linearGradient>
      </defs>

      {/* Rainbow arch (centered in left 240px area) */}
      <g transform="translate(-60, 0)">
        {ARCS.map((r, i) => (
          <path
            key={i}
            d={arcPath(r)}
            fill="none"
            stroke="url(#archGrad)"
            strokeWidth={8}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* "Color" — red→orange→yellow→green */}
      <text
        x={TEXT_X}
        y={TEXT_Y}
        fill="url(#colorGrad)"
        fontSize={60}
        fontWeight={700}
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-0.5"
      >
        Color
      </text>

      {/* "Archive" — cyan→blue→purple */}
      <text
        x={TEXT_X}
        y={TEXT_Y + 40}
        fill="url(#archiveGrad)"
        fontSize={40}
        fontWeight={600}
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-0.3"
      >
        Archive
      </text>
    </svg>
  );
}
