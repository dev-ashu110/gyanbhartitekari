-- Fix remaining security issues

-- 1. Create a secure public view for student portfolios (excludes user_id and student_id)
CREATE OR REPLACE VIEW public.student_portfolios_public AS
SELECT 
  id,
  title,
  description,
  subject,
  assignment_type,
  file_name,
  file_type,
  file_url,
  created_at,
  updated_at
FROM public.student_portfolios;

-- Grant public read access to the portfolio view
GRANT SELECT ON public.student_portfolios_public TO anon;
GRANT SELECT ON public.student_portfolios_public TO authenticated;

-- 2. Drop the overly permissive public viewing policy for student_portfolios
DROP POLICY IF EXISTS "Public can view student portfolios" ON public.student_portfolios;

-- 3. Restrict parent contact information to student's own record only
-- Drop existing teacher policy that gives access to all data
DROP POLICY IF EXISTS "Teachers can view all student data" ON public.student_data;

-- Create new policy: Teachers can view student data EXCEPT parent contact info
-- This will be handled at application level by using the public view for teachers
-- Only students can see their own parent contact info
CREATE POLICY "Only students can view parent contact info" 
ON public.student_data 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND (parent_email IS NOT NULL OR parent_phone IS NOT NULL)
);

-- 4. Create a view for teachers that excludes parent contact information
CREATE OR REPLACE VIEW public.student_data_for_teachers AS
SELECT 
  id,
  user_id,
  student_name,
  admission_no,
  roll_no,
  class,
  section,
  bio,
  github_url,
  portfolio_url,
  profile_picture_url,
  achievements,
  created_at,
  updated_at
FROM public.student_data;

-- Set security invoker so RLS is checked
ALTER VIEW public.student_data_for_teachers SET (security_invoker = true);

-- Grant access to teachers through the view
GRANT SELECT ON public.student_data_for_teachers TO authenticated;

-- 5. Create policy for teachers to use the restricted view
CREATE POLICY "Teachers can view student academic data" 
ON public.student_data 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'teacher') 
  AND (parent_email IS NULL AND parent_phone IS NULL)
);