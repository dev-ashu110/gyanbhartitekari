-- Create gallery_images table
CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  title text,
  caption text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  attached_event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  is_cover boolean DEFAULT false,
  is_thumbnail boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Policies for gallery_images
CREATE POLICY "Anyone can view gallery images"
  ON public.gallery_images FOR SELECT
  USING (true);

CREATE POLICY "Admin and teachers can insert gallery images"
  ON public.gallery_images FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'teacher'::app_role)
  );

CREATE POLICY "Admin and teachers can update gallery images"
  ON public.gallery_images FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'teacher'::app_role)
  );

CREATE POLICY "Admin and teachers can delete gallery images"
  ON public.gallery_images FOR DELETE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'teacher'::app_role)
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_images;

-- Create timetables table (simplified)
CREATE TABLE public.timetables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class text NOT NULL,
  day text NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  period_name text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

-- Policies for timetables
CREATE POLICY "Anyone can view timetables"
  ON public.timetables FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert timetables"
  ON public.timetables FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update timetables"
  ON public.timetables FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete timetables"
  ON public.timetables FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.timetables;

-- Add trigger for timetables updated_at
CREATE TRIGGER update_timetables_updated_at
  BEFORE UPDATE ON public.timetables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create site_config table for editable stats
CREATE TABLE public.site_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Policies for site_config
CREATE POLICY "Anyone can view site config"
  ON public.site_config FOR SELECT
  USING (true);

CREATE POLICY "Admin can update site config"
  ON public.site_config FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default stats
INSERT INTO public.site_config (key, value, description) VALUES
  ('faculty_count', '150', 'Number of faculty members'),
  ('student_count', '5500', 'Number of students'),
  ('school_name', 'Gyan Bharti Sr. Sec. School', 'School name'),
  ('established_year', '1990', 'Year school was established')
ON CONFLICT (key) DO NOTHING;