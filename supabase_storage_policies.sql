-- ============================================
-- SUPABASE STORAGE POLICIES
-- Run these in the Supabase SQL Editor
-- ============================================

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'capsule-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to view their own uploads before capsule unlock
CREATE POLICY "Allow users to view own uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'capsule-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow access to media from unlocked capsules
-- Note: This is complex and best handled via signed URLs in the backend
-- The backend verifies unlock status before generating signed URLs

-- Policy: Allow users to delete their own files (from unlocked capsules)
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'capsule-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
