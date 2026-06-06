-- Storage RLS policies — run this in Supabase SQL Editor
-- Open: https://supabase.com/dashboard/project/vlsnkgggaelmfezhzrtp/sql/new

-- 1. Allow anonymous SELECT on storage.objects for photos bucket
CREATE POLICY "allow_anon_select_photos_bucket"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'photos');

-- 2. Allow anonymous INSERT to storage.objects for photos bucket
CREATE POLICY "allow_anon_insert_photos_bucket"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'photos');

-- 3. Allow anonymous DELETE from storage.objects for photos bucket
CREATE POLICY "allow_anon_delete_photos_bucket"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'photos');

-- 4. Allow anonymous UPDATE on storage.objects for photos bucket
CREATE POLICY "allow_anon_update_photos_bucket"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'photos')
WITH CHECK (bucket_id = 'photos');