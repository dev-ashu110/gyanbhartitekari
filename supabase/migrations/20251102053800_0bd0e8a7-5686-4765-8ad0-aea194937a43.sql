-- Ensure profiles are created for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Allow authenticated users to assign themselves the 'visitor' role
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can assign visitor role to self" ON public.user_roles;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE POLICY "Users can assign visitor role to self"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'visitor');

-- Ensure pending_role_requests.user_id references an existing auth user (only if not already set)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'pending_role_requests_user_id_fkey'
      AND table_schema = 'public'
      AND table_name = 'pending_role_requests'
  ) THEN
    ALTER TABLE public.pending_role_requests
      ADD CONSTRAINT pending_role_requests_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;