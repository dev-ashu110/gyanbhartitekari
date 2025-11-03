-- Add verified column to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- Create a function to handle email verification
CREATE OR REPLACE FUNCTION public.handle_email_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update verified status in profiles
  UPDATE public.profiles
  SET verified = true
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for email verification
DROP TRIGGER IF EXISTS on_email_verified ON auth.users;
CREATE TRIGGER on_email_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_email_verification();