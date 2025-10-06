-- Fix critical security issues

-- 1. Drop the overly permissive public viewing policy for student_data
DROP POLICY IF EXISTS "Public can view student profiles" ON public.student_data;

-- 2. Create a secure view for public student profiles (excludes sensitive data)
CREATE OR REPLACE VIEW public.student_public_profiles AS
SELECT 
  id,
  student_name,
  admission_no,
  class,
  section,
  bio,
  github_url,
  portfolio_url,
  profile_picture_url,
  achievements
FROM public.student_data;

-- 3. Create RLS policy for the public view
ALTER VIEW public.student_public_profiles SET (security_invoker = true);

-- 4. Grant public read access to the view only
GRANT SELECT ON public.student_public_profiles TO anon;
GRANT SELECT ON public.student_public_profiles TO authenticated;

-- 5. Ensure admin can view all student data including sensitive info
CREATE POLICY "Admins can view all student data" 
ON public.student_data 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Ensure teachers can view student contact information
CREATE POLICY "Teachers can view all student data" 
ON public.student_data 
FOR SELECT 
USING (public.has_role(auth.uid(), 'teacher'));