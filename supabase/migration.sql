-- Migration SQL for color_archive
-- Run this in Supabase SQL Editor

-- 1. Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  dominant_hex TEXT NOT NULL,
  color_family TEXT NOT NULL CHECK (
    color_family IN (
      'red', 'orange', 'yellow', 'green', 'cyan',
      'blue', 'purple', 'pink', 'brown', 'grayscale', 'uncategorized'
    )
  ),
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_photos_color_family ON photos (color_family);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_dominant_hex ON photos (dominant_hex);

-- 3. Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 4. Allow anonymous inserts
CREATE POLICY "allow_anon_insert_photos"
  ON photos FOR INSERT
  TO anon
  WITH CHECK (true);

-- 5. Allow anonymous selects
CREATE POLICY "allow_anon_select_photos"
  ON photos FOR SELECT
  TO anon
  USING (true);

-- 6. Storage bucket for images
-- Run in Supabase Storage section:
-- Create a bucket named 'color-archive' (public)

-- 7. Storage policy for anonymous uploads
-- In Supabase Storage → Policies for bucket 'color-archive':
-- Policy name: "allow_anon_upload"
-- Action: INSERT
-- Target roles: anon
-- Policy expression: true