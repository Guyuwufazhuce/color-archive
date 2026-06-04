"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { PhotoRecord } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/types";
import AdsPlaceholder from "@/components/AdsPlaceholder";
import { useLanguage } from "@/lib/LanguageContext";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<PhotoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    if (!query) {
      setLoading(false);
      setResults([]);
      return;
    }

    async function search() {
      setLoading(true);

      // Normalize query: strip # if present
      const hex = query.startsWith("#") ? query : `#${query}`;
      const hexLower = hex.toLowerCase();

      // Try to match by dominant_hex first
      let { data: exact, error } = await supabase
        .from("photos")
        .select("*")
        .ilike("dominant_hex", `%${hexLower}%`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Search error:", error);
        setLoading(false);
        return;
      }

      // If no results, try matching by color family
      if (!exact || exact.length === 0) {
        const matchingFamily = Object.entries(CATEGORY_COLORS).find(
          ([_, familyHex]) => familyHex.toLowerCase().includes(hexLower) || hexLower.includes(familyHex.replace("#", ""))
        );

        if (matchingFamily) {
          const { data: familyResults } = await supabase
            .from("photos")
            .select("*")
            .eq("color_family", matchingFamily[0])
            .order("created_at", { ascending: false })
            .limit(50);
          if (familyResults) exact = familyResults;
        }
      }

      setResults(exact || []);
      setLoading(false);
    }

    search();
  }, [query]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          {t("search.title")}
        </h1>
        {query && (
          <p className="mt-2 text-sm text-gray-500">
            {t("search.subtitle", { query })}
          </p>
        )}
      </div>

      {loading && (
        <div className="text-center py-16 text-sm text-gray-400">
          {t("search.searching")}
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400 mb-2">
            {t("search.noResults", { query })}
          </p>
          <p className="text-xs text-gray-400">
            {t("search.trySearch")}{" "}
            <Link href="/search?q=%23ff0000" className="text-blue-500 hover:underline">
              #ff0000
            </Link>{" "}
            {t("search.orBrowse")}{" "}
            <Link href="/gallery" className="text-blue-500 hover:underline">
              {t("search.allPhotos")}
            </Link>
            .
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="columns-2 sm:columns-3 md:columns-4 gap-4">
          {results.map((photo) => (
            <Link
              key={photo.id}
              href={`/photo/${photo.id}`}
              className="block mb-4 break-inside-avoid group"
            >
              <div className="relative rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={photo.image_url}
                  alt={`Photo ${photo.dominant_hex}`}
                  className="w-full h-auto object-cover group-hover:opacity-95 transition-opacity"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-white/40"
                      style={{ backgroundColor: photo.dominant_hex }}
                    />
                    <span className="text-[11px] text-white font-medium">
                      {photo.dominant_hex}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <AdsPlaceholder format="banner" className="mt-10" />
    </div>
  );
}