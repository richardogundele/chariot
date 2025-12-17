-- Enable RLS on products table (if not already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Update products table to ensure proper structure
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS original_image_url TEXT;

-- Create edge function for copy generation
CREATE OR REPLACE FUNCTION public.log_copy_generation(
  p_product_id UUID,
  p_user_id UUID,
  p_copy_type TEXT,
  p_generated_copy TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_letter_id UUID;
BEGIN
  INSERT INTO sales_letters (product_id, title, content)
  VALUES (p_product_id, p_copy_type, p_generated_copy)
  RETURNING id INTO v_letter_id;
  
  RETURN v_letter_id;
END;
$$;

-- Ensure user_profiles has proper trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure user gets default role
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();