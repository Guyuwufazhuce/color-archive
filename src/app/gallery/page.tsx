import { Suspense } from "react";
import GalleryClient from "@/components/gallery/GalleryClient";

export default function GalleryPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-24">
          <p className="text-gray-300 text-sm">Loading gallery…</p>
        </div>
      }
    >
      <GalleryClient />
    </Suspense>
  );
}