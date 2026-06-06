-- Migration SQL for Color Archive
-- Run this in Supabase SQL Editor
-- Open: https://supabase.com/dashboard/project/vlsnkgggaelmfezhzrtp/sql/new

-- 1. Drop old table (deletes ALL existing data — backup first if needed)
DROP TABLE IF EXISTS photos CASCADE;

-- 2. Create photos table with new schema
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL DEFAULT '',
  dominant_color TEXT NOT NULL DEFAULT '#cccccc',
  dominant_colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  color_tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Indexes
CREATE INDEX idx_photos_created_at ON photos (created_at DESC);
CREATE INDEX idx_photos_color_tags ON photos USING GIN (color_tags);

-- 4. Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 5. Allow anonymous SELECT
CREATE POLICY "allow_anon_select_photos"
  ON photos FOR SELECT
  TO anon
  USING (true);

-- 6. Allow anonymous INSERT
CREATE POLICY "allow_anon_insert_photos"
  ON photos FOR INSERT
  TO anon
  WITH CHECK (true);

-- 7. Allow anonymous DELETE
CREATE POLICY "allow_anon_delete_photos"
  ON photos FOR DELETE
  TO anon
  USING (true);

-- 8. Allow anonymous UPDATE
CREATE POLICY "allow_anon_update_photos"
  ON photos FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);