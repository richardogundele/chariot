-- Fix the handle_new_user_role function to prevent duplicate key errors
-- This happens when a user tries to sign up and the role already exists

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Use INSERT ... ON CONFLICT to prevent duplicate key errors
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$function$;