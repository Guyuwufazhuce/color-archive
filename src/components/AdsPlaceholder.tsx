"use client";

import { useId } from "react";

interface AdsPlaceholderProps {
  className?: string;
  format?: "banner" | "rectangle" | "leaderboard";
  label?: string;
}

const FORMAT_STYLES: Record<"banner" | "rectangle" | "leaderboard", string> = {
  banner: "h-[90px]",
  rectangle: "h-[250px]",
  leaderboard: "h-[90px]",
};

export default function AdsPlaceholder({
  className = "",
  format = "rectangle",
  label,
}: AdsPlaceholderProps) {
  const id = useId();

  return (
    <div
      id={`ad-placeholder-${id}`}
      className={`w-full ${FORMAT_STYLES[format]} bg-gray-50 border border-dashed border-gray-200 rounded-xl flex items-center justify-center select-none ${className}`}
      data-ad-format={format}
      data-ad-ready="false"
    >
      <span className="text-[10px] text-gray-300 uppercase tracking-widest">
        {label || "Ad Space"}
      </span>
    </div>
  );
}