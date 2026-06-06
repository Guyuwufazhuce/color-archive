// ─── Supabase Gallery Service ────────────────────────────────
// All CRUD operations for the public color gallery.

import { supabase } from "./supabase";
import type { ImageData, PhotoRecord } from "./types";

const BUCKET = "photos";

// ─── Upload file to Supabase Storage ──────────────────────

export async function uploadPhoto(
  file: File,
  analysis: {
    dominant_hex: string;
    dominant_name: string;
    dominant_colors: { hex: string; name: string; percentage: number }[];
    color_tags: string[];
  }
): Promise<{ id: string; image_url: string } | { error: string }> {
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${crypto.randomUUID()}-${file.name}`;
  const storagePath = `public/${fileName}`;

  // 1. Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("[galleryService] Storage upload error:", uploadError);
    return { error: `Upload failed: ${uploadError.message}` };
  }

  // 2. Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  const imageUrl = urlData?.publicUrl ?? "";

  // 3. Insert record into photos table
  const { data: insertData, error: dbError } = await supabase
    .from("photos")
    .insert({
      filename: file.name,
      image_url: imageUrl,
      storage_path: storagePath,
      dominant_color: analysis.dominant_hex,
      dominant_colors: analysis.dominant_colors,
      color_tags: analysis.color_tags,
    })
    .select("id, image_url")
    .single();

  if (dbError) {
    console.error("[galleryService] DB insert error:", dbError);
    // Try cleanup — don't block on it
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return { error: `Database insert failed: ${dbError.message}` };
  }

  return { id: insertData.id, image_url: imageUrl };
}

// ─── Fetch all photos ─────────────────────────────────────

export async function fetchPhotos(): Promise<PhotoRecord[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[galleryService] fetchPhotos error:", error);
    return [];
  }

  return data ?? [];
}

// ─── Fetch a single photo by id ───────────────────────────

export async function fetchPhotoById(
  id: string
): Promise<PhotoRecord | null> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[galleryService] fetchPhotoById error:", error);
    return null;
  }

  return data;
}

// ─── Delete a photo (DB + Storage) ────────────────────────

export async function deletePhoto(
  id: string,
  storagePath: string
): Promise<{ ok: boolean; storageError?: string }> {
  // 1. Delete DB record first
  const { error: dbError } = await supabase
    .from("photos")
    .delete()
    .eq("id", id);

  if (dbError) {
    return { ok: false, storageError: `Database delete failed: ${dbError.message}` };
  }

  // 2. Delete from Storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath]);

  if (storageError) {
    console.warn("[galleryService] Storage delete failed (DB record already removed):", storageError);
    return { ok: true, storageError: `Image removed from gallery, but storage cleanup failed: ${storageError.message}` };
  }

  return { ok: true };
}

// ─── Reanalyze a single photo's colors ────────────────────

export async function updatePhotoAnalysis(
  id: string,
  analysis: {
    dominant_hex: string;
    dominant_name: string;
    dominant_colors: { hex: string; name: string; percentage: number }[];
    color_tags: string[];
  }
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase
    .from("photos")
    .update({
      dominant_color: analysis.dominant_hex,
      dominant_colors: analysis.dominant_colors,
      color_tags: analysis.color_tags,
    })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

// ─── Convert PhotoRecord → ImageData (for existing UI code) ──

export function recordToImageData(record: PhotoRecord): ImageData {
  return {
    id: record.id,
    name: record.filename,
    image_url: record.image_url,
    storage_path: record.storage_path,
    color_hex: record.dominant_color,
    color_name: record.color_tags?.[0] ?? "Gray",
    palette: (record.dominant_colors ?? []).map((c) => c.hex),
    dominant_colors: record.dominant_colors ?? [],
    color_tags: record.color_tags ?? [],
    created_at: new Date(record.created_at).getTime(),
  };
}