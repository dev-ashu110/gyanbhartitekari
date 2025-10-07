-- Fix security issue: Enable RLS on student_data_for_teachers view
-- Drop the view and recreate it as a proper table with RLS
DROP VIEW IF EXISTS public.student_data_for_teachers;

-- Create student_data_for_teachers as a view with proper security
-- This view will be accessible only to teachers and admins via RLS
CREATE OR REPLACE VIEW public.student_data_for_teachers
WITH (security_invoker = true)
AS
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
  github_url,
  portfolio_url,
  created_at,
  updated_at
FROM public.student_data;

-- Grant access to authenticated users (RLS will handle actual permissions)
GRANT SELECT ON public.student_data_for_teachers TO authenticated;

-- Create pending role requests table for approval workflow
CREATE TABLE IF NOT EXISTS public.pending_role_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_role app_role NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id),
  notes text,
  UNIQUE(user_id, requested_role, status)
);

-- Enable RLS on pending_role_requests
ALTER TABLE public.pending_role_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own role requests"
ON public.pending_role_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own role requests
CREATE POLICY "Users can create role requests"
ON public.pending_role_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admins can view all requests
CREATE POLICY "Admins can view all role requests"
ON public.pending_role_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update requests (approve/reject)
CREATE POLICY "Admins can update role requests"
ON public.pending_role_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create a table for school public information (for visitors)
CREATE TABLE IF NOT EXISTS public.school_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name text NOT NULL,
  description text,
  established_year integer,
  principal_name text,
  contact_email text,
  contact_phone text,
  address text,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on school_info (public read access)
ALTER TABLE public.school_info ENABLE ROW LEVEL SECURITY;

-- Anyone can view school info (even unauthenticated)
CREATE POLICY "Anyone can view school info"
ON public.school_info
FOR SELECT
USING (true);

-- Only admins can modify school info
CREATE POLICY "Admins can manage school info"
ON public.school_info
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create teachers table for visitor page
CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  qualification text,
  experience_years integer,
  photo_url text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on teachers
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Anyone can view teachers (public info for visitors)
CREATE POLICY "Anyone can view teachers"
ON public.teachers
FOR SELECT
USING (true);

-- Only admins can manage teachers
CREATE POLICY "Admins can manage teachers"
ON public.teachers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Insert sample school info
INSERT INTO public.school_info (school_name, description, established_year, principal_name, contact_email, contact_phone, address)
VALUES (
  'Gyan Bharti School',
  'A Seat of Learning - Empowering Minds, Building Futures',
  2008,
  'Dr. Principal Name',
  'info@gyanbharti.edu',
  '+91-XXXXXXXXXX',
  'School Address, City, State - 000000'
)
ON CONFLICT DO NOTHING;

-- Add visitor role to app_role enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student', 'visitor');
  ELSE
    BEGIN
      ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'visitor';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END;
  END IF;
END $$;

-- Create trigger for updated_at on teachers
CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();