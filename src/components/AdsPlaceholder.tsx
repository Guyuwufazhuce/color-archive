"use client";

import { useEffect, useId } from "react";

interface AdsPlaceholderProps {
  className?: string;
  format?: "banner" | "rectangle" | "leaderboard" | "auto";
  label?: string;
  /** Optional ad unit slot ID. If omitted, uses responsive auto-format. */
  adSlot?: string;
}

const FORMAT_STYLES: Record<string, string> = {
  banner: "h-[90px]",
  rectangle: "h-[250px]",
  leaderboard: "h-[90px]",
  auto: "min-h-[100px]",
};

const RAW_CLIENT = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "").trim();

/** Normalise to `ca-pub-XXXXXXXX` format (accepts bare pub-, ca-pub-, etc.). */
function normaliseClient(raw: string): string {
  const cleaned = raw.replace(/^(ca-)?pub-?/i, "");
  return `ca-pub-${cleaned}`;
}

const AD_CLIENT = RAW_CLIENT ? normaliseClient(RAW_CLIENT) : "";

export default function AdsPlaceholder({
  className = "",
  format = "rectangle",
  label,
  adSlot,
}: AdsPlaceholderProps) {
  const id = useId();

  // ── Real AdSense ad ──
  if (AD_CLIENT) {
    // Notify AdSense script to render this unit
    useEffect(() => {
      try {
        const w = window as unknown as { adsbygoogle?: unknown[] };
        if (w.adsbygoogle) {
          w.adsbygoogle.push({});
        }
      } catch {
        // Silently fail — ads may be blocked
      }
    }, []);

    const adFormat = adSlot ? (format === "rectangle" ? "auto" : format) : "auto";

    return (
      <div
        className={`w-full flex justify-center ${className}`}
        data-ad-format={adFormat}
      >
        <ins
          className={`adsbygoogle ${FORMAT_STYLES[format] || FORMAT_STYLES.auto}`}
          style={{ display: "block", minWidth: "300px" }}
          data-ad-client={AD_CLIENT}
          {...(adSlot ? { "data-ad-slot": adSlot } : {})}
          data-ad-format={adFormat}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // ── Placeholder when AdSense not configured ──
  return (
    <div
      id={`ad-placeholder-${id}`}
      className={`w-full ${FORMAT_STYLES[format] || FORMAT_STYLES.auto} bg-gray-50 border border-dashed border-gray-200 rounded-xl flex items-center justify-center select-none ${className}`}
      data-ad-format={format}
      data-ad-ready="false"
    >
      <span className="text-[10px] text-gray-300 uppercase tracking-widest">
        {label || "Ad Space"}
      </span>
    </div>
  );
}