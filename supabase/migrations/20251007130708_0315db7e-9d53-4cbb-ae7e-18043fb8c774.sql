-- Fix 1: Remove conflicting public access policy from student_projects
DROP POLICY IF EXISTS "Public can view all projects" ON public.student_projects;

-- Fix 2: Drop and recreate student_portfolios_public view with security_barrier
DROP VIEW IF EXISTS public.student_portfolios_public CASCADE;

CREATE VIEW public.student_portfolios_public 
WITH (security_barrier = true) AS
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

-- Grant public access to this view
GRANT SELECT ON public.student_portfolios_public TO anon, authenticated;

-- Fix 3: Drop and recreate student_data_for_teachers view with security_barrier
DROP VIEW IF EXISTS public.student_data_for_teachers CASCADE;

CREATE VIEW public.student_data_for_teachers 
WITH (security_barrier = true) AS
SELECT 
  id,
  user_id,
  student_name,
  admission_no,
  roll_no,
  class,
  section,
  bio,
  achievements,
  profile_picture_url,
  portfolio_url,
  github_url,
  created_at,
  updated_at
FROM public.student_data
WHERE parent_email IS NULL AND parent_phone IS NULL;

-- Grant access only to authenticated users
GRANT SELECT ON public.student_data_for_teachers TO authenticated;

-- Fix 4: Strengthen parent contact protection in student_data
DROP POLICY IF EXISTS "Teachers can view student academic data" ON public.student_data;

CREATE POLICY "Teachers can view student academic data only"
ON public.student_data
FOR SELECT
USING (
  public.has_role(auth.uid(), 'teacher'::app_role)
  AND parent_email IS NULL 
  AND parent_phone IS NULL
);

-- Fix 5: Ensure only students and admins can see full student data including parent contact
DROP POLICY IF EXISTS "Only students can view parent contact info" ON public.student_data;
DROP POLICY IF EXISTS "Students can view their own data" ON public.student_data;

CREATE POLICY "Students can view their own complete data"
ON public.student_data
FOR SELECT
USING (auth.uid() = user_id);