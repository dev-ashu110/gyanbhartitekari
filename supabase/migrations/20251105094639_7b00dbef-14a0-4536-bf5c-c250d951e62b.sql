-- Fix critical security issues: Storage policies and file validation

-- 1. Tighten storage bucket policies for gallery uploads
-- Admin and teachers can upload to gallery folder
CREATE POLICY "Admin/Teacher can upload to gallery"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-portfolios' 
  AND (storage.foldername(name))[1] = 'gallery'
  AND (
    has_role(auth.uid(), 'admin') 
    OR has_role(auth.uid(), 'teacher')
  )
);

-- Admin and teachers can update gallery images
CREATE POLICY "Admin/Teacher can update gallery images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'student-portfolios' 
  AND (storage.foldername(name))[1] = 'gallery'
  AND (
    has_role(auth.uid(), 'admin') 
    OR has_role(auth.uid(), 'teacher')
  )
);

-- Admin and teachers can delete gallery images
CREATE POLICY "Admin/Teacher can delete gallery images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'student-portfolios' 
  AND (storage.foldername(name))[1] = 'gallery'
  AND (
    has_role(auth.uid(), 'admin') 
    OR has_role(auth.uid(), 'teacher')
  )
);

-- Students can upload to their own portfolio folder
CREATE POLICY "Students can upload to own portfolio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-portfolios' 
  AND (storage.foldername(name))[1] = 'portfolios'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Students can view their own portfolio files
CREATE POLICY "Students can view own portfolio"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-portfolios' 
  AND (
    (storage.foldername(name))[1] = 'portfolios'
    AND (storage.foldername(name))[2] = auth.uid()::text
  )
  OR (
    (storage.foldername(name))[1] = 'gallery'
  )
);

-- Students can delete their own portfolio files
CREATE POLICY "Students can delete own portfolio"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'student-portfolios' 
  AND (storage.foldername(name))[1] = 'portfolios'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Admin and teachers can view all files
CREATE POLICY "Admin/Teacher can view all files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-portfolios' 
  AND (
    has_role(auth.uid(), 'admin') 
    OR has_role(auth.uid(), 'teacher')
  )
);

-- 2. Update storage bucket to enforce file size limits
UPDATE storage.buckets
SET 
  file_size_limit = 10485760, -- 10MB in bytes
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
WHERE id = 'student-portfolios';