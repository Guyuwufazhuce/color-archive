"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { CATEGORY_ORDER } from "@/lib/types";

export default function CommunityStats() {
  const [totalPhotos, setTotalPhotos] = useState<number | null>(null);
  const [colorCounts, setColorCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function load() {
      const { count } = await supabase
        .from("photos")
        .select("*", { count: "exact", head: true });

      if (count !== null) setTotalPhotos(count);

      // Count per color family
      const counts: Record<string, number> = {};
      for (const cat of CATEGORY_ORDER) {
        const { count: c } = await supabase
          .from("photos")
          .select("*", { count: "exact", head: true })
          .eq("color_family", cat);
        if (c !== null) counts[cat] = c;
      }
      setColorCounts(counts);
    }
    load();
  }, []);

  if (totalPhotos === null) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-gray-900">
            Community Stats
          </h2>
          <Link
            href="/gallery"
            className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            View gallery →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total photos */}
          <div className="bg-[#f8f9fa] rounded-xl p-4">
            <div className="text-2xl font-semibold text-gray-900">
              {totalPhotos.toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Total Photos</div>
          </div>

          {/* Color active count */}
          <div className="bg-[#f8f9fa] rounded-xl p-4">
            <div className="text-2xl font-semibold text-gray-900">
              {Object.values(colorCounts).filter((c) => c > 0).length}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Active Colors</div>
          </div>

          {/* Per-color counts */}
          {CATEGORY_ORDER.map((cat) => {
            const count = colorCounts[cat] || 0;
            if (count === 0) return null;
            return (
              <Link
                key={cat}
                href={`/collection/${cat}`}
                className="bg-[#f8f9fa] rounded-xl p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="text-lg font-semibold text-gray-900">
                  {count}
                </div>
                <div className="text-[11px] text-gray-400 mt-1 capitalize">
                  {cat}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}