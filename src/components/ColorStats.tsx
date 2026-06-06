"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface BarEntry {
  name: string;
  hex: string;
  height: number;
  pct: number;
  pctLabel: string;
  count: number;
}

// Fixed visual demo data — mirrors reference chart
const FIXED_BARS: BarEntry[] = [
  { name: "White",  hex: "#f8fafc",  height: 220, pct: 23,   pctLabel: "23%",  count: 128 },
  { name: "Black",  hex: "#111827",  height: 180, pct: 17,   pctLabel: "17%",  count: 94 },
  { name: "Green",  hex: "#22c55e",  height: 145, pct: 13,   pctLabel: "13%",  count: 73 },
  { name: "Blue",   hex: "#2196f3",  height: 120, pct: 11,   pctLabel: "11%",  count: 61 },
  { name: "Gray",   hex: "#9ca3af",  height: 90,  pct: 8,    pctLabel: "8%",   count: 45 },
  { name: "Red",    hex: "#ff3b30",  height: 80,  pct: 7,    pctLabel: "7%",   count: 38 },
  { name: "Yellow", hex: "#ffd60a",  height: 70,  pct: 6,    pctLabel: "6%",   count: 32 },
  { name: "Cyan",   hex: "#67e8f9",  height: 60,  pct: 5,    pctLabel: "5%",   count: 28 },
  { name: "Orange", hex: "#ffa726",  height: 50,  pct: 4,    pctLabel: "4%",   count: 24 },
  { name: "Purple", hex: "#9333ea",  height: 40,  pct: 3,    pctLabel: "3%",   count: 18 },
  { name: "Pink",   hex: "#ec6bcf",  height: 32,  pct: 2.5,  pctLabel: "2.5%", count: 14 },
  { name: "Brown",  hex: "#b87333",  height: 26,  pct: 2,    pctLabel: "2%",   count: 12 },
  { name: "Lime",   hex: "#a3e635",  height: 20,  pct: 1.5,  pctLabel: "1.5%", count: 9 },
  { name: "Indigo", hex: "#6366f1",  height: 15,  pct: 1,    pctLabel: "1%",   count: 7 },
  { name: "Rose",   hex: "#fb7185",  height: 10,  pct: 0.5,  pctLabel: "0.5%", count: 6 },
];

const BAR_W = 54;
const GAP = 32;

export default function ColorStats() {
  const router = useRouter();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const goToColor = (name: string) => {
    router.push(`/gallery?color=${encodeURIComponent(name.toLowerCase())}`);
  };

  return (
    <div className="w-full mt-20">
      <div className="max-w-[1280px] mx-auto px-6">
        <div
          className="overflow-x-auto pb-6"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e7eb transparent" }}
        >
          <div className="flex flex-col items-center min-w-max mx-auto">
            {/* ── Row 1: percentages ── */}
            <div className="flex gap-[32px]">
              {FIXED_BARS.map((bar) => (
                <div
                  key={bar.name}
                  className="flex flex-col items-center"
                  style={{ width: BAR_W }}
                >
                  <div className="h-6 flex items-center justify-center mb-1.5">
                    <span className="text-sm font-semibold text-gray-700 tabular-nums">
                      {bar.pctLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Row 2: bars ── */}
            <div className="relative flex gap-[32px]">
              {FIXED_BARS.map((bar) => (
                <div
                  key={bar.name}
                  className="relative flex flex-col items-center cursor-pointer group"
                  onClick={() => goToColor(bar.name)}
                  style={{ width: BAR_W }}
                >
                  {/* Bar — rectangular with 12px top radius */}
                  <div
                    className="transition-all duration-800 ease-out group-hover:-translate-y-1"
                    style={{
                      width: "100%",
                      height: animated ? `${bar.height}px` : "0px",
                      borderRadius: "12px 12px 0 0",
                      backgroundColor: bar.hex,
                      border: bar.name === "White" ? "1px solid #e5e7eb" : "none",
                      transition: "height 900ms ease-out, transform 0.2s ease",
                    }}
                  />

                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap z-10 shadow-sm">
                    <div className="font-medium">{bar.name}</div>
                    <div>{bar.count} {bar.count === 1 ? "photo" : "photos"}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Baseline ── */}
            <div className="h-px bg-gray-200 w-full" />

            {/* ── Row 3: labels ── */}
            <div className="flex gap-[32px] mt-3">
              {FIXED_BARS.map((bar) => (
                <div
                  key={bar.name}
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => goToColor(bar.name)}
                  style={{ width: BAR_W }}
                >
                  <div className="text-sm font-medium text-gray-700 leading-tight">
                    {bar.name}
                  </div>
                  <div className="mt-0.5 text-[13px] font-medium text-gray-500 leading-tight tabular-nums">
                    {bar.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}