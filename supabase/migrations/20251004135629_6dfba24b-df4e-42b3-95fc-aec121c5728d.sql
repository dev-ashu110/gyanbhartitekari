-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create student_data table for storing student information
CREATE TABLE public.student_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  admission_no TEXT NOT NULL UNIQUE,
  roll_no TEXT NOT NULL,
  section TEXT NOT NULL,
  class TEXT NOT NULL,
  parent_email TEXT,
  parent_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_data ENABLE ROW LEVEL SECURITY;

-- Create policies for student_data
CREATE POLICY "Students can view their own data"
ON public.student_data
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Students can update their own data"
ON public.student_data
FOR UPDATE
USING (auth.uid() = user_id);

-- Create student_portfolios table for storing student work
CREATE TABLE public.student_portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.student_data(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  file_name TEXT,
  assignment_type TEXT,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_portfolios ENABLE ROW LEVEL SECURITY;

-- Create policies for student_portfolios
CREATE POLICY "Students can view their own portfolios"
ON public.student_portfolios
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Students can create their own portfolios"
ON public.student_portfolios
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own portfolios"
ON public.student_portfolios
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Students can delete their own portfolios"
ON public.student_portfolios
FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket for student files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-portfolios',
  'student-portfolios',
  false,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/zip', 'application/x-zip-compressed', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Create storage policies
CREATE POLICY "Students can upload their own files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'student-portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Students can view their own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'student-portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Students can delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'student-portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create trigger for automatic timestamp updates on student_data
CREATE TRIGGER update_student_data_updated_at
BEFORE UPDATE ON public.student_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on student_portfolios
CREATE TRIGGER update_student_portfolios_updated_at
BEFORE UPDATE ON public.student_portfolios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();