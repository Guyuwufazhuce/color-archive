"use client";

import { useEffect, useRef } from "react";

const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_ID || "";

export default function AdsPlaceholder({
  format = "auto",
  className = "",
  adSlot,
}: {
  format?: "auto" | "banner" | "leaderboard";
  className?: string;
  adSlot?: string;
}) {
  const adRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!PUBLISHER_ID || initialized.current || !adRef.current) return;

    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
      initialized.current = true;
    } catch {
      // AdBlock or no network
    }
  }, []);

  if (!PUBLISHER_ID) {
    return null;
  }

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={adSlot || undefined}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}