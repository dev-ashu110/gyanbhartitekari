-- Fix Security Definer Views by using SECURITY INVOKER mode
-- This ensures views respect RLS policies of the querying user

-- Fix student_portfolios_public view
DROP VIEW IF EXISTS public.student_portfolios_public CASCADE;

CREATE VIEW public.student_portfolios_public 
WITH (security_invoker=on) AS
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

GRANT SELECT ON public.student_portfolios_public TO anon, authenticated;

-- Fix student_data_for_teachers view
DROP VIEW IF EXISTS public.student_data_for_teachers CASCADE;

CREATE VIEW public.student_data_for_teachers 
WITH (security_invoker=on) AS
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

GRANT SELECT ON public.student_data_for_teachers TO authenticated;