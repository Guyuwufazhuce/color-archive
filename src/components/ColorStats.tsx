"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface BarData {
  name: string;
  value: number;
  percent: string;
  height: number;
  color: string;
  border?: string;
}

const FIXED_BARS: BarData[] = [
  { name: "White",  value: 128, percent: "23%",  height: 220, color: "#f8fafc", border: "#e5e7eb" },
  { name: "Black",  value: 94,  percent: "17%",  height: 180, color: "#111827" },
  { name: "Green",  value: 73,  percent: "13%",  height: 145, color: "#22c55e" },
  { name: "Blue",   value: 61,  percent: "11%",  height: 120, color: "#2196f3" },
  { name: "Gray",   value: 45,  percent: "8%",   height: 90,  color: "#9ca3af" },
  { name: "Red",    value: 38,  percent: "7%",   height: 80,  color: "#ff3b30" },
  { name: "Yellow", value: 32,  percent: "6%",   height: 70,  color: "#ffd60a" },
  { name: "Cyan",   value: 28,  percent: "5%",   height: 60,  color: "#67e8f9" },
  { name: "Orange", value: 24,  percent: "4%",   height: 50,  color: "#ffa726" },
  { name: "Purple", value: 18,  percent: "3%",   height: 40,  color: "#9333ea" },
  { name: "Pink",   value: 14,  percent: "2.5%", height: 32,  color: "#ec6bcf" },
  { name: "Brown",  value: 12,  percent: "2%",   height: 26,  color: "#b87333" },
  { name: "Lime",   value: 9,   percent: "1.5%", height: 20,  color: "#a3e635" },
  { name: "Indigo", value: 7,   percent: "1%",   height: 15,  color: "#6366f1" },
  { name: "Rose",   value: 6,   percent: "0.5%", height: 10,  color: "#fb7185" },
];

const BAR_WIDTH = 28;
const GAP = 36;
const CONTAINER_HEIGHT = 260;

export default function ColorStats() {
  const router = useRouter();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  const goTo = (name: string) => {
    router.push(`/gallery?color=${encodeURIComponent(name.toLowerCase())}`);
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        width: "90vw",
        margin: "72px auto 0",
      }}
    >
      <div
        style={{
          overflowX: "auto",
          paddingBottom: 24,
          scrollbarWidth: "thin",
          scrollbarColor: "#e5e7eb transparent",
        }}
      >
        <div style={{ minWidth: "max-content", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* ── Row 1: percentages ── */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: GAP,
            }}
          >
            {FIXED_BARS.map((bar) => (
              <div
                key={bar.name}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: BAR_WIDTH,
                }}
              >
                <div
                  style={{
                    height: 18,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#374151",
                    }}
                  >
                    {bar.percent}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Row 2: bars container, align-items: flex-end ── */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: GAP,
              height: CONTAINER_HEIGHT,
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            {FIXED_BARS.map((bar) => (
              <div
                key={bar.name}
                onClick={() => goTo(bar.name)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: BAR_WIDTH,
                  cursor: "pointer",
                  position: "relative",
                }}
                className="group"
              >
                {/* Bar */}
                <div
                  style={{
                    width: "100%",
                    height: animated ? bar.height : 0,
                    borderRadius: "10px 10px 0 0",
                    backgroundColor: bar.color,
                    border: bar.border ? `1px solid ${bar.border}` : "none",
                    transition: "height 900ms ease-out, transform 0.2s ease",
                    transformOrigin: "bottom",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.transform = "translateY(0)";
                  }}
                />

                {/* Tooltip */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "100%",
                    marginBottom: 8,
                    opacity: 0,
                    pointerEvents: "none",
                    transition: "opacity 0.2s",
                    backgroundColor: "#111827",
                    color: "#fff",
                    fontSize: 12,
                    borderRadius: 8,
                    padding: "6px 12px",
                    whiteSpace: "nowrap",
                    zIndex: 10,
                  }}
                  className="group-hover:opacity-100"
                >
                  <div style={{ fontWeight: 500 }}>{bar.name}</div>
                  <div>{bar.value} {bar.value === 1 ? "photo" : "photos"}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Row 3: labels (name + count) ── */}
          <div
            style={{
              display: "flex",
              gap: GAP,
              marginTop: 0,
            }}
          >
            {FIXED_BARS.map((bar) => (
              <div
                key={bar.name}
                onClick={() => goTo(bar.name)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: BAR_WIDTH,
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginTop: 14, lineHeight: 1.2 }}>
                  {bar.name}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6, lineHeight: 1.2 }}>
                  {bar.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
