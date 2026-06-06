// ─── Rainbow "C" logo — 4 concentric arcs forming a letter C ──
// C opens to the right, 7-color gradient left→right

const VIEW_W = 100;
const VIEW_H = 100;

export default function RainbowLogo() {
  const h = 30;
  const w = Math.round((VIEW_W / VIEW_H) * h);

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      xmlns="http://www.w3.org/2000/svg"
      className="block select-none"
      aria-label="Color Archive"
    >
      <defs>
        <linearGradient id="cGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#ff5a4a" />
          <stop offset="15%" stopColor="#ff9f1a" />
          <stop offset="30%" stopColor="#ffd60a" />
          <stop offset="50%" stopColor="#7bdc3c" />
          <stop offset="68%" stopColor="#2ed3c6" />
          <stop offset="84%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#9b5de5" />
        </linearGradient>
      </defs>

      {/* 4 concentric C-shaped arcs, opening to the right */}
      <path
        d="M 50 8 A 42 42 0 0 0 50 92"
        fill="none"
        stroke="url(#cGrad)"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d="M 50 14 A 36 36 0 0 0 50 86"
        fill="none"
        stroke="url(#cGrad)"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d="M 50 20 A 30 30 0 0 0 50 80"
        fill="none"
        stroke="url(#cGrad)"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d="M 50 26 A 24 24 0 0 0 50 74"
        fill="none"
        stroke="url(#cGrad)"
        strokeWidth={6}
        strokeLinecap="round"
      />
    </svg>
  );
}
