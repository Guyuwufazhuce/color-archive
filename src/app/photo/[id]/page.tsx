import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import PhotoDetailClient from "@/components/gallery/PhotoDetailClient";
import { buildPhotoMetadata } from "@/lib/seo";
import type { PhotoRecord } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabaseAdmin
    .from("photos")
    .select("dominant_hex, color_family")
    .eq("id", id)
    .single();

  if (!data) return {};
  return buildPhotoMetadata(id, data.dominant_hex, data.color_family);
}

export default async function PhotoPage({ params }: Props) {
  const { id } = await params;

  const { data: photo, error } = await supabaseAdmin
    .from("photos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !photo) notFound();

  // Fetch related photos (same color family)
  const { data: related } = await supabaseAdmin
    .from("photos")
    .select("*")
    .eq("color_family", photo.color_family)
    .neq("id", photo.id)
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <PhotoDetailClient
      photo={photo as unknown as PhotoRecord}
      related={(related || []) as unknown as PhotoRecord[]}
    />
  );
}