-- Phase 5.0: Premium Features Database Setup

-- 1. Update site_config with new achievement counts
INSERT INTO public.site_config (key, value, description) VALUES
  ('students_count', '5500', 'Total number of students'),
  ('faculty_count', '150', 'Total number of faculty members'),
  ('years_excellence', '15', 'Years of excellence'),
  ('success_rate', '95', 'Success rate percentage')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Create achievements table for school highlights
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  year integer NOT NULL,
  category text NOT NULL CHECK (category IN ('academic', 'sports', 'cultural', 'infrastructure', 'awards')),
  image_url text,
  display_order integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Achievements policies
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert achievements"
  ON public.achievements FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update achievements"
  ON public.achievements FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete achievements"
  ON public.achievements FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_role text NOT NULL CHECK (author_role IN ('parent', 'student', 'alumni', 'teacher')),
  content text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  avatar_url text,
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Testimonials policies
CREATE POLICY "Anyone can view testimonials"
  ON public.testimonials FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert testimonials"
  ON public.testimonials FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update testimonials"
  ON public.testimonials FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete testimonials"
  ON public.testimonials FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Create analytics_logs table
CREATE TABLE IF NOT EXISTS public.analytics_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('page_view', 'event_registration', 'notice_view', 'download', 'search')),
  page_path text,
  user_id uuid REFERENCES auth.users(id),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for analytics_logs
ALTER TABLE public.analytics_logs ENABLE ROW LEVEL SECURITY;

-- Analytics policies
CREATE POLICY "Admin can view analytics"
  ON public.analytics_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert analytics"
  ON public.analytics_logs FOR INSERT
  WITH CHECK (true);

-- 5. Create event_registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_class text NOT NULL,
  parent_email text,
  parent_phone text,
  status text DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS for event_registrations
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Event registrations policies
CREATE POLICY "Users can view their own registrations"
  ON public.event_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all registrations"
  ON public.event_registrations FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can register for events"
  ON public.event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations"
  ON public.event_registrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can update any registration"
  ON public.event_registrations FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. Create prospectus_content table
CREATE TABLE IF NOT EXISTS public.prospectus_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL UNIQUE CHECK (section IN ('mission', 'vision', 'principal_message', 'facilities', 'curriculum')),
  content text NOT NULL,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for prospectus_content
ALTER TABLE public.prospectus_content ENABLE ROW LEVEL SECURITY;

-- Prospectus policies
CREATE POLICY "Anyone can view prospectus"
  ON public.prospectus_content FOR SELECT
  USING (true);

CREATE POLICY "Admin can update prospectus"
  ON public.prospectus_content FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.testimonials;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_registrations;

-- 8. Create triggers for updated_at
CREATE TRIGGER update_achievements_updated_at
  BEFORE UPDATE ON public.achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at
  BEFORE UPDATE ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Insert sample data
INSERT INTO public.achievements (title, description, year, category, display_order) VALUES
  ('100% Board Results', 'Achieved outstanding 100% pass rate in Class XII Board Examinations', 2024, 'academic', 1),
  ('State Level Championship', 'Won Gold Medal in State Level Athletics Championship', 2024, 'sports', 2),
  ('Cultural Excellence Award', 'Recognized for excellence in cultural activities and performing arts', 2023, 'cultural', 3),
  ('Best Infrastructure Award', 'Awarded Best School Infrastructure in Bihar', 2023, 'infrastructure', 4);

INSERT INTO public.testimonials (author_name, author_role, content, rating, is_featured, display_order) VALUES
  ('Mrs. Sunita Sharma', 'parent', 'Gyan Bharti has been instrumental in shaping my child''s future. The dedicated faculty and excellent infrastructure make it the best choice for quality education.', 5, true, 1),
  ('Rahul Kumar', 'alumni', 'The values and education I received at Gyan Bharti have been the foundation of my success. Forever grateful to my teachers and the school.', 5, true, 2),
  ('Mr. Rajesh Singh', 'parent', 'The school provides a perfect blend of academics and extracurricular activities. My daughter has grown tremendously in confidence and knowledge.', 5, true, 3);

INSERT INTO public.prospectus_content (section, content) VALUES
  ('mission', 'To provide quality education that empowers students to become responsible global citizens with strong moral values and academic excellence.'),
  ('vision', 'To be a leading educational institution recognized for innovation, excellence, and holistic development of students.'),
  ('principal_message', 'Welcome to Gyan Bharti Senior Secondary School. We are committed to nurturing young minds and preparing them for a bright future through comprehensive education and character building.'),
  ('facilities', 'State-of-the-art classrooms, well-equipped science labs, modern computer lab, extensive library, sports facilities, and safe transportation.'),
  ('curriculum', 'CBSE curriculum with focus on experiential learning, critical thinking, and skill development. Special emphasis on science, mathematics, and language development.');