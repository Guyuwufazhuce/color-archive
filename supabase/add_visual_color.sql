-- Add visual_color column if not already present
ALTER TABLE photos
ADD COLUMN IF NOT EXISTS visual_color TEXT NOT NULL DEFAULT '';

-- Ensure color_tags is TEXT[]
ALTER TABLE photos
ALTER COLUMN color_tags SET DATA TYPE TEXT[] USING COALESCE(color_tags, '{}'::text[]);

-- Refresh schema cache (Supabase will auto-detect, but run ANALYZE to be safe)
ANALYZE photos;

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'photos' 
ORDER BY ordinal_position;