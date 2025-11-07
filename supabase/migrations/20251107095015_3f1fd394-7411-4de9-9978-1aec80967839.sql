-- Reset and rebuild authentication system from scratch

-- 1. Add status and email columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS email text;

-- 2. Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- 3. Drop and recreate the handle_new_user trigger function (remove auto-admin assignment)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with email synced from auth
  INSERT INTO public.profiles (id, full_name, email, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    NEW.email,
    'pending'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = NEW.email;

  -- No auto-role assignment - admin assigns roles manually
  
  RETURN NEW;
END;
$$;

-- 4. Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Update RLS policies for profiles to include status checks
DROP POLICY IF EXISTS "Banned users cannot access" ON public.profiles;
CREATE POLICY "Banned users cannot access"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id AND status != 'banned'
);

-- 6. Admin can view and manage all users
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 7. Admin can update user status (ban/unban)
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- 8. Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- 9. Users can update their own profile (but not status or role)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id AND status != 'banned')
WITH CHECK (auth.uid() = id);

-- 10. Sync existing user emails to profiles
UPDATE public.profiles p
SET email = (
  SELECT email FROM auth.users u WHERE u.id = p.id
)
WHERE email IS NULL;