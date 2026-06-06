"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { fetchPhotos } from "@/lib/galleryService";
import { recordToImageData } from "@/lib/galleryService";
import { CATEGORIES } from "@/lib/colorCategories";
import type { ImageData } from "@/lib/types";

const BAR_W = 28;
const GAP = 36;
const MAX_BAR_H = 220; // tallest bar in px
const ZERO_BAR_H = 2;  // thin line for 0-count colors

export default function ColorStats() {
  const router = useRouter();
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [anim, setAnim] = useState(false);

  // Fetch real images on mount
  useEffect(() => {
    fetchPhotos()
      .then((records) => {
        setLoading(false);
        setImages(records.map(recordToImageData));
      })
      .catch(() => setLoading(false));
  }, []);

  // Trigger grow animation
  useEffect(() => {
    const t = setTimeout(() => setAnim(true), 80);
    return () => clearTimeout(t);
  }, [images]); // re-animate when data arrives

  const go = (name: string) =>
    router.push(`/gallery?color=${encodeURIComponent(name.toLowerCase())}`);

  // ── Compute bar data from real images ──
  const bars = useMemo(() => {
    const total = images.length;
    const countsMap = new Map<string, number>();

    // Initialize all categories to 0
    for (const cat of CATEGORIES) {
      countsMap.set(cat.name, 0);
    }

    // Count images per color category
    for (const img of images) {
      const tags = (img.color_tags ?? [img.color_name]).map((t) => String(t));
      // Mark all matching categories
      for (const tag of tags) {
        if (countsMap.has(tag)) {
          countsMap.set(tag, (countsMap.get(tag) ?? 0) + 1);
        }
      }
    }

    let maxCount = 0;
    const rawBars = CATEGORIES.map((cat) => {
      const count = countsMap.get(cat.name) ?? 0;
      if (count > maxCount) maxCount = count;
      return { name: cat.name, color: cat.hex, count };
    });

    return rawBars.map((b) => {
      const pct = total > 0 ? (b.count / total) * 100 : 0;
      const pctLabel =
        pct === 0
          ? ""
          : pct < 0.1
            ? "<0.1%"
            : `${pct.toFixed(pct >= 1 ? 0 : 1)}%`;
      const height = b.count === 0 ? ZERO_BAR_H : Math.round((b.count / maxCount) * MAX_BAR_H);
      return { ...b, height, pct, pctLabel };
    });
  }, [images]);

  // Loading state — render nothing (flicker-free)
  if (loading) return null;
  if (images.length === 0) return null;

  return (
    <div style={{ maxWidth: 1200, width: "90vw", margin: "72px auto 0" }}>
      <div
        style={{
          overflowX: "auto",
          paddingBottom: 24,
          scrollbarWidth: "thin",
          scrollbarColor: "#e5e7eb transparent",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: GAP,
            minWidth: "max-content",
          }}
        >
          {bars.map((b) => {
            const isZero = b.count === 0;
            const barH = anim ? b.height : 0;
            return (
              <div
                key={b.name}
                onClick={() => go(b.name)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  width: BAR_W,
                  cursor: "pointer",
                  position: "relative",
                  opacity: isZero ? 0.4 : 1,
                }}
                className="group"
              >
                {/* percentage — follows its bar */}
                {b.pctLabel && (
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#374151",
                      lineHeight: 1,
                      marginBottom: 8,
                      flexShrink: 0,
                    }}
                  >
                    {b.pctLabel}
                  </div>
                )}

                {/* bar or thin placeholder line */}
                {isZero ? (
                  <div
                    style={{
                      width: 12,
                      height: 2,
                      borderRadius: 0,
                      backgroundColor: b.color,
                      opacity: 0.3,
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: barH,
                      borderRadius: "10px 10px 0 0",
                      backgroundColor: b.color,
                      transition: "height 900ms ease-out, transform 0.2s ease",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(-4px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(0)";
                    }}
                  />
                )}

                {/* tooltip (only if count > 0) */}
                {!isZero && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      marginBottom: 32,
                      opacity: 0,
                      pointerEvents: "none",
                      transition: "opacity 0.15s",
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
                    <div style={{ fontWeight: 500 }}>{b.name}</div>
                    <div>
                      {b.count} {b.count === 1 ? "photo" : "photos"}
                    </div>
                  </div>
                )}

                {/* label — name */}
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginTop: isZero ? 16 : 14,
                    lineHeight: 1.2,
                    flexShrink: 0,
                  }}
                >
                  {b.name}
                </div>

                {/* label — count */}
                <div
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginTop: 6,
                    lineHeight: 1.2,
                    flexShrink: 0,
                  }}
                >
                  {b.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
