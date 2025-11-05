-- Add missing RLS policies for school_info table
CREATE POLICY "Admin can update school info"
ON public.school_info FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can insert school info"
ON public.school_info FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete school info"
ON public.school_info FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add missing RLS policies for prospectus_content table
CREATE POLICY "Admin can insert prospectus"
ON public.prospectus_content FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete prospectus"
ON public.prospectus_content FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));