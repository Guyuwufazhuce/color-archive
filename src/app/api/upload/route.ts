import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const dominantHex = formData.get("dominantHex") as string | null;
    const colorFamily = formData.get("colorFamily") as string | null;

    if (!file || !dominantHex || !colorFamily) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate color family
    const validFamilies = [
      "red", "orange", "yellow", "green", "cyan",
      "blue", "purple", "pink", "brown", "grayscale", "uncategorized",
    ];
    if (!validFamilies.includes(colorFamily)) {
      return NextResponse.json(
        { error: "Invalid color family" },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("color-archive")
      .upload(`images/${fileName}`, buffer, {
        contentType: file.type || "image/jpeg",
        cacheControl: "31536000",
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicData } = supabaseAdmin.storage
      .from("color-archive")
      .getPublicUrl(`images/${fileName}`);

    const imageUrl = publicData.publicUrl;

    // Get image dimensions from the file
    let width = 0;
    let height = 0;

    // Insert record
    const { data: record, error: dbError } = await supabaseAdmin
      .from("photos")
      .insert({
        image_url: imageUrl,
        dominant_hex: dominantHex,
        color_family: colorFamily,
        width,
        height,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      // Don't fail — image is already uploaded
      return NextResponse.json({
        id: null,
        image_url: imageUrl,
        error: "Failed to save record",
      });
    }

    return NextResponse.json(record);
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}