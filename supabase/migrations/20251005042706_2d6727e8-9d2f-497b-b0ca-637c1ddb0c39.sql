-- Fix RLS policies for student_data table
CREATE POLICY "Students can create their own data" 
ON public.student_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can delete their own data" 
ON public.student_data 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add GitHub and portfolio fields to student_data
ALTER TABLE public.student_data 
ADD COLUMN github_url text,
ADD COLUMN portfolio_url text,
ADD COLUMN bio text,
ADD COLUMN profile_picture_url text,
ADD COLUMN achievements text[];

-- Create user roles system for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Allow public viewing of student profiles (for showcase)
CREATE POLICY "Public can view student profiles" 
ON public.student_data 
FOR SELECT 
USING (true);

-- Add public viewing for portfolios
CREATE POLICY "Public can view student portfolios" 
ON public.student_portfolios 
FOR SELECT 
USING (true);

-- Create projects/showcase table
CREATE TABLE public.student_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES public.student_data(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  project_url text,
  github_url text,
  tech_stack text[],
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can create their own projects" 
ON public.student_projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can view their own projects" 
ON public.student_projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view all projects" 
ON public.student_projects 
FOR SELECT 
USING (true);

CREATE POLICY "Students can update their own projects" 
ON public.student_projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Students can delete their own projects" 
ON public.student_projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updating updated_at
CREATE TRIGGER update_student_projects_updated_at
BEFORE UPDATE ON public.student_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();